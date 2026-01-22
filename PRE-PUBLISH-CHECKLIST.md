# Pre-Publishing Checklist

Complete this checklist before publishing to npm:

## 1. Package Configuration

- [ ] Update `git-id-cli/package.json`:
  - [ ] `"name": "@your-npm-username/git-id"` - Replace with your actual npm username
  - [ ] `"version": "1.0.0"` - Set appropriate version
  - [ ] `"author": "Your Name <your.email@example.com>"` - Add your details
  - [ ] `"homepage"` - Update GitHub URL
  - [ ] `"repository"` - Update repository URL
  - [ ] `"bugs"` - Update issues URL

## 2. Documentation Updates

- [ ] Update README.md:
  - [ ] Replace `@your-npm-username` with actual username
  - [ ] Replace `your-username` with GitHub username
  - [ ] Update badges with correct package name
  - [ ] Verify installation command is correct

- [ ] Update DOCUMENTATION.md:
  - [ ] Replace all `@your-npm-username` references
  - [ ] Replace all `your-username` references
  - [ ] Update GitHub repository URLs

- [ ] Update PUBLISHING.md:
  - [ ] Verify all examples use your package name

## 3. Files to Include

- [ ] Check `git-id-cli/.npmignore` exists
- [ ] Verify `git-id-cli/package.json` "files" field includes:
  - [ ] `dist/` directory
  - [ ] `README.md`
  - [ ] `LICENSE`

## 4. Code Quality

- [ ] All TypeScript files compile without errors
  ```bash
  cd git-id-cli && npm run build
  ```
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] README examples are tested and work

## 5. Testing

- [ ] Test build:
  ```bash
  cd git-id-cli
  npm run build
  ```

- [ ] Test locally:
  ```bash
  npm link
  git-id --version
  git-id list
  ```

- [ ] Test package contents:
  ```bash
  npm pack
  tar -tzf *.tgz  # Inspect contents
  ```

- [ ] Dry run publish:
  ```bash
  npm publish --dry-run
  ```

## 6. Repository Setup

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Add LICENSE file (MIT)
- [ ] Add .gitignore
- [ ] Add README.md to repository root
- [ ] Create first release/tag

## 7. npm Account

- [ ] Create npm account at npmjs.com
- [ ] Verify email address
- [ ] Enable 2FA (recommended)
- [ ] Login via CLI:
  ```bash
  npm login
  ```

## 8. Pre-Publish Verification

- [ ] Package name is available (or use scoped package)
- [ ] Version number follows semver
- [ ] All dependencies are listed in package.json
- [ ] No sensitive data in code or config
- [ ] LICENSE file exists

## 9. Documentation Final Check

- [ ] README.md has clear installation instructions
- [ ] DOCUMENTATION.md is complete
- [ ] Examples in documentation work
- [ ] Troubleshooting section is helpful
- [ ] Links to repository are correct

## 10. Publishing

- [ ] Commit all changes
  ```bash
  git add .
  git commit -m "Prepare for v1.0.0 release"
  ```

- [ ] Create git tag
  ```bash
  git tag v1.0.0
  git push origin main --tags
  ```

- [ ] Publish to npm
  ```bash
  cd git-id-cli
  npm publish --access public
  ```

- [ ] Verify package on npmjs.com
  - [ ] Visit `https://www.npmjs.com/package/@your-username/git-id`
  - [ ] Check README displays correctly
  - [ ] Verify version number

## 11. Post-Publishing

- [ ] Test global installation
  ```bash
  npm install -g @your-username/git-id
  git-id --version
  ```

- [ ] Create GitHub release
  - [ ] Add release notes
  - [ ] Link to npm package

- [ ] Share on social media (optional)
  - [ ] Twitter
  - [ ] Reddit (r/programming, r/node)
  - [ ] Dev.to

## 12. Monitoring

- [ ] Watch for issues on GitHub
- [ ] Monitor npm download stats
- [ ] Respond to user feedback

---

## Quick Command Reference

```bash
# Login to npm
npm login

# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Test package
cd git-id-cli
npm run build
npm pack
npm publish --dry-run

# Publish
npm publish --access public

# Test installation
npm install -g @your-username/git-id
git-id --version
```

---

**Ready to publish?** Make sure all checkboxes are checked! ✅
