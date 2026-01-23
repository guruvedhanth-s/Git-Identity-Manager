# Git Identity Manager - Usage Guide

> **Complete guide for using Git Identity Manager to manage multiple Git identities**

---

## Table of Contents

- [Getting Started](#getting-started)
- [Shell Configuration](#shell-configuration)
- [Creating Profiles](#creating-profiles)
- [Using Profiles](#using-profiles)
- [Working with Multiple GitHub Accounts](#working-with-multiple-github-accounts)
- [Commands Reference](#commands-reference)
- [SSH Key Management](#ssh-key-management)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Repository Access](#repository-access)

---

## Getting Started

### Installation

```bash
npm i -g @guruvedhanth-s/git-id
```

**Shell configuration is automatic!** The installation script will:
- ✅ Detect your shell (Bash/Zsh)
- ✅ Add the `--profile` support function
- ✅ Update your shell config file (~/.bashrc or ~/.zshrc)

After installation:
```bash
# Reload your shell
source ~/.bashrc  # or source ~/.zshrc

# Or simply restart your terminal
```

Verify installation:
```bash
git-id --version
```

---

## Shell Configuration

### Automatic Configuration

When you install the package globally, the setup script automatically:

1. **Detects your shell** - Checks for `.bashrc`, `.bash_profile`, `.zshrc`, `.profile`
2. **Adds the git function** - Enables `--profile` support for all git commands
3. **Skips if already configured** - Won't duplicate if already present

**What gets added:**
```bash
# Git Identity Manager - START
git() {
    if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
# Git Identity Manager - END
```

### Manual Configuration (If Needed)

If automatic setup didn't work, manually add to your shell config:

**For Git Bash (Windows) - `~/.bashrc`:**
```bash
git() {
    if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
```

**For Zsh (Mac/Linux) - `~/.zshrc`:**
```bash
git() {
    if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

### Verify Configuration

Check if the function is active:
```bash
type git
```

Expected output:
```
git is a function
```

---

## Creating Profiles

### Method 1: GitHub Authentication (Recommended)

The easiest way to create a profile is using GitHub OAuth:

```bash
git-id add --github
```

**What happens:**
1. You'll be prompted to enter a profile name (e.g., "work", "personal")
2. Your browser opens to GitHub authorization page
3. You sign in with your GitHub account
4. SSH key is automatically generated
5. SSH key is uploaded to your GitHub account
6. Profile is saved and ready to use

**Example:**
```
→ Enter profile name: work
→ Opening GitHub authorization page...
→ Authorize 'Git Identity Manager' in your browser
→ ✓ Authorized successfully
→ ✓ SSH key generated
→ ✓ SSH key uploaded to GitHub
→ ✓ Profile 'work' created successfully!
```

### Method 2: Manual Configuration

For more control or non-GitHub accounts:

```bash
git-id add --manual
```

**You'll be prompted for:**
- **Profile name:** Identifier for this profile (e.g., "client-acme")
- **User name:** Your full name for commits
- **Email:** Email address for commits
- **GitHub username (optional):** Your GitHub username
- **SSH key generation:** Whether to generate a new SSH key
- **GPG signing key (optional):** Your GPG key ID for signed commits

---

## Using Profiles

### Clone with Profile

Start with the correct identity from the beginning:

```bash
git clone https://github.com/company/repo.git --profile work
```

This automatically:
- Clones the repository
- Configures user.name and user.email
- Sets up SSH key authentication
- Repository is ready to commit/push

### Switch Profile in Existing Repository

Change the identity for an existing repo:

```bash
cd my-repo
git-id use personal
```

Verify the switch:
```bash
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

### Push/Pull with Profile

Use any Git command with `--profile`:

```bash
# Push with specific profile
git push origin main --profile work

# Pull with specific profile
git pull --profile personal

# Fetch with specific profile
git fetch --profile work

# Any git command works!
git commit -m "Update" --profile work
git checkout -b feature --profile personal
```

---

## Working with Multiple GitHub Accounts

### Scenario: Work and Personal Accounts

**Step 1: Create Profiles**
```bash
# Work account
git-id add --github
→ Name: work
→ Sign in with work@company.com

# Personal account
git-id add --github
→ Name: personal
→ Sign in with personal@gmail.com
```

**Step 2: Clone Repositories**
```bash
# Work project
git clone https://github.com/company/project.git --profile work
cd project
git-id current  # Verify work profile is active

# Personal project
git clone https://github.com/username/my-app.git --profile personal
cd my-app
git-id current  # Verify personal profile is active
```

**Step 3: Work on Both Projects**
```bash
# Work on company project
cd project
git checkout -b feature
# ... make changes ...
git commit -m "Add feature"
git push origin feature --profile work

# Work on personal project
cd ../my-app
git checkout -b experiment
# ... make changes ...
git commit -m "Try new approach"
git push origin experiment --profile personal
```

Each profile uses:
- ✅ Correct email address
- ✅ Correct SSH key
- ✅ Isolated Git history
- ✅ No identity mixing

---

## Commands Reference

### Profile Management Commands

#### List All Profiles
```bash
git-id list
```

Shows all configured profiles with their details.

#### Create Profile (GitHub)
```bash
git-id add --github
```

Create a profile with GitHub OAuth authentication.

#### Create Profile (Manual)
```bash
git-id add --manual
```

Create a profile by entering details manually.

#### Delete Profile
```bash
git-id delete <profile-name>
```

Delete a specific profile.

#### Delete All Profiles
```bash
git-id delete --all
```

Delete all profiles (confirmation required).

### Profile Usage Commands

#### Switch Profile
```bash
git-id use <profile-name>
```

Switch to a profile in the current repository.

#### Apply Profile Globally
```bash
git-id use <profile-name> --global
```

Apply profile to global Git configuration.

#### Show Current Identity
```bash
git-id current
```

Display the current Git identity configuration.

#### Test SSH Connection
```bash
git-id test <profile-name>
```

Test SSH connection to GitHub using the profile's key.

### Git Commands with --profile

Use `--profile` flag with any Git command:

```bash
# Clone
git clone <url> --profile <profile-name>

# Push
git push [remote] [branch] --profile <profile-name>

# Pull
git pull [remote] [branch] --profile <profile-name>

# Fetch
git fetch [remote] --profile <profile-name>

# Any Git command
git <any-command> --profile <profile-name>
```

---

## SSH Key Management

### Automatic SSH Key Generation

When you create a profile with `--github`, Git Identity Manager:

1. **Generates ED25519 key pair** (most secure)
2. **Saves private key** to `~/.ssh/id_ed25519_<profile>`
3. **Saves public key** to `~/.ssh/id_ed25519_<profile>.pub`
4. **Uploads public key** to your GitHub account
5. **Configures Git** to use the key automatically

### SSH Key Locations

```
~/.ssh/
├── id_ed25519_work          # Work profile private key
├── id_ed25519_work.pub      # Work profile public key
├── id_ed25519_personal      # Personal profile private key
├── id_ed25519_personal.pub  # Personal profile public key
└── config                    # SSH configuration
```

### SSH Config Auto-Configuration

Git Identity Manager automatically updates `~/.ssh/config`:

```ssh
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

### Testing SSH Connections

Test if SSH authentication works:

```bash
# Using git-id command
git-id test work

# Manual test
ssh -T git@github.com -i ~/.ssh/id_ed25519_work
```

Expected output:
```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

### Using Existing SSH Keys

If you already have SSH keys:

```bash
git-id add --manual
→ Profile name: existing
→ User name: John Doe
→ Email: john@example.com
→ SSH key path: ~/.ssh/id_rsa_existing
```

---

## Advanced Features

### GPG Commit Signing

#### Setup GPG Signing

1. **Generate GPG key** (if needed):
   ```bash
   gpg --full-generate-key
   # Choose: RSA and RSA, 4096 bits
   ```

2. **Get your key ID**:
   ```bash
   gpg --list-secret-keys --keyid-format=long
   # Copy the key ID (e.g., ABC123DEF456)
   ```

3. **Add to profile**:
   When creating with `--manual`, enter the GPG key ID when prompted.

4. **Export to GitHub**:
   ```bash
   gpg --armor --export <KEY_ID>
   # Copy output and add to GitHub → Settings → GPG keys
   ```

#### Automatic Configuration

Git Identity Manager automatically sets:
```bash
git config --local user.signingkey <KEY_ID>
git config --local commit.gpgsign true
```

All commits will be automatically signed!

### Profile Data Storage

Profiles are stored in:
```
~/.git-id/
└── profiles.json
```

**Profile structure:**
```json
{
  "work": {
    "name": "John Doe",
    "email": "john@company.com",
    "github": "johndoe-work",
    "sshKey": "~/.ssh/id_ed25519_work",
    "signingKey": "ABC123DEF456"
  }
}
```

---

## Troubleshooting

### Issue: Command not found: git-id

**Solution:**
```bash
# Reinstall globally
npm i -g @guruvedhanth-s/git-id

# Verify
git-id --version
```

### Issue: --profile flag not working

**Symptom:** `git clone <url> --profile work` doesn't work

**Solution:**

1. **Check if function is configured:**
   ```bash
   type git
   ```
   Should show: "git is a function"

2. **If not configured, reload shell:**
   ```bash
   source ~/.bashrc  # or source ~/.zshrc
   ```

3. **If still not working, manually add the function:**
   Edit `~/.bashrc` or `~/.zshrc` and add:
   ```bash
   git() {
       if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
           gitp "$@"
       else
           command git "$@"
       fi
   }
   ```
   Then reload: `source ~/.bashrc`

### Issue: SSH authentication failed

**Symptom:** `Permission denied (publickey)`

**Solution:**
```bash
# Test SSH connection
git-id test <profile-name>

# Manual test
ssh -T git@github.com -i ~/.ssh/id_ed25519_<profile>

# Check if key is added to GitHub
# Go to: GitHub → Settings → SSH and GPG keys
```

### Issue: Wrong identity on commits

**Symptom:** Commits show wrong email/name

**Solution:**
```bash
# Check current identity
git-id current

# Switch to correct profile
git-id use <profile-name>

# Verify
git config user.email
```

### Issue: Profile not found

**Symptom:** `Error: Profile 'work' not found`

**Solution:**
```bash
# List all profiles
git-id list

# Create missing profile
git-id add --github
```

### Issue: Multiple SSH keys conflict

**Symptom:** Wrong SSH key being used

**Solution:**
Git Identity Manager sets `core.sshCommand` per repository to avoid conflicts:
```bash
# Check SSH command
git config core.sshCommand

# Should show: ssh -i ~/.ssh/id_ed25519_<profile>
```

---

## Best Practices

### 1. Use Descriptive Profile Names

✅ Good: `work`, `personal`, `client-acme`, `opensource`  
❌ Bad: `profile1`, `test`, `temp`

### 2. Clone with --profile from the Start

Always specify profile when cloning:
```bash
git clone <url> --profile work
```

This ensures correct identity from the first commit.

### 3. Verify Identity Before Committing

Before making commits in a new repository:
```bash
git-id current
```

### 4. One Profile Per GitHub Account

Create separate profiles for each GitHub account:
- `work` → work@company.com
- `personal` → personal@gmail.com
- `freelance` → freelance@email.com

### 5. Test SSH After Creating Profile

After creating a profile, test the SSH connection:
```bash
git-id test <profile-name>
```

### 6. Keep Profiles Backed Up

Your profiles are stored in `~/.git-id/profiles.json`. Consider backing this up periodically.

### 7. Use Manual Method for Non-GitHub Hosts

For GitLab, Bitbucket, or self-hosted Git:
```bash
git-id add --manual
# Then manually add SSH key to the platform
```

---

## Repository Access

### Source Code

The complete source code is available on GitHub:

**Repository:** [https://github.com/guruvedhanth-s/Git-Identity-Manager](https://github.com/guruvedhanth-s/Git-Identity-Manager)

### Project Structure

```
Git-Identity-Manager/
├── git-id-cli/                  # CLI tool source
│   ├── src/
│   │   ├── index.ts            # Main entry point
│   │   ├── profile-manager.ts  # Profile management
│   │   ├── github-auth.ts      # GitHub OAuth
│   │   ├── ssh-manager.ts      # SSH key handling
│   │   ├── git-config.ts       # Git configuration
│   │   └── git-wrapper.ts      # Git command wrapper
│   ├── package.json
│   └── tsconfig.json
├── README.md                    # Package overview
└── DOCUMENTATION.md             # This file
```

### Contributing

We welcome contributions!

**Report issues:**  
[https://github.com/guruvedhanth-s/Git-Identity-Manager/issues](https://github.com/guruvedhanth-s/Git-Identity-Manager/issues)

**Discussions:**  
[https://github.com/guruvedhanth-s/Git-Identity-Manager/discussions](https://github.com/guruvedhanth-s/Git-Identity-Manager/discussions)

**Pull requests:**  
Fork the repository and submit a PR with your improvements!

### Building from Source

```bash
# Clone the repository
git clone https://github.com/guruvedhanth-s/Git-Identity-Manager.git
cd Git-Identity-Manager/git-id-cli

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally
npm link

# Test
git-id --version
```

---

## Getting Help

### Documentation

- **Package Overview:** [README.md](README.md)
- **Usage Guide:** This document
- **npm Package:** [npmjs.com/package/@guruvedhanth-s/git-id](https://www.npmjs.com/package/@guruvedhanth-s/git-id)

### Support Channels

- **GitHub Issues:** Report bugs and request features
- **GitHub Discussions:** Ask questions and share ideas
- **Package Documentation:** Check the npm package page

---

## Summary

Git Identity Manager makes working with multiple Git identities effortless:

1. **Install:** `npm i -g @guruvedhanth-s/git-id`
2. **Configure Shell:** Add the function to `~/.bashrc` or `~/.zshrc`
3. **Create Profiles:** `git-id add --github`
4. **Use Profiles:** `git clone <url> --profile <name>`
5. **Work Seamlessly:** Each profile uses the correct identity automatically

No more wrong commits, no more SSH key confusion, no more identity mixing!
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
