export interface GitProfile {
  name: string;
  userName: string;
  email: string;
  githubUsername?: string;
  sshKeyConfigured?: boolean;
  createdAt: string;
}

export interface SSHKeyPair {
  privateKey: string;
  publicKey: string;
}

export interface GitHubUser {
  login: string;
  name?: string;
  email?: string;
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}
