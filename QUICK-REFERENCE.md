# Quick Reference

## Installation

```bash
npm install -g @guruvedhanth-s/git-id
```

## Basic Commands

| Command | Description |
|---------|-------------|
| `git-id add --github` | Create profile with GitHub sign-in |
| `git-id add --manual` | Create profile manually |
| `git-id list` | List all profiles |
| `git-id current` | Show current Git identity |
| `git-id use <profile>` | Switch to profile in current repo |
| `git-id test <profile>` | Test SSH connection |
| `git-id delete <profile>` | Delete a profile |

## Using --profile with Git

```bash
# Clone with profile
git clone <repo-url> --profile <profile-name>

# Push with profile
git push --profile <profile-name>

# Pull with profile
git pull --profile <profile-name>

# Any git command works!
git <command> --profile <profile-name>
```

## Shell Setup

Add to `~/.bashrc` or `~/.zshrc`:

```bash
git() {
    if [[ " $* " == *" --profile "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
```

Then reload: `source ~/.bashrc`

## File Locations

| What | Where |
|------|-------|
| Profiles | `~/.git-id/profiles.json` |
| SSH Keys | `~/.ssh/id_ed25519_<profile>` |
| SSH Config | `~/.ssh/config` |

## Example Workflow

```bash
# 1. Create work profile
git-id add --github
# → Name: work
# → Sign in with work GitHub

# 2. Create personal profile
git-id add --github
# → Name: personal
# → Sign in with personal GitHub

# 3. Clone work repo
git clone git@github.com:company/repo.git --profile work

# 4. Clone personal repo
git clone git@github.com:me/project.git --profile personal

# 5. Check current identity
cd repo && git-id current

# 6. Test SSH connection
git-id test work
```

## Troubleshooting

**Command not found:**
```bash
npm install -g @your-npm-username/git-id
```

**--profile not working:**
```bash
# Add shell function (see Shell Setup above)
source ~/.bashrc
type git  # Should show "git is a function"
```

**SSH failed:**
```bash
git-id test <profile>
ssh -T git@github.com -i ~/.ssh/id_ed25519_<profile>
```

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@guruvedhanth-s/git-id)
- 📖 [Full Documentation](DOCUMENTATION.md)
- 🐛 [Report Issues](https://github.com/guruvedhanth-s/Git-Identity-Manager/issues)
- 💬 [Discussions](https://github.com/guruvedhanth-s/Git-Identity-Manager/discussions)
