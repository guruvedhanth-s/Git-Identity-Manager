# Git Identity Manager

A CLI tool to manage multiple Git identities with automatic GitHub SSH key setup. Use the regular `git` command with `--profile` flag to work with different GitHub accounts.

## Features

- **Use Regular Git** - Just add `--profile` to any git command
- **Multiple Git Profiles** - Create and switch between different Git identities  
- **GitHub OAuth Integration** - Sign in with GitHub to auto-configure everything
- **Automatic SSH Key Management** - Generates and uploads SSH keys to GitHub
- **Profile-based Cloning** - Clone repos with the correct identity automatically

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/git-id-cli.git

# Install dependencies and build
cd git-id-cli
npm install

# Link globally
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
git id add --github

# List your profiles  
git id list

# Clone with a profile
git clone https://github.com/user/repo.git --profile Work

# Check current identity
git id current
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
git fetch --profile Hex
```

### Profile Management (`git id`)

```bash
# List all profiles
git id list

# Create new profile (with GitHub sign-in)
git id add --github

# Create new profile (manual)
git id add --manual

# Switch profile in current repo
git id use Work
git id use Personal --global  # Apply globally

# Show current identity
git id current

# Test SSH connection
git id test Work

# Delete a profile
git id delete OldProfile
git id delete --all  # Delete all
```

---

## Your Current Setup

| Profile | User | Email | GitHub |
|---------|------|-------|--------|
| Personal | guruvedhanth-s | guruvedhanths@gmail.com | guruvedhanth-s |
| Hex | guruvedhanths | Guruvedhanth.Suresh@hexstream.com | guruvedhanths |

### SSH Host Aliases

```bash
# Clone using Personal account
git clone git@github-Personal:guruvedhanth-s/repo.git

# Clone using Hex account  
git clone git@github-Hex:guruvedhanths/repo.git
```

---

## Examples

### Clone a Work Project

```bash
git clone https://github.com/HEXstreamAnalytics/utility360v2.git --profile Hex
cd utility360v2
git id current  # Shows: Profile: Hex
```

### Clone a Personal Project

```bash
git clone https://github.com/guruvedhanth-s/my-project.git --profile Personal
cd my-project
git id current  # Shows: Profile: Personal
```

### Switch Profile in Existing Repo

```bash
cd existing-repo
git id current        # Check current
git id use Hex        # Switch to Hex
git config user.email # Verify: Guruvedhanth.Suresh@hexstream.com
```

### Push with Different Profile

```bash
cd some-repo
git add .
git commit -m "feature: add something"
git push --profile Hex  # Uses Hex SSH key
```

### Create a New Profile

```bash
git id add --github
# Enter name: Client
# Browser opens -> Sign in with client's GitHub
# SSH key auto-generated and uploaded
# Done!

git id list  # Shows new profile
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

### Command not found: gitp

```bash
# Re-link the CLI
cd ~/Work/Git\ Extension/git-id-cli
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
git id test Hex

# Manual test
ssh -T git@github-Hex
```

### Wrong Identity After Clone

```bash
cd cloned-repo
git id use CorrectProfile
```

---

## Command Summary

| Command | Description |
|---------|-------------|
| `git clone <url> --profile <name>` | Clone with specific profile |
| `git push --profile <name>` | Push with specific profile |
| `git pull --profile <name>` | Pull with specific profile |
| `git id list` | List all profiles |
| `git id add --github` | Create profile with GitHub |
| `git id use <name>` | Switch profile in current repo |
| `git id current` | Show current identity |
| `git id test <name>` | Test SSH connection |
| `git id delete <name>` | Delete a profile |

---

## License

MIT
