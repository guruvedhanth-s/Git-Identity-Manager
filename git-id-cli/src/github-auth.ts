import * as https from 'https';
import chalk from 'chalk';
import open from 'open';
import ora from 'ora';
import { GitHubUser, DeviceCodeResponse } from './types';

export class GitHubAuth {
  // Your GitHub OAuth App Client ID
  private static readonly CLIENT_ID = 'Ov23liig7GSttaj33WLN';

  /**
   * Authenticate using GitHub Device Flow
   */
  async authenticateWithDeviceFlow(): Promise<string | null> {
    const spinner = ora('Initializing GitHub authentication...').start();

    try {
      // Step 1: Get device code
      const deviceCode = await this.getDeviceCode();
      spinner.stop();

      console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold('  GitHub Authentication'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      console.log(`  1. Open: ${chalk.underline(deviceCode.verification_uri)}`);
      console.log(`  2. Enter code: ${chalk.bold.yellow(deviceCode.user_code)}\n`);
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      // Open browser automatically
      await open(deviceCode.verification_uri);

      // Step 2: Poll for access token
      const tokenSpinner = ora('Waiting for GitHub authorization...').start();
      const accessToken = await this.pollForAccessToken(deviceCode);
      tokenSpinner.succeed('GitHub authorization successful!');

      return accessToken;
    } catch (error) {
      spinner.fail('GitHub authentication failed');
      throw error;
    }
  }

  private async getDeviceCode(): Promise<DeviceCodeResponse> {
    return new Promise((resolve, reject) => {
      const data = `client_id=${GitHubAuth.CLIENT_ID}&scope=read:user,user:email,admin:public_key`;

      const req = https.request({
        hostname: 'github.com',
        path: '/login/device/code',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else {
              resolve(response);
            }
          } catch {
            reject(new Error('Invalid response from GitHub'));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  private async pollForAccessToken(deviceCode: DeviceCodeResponse): Promise<string> {
    const interval = (deviceCode.interval || 5) * 1000;
    const expiresAt = Date.now() + deviceCode.expires_in * 1000;

    while (Date.now() < expiresAt) {
      await this.sleep(interval);

      try {
        const result = await this.checkAccessToken(deviceCode.device_code);
        if (result.access_token) {
          return result.access_token;
        }
        if (result.error === 'expired_token') {
          throw new Error('Authorization expired. Please try again.');
        }
        if (result.error && result.error !== 'authorization_pending' && result.error !== 'slow_down') {
          throw new Error(result.error_description || result.error);
        }
      } catch (error) {
        if ((error as Error).message !== 'authorization_pending') {
          throw error;
        }
      }
    }

    throw new Error('Authorization timed out. Please try again.');
  }

  private async checkAccessToken(deviceCode: string): Promise<{ access_token?: string; error?: string; error_description?: string }> {
    return new Promise((resolve, reject) => {
      const data = `client_id=${GitHubAuth.CLIENT_ID}&device_code=${deviceCode}&grant_type=urn:ietf:params:oauth:grant-type:device_code`;

      const req = https.request({
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error('Invalid response from GitHub'));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Get authenticated user info
   */
  async getAuthenticatedUser(accessToken: string): Promise<GitHubUser | null> {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'git-id-cli',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              resolve(JSON.parse(body));
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.end();
    });
  }

  /**
   * Get user's primary email
   */
  async getUserEmail(accessToken: string): Promise<string | null> {
    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.github.com',
        path: '/user/emails',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'git-id-cli',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const emails = JSON.parse(body);
              const primary = emails.find((e: { primary: boolean }) => e.primary);
              resolve(primary?.email || emails[0]?.email || null);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.end();
    });
  }

  /**
   * Upload SSH public key to GitHub
   */
  async uploadSSHKey(accessToken: string, publicKey: string, title: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data = JSON.stringify({ title, key: publicKey });

      const req = https.request({
        hostname: 'api.github.com',
        path: '/user/keys',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'git-id-cli',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 201) {
            resolve(true);
          } else if (res.statusCode === 422) {
            // Key already exists
            console.log(chalk.yellow('  SSH key already exists on GitHub'));
            resolve(true);
          } else {
            console.error(chalk.red(`  Failed to upload SSH key: ${res.statusCode}`));
            resolve(false);
          }
        });
      });

      req.on('error', () => resolve(false));
      req.write(data);
      req.end();
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
