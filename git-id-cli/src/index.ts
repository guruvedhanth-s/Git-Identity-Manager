#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ProfileManager } from './profile-manager';
import { GitHubAuth } from './github-auth';
import { SSHManager } from './ssh-manager';
import { GitConfig } from './git-config';
import { promptCreateProfile, promptSelectProfile, promptConfirm } from './prompts';

const program = new Command();
const profileManager = new ProfileManager();
const githubAuth = new GitHubAuth();
const sshManager = new SSHManager();
const gitConfig = new GitConfig();

program
  .name('git-id')
  .description('Manage multiple Git identities with automatic GitHub SSH key setup')
  .version('1.0.0');

// List all profiles
program
  .command('list')
  .alias('ls')
  .description('List all configured Git profiles')
  .action(async () => {
    const profiles = profileManager.getProfiles();
    
    if (profiles.length === 0) {
      console.log(chalk.yellow('No profiles configured. Run `git-id add` to create one.'));
      return;
    }

    console.log(chalk.bold('\nConfigured Git Profiles:\n'));
    
    // Get current git user for comparison
    const currentUser = await gitConfig.getCurrentUser();
    const currentEmail = await gitConfig.getCurrentEmail();
    
    for (const profile of profiles) {
      const isCurrent = profile.email === currentEmail && profile.userName === currentUser;
      const marker = isCurrent ? chalk.green(' ← current') : '';
      const sshIcon = profile.sshKeyConfigured ? chalk.cyan(' [SSH]') : '';
      
      console.log(`  ${chalk.bold(profile.name)}${marker}${sshIcon}`);
      console.log(`    User:  ${profile.userName}`);
      console.log(`    Email: ${profile.email}`);
      if (profile.githubUsername) {
        console.log(`    GitHub: ${profile.githubUsername}`);
      }
      console.log();
    }
  });

// Add a new profile
program
  .command('add')
  .description('Create a new Git profile')
  .option('-n, --name <name>', 'Profile name')
  .option('--github', 'Sign in with GitHub (recommended)')
  .option('--manual', 'Manual setup without GitHub')
  .action(async (options) => {
    try {
      const profile = await promptCreateProfile(options, profileManager, githubAuth, sshManager);
      if (profile) {
        console.log(chalk.green(`\n✓ Profile "${profile.name}" created successfully!`));
        
        if (profile.sshKeyConfigured) {
          console.log(chalk.cyan(`\nSSH host alias: git@github-${profile.name}:${profile.githubUsername}/repo.git`));
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

// Switch/use a profile
program
  .command('use [profile]')
  .alias('switch')
  .description('Apply a Git profile to the current repository')
  .option('-g, --global', 'Apply globally instead of locally')
  .action(async (profileName, options) => {
    try {
      const profiles = profileManager.getProfiles();
      
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles configured. Run `git-id add` to create one.'));
        return;
      }

      // If no profile specified, show interactive selection
      let selectedProfile;
      if (!profileName) {
        selectedProfile = await promptSelectProfile(profiles);
      } else {
        selectedProfile = profiles.find(p => p.name.toLowerCase() === profileName.toLowerCase());
        if (!selectedProfile) {
          console.error(chalk.red(`Profile "${profileName}" not found.`));
          console.log('Available profiles:', profiles.map(p => p.name).join(', '));
          process.exit(1);
        }
      }

      if (!selectedProfile) {
        return;
      }

      const scope = options.global ? 'global' : 'local';
      await gitConfig.applyProfile(selectedProfile, scope);
      
      console.log(chalk.green(`\n✓ Applied profile "${selectedProfile.name}" (${scope})`));
      console.log(`  User:  ${selectedProfile.userName}`);
      console.log(`  Email: ${selectedProfile.email}`);
      
      if (selectedProfile.sshKeyConfigured) {
        console.log(chalk.cyan(`\n  SSH: Use git@github-${selectedProfile.name}:user/repo.git for cloning`));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

// Show current identity
program
  .command('current')
  .alias('whoami')
  .description('Show the current Git identity')
  .action(async () => {
    const user = await gitConfig.getCurrentUser();
    const email = await gitConfig.getCurrentEmail();
    
    if (!user && !email) {
      console.log(chalk.yellow('No Git identity configured for this repository.'));
      return;
    }

    console.log(chalk.bold('\nCurrent Git Identity:\n'));
    console.log(`  User:  ${user || '(not set)'}`);
    console.log(`  Email: ${email || '(not set)'}`);
    
    // Check if it matches a known profile
    const profiles = profileManager.getProfiles();
    const matchingProfile = profiles.find(p => p.email === email);
    
    if (matchingProfile) {
      console.log(chalk.green(`\n  Profile: ${matchingProfile.name}`));
    }
    console.log();
  });

// Delete a profile
program
  .command('delete [profile]')
  .alias('rm')
  .description('Delete a Git profile')
  .option('-a, --all', 'Delete all profiles')
  .action(async (profileName, options) => {
    try {
      const profiles = profileManager.getProfiles();
      
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles to delete.'));
        return;
      }

      if (options.all) {
        const confirm = await promptConfirm(`Delete ALL ${profiles.length} profiles?`);
        if (confirm) {
          for (const profile of profiles) {
            await sshManager.removeSSHConfigEntry(profile.name);
            await sshManager.deleteKeyFiles(profile.name);
          }
          profileManager.deleteAllProfiles();
          console.log(chalk.green(`✓ Deleted all profiles.`));
        }
        return;
      }

      let selectedProfile;
      if (!profileName) {
        selectedProfile = await promptSelectProfile(profiles, 'Select profile to delete');
      } else {
        selectedProfile = profiles.find(p => p.name.toLowerCase() === profileName.toLowerCase());
        if (!selectedProfile) {
          console.error(chalk.red(`Profile "${profileName}" not found.`));
          process.exit(1);
        }
      }

      if (!selectedProfile) {
        return;
      }

      const confirm = await promptConfirm(`Delete profile "${selectedProfile.name}"?`);
      if (confirm) {
        await sshManager.removeSSHConfigEntry(selectedProfile.name);
        await sshManager.deleteKeyFiles(selectedProfile.name);
        profileManager.deleteProfile(selectedProfile.name);
        console.log(chalk.green(`✓ Profile "${selectedProfile.name}" deleted.`));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

// Test SSH connection
program
  .command('test [profile]')
  .description('Test SSH connection to GitHub')
  .action(async (profileName) => {
    try {
      const profiles = profileManager.getProfiles();
      const sshProfiles = profiles.filter(p => p.sshKeyConfigured);
      
      if (sshProfiles.length === 0) {
        console.log(chalk.yellow('No profiles with SSH keys configured.'));
        return;
      }

      let selectedProfile;
      if (!profileName) {
        selectedProfile = await promptSelectProfile(sshProfiles, 'Select profile to test');
      } else {
        selectedProfile = sshProfiles.find(p => p.name.toLowerCase() === profileName.toLowerCase());
        if (!selectedProfile) {
          console.error(chalk.red(`Profile "${profileName}" not found or has no SSH key.`));
          process.exit(1);
        }
      }

      if (!selectedProfile) {
        return;
      }

      console.log(chalk.cyan(`\nTesting SSH connection for "${selectedProfile.name}"...`));
      const result = await sshManager.testGitHubConnection(selectedProfile.name);
      
      if (result.success) {
        console.log(chalk.green(`✓ Successfully authenticated as: ${result.username}`));
      } else {
        console.log(chalk.red(`✗ Connection failed: ${result.error}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

// Clone with specific profile
program
  .command('clone <url> [directory]')
  .description('Clone a repository using a specific profile')
  .option('-p, --profile <profile>', 'Profile to use')
  .action(async (url, directory, options) => {
    try {
      const profiles = profileManager.getProfiles();
      
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles configured. Run `git-id add` first.'));
        return;
      }

      let selectedProfile;
      if (options.profile) {
        selectedProfile = profiles.find(p => p.name.toLowerCase() === options.profile.toLowerCase());
        if (!selectedProfile) {
          console.error(chalk.red(`Profile "${options.profile}" not found.`));
          process.exit(1);
        }
      } else {
        selectedProfile = await promptSelectProfile(profiles, 'Select profile for cloning');
      }

      if (!selectedProfile) {
        return;
      }

      // Transform URL if using SSH
      let cloneUrl = url;
      if (selectedProfile.sshKeyConfigured && url.includes('github.com')) {
        cloneUrl = url.replace('git@github.com:', `git@github-${selectedProfile.name}:`);
        cloneUrl = cloneUrl.replace('https://github.com/', `git@github-${selectedProfile.name}:`);
      }

      console.log(chalk.cyan(`\nCloning with profile "${selectedProfile.name}"...`));
      console.log(`URL: ${cloneUrl}\n`);
      
      const clonedPath = await gitConfig.clone(cloneUrl, directory, selectedProfile);
      
      console.log(chalk.green(`\n✓ Cloned successfully with profile "${selectedProfile.name}"`));
      console.log(chalk.cyan(`\nTo start working:\n`));
      console.log(`  cd ${clonedPath.includes(' ') ? `"${clonedPath}"` : clonedPath}`);
      console.log();
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

program.parse();
