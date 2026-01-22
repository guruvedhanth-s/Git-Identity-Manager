#!/usr/bin/env node

/**
 * Git wrapper that supports --profile flag for identity management
 * 
 * Usage:
 *   git clone <url> --profile Personal
 *   git push --profile Hex
 *   git pull --profile Work
 * 
 * Also supports git-id subcommand for profile management:
 *   git id list
 *   git id add
 *   git id use Personal
 */

import { execSync } from 'child_process';
import * as path from 'path';
import chalk from 'chalk';
import { ProfileManager } from './profile-manager';
import { GitConfig } from './git-config';
import { GitProfile } from './types';

const profileManager = new ProfileManager();
const gitConfig = new GitConfig();

async function main() {
  const args = process.argv.slice(2);
  
  // Check if this is a git-id command (git id ...)
  if (args[0] === 'id') {
    // Forward to git-id CLI
    const gitIdPath = path.join(__dirname, 'index.js');
    const gitIdArgs = args.slice(1);
    
    try {
      execSync(`node "${gitIdPath}" ${gitIdArgs.join(' ')}`, { stdio: 'inherit' });
    } catch {
      process.exit(1);
    }
    return;
  }

  // Extract --profile flag
  let profileName: string | undefined;
  const filteredArgs: string[] = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--profile' || args[i] === '-p') {
      profileName = args[i + 1];
      i++; // Skip the profile name
    } else if (args[i].startsWith('--profile=')) {
      profileName = args[i].split('=')[1];
    } else {
      filteredArgs.push(args[i]);
    }
  }

  // If no profile specified, just run regular git
  if (!profileName) {
    runGit(filteredArgs);
    return;
  }

  // Get the profile
  const profile = profileManager.getProfile(profileName);
  if (!profile) {
    console.error(chalk.red(`Profile "${profileName}" not found.`));
    console.log('Available profiles:', profileManager.getProfiles().map(p => p.name).join(', '));
    console.log(`\nRun ${chalk.cyan('git id list')} to see all profiles.`);
    process.exit(1);
  }

  const command = filteredArgs[0];

  // Handle clone specially - apply profile after cloning
  if (command === 'clone') {
    await handleClone(filteredArgs, profile);
    return;
  }

  // For other commands, temporarily set the profile and run the command
  await handleGitCommand(filteredArgs, profile);
}

/**
 * Handle git clone with profile
 */
async function handleClone(args: string[], profile: GitProfile) {
  // Transform URL if using SSH
  const transformedArgs = args.map(arg => {
    if (profile.sshKeyConfigured && arg.includes('github.com')) {
      // Transform GitHub URLs to use profile's SSH host alias
      return arg
        .replace('git@github.com:', `git@github-${profile.name}:`)
        .replace(/https:\/\/github\.com\//, `git@github-${profile.name}:`);
    }
    return arg;
  });

  console.log(chalk.cyan(`Cloning with profile "${profile.name}"...`));
  
  // Find the destination directory
  let destDir: string | undefined;
  const urlIndex = transformedArgs.findIndex(a => a.includes('github') || a.includes('gitlab') || a.includes('bitbucket') || a.endsWith('.git'));
  if (urlIndex !== -1 && transformedArgs[urlIndex + 1] && !transformedArgs[urlIndex + 1].startsWith('-')) {
    destDir = transformedArgs[urlIndex + 1];
  } else if (urlIndex !== -1) {
    // Extract from URL
    destDir = transformedArgs[urlIndex].split('/').pop()?.replace('.git', '');
  }

  // Run git clone
  try {
    execSync(`git ${transformedArgs.join(' ')}`, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }

  // Apply profile to the cloned repo
  if (destDir) {
    const originalDir = process.cwd();
    try {
      process.chdir(destDir);
      await gitConfig.applyProfile(profile, 'local');
      const clonedPath = process.cwd();
      process.chdir(originalDir);
      
      console.log(chalk.green(`\n✓ Cloned with profile "${profile.name}"`));
      console.log(`  User:  ${profile.userName}`);
      console.log(`  Email: ${profile.email}`);
      console.log(chalk.cyan(`\nTo start working:\n`));
      console.log(`  cd ${clonedPath.includes(' ') ? `"${clonedPath}"` : clonedPath}\n`);
    } catch (error) {
      process.chdir(originalDir);
      console.error(chalk.yellow(`Warning: Could not apply profile: ${error}`));
    }
  }
}

/**
 * Handle other git commands with profile
 */
async function handleGitCommand(args: string[], profile: GitProfile) {
  // Transform any GitHub URLs in the args
  const transformedArgs = args.map(arg => {
    if (profile.sshKeyConfigured && arg.includes('github.com')) {
      return arg
        .replace('git@github.com:', `git@github-${profile.name}:`)
        .replace(/https:\/\/github\.com\//, `git@github-${profile.name}:`);
    }
    return arg;
  });

  // For push/pull/fetch, we need to use the correct SSH identity
  const sshCommands = ['push', 'pull', 'fetch', 'remote'];
  const command = transformedArgs[0];

  if (sshCommands.includes(command) && profile.sshKeyConfigured) {
    // Set GIT_SSH_COMMAND to use the profile's key
    const sshKeyPath = `~/.ssh/id_ed25519_${profile.name}`;
    const env = {
      ...process.env,
      GIT_SSH_COMMAND: `ssh -i ${sshKeyPath} -o IdentitiesOnly=yes`,
    };

    try {
      execSync(`git ${transformedArgs.join(' ')}`, { 
        stdio: 'inherit',
        env,
      });
    } catch {
      process.exit(1);
    }
  } else {
    // For other commands, just run git normally
    runGit(transformedArgs);
  }
}

/**
 * Run git with the given arguments
 */
function runGit(args: string[]) {
  try {
    execSync(`git ${args.join(' ')}`, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
});
