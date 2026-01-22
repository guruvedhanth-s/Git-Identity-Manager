import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { GitProfile } from './types';
import { ProfileManager } from './profile-manager';
import { GitHubAuth } from './github-auth';
import { SSHManager } from './ssh-manager';

interface CreateProfileOptions {
  name?: string;
  github?: boolean;
  manual?: boolean;
}

/**
 * Prompt user to create a new profile
 */
export async function promptCreateProfile(
  options: CreateProfileOptions,
  profileManager: ProfileManager,
  githubAuth: GitHubAuth,
  sshManager: SSHManager
): Promise<GitProfile | null> {
  // Determine flow type
  let useGitHub = options.github;
  
  if (!options.github && !options.manual) {
    const { flowType } = await inquirer.prompt([{
      type: 'list',
      name: 'flowType',
      message: 'How would you like to set up your profile?',
      choices: [
        { name: `${chalk.green('→')} Sign in with GitHub (recommended)`, value: 'github' },
        { name: '  Manual setup', value: 'manual' },
      ],
    }]);
    useGitHub = flowType === 'github';
  }

  // Get profile name
  let profileName = options.name;
  if (!profileName) {
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'Profile name (e.g., "work", "personal"):',
      validate: (input: string) => {
        if (!input.trim()) return 'Profile name is required';
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return 'Only letters, numbers, underscores, and hyphens allowed';
        }
        if (profileManager.getProfile(input)) {
          return 'A profile with this name already exists';
        }
        return true;
      },
    }]);
    profileName = name;
  }

  if (useGitHub) {
    return createProfileWithGitHub(profileName!, profileManager, githubAuth, sshManager);
  } else {
    return createProfileManually(profileName!, profileManager, sshManager);
  }
}

/**
 * Create profile with GitHub authentication
 */
async function createProfileWithGitHub(
  profileName: string,
  profileManager: ProfileManager,
  githubAuth: GitHubAuth,
  sshManager: SSHManager
): Promise<GitProfile | null> {
  // Authenticate with GitHub
  const accessToken = await githubAuth.authenticateWithDeviceFlow();
  if (!accessToken) {
    return null;
  }

  // Get user info
  const spinner = ora('Fetching GitHub user info...').start();
  const user = await githubAuth.getAuthenticatedUser(accessToken);
  const email = await githubAuth.getUserEmail(accessToken);

  if (!user) {
    spinner.fail('Failed to get user info from GitHub');
    return null;
  }

  spinner.succeed(`Logged in as ${chalk.bold(user.login)}`);

  const githubUsername = user.login;
  const userName = user.name || user.login;
  const userEmail = email || `${user.login}@users.noreply.github.com`;

  // Generate SSH key
  const keySpinner = ora('Generating SSH key...').start();
  try {
    const keyPair = await sshManager.generateSSHKey(userEmail, profileName);
    keySpinner.succeed('SSH key generated');

    // Upload to GitHub
    const uploadSpinner = ora('Uploading SSH key to GitHub...').start();
    const keyTitle = `git-id: ${profileName} (${new Date().toLocaleDateString()})`;
    const uploaded = await githubAuth.uploadSSHKey(accessToken, keyPair.publicKey, keyTitle);
    
    if (uploaded) {
      uploadSpinner.succeed('SSH key uploaded to GitHub');
    } else {
      uploadSpinner.warn('Could not upload SSH key (you may need to add it manually)');
    }

    // Update SSH config
    const configSpinner = ora('Configuring SSH...').start();
    sshManager.updateSSHConfig(profileName, githubUsername);
    configSpinner.succeed('SSH config updated');

    // Try to add to SSH agent
    await sshManager.addToSSHAgent(profileName);

    // Create and save profile
    const profile: GitProfile = {
      name: profileName,
      userName,
      email: userEmail,
      githubUsername,
      sshKeyConfigured: true,
      createdAt: new Date().toISOString(),
    };

    profileManager.addProfile(profile);
    return profile;
  } catch (error) {
    keySpinner.fail(`SSH key generation failed: ${error}`);
    return null;
  }
}

/**
 * Create profile manually
 */
async function createProfileManually(
  profileName: string,
  profileManager: ProfileManager,
  sshManager: SSHManager
): Promise<GitProfile | null> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'userName',
      message: 'Git user name:',
      validate: (input: string) => input.trim() ? true : 'User name is required',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Git email:',
      validate: (input: string) => {
        if (!input.trim()) return 'Email is required';
        if (!input.includes('@')) return 'Please enter a valid email';
        return true;
      },
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub username (optional, for SSH):',
    },
    {
      type: 'confirm',
      name: 'generateSSH',
      message: 'Generate SSH key for this profile?',
      default: true,
    },
  ]);

  let sshKeyConfigured = false;

  if (answers.generateSSH) {
    const spinner = ora('Generating SSH key...').start();
    try {
      await sshManager.generateSSHKey(answers.email, profileName);
      spinner.succeed('SSH key generated');

      if (answers.githubUsername) {
        sshManager.updateSSHConfig(profileName, answers.githubUsername);
        console.log(chalk.cyan(`\n  SSH host alias configured: github-${profileName}`));
        console.log(chalk.yellow('  Don\'t forget to add the public key to GitHub!'));
        console.log(`  Key location: ~/.ssh/id_ed25519_${profileName}.pub\n`);
      }
      
      sshKeyConfigured = true;
    } catch (error) {
      spinner.fail(`SSH key generation failed: ${error}`);
    }
  }

  const profile: GitProfile = {
    name: profileName,
    userName: answers.userName.trim(),
    email: answers.email.trim(),
    githubUsername: answers.githubUsername?.trim() || undefined,
    sshKeyConfigured,
    createdAt: new Date().toISOString(),
  };

  profileManager.addProfile(profile);
  return profile;
}

/**
 * Prompt user to select a profile
 */
export async function promptSelectProfile(
  profiles: GitProfile[],
  message = 'Select a profile:'
): Promise<GitProfile | null> {
  const { selected } = await inquirer.prompt([{
    type: 'list',
    name: 'selected',
    message,
    choices: profiles.map(p => ({
      name: `${p.name} - ${p.userName} <${p.email}>${p.sshKeyConfigured ? chalk.cyan(' [SSH]') : ''}`,
      value: p.name,
    })),
  }]);

  return profiles.find(p => p.name === selected) || null;
}

/**
 * Prompt for confirmation
 */
export async function promptConfirm(message: string): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmed',
    message,
    default: false,
  }]);
  return confirmed;
}
