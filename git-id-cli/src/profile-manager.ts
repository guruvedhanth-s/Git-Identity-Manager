import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GitProfile } from './types';

export class ProfileManager {
  private configPath: string;
  private profiles: GitProfile[] = [];

  constructor() {
    // Store config in user's home directory
    const configDir = path.join(os.homedir(), '.git-id');
    this.configPath = path.join(configDir, 'profiles.json');
    this.ensureConfigDir(configDir);
    this.loadProfiles();
  }

  private ensureConfigDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadProfiles(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        this.profiles = JSON.parse(content);
      }
    } catch {
      this.profiles = [];
    }
  }

  private saveProfiles(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(this.profiles, null, 2));
  }

  getProfiles(): GitProfile[] {
    return [...this.profiles];
  }

  getProfile(name: string): GitProfile | undefined {
    return this.profiles.find(p => p.name.toLowerCase() === name.toLowerCase());
  }

  addProfile(profile: GitProfile): void {
    if (this.getProfile(profile.name)) {
      throw new Error(`Profile "${profile.name}" already exists`);
    }
    this.profiles.push(profile);
    this.saveProfiles();
  }

  updateProfile(name: string, updates: Partial<GitProfile>): void {
    const index = this.profiles.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    if (index === -1) {
      throw new Error(`Profile "${name}" not found`);
    }
    this.profiles[index] = { ...this.profiles[index], ...updates };
    this.saveProfiles();
  }

  deleteProfile(name: string): void {
    const index = this.profiles.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    if (index === -1) {
      throw new Error(`Profile "${name}" not found`);
    }
    this.profiles.splice(index, 1);
    this.saveProfiles();
  }

  deleteAllProfiles(): void {
    this.profiles = [];
    this.saveProfiles();
  }
}
