# Git Identity Manager

[![npm version](https://badge.fury.io/js/%40guruvedhanth-s%2Fgit-id.svg)](https://www.npmjs.com/package/@guruvedhanth-s/git-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@guruvedhanth-s/git-id.svg)](https://nodejs.org/)

A CLI tool to manage multiple Git identities with automatic GitHub SSH key setup. Use the regular `git` command with `--profile` flag to work with different GitHub accounts.

## Features

- **Use Regular Git** - Just add `--profile` to any git command
- **Multiple Git Profiles** - Create and switch between different Git identities  
- **GitHub OAuth Integration** - Sign in with GitHub to auto-configure everything
- **Automatic SSH Key Management** - Generates and uploads SSH keys to GitHub
- **Profile-based Cloning** - Clone repos with the correct identity automatically

---

## Installation

### Option 1: Install from npm (Recommended)

```bash
# Install globally
npm install -g @guruvedhanth-s/git-id

# Verify installation
git-id --version
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/guruvedhanth-s/Git-Identity-Manager.git
cd Git-Identity-Manager

# Install and setup CLI tool
npm run setup

# Or manually:
cd git-id-cli
npm install
npm run build
npm link
```

### Enable `git --profile` Support

Add this to your `~/.bashrc` (for Git Bash on Windows) or `~/.zshrc` (for Mac/Linux):

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

Then reload your shell:
```bash
source ~/.bashrc
```

---

## Quick Start

```bash
# Create a profile with GitHub sign-in
git-id add --github

# List your profiles  
git-id list

# Clone with a profile
git clone https://github.com/user/repo.git --profile Work

# Check current identity
git-id current
```

---

## Commands

### Using `--profile` with Git

Add `--profile <name>` to any git command to use a specific identity:

```bash
# Clone with profile
git clone https://github.com/company/project.git --profile Work
git clone https://github.com/personal/repo.git --profile Personal

# Push with profile
git push origin main --profile Work

# Pull with profile  
git pull --profile Personal

# Fetch with profile
git fetch --profile Work
```

### Profile Management (`git-id`)

```bash
# List all profiles
git-id list

# Create new profile (with GitHub sign-in)
git-id add --github

# Create new profile (manual)
git-id add --manual

# Switch profile in current repo
git-id use Work
git-id use Personal --global  # Apply globally

# Show current identity
git-id current

# Test SSH connection
git-id test Work

# Delete a profile
git-id delete OldProfile
git-id delete --all  # Delete all
```

---

## Publishing to npm

Published as [@guruvedhanth-s/git-id](https://www.npmjs.com/package/@guruvedhanth-s/git-id)

For publishing updates, see [PUBLISHING.md](PUBLISHING.md) for detailed instructions.

---

## Documentation

For complete documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)  
For quick reference, see [QUICK-REFERENCE.md](QUICK-REFERENCE.md)  
For version history, see [CHANGELOG.md](CHANGELOG.md)

---

## Examples

### Clone a Work Project

```bash
git clone https://github.com/company/project.git --profile Work
cd project
git-id current  # Shows: Profile: Work
```

### Clone a Personal Project

```bash
git clone https://github.com/username/my-project.git --profile Personal
cd my-project
git-id current  # Shows: Profile: Personal
```

### Switch Profile in Existing Repo

```bash
cd existing-repo
git-id current        # Check current
git-id use Work       # Switch to Work
git config user.email # Verify: work@company.com
```

---

## File Locations

| File | Location | Description |
|------|----------|-------------|
| Profiles | `~/.git-id/profiles.json` | Your saved profiles |
| SSH Keys | `~/.ssh/id_ed25519_<profile>` | SSH keys per profile |
| SSH Config | `~/.ssh/config` | SSH host aliases |

---

## Troubleshooting

### Command not found: git-id

```bash
# Re-link the CLI
cd git-id-cli
npm link
```

### --profile not working

Make sure you added the function to `~/.bashrc` and reloaded:

```bash
source ~/.bashrc
type git  # Should show "git is a function"
```

### SSH Connection Failed

```bash
# Test SSH
git-id test Work

# Manual test
ssh -T git@github-Work
```

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## License

MIT
