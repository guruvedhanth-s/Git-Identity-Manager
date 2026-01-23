# Git Identity Manager - CLI Tool

> Development README for the Git Identity Manager CLI package

A CLI tool to manage multiple Git identities with automatic GitHub SSH key setup. Use the regular `git` command with `--profile` flag to work with different GitHub accounts.

## Features

- **Use Regular Git** - Just add `--profile` to any git command
- **Multiple Git Profiles** - Create and switch between different Git identities  
- **GitHub OAuth Integration** - Sign in with GitHub to auto-configure everything
- **Automatic SSH Key Management** - Generates and uploads SSH keys to GitHub
- **Automatic Shell Configuration** - Sets up `--profile` support on installation
- **Profile-based Cloning** - Clone repos with the correct identity automatically

---

## For Users

### Installation from npm

```bash
npm i -g @guruvedhanth-s/git-id
```

**That's it!** Shell configuration is automatic.

For complete documentation, see:
- [Main README](../README.md) - Package overview and quick start
- [DOCUMENTATION](../DOCUMENTATION.md) - Complete usage guide

---

## For Developers

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/guruvedhanth-s/Git-Identity-Manager.git
cd Git-Identity-Manager/git-id-cli

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally for testing
npm link
```

### Development Workflow

```bash
# Build after changes
npm run build

# Run in development mode
npm run dev

# Test the CLI
git-id --version
git-id list
```

---

## Quick Start

```bash
# Create a profile with GitHub sign-in
git-id add --github

# List your profiles  
git-id list

# Clone with a profile
git clone https://github.com/user/repo.git --profile work

# Check current identity
git-id current
```

---

## Commands Overview

### Using `--profile` with Git

Add `--profile <name>` to any git command:

```bash
# Clone with profile
git clone https://github.com/company/project.git --profile work
git clone https://github.com/personal/repo.git --profile personal

# Push with profile
git push origin main --profile work

# Pull with profile  
git pull --profile personal

# Any git command works!
git fetch --profile work
git commit -m "message" --profile personal
```

### Profile Management Commands

```bash
# List all profiles
git-id list

# Create new profile (with GitHub sign-in)
git-id add --github

# Create new profile (manual)
git-id add --manual

# Switch profile in current repo
git-id use work
git-id use personal --global  # Apply globally

# Show current identity
git-id current

# Test SSH connection
git-id test work

# Delete a profile
git-id delete oldprofile
git-id delete --all  # Delete all profiles
```

---

## Usage Examples

### Create and Use Profiles

```bash
# Create work profile
git-id add --github
→ Name: work
→ Sign in with work GitHub account

# Create personal profile
git-id add --github
→ Name: personal  
→ Sign in with personal GitHub account

# Clone work repository
git clone https://github.com/company/project.git --profile work
cd project
git-id current  # Verify: Profile: work

# Clone personal repository
git clone https://github.com/username/my-project.git --profile personal
cd my-project
git-id current  # Verify: Profile: personal
```

### Switch Profile in Existing Repo

```bash
cd existing-repo

# Check current identity
git-id current

# Switch to different profile
git-id use work

# Verify
git config user.email  # Shows work email
```

### Work with Multiple Accounts

```bash
# Setup profiles for each account
git-id add --github  # work
git-id add --github  # personal
git-id add --github  # client

# Use different profiles for different repos
git clone git@github.com:company/repo.git --profile work
git clone git@github.com:username/project.git --profile personal
git clone git@github.com:client/app.git --profile client

# Each repo automatically uses the correct identity and SSH key
```

---

## Project Structure

```
git-id-cli/
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── profile-manager.ts    # Profile CRUD operations
│   ├── github-auth.ts        # GitHub OAuth flow
│   ├── ssh-manager.ts        # SSH key generation & upload
│   ├── git-config.ts         # Git configuration management
│   ├── git-wrapper.ts        # Git command wrapper for --profile
│   ├── prompts.ts            # CLI prompts
│   └── types.ts              # TypeScript types
├── scripts/
│   └── postinstall.js        # Automatic shell configuration
├── dist/                     # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md                 # This file
```

---

## How It Works

### Profile Storage

Profiles are stored in `~/.git-id/profiles.json`:

```json
{
  "work": {
    "name": "John Doe",
    "email": "john@company.com",
    "github": "john-work",
    "sshKey": "~/.ssh/id_ed25519_work",
    "signingKey": null
  }
}
```

### SSH Key Management

- **Key Generation:** ED25519 keys are generated per profile
- **Key Location:** `~/.ssh/id_ed25519_<profile>`
- **SSH Config:** Auto-configured in `~/.ssh/config` with host aliases
- **GitHub Upload:** Public keys uploaded via OAuth during profile creation

### Git Configuration

When you use a profile, these Git configs are set:

```bash
git config --local user.name "John Doe"
git config --local user.email "john@company.com"
git config --local core.sshCommand "ssh -i ~/.ssh/id_ed25519_work"
```

### Shell Integration

The postinstall script adds this function to your shell:

```bash
git() {
    if [[ " $* " == *" --profile "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
```

This intercepts `git --profile` commands and routes them through the CLI tool.

---

## File Locations

| What | Location |
|------|----------|
| **Profiles** | `~/.git-id/profiles.json` |
| **SSH Keys** | `~/.ssh/id_ed25519_<profile>` |
| **SSH Config** | `~/.ssh/config` |
| **Shell Config** | `~/.bashrc` or `~/.zshrc` |

---

## Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in dev mode (with ts-node)
npm run dev

# Link globally for testing
npm link

# Unlink
npm unlink -g

# Test the build
npm pack  # Creates tarball to inspect

# Publish to npm (with build)
npm publish
```

---

## Troubleshooting Development Issues

### TypeScript Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Testing Locally

```bash
# Link the package
npm link

# Test commands
git-id --version
git-id list
git-id add --github

# Unlink when done
npm unlink -g
```

### Shell Function Not Working

```bash
# Check if linked
which git-id
which gitp

# Reload shell config
source ~/.bashrc

# Test function
type git  # Should show "git is a function"
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT
