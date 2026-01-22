import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { SSHKeyPair } from './types';

const execAsync = promisify(exec);

export class SSHManager {
  private sshDir: string;

  constructor() {
    this.sshDir = path.join(os.homedir(), '.ssh');
    this.ensureSSHDir();
  }

  private ensureSSHDir(): void {
    if (!fs.existsSync(this.sshDir)) {
      fs.mkdirSync(this.sshDir, { recursive: true, mode: 0o700 });
    }
  }

  private getKeyFileName(profileName: string): string {
    return `id_ed25519_${profileName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }

  /**
   * Generate a new SSH key pair
   */
  async generateSSHKey(email: string, profileName: string): Promise<SSHKeyPair> {
    const keyFileName = this.getKeyFileName(profileName);
    const privateKeyPath = path.join(this.sshDir, keyFileName);
    const publicKeyPath = `${privateKeyPath}.pub`;

    // Remove existing keys if they exist
    try {
      if (fs.existsSync(privateKeyPath)) fs.unlinkSync(privateKeyPath);
      if (fs.existsSync(publicKeyPath)) fs.unlinkSync(publicKeyPath);
    } catch {
      // Ignore
    }

    // Generate SSH key using ssh-keygen
    const command = `ssh-keygen -t ed25519 -C "${email}" -f "${privateKeyPath}" -N ""`;
    
    try {
      execSync(command, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Failed to generate SSH key: ${error}`);
    }

    // Read the generated keys
    const privateKey = fs.readFileSync(privateKeyPath, 'utf-8').trim();
    const publicKey = fs.readFileSync(publicKeyPath, 'utf-8').trim();

    // Set proper permissions on private key
    if (process.platform !== 'win32') {
      fs.chmodSync(privateKeyPath, 0o600);
    }

    return { privateKey, publicKey };
  }

  /**
   * Update SSH config with a new host alias for GitHub
   */
  updateSSHConfig(profileName: string, githubUsername: string): void {
    const configPath = path.join(this.sshDir, 'config');
    const keyFileName = this.getKeyFileName(profileName);
    const keyPath = path.join(this.sshDir, keyFileName);
    const hostAlias = `github-${profileName}`;

    // Read existing config
    let existingConfig = '';
    try {
      if (fs.existsSync(configPath)) {
        existingConfig = fs.readFileSync(configPath, 'utf-8');
      }
    } catch {
      // File doesn't exist
    }

    // Markers for our managed entries
    const entryMarkerStart = `# Git-ID - ${profileName}`;
    const entryMarkerEnd = `# End Git-ID - ${profileName}`;

    // Remove existing entry if present
    const startIndex = existingConfig.indexOf(entryMarkerStart);
    const endIndex = existingConfig.indexOf(entryMarkerEnd);
    
    if (startIndex !== -1 && endIndex !== -1) {
      existingConfig = 
        existingConfig.substring(0, startIndex) + 
        existingConfig.substring(endIndex + entryMarkerEnd.length);
    }

    // Create new entry with proper path format
    // Use ~/.ssh/ shorthand to avoid spaces in paths
    const keyPathForConfig = `~/.ssh/${keyFileName}`;

    const newEntry = `
${entryMarkerStart}
Host ${hostAlias}
    HostName github.com
    User git
    IdentityFile ${keyPathForConfig}
    IdentitiesOnly yes
${entryMarkerEnd}
`;

    // Append new entry
    const newConfig = existingConfig.trimEnd() + '\n' + newEntry;

    // Write the config file
    fs.writeFileSync(configPath, newConfig, { encoding: 'utf-8', mode: 0o600 });
  }

  /**
   * Remove SSH config entry for a profile
   */
  async removeSSHConfigEntry(profileName: string): Promise<void> {
    const configPath = path.join(this.sshDir, 'config');
    
    try {
      if (!fs.existsSync(configPath)) return;
      
      let existingConfig = fs.readFileSync(configPath, 'utf-8');
      
      const entryMarkerStart = `# Git-ID - ${profileName}`;
      const entryMarkerEnd = `# End Git-ID - ${profileName}`;

      const startIndex = existingConfig.indexOf(entryMarkerStart);
      const endIndex = existingConfig.indexOf(entryMarkerEnd);
      
      if (startIndex !== -1 && endIndex !== -1) {
        existingConfig = 
          existingConfig.substring(0, startIndex) + 
          existingConfig.substring(endIndex + entryMarkerEnd.length);
        
        fs.writeFileSync(configPath, existingConfig.trim() + '\n', {
          encoding: 'utf-8',
          mode: 0o600,
        });
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Delete SSH key files for a profile
   */
  async deleteKeyFiles(profileName: string): Promise<void> {
    const keyFileName = this.getKeyFileName(profileName);
    const privateKeyPath = path.join(this.sshDir, keyFileName);
    const publicKeyPath = `${privateKeyPath}.pub`;

    try {
      if (fs.existsSync(privateKeyPath)) fs.unlinkSync(privateKeyPath);
      if (fs.existsSync(publicKeyPath)) fs.unlinkSync(publicKeyPath);
    } catch {
      // Ignore
    }
  }

  /**
   * Test SSH connection to GitHub
   */
  async testGitHubConnection(profileName: string): Promise<{ success: boolean; username?: string; error?: string }> {
    const hostAlias = `github-${profileName}`;
    
    try {
      const { stdout, stderr } = await execAsync(
        `ssh -T git@${hostAlias} -o StrictHostKeyChecking=accept-new 2>&1`,
        { timeout: 30000 }
      );

      const output = stdout + stderr;
      
      // GitHub returns "Hi username!" in the output
      const match = output.match(/Hi ([^!]+)!/);
      if (match) {
        return { success: true, username: match[1] };
      }

      if (output.includes('successfully authenticated')) {
        return { success: true };
      }

      return { success: false, error: output.trim() || 'Unknown error' };
    } catch (error: unknown) {
      // SSH -T returns exit code 1 even on success, check stderr
      const err = error as { stdout?: string; stderr?: string; message?: string };
      const output = (err.stdout || '') + (err.stderr || '');
      
      const match = output.match(/Hi ([^!]+)!/);
      if (match) {
        return { success: true, username: match[1] };
      }

      if (output.includes('successfully authenticated')) {
        return { success: true };
      }

      return { success: false, error: output.trim() || err.message || 'Connection failed' };
    }
  }

  /**
   * Add key to SSH agent (optional, best-effort)
   */
  async addToSSHAgent(profileName: string): Promise<boolean> {
    const keyFileName = this.getKeyFileName(profileName);
    const keyPath = path.join(this.sshDir, keyFileName);
    
    try {
      if (process.platform === 'win32') {
        await execAsync(`ssh-add "${keyPath.replace(/\\/g, '/')}"`);
      } else {
        await execAsync(`ssh-add "${keyPath}"`);
      }
      return true;
    } catch {
      // SSH agent not available - that's okay
      return false;
    }
  }
}
