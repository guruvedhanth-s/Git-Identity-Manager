import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { GitProfile } from './types';

const execAsync = promisify(exec);

export class GitConfig {
  /**
   * Get current Git user.name
   */
  async getCurrentUser(): Promise<string | undefined> {
    return this.getConfig('user.name');
  }

  /**
   * Get current Git user.email
   */
  async getCurrentEmail(): Promise<string | undefined> {
    return this.getConfig('user.email');
  }

  /**
   * Get a Git config value
   */
  private async getConfig(key: string, scope: 'local' | 'global' = 'local'): Promise<string | undefined> {
    try {
      // Try local first, then global
      try {
        const { stdout } = await execAsync(`git config --${scope} --get ${key}`);
        return stdout.trim() || undefined;
      } catch {
        if (scope === 'local') {
          // Fallback to global
          const { stdout } = await execAsync(`git config --global --get ${key}`);
          return stdout.trim() || undefined;
        }
        return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Set a Git config value
   */
  private setConfig(key: string, value: string, scope: 'local' | 'global' = 'local'): void {
    try {
      execSync(`git config --${scope} ${key} "${value}"`, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Failed to set ${key}: ${error}`);
    }
  }

  /**
   * Apply a profile to Git config
   */
  async applyProfile(profile: GitProfile, scope: 'local' | 'global' = 'local'): Promise<void> {
    // Check if we're in a git repo for local scope
    if (scope === 'local') {
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      } catch {
        throw new Error('Not a git repository. Use --global to set globally.');
      }
    }

    this.setConfig('user.name', profile.userName, scope);
    this.setConfig('user.email', profile.email, scope);

    // If SSH key is configured, set the SSH command
    if (profile.sshKeyConfigured) {
      const sshCommand = `ssh -o IdentitiesOnly=yes -F ~/.ssh/config`;
      this.setConfig('core.sshCommand', sshCommand, scope);
    }
  }

  /**
   * Clone a repository with a specific profile
   * Returns the directory where the repo was cloned
   */
  async clone(url: string, directory: string | undefined, profile: GitProfile): Promise<string> {
    const args = ['git', 'clone', url];
    if (directory) {
      args.push(directory);
    }

    try {
      execSync(args.join(' '), { stdio: 'inherit' });

      // Determine the cloned directory name
      const targetDir = directory || url.split('/').pop()?.replace('.git', '') || '.';
      const originalDir = process.cwd();
      
      // Change to the cloned directory and set the profile
      process.chdir(targetDir);
      await this.applyProfile(profile, 'local');
      
      // Get absolute path for display
      const clonedPath = process.cwd();
      
      // Change back to original directory
      process.chdir(originalDir);
      
      return clonedPath;
    } catch (error) {
      throw new Error(`Clone failed: ${error}`);
    }
  }

  /**
   * Check if current directory is a git repository
   */
  isGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}
