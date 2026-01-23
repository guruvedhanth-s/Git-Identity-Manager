# Git Identity Manager

[![npm version](https://badge.fury.io/js/%40guruvedhanth-s%2Fgit-id.svg)](https://www.npmjs.com/package/@guruvedhanth-s/git-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@guruvedhanth-s/git-id.svg)](https://nodejs.org/)

> A powerful CLI tool to seamlessly manage multiple Git identities with automatic GitHub SSH key setup. Work with multiple GitHub accounts effortlessly using the regular `git` command with `--profile` flag.

---

## 🚀 Why Git Identity Manager?

Modern developers often juggle multiple Git identities:
- **Personal projects** on your personal GitHub account
- **Work repositories** requiring your corporate email
- **Client projects** with specific identity requirements
- **Multiple GitHub accounts** (freelance, open source, etc.)

Traditional Git configuration makes it easy to:
- ❌ Accidentally commit with the wrong email
- ❌ Use incorrect SSH keys for authentication
- ❌ Mix up identities across different organizations

**Git Identity Manager solves this** by providing profile-based identity management that automatically handles everything for you.

---

## ✨ Key Features

- 🎯 **Use Regular Git Commands** - Just add `--profile` to any git command
- 👤 **Multiple Profiles** - Create unlimited Git identities for different contexts
- 🔐 **GitHub OAuth Integration** - Sign in with GitHub to auto-configure everything
- 🔑 **Automatic SSH Management** - Generates and uploads SSH keys to GitHub automatically
- 🚀 **Smart Cloning** - Clone repos with the correct identity from the start
- 🔄 **Easy Switching** - Switch profiles in existing repositories instantly

---

## 📦 Installation

```bash
npm i -g @guruvedhanth-s/git-id
```

**That's it!** The installation automatically configures your shell for `--profile` support.

After installation, you'll see:
```
✅ Successfully configured shell profile(s):
   - ~/.bashrc (or ~/.zshrc)

📝 To activate the changes, run:
   source ~/.bashrc

   Or restart your terminal.
```

Verify installation:
```bash
git-id --version
```

---

## 🎯 Quick Start

### 1. Create Your First Profile

```bash
# With GitHub authentication (recommended)
git-id add --github
```

Follow the prompts:
- Enter profile name (e.g., "work", "personal")
- Authorize with GitHub in your browser
- SSH key is automatically generated and uploaded
- Profile is ready to use!

### 2. List Your Profiles

```bash
git-id list
```

### 3. Use Your Profile

```bash
# Clone with a specific profile
git clone https://github.com/company/project.git --profile work

# Check current identity
git-id current
```

---

## 💡 Common Use Cases

### Work with Multiple GitHub Accounts

```bash
# Create profiles
git-id add --github  # Create "work" profile
git-id add --github  # Create "personal" profile

# Clone work repository
git clone https://github.com/company/repo.git --profile work

# Clone personal repository
git clone https://github.com/username/project.git --profile personal

# Each uses the correct SSH key and email automatically!
```

### Switch Profile in Existing Repository

```bash
cd existing-repo

# Check current identity
git-id current

# Switch to different profile
git-id use personal

# All commits now use personal identity
git commit -m "Personal contribution"
```

### Push/Pull with Specific Profile

```bash
# Push with work profile
git push origin main --profile work

# Pull with personal profile
git pull --profile personal
```

---

## 📖 Commands Reference

### Profile Management

```bash
git-id add --github         # Create profile with GitHub sign-in
git-id add --manual         # Create profile manually
git-id list                 # List all profiles
git-id delete <profile>     # Delete a profile
git-id delete --all         # Delete all profiles
```

### Profile Usage

```bash
git-id use <profile>        # Switch profile in current repo
git-id use <profile> --global  # Apply profile globally
git-id current              # Show current Git identity
git-id test <profile>       # Test SSH connection
```

### Using --profile with Git

```bash
git clone <url> --profile <name>
git push --profile <name>
git pull --profile <name>
git fetch --profile <name>

# Works with any git command!
```

---

## 📁 Where Everything Lives

| What | Location |
|------|----------|
| **Profiles** | `~/.git-id/profiles.json` |
| **SSH Keys** | `~/.ssh/id_ed25519_<profile>` |
| **SSH Config** | `~/.ssh/config` |

---

## 🔧 Troubleshooting

### Command not found: git-id
```bash
npm i -g @guruvedhanth-s/git-id
```

### --profile not working
Make sure you reloaded your shell after installation:
```bash
source ~/.bashrc  # or restart terminal
type git  # Should show "git is a function"
```

### SSH Connection Failed
```bash
git-id test <profile>
```

---

## 📚 Documentation

For detailed usage guide and advanced features, see [DOCUMENTATION.md](DOCUMENTATION.md)

---

## 🤝 Contributing

Contributions are welcome! 
- **Report issues:** [GitHub Issues](https://github.com/guruvedhanth-s/Git-Identity-Manager/issues)
- **Discussions:** [GitHub Discussions](https://github.com/guruvedhanth-s/Git-Identity-Manager/discussions)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details
