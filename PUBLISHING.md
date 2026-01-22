# Publishing to npm

This guide explains how to publish the Git Identity Manager CLI tool to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm CLI**: Ensure you have npm installed (comes with Node.js)
3. **Authentication**: Login to npm from your terminal

```bash
npm login
```

## Before Publishing

### 1. Update Package Information

Edit `git-id-cli/package.json`:

```json
{
  "name": "@your-npm-username/git-id",  // Change to your npm username
  "version": "1.0.0",                   // Update version for each release
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "url": "git+https://github.com/your-username/git-identity-manager.git"
  }
}
```

### 2. Update Documentation

Update these URLs in all files:
- `@your-npm-username` → your actual npm username
- `your-username` → your actual GitHub username
- `your.email@example.com` → your actual email

### 3. Test Locally

```bash
cd git-id-cli

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm link
git-id --version

# Test package contents
npm pack
```

This creates a `.tgz` file you can inspect to verify what will be published.

### 4. Check Package Contents

```bash
# View what will be published
npm publish --dry-run
```

## Publishing

### For Scoped Packages (Recommended)

Scoped packages are namespaced under your username (e.g., `@username/git-id`):

```bash
cd git-id-cli

# First publish (public access required for scoped packages)
npm publish --access public

# Subsequent publishes
npm publish
```

### For Unscoped Packages

If you change the name to just `git-id` (requires unique name):

```bash
cd git-id-cli
npm publish
```

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backward compatible

Update version before each publish:

```bash
# Patch update
npm version patch

# Minor update
npm version minor

# Major update
npm version major
```

This automatically updates `package.json` and creates a git tag.

## Publishing Workflow

1. **Make changes** to your code
2. **Test thoroughly**
   ```bash
   npm run build
   git-id list
   ```
3. **Update version**
   ```bash
   npm version patch  # or minor/major
   ```
4. **Commit and tag**
   ```bash
   git add .
   git commit -m "Release v1.0.1"
   git push origin main --tags
   ```
5. **Publish to npm**
   ```bash
   cd git-id-cli
   npm publish --access public
   ```

## After Publishing

### Verify Publication

1. Check on npmjs.com: `https://www.npmjs.com/package/@your-username/git-id`
2. Test installation:
   ```bash
   # In a different directory
   npm install -g @your-username/git-id
   git-id --version
   ```

### Update Documentation

Update README.md with the correct npm install command:

```bash
npm install -g @your-actual-username/git-id
```

## Unpublishing (Use with Caution)

You can unpublish within 72 hours of publishing:

```bash
npm unpublish @your-username/git-id@1.0.0
```

⚠️ **Warning**: Unpublishing is discouraged. Consider deprecating instead:

```bash
npm deprecate @your-username/git-id@1.0.0 "This version has a critical bug, please upgrade"
```

## CI/CD Publishing (Optional)

### Using GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: cd git-id-cli && npm ci
      - run: cd git-id-cli && npm run build
      - run: cd git-id-cli && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add `NPM_TOKEN` to your GitHub repository secrets.

## Troubleshooting

### Package Name Already Taken

Error: `403 Forbidden - PUT https://registry.npmjs.org/@username/git-id - Package name too similar to existing package`

Solution: Use a scoped package or choose a different name:
- `@username/git-id` (scoped, always available)
- `git-identity-cli`
- `multi-git-identity`

### Authentication Error

Error: `npm ERR! code ENEEDAUTH`

Solution:
```bash
npm login
# Enter your npm credentials
```

### Build Failed

Error: Build errors during `npm publish`

Solution:
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Permission Error

Error: `npm ERR! code EACCES`

Solution: Don't use `sudo`. If installed with sudo, fix permissions:
```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules
```

## Best Practices

1. ✅ **Test before publishing**: Always run tests and verify locally
2. ✅ **Use semantic versioning**: Follow semver strictly
3. ✅ **Keep good documentation**: Update README with examples
4. ✅ **Use .npmignore**: Only publish necessary files
5. ✅ **Create git tags**: Tag releases for version history
6. ✅ **Write changelogs**: Document what changed in each version

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm Package Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Creating and Publishing Scoped Packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)

---

**Ready to publish?** Follow the steps above and share your tool with the world! 🚀
