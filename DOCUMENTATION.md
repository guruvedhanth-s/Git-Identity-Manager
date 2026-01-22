# Git Identity Manager - Complete Documentation

> **Command-line tool to manage multiple Git identities with automatic GitHub SSH key setup**

Git Identity Manager is a powerful CLI tool for developers working with multiple Git accounts, organizations, or clients. Use the regular `git` command with `--profile` flag to work seamlessly with different GitHub accounts.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start Guide](#quick-start-guide)
- [Commands](#commands)
  - [Profile Management](#profile-management)
  - [Profile Application](#profile-application)
  - [Using --profile with Git](#using---profile-with-git)
- [Usage Examples](#usage-examples)
- [Advanced Topics](#advanced-topics)
  - [SSH Key Management](#ssh-key-management)
  - [GPG Signing](#gpg-signing)
  - [Multi-Account GitHub Workflows](#multi-account-github-workflows)
  - [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [FAQ](#faq)

---

## Overview

### The Problem

Modern developers often work with multiple Git identities:
- Personal projects on GitHub
- Company repositories requiring corporate email
- Client projects with specific identity requirements
- Multiple GitHub accounts (work, personal, freelance)

Traditional Git configuration is **user-driven** (configured globally), making it easy to:
- Accidentally commit with the wrong email address
- Use incorrect SSH keys for authentication
- Mix up identities across different organizations

### The Solution

Git Identity Manager provides a CLI-based approach to manage Git identities:
- Use regular `git` commands with `--profile` flag
- Profiles are automatically applied on clone, push, pull, and any Git operation
- SSH keys are managed per-profile for seamless multi-account workflows
- GitHub authentication is streamlined with OAuth Device Flow
- Automatic SSH key generation and upload to GitHub

---

## Installation

### Prerequisites
- Node.js 16+ and npm
- Git installed and configured
- Bash/Zsh shell (for `--profile` support)

### Option 1: Install from npm (Recommended)

```bash
# Install globally
npm install -g @guruvedhanth-s/git-id

# Verify installation
git-id --version
```

### Option 2: Install from Source

```bash
# 1. Clone the repository
git clone https://github.com/guruvedhanth-s/Git-Identity-Manager.git
cd Git-Identity-Manager/git-id-cli

# 2. Install dependencies and build
npm install
npm run build

# 3. Link globally to make 'git-id' available
npm link

# 4. Verify installation
git-id --version
```

### Enable `git --profile` Support

Add this function to your shell configuration file:

**For Git Bash on Windows** (`~/.bashrc`):
```bash
# Git Identity Manager - enables 'git --profile' support
git() {
    if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
```

**For Zsh on Mac/Linux** (`~/.zshrc`):
```zsh
# Git Identity Manager - enables 'git --profile' support
git() {
    if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
```

**Reload your shell:**
```bash
# For Bash
source ~/.bashrc

# For Zsh
source ~/.zshrc

# Verify it works
type git  # Should show "git is a function"
```

---

## Quick Start Guide

### 1. Create Your First Profile

```bash
# With GitHub authentication (recommended)
git-id add --github
# Follow the prompts to sign in and auto-configure

# Or manually
git-id add --manual
# Enter profile details interactively
```

**GitHub Sign-in Flow:**
```
→ Enter profile name: "work"
→ Browser opens to GitHub
→ Authorize the application
→ SSH key automatically generated and uploaded
→ Profile ready to use!
```

**Manual Entry Flow:**
```
→ Profile name: work
→ User name: John Doe
→ Email: john.doe@company.com
→ GitHub username (optional): johndoe-company
→ Generate SSH key? (Y/n): Y
→ SSH key generated and saved
→ GPG signing key (optional): ABC123DEF
```

### 2. Use Your Profile

```bash
# Clone a repository with a specific profile
git clone https://github.com/company/project.git --profile work
cd project

# Check current identity
git-id current
```

Output:
```
Current Git Identity:
✓ Profile: work
  user.name = John Doe
  user.email = john.doe@company.com
  core.sshCommand = ssh -i ~/.ssh/id_ed25519_work
```

### 3. Work with Multiple Profiles

```bash
# List all your profiles
git-id list

# Switch profile in an existing repository
cd existing-repo
git-id use personal

# Work with different accounts seamlessly
git clone https://github.com/company/repo.git --profile work
git clone https://github.com/personal/project.git --profile personal
```

---

## Commands

### Profile Management

```bash
# List all profiles
git-id list
# or
gid list

# Create new profile with GitHub sign-in
git-id add --github

# Create new profile manually
git-id add --manual

# Delete a profile
git-id delete <profile-name>

# Delete all profiles
git-id delete --all
```

### Profile Application

```bash
# Switch profile in current repository
git-id use <profile-name>

# Apply profile globally (changes global Git config)
git-id use <profile-name> --global

# Show current Git identity
git-id current

# Test SSH connection
git-id test <profile-name>
```

### Using `--profile` with Git

Once you've enabled the shell function, you can use `--profile` with any git command:

```bash
# Clone with specific profile
git clone https://github.com/user/repo.git --profile work

# Push with specific profile
git push origin main --profile personal

# Pull with specific profile
git pull --profile client-acme

# Fetch with specific profile
git fetch --profile work

# Any git command works!
git commit -m "message" --profile work
git status --profile personal
git checkout -b feature --profile work
git log --profile personal
```

---

## Usage Examples

#### Example 1: Creating Multiple Profiles

```bash
# Create work profile
git-id add --github
→ Name: work
→ Sign in with work GitHub account
→ Profile created: work

# Create personal profile
git-id add --github
→ Name: personal
→ Sign in with personal GitHub account
→ Profile created: personal

# List profiles
git-id list
```

Output:
```
Available Git Profiles:

✓ work
  User: John Doe
  Email: john.doe@company.com
  GitHub: johndoe-company
  SSH Key: ~/.ssh/id_ed25519_work

✓ personal
  User: John Doe
  Email: john@personal.com
  GitHub: johndoe
  SSH Key: ~/.ssh/id_ed25519_personal
```

#### Example 2: Cloning with Different Profiles

```bash
# Clone work project
git clone https://github.com/company/project.git --profile work
cd project
git-id current
```

Output:
```
Current Git Identity:
✓ Profile: work
  user.name = John Doe
  user.email = john.doe@company.com
  core.sshCommand = ssh -i ~/.ssh/id_ed25519_work
```

```bash
# Clone personal project
git clone https://github.com/johndoe/my-project.git --profile personal
cd my-project
git-id current
```

Output:
```
Current Git Identity:
✓ Profile: personal
  user.name = John Doe
  user.email = john@personal.com
  core.sshCommand = ssh -i ~/.ssh/id_ed25519_personal
```

#### Example 3: Switching Profile in Existing Repository

```bash
cd existing-repo

# Check current identity
git-id current
→ Profile: work

# Switch to personal
git-id use personal

# Verify switch
git config user.email
→ john@personal.com

# Now commits use personal identity
git commit -m "Personal contribution"
```

#### Example 4: Testing SSH Connection

```bash
# Test work profile connection
git-id test work
```

Output:
```
Testing SSH connection to GitHub...
Using key: ~/.ssh/id_ed25519_work

✓ Successfully authenticated to GitHub!
  Username: johndoe-company
```

#### Example 5: Working with Multiple GitHub Accounts

```bash
# Setup
git-id add --github  # Create "work" profile with work account
git-id add --github  # Create "personal" profile with personal account

# Clone work repository
git clone git@github.com:company/repo.git --profile work
cd repo

# Work on feature
git checkout -b feature
# ... make changes ...
git commit -m "Add feature"
git push origin feature --profile work  # Uses work SSH key

# Switch to personal project
cd ~/personal-projects
git clone git@github.com:johndoe/project.git --profile personal
cd project

# Work on project
# ... make changes ...
git commit -m "Update readme"
git push origin main --profile personal  # Uses personal SSH key
```

---

## Advanced Topics

### SSH Key Management

#### How SSH Keys Work with Profiles

When you create a profile with SSH key support, Git Identity Manager:
1. Generates an ED25519 key pair (or stores your provided key)
2. Stores the private key in `~/.ssh/` directory
3. Stores the public key alongside the private key
4. Configures `core.sshCommand` to use the correct private key
5. Auto-configures SSH host aliases in `~/.ssh/config`

#### Key Storage Locations

- **SSH keys:** `~/.ssh/id_ed25519_<profile-name>`
- **SSH config:** `~/.ssh/config` (auto-configured with host aliases)
- **Profile data:** `~/.git-id/profiles.json`

#### SSH Config Auto-Configuration

The CLI tool automatically creates SSH host aliases:

```ssh
# ~/.ssh/config (auto-generated)

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes
```

You can then clone using aliases:
```bash
git clone git@github-work:company/repo.git
git clone git@github-personal:johndoe/project.git
```

#### Manual SSH Key Management

**Add Existing SSH Key:**
```bash
# When creating a profile manually, specify the key path
git-id add --manual
→ SSH key path: ~/.ssh/id_rsa_custom
```

**Generate New Key Manually:**
```bash
# Generate ED25519 key
ssh-keygen -t ed25519 -C "your@email.com" -f ~/.ssh/id_ed25519_custom

# Add to GitHub
cat ~/.ssh/id_ed25519_custom.pub
# Copy and paste to GitHub → Settings → SSH Keys

# Configure in profile
git-id add --manual
→ SSH Key Path: ~/.ssh/id_ed25519_custom
```

#### Testing SSH Connections

**Via CLI:**
```bash
git-id test <profile-name>
```

**Manual Test:**
```bash
ssh -T git@github.com -i ~/.ssh/id_ed25519_work
# Expected: "Hi username! You've successfully authenticated..."
```

---

### GPG Signing

#### Setting Up GPG Signing

1. **Generate GPG Key** (if you don't have one):
   ```bash
   gpg --full-generate-key
   # Choose: RSA and RSA, 4096 bits, no expiration
   # Enter your name and email
   ```

2. **Get Your Key ID**:
   ```bash
   gpg --list-secret-keys --keyid-format LONG
   # Look for: sec   rsa4096/KEYID
   ```

3. **Add to Profile**:
   - VS Code: Edit profile → Enter signing key ID
   - CLI: When creating profile, enter GPG key when prompted

3. **Add to Profile**:
   - When creating profile: `git-id add --manual`
   - Enter GPG key when prompted

4. **Export Public Key to GitHub**:
   ```bash
   gpg --armor --export KEYID
   # Copy output and add to GitHub → Settings → GPG Keys
   ```

#### Automatic Configuration

When a profile has a signing key, Git Identity Manager automatically sets:
```bash
git config --local user.signingkey KEYID
git config --local commit.gpgsign true
```

#### Per-Commit Signing

```bash
# With auto-signing enabled (profile has signing key)
git commit -m "Signed commit"  # Automatically signed

# Force sign even without profile configuration
git commit -S -m "Force signed"

# Skip signing even with profile configuration
git commit --no-gpg-sign -m "Unsigned"
```

---

### Multi-Account GitHub Workflows

#### Scenario: Work and Personal GitHub Accounts

**Setup:**
```bash
# 1. Create profiles
git-id add --github  # work account
git-id add --github  # personal account

# 2. Clone repositories with correct profiles
git clone git@github.com:company/work-repo.git --profile work
git clone git@github.com:me/personal-repo.git --profile personal
```

**Daily Workflow:**
```bash
# Work on company project
cd work-repo
git-id current  # Verify: work profile active
git checkout -b feature
# ... code ...
git commit -m "Add feature"
git push --profile work

# Work on personal project
cd personal-repo
git-id current  # Verify: personal profile active
git checkout -b experiment
# ... code ...
git commit -m "Try new approach"
git push --profile personal
```

#### Scenario: Multiple Clients

```bash
# Create separate profiles for each client
git-id add --github  # client-a
git-id add --github  # client-b

# Clone client repositories
git clone git@github.com:client-a/project.git --profile client-a
git clone git@github.com:client-b/project.git --profile client-b
```

Each client gets:
- Dedicated email address
- Separate SSH key
- Isolated commit history
- No identity leakage

---

### Troubleshooting

#### Problem: Profile Not Found

**Symptom:**
```
Error: Profile 'work' not found
```

**Solution:**
1. Check available profiles:
   ```bash
   git-id list
   ```
2. Create the missing profile:
   ```bash
   git-id add --github
   ```

#### Problem: SSH Authentication Failed

**Symptom:**
```
git@github.com: Permission denied (publickey)
```

**Solutions:**

1. **Verify Key Exists:**
   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

2. **Test Connection:**
   ```bash
   git-id test <profile-name>
   # or manually
   ssh -T git@github.com -i ~/.ssh/id_ed25519_<profile>
   ```

3. **Check Key Permissions:**
   ```bash
   chmod 600 ~/.ssh/id_ed25519_*
   chmod 644 ~/.ssh/id_ed25519_*.pub
   ```

4. **Verify Key on GitHub:**
   - Go to GitHub → Settings → SSH and GPG keys
   - Check if your key is listed
   - Re-upload if needed:
     ```bash
     cat ~/.ssh/id_ed25519_<profile>.pub
     # Copy and add to GitHub
     ```

5. **Check SSH Config:**
   ```bash
   cat ~/.ssh/config
   # Verify host aliases are correct
   ```

#### Problem: Configuration Mismatch

   - Check if your key is listed
   - Re-upload if needed:
     ```bash
     cat ~/.ssh/id_ed25519_<profile>.pub
     # Copy and add to GitHub
     ```

5. **Check SSH Config:**
   ```bash
   cat ~/.ssh/config
   # Verify host aliases are correct
   ```

#### Problem: `--profile` Flag Not Working

**Symptom:**
```
error: unknown option `profile'
```

**Solution:**

1. **Verify Shell Function:**
   ```bash
   type git
   # Should show: "git is a function"
   ```

2. **Re-add Function:**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   git() {
       if [[ " $* " == *" --profile "* ]]; then
           gitp "$@"
       else
           command git "$@"
       fi
   }
   
   # Reload
   source ~/.bashrc
   ```

3. **Verify gitp Command:**
   ```bash
   which gitp
   # Should show: /usr/local/bin/gitp or similar
   ```

4. **Re-link CLI:**
   ```bash
   cd git-id-cli
   npm link
   ```

#### Problem: Command Not Found: git-id

**Symptom:**
```
bash: git-id: command not found
```

**Solution:**
```bash
# Navigate to CLI directory
cd path/to/git-identity-manager/git-id-cli

# Re-install and link
npm install
npm run build
npm link

# Verify
which git-id
git-id --version
```

#### Problem: Wrong Identity After Clone

**Symptom:**
```
# Cloned with --profile work, but using personal identity
git config user.email
→ john@personal.com (wrong!)
```

**Solution:**
```bash
# Reapply correct profile
git-id use work

# Verify
git config user.email
→ john.doe@company.com (correct!)
```

#### Problem: GPG Signing Fails

**Symptom:**
```
error: gpg failed to sign the data
```

**Solutions:**

1. **Verify GPG Key:**
   ```bash
   gpg --list-secret-keys
   # Check if key exists
   ```

2. **Test Signing:**
   ```bash
   echo "test" | gpg --clearsign
   ```

3. **Configure GPG TTY:**
   ```bash
   export GPG_TTY=$(tty)
   # Add to ~/.bashrc
   ```

4. **Check Key Trust:**
   ```bash
   gpg --edit-key KEYID
   > trust
   > 5 (ultimate trust)
   > quit
   ```

---

## Best Practices

### 1. Profile Naming

✅ **Good:**
```json
{ "name": "work" }
{ "name": "personal" }
{ "name": "client-acme" }
{ "name": "github-personal" }
```

❌ **Avoid:**
```json
{ "name": "My Work Profile 2023" }  // Too long
{ "name": "profile1" }              // Not descriptive
{ "name": "P" }                      // Too short
```

### 2. SSH Key Organization

**One Key Per Profile:**
```
~/.ssh/id_ed25519_work
~/.ssh/id_ed25519_personal
~/.ssh/id_ed25519_client_a
```

**Not Recommended:**
```
~/.ssh/id_rsa (shared across profiles)
```

### 3. Regular Profile Audits

```bash
# Periodically review profiles
git-id list

# Delete unused profiles
git-id delete old-client

# Test SSH connections
git-id test work
git-id test personal
```

### 4. Backup SSH Keys

```bash
# Backup private keys (store securely!)
cp ~/.ssh/id_ed25519_* ~/secure-backup/

# Or use password-protected keys
ssh-keygen -t ed25519 -C "email" -f ~/.ssh/id_ed25519_work
→ Enter passphrase when prompted
```

### 5. Use GitHub Sign-in for New Profiles

GitHub OAuth provides:
- Automatic key generation
- Automatic key upload
- Guaranteed correct GitHub username
- Less room for error

### 6. Team Onboarding

Create a team guide:

```markdown
# Git Identity Setup

1. Install Git Identity Manager CLI
   - Clone repo and run `npm link`
2. Add shell function to ~/.bashrc
3. Create profile: `git-id add --github`
   - Use your @company.com email
4. Clone repos with `--profile company`
```

### 7. Security Considerations

- ✅ Use GitHub OAuth (Device Flow) for authentication
- ✅ Set proper file permissions (600 for private keys)
- ✅ Use ED25519 keys (stronger, smaller)
- ✅ Use password-protected keys when possible
- ❌ Don't share private keys
- ❌ Don't commit keys to repositories
- ❌ Don't use the same key across multiple services

---

## FAQ

### General Questions

**Q: Will this affect my global Git configuration?**
A: No. The tool modifies only **local** repository configuration (`git config --local`), never global (unless you use `--global` flag explicitly).

**Q: Can I use this with non-GitHub providers (GitLab, Bitbucket)?**
A: Yes! SSH key management works with any Git provider. GitHub OAuth is optional.

**Q: Is this safe for company repositories?**
A: Yes. Keys are stored securely in ~/.ssh with proper permissions, and you have full control over which keys are used where.

### Technical Questions

**Q: Where are profiles and SSH keys stored?**
A:
- **Profiles:** `~/.git-id/profiles.json`
- **SSH keys:** `~/.ssh/id_ed25519_<profile>`
- **SSH config:** `~/.ssh/config`

**Q: How does `--profile` work?**
A: The shell function intercepts `git --profile` commands and calls `gitp`, which sets the profile then executes the git command.

**Q: Can I use existing SSH keys?**
A: Yes! When creating a profile manually, provide the path to your existing key.

**Q: What if I already have a `.git/config` setup?**
A: The tool will add/update only the identity-related fields (`user.name`, `user.email`, `core.sshCommand`). Other settings remain untouched.

**Q: Does this work with Git hooks?**
A: Yes. The profile is applied before Git operations, so hooks see the correct identity.

**Q: Can I use different GPG keys per profile?**
A: Yes. Each profile can have its own signing key configuration.

### Workflow Questions

**Q: Can I override a profile temporarily?**
A: Yes. Use `git-id use <other-profile>` in the repository.

**Q: What if team members don't have the tool installed?**
A: They can still work normally. The tool only configures standard Git settings that work with any Git client.

**Q: Can I use this in CI/CD?**
A: Yes. Configure profiles in the CI environment first, then use `git-id use <profile>` in your CI scripts.

**Q: How do I migrate from manual Git config?**
A:
1. Create profiles matching your current configs: `git-id add --manual`
2. Use profiles in your repos: `git-id use <profile>`
3. Remove manual `git config --local` commands from your workflow

---

## Project Structure

### CLI Tool

```
git-id-cli/
└── src/
    ├── index.ts             # CLI entry point (git-id commands)
    ├── git-wrapper.ts       # Git command wrapper (gitp)
    ├── profile-manager.ts   # Profile management
    ├── github-auth.ts       # GitHub OAuth
    ├── ssh-manager.ts       # SSH key operations
    ├── git-config.ts        # Git config interface
    ├── prompts.ts           # Interactive prompts
    └── types.ts             # TypeScript types
```

### File Locations

| File | Location | Description |
|------|----------|-------------|
| Profiles | `~/.git-id/profiles.json` | Your saved profiles |
| SSH Keys | `~/.ssh/id_ed25519_<profile>` | SSH keys per profile |
| SSH Config | `~/.ssh/config` | SSH host aliases |

---

## Contributing

We welcome contributions! Please see the repository for:
- Issue tracker
- Pull request guidelines
- Development setup instructions
- Code of conduct

---

## Support

**npm Package:** [npmjs.com/package/@guruvedhanth-s/git-id](https://www.npmjs.com/package/@guruvedhanth-s/git-id)  
**Documentation:** This file  
**Issues:** [GitHub Issues](https://github.com/guruvedhanth-s/Git-Identity-Manager/issues)  
**Discussions:** [GitHub Discussions](https://github.com/guruvedhanth-s/Git-Identity-Manager/discussions)

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Publishing

Want to publish your own version? See [PUBLISHING.md](PUBLISHING.md)

---

## Changelog

### v1.0.0
- GitHub OAuth Device Flow integration
- Automatic SSH key generation and upload
- `--profile` support for all git commands
- Profile management CLI
- Multi-account workflows
- GPG signing support

---

## Acknowledgments

Built with ❤️ for developers managing multiple Git identities.

Special thanks to:
- GitHub OAuth API
- Node.js and TypeScript communities
- The open-source community

---

**Made with ❤️ by developers, for developers.**

*Last updated: January 2026*
