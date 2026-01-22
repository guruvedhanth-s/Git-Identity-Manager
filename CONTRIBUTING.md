# Contributing to Git Identity Manager

Thank you for your interest in contributing to Git Identity Manager! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Git
- A GitHub account (for testing OAuth features)

### Setting Up Your Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/git-identity-manager.git
   cd git-identity-manager
   ```

2. **Install Dependencies**
   ```bash
   cd git-id-cli
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Link for Local Testing**
   ```bash
   npm link
   ```

5. **Test Your Changes**
   ```bash
   git-id --version
   git-id list
   ```

## Project Structure

```
git-identity-manager/
├── git-id-cli/              # CLI tool source code
│   ├── src/
│   │   ├── index.ts         # Main CLI entry point
│   │   ├── git-wrapper.ts   # Git command wrapper (gitp)
│   │   ├── profile-manager.ts
│   │   ├── github-auth.ts
│   │   ├── ssh-manager.ts
│   │   ├── git-config.ts
│   │   ├── prompts.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
├── DOCUMENTATION.md         # Complete user documentation
├── README.md               # Quick start guide
└── package.json            # Root package configuration
```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting patterns
- Use meaningful variable and function names
- Add comments for complex logic

### Commits

- Write clear, descriptive commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issues in commits when applicable

### Testing

Before submitting:

1. **Build without errors**
   ```bash
   cd git-id-cli
   npm run build
   ```

2. **Test basic functionality**
   ```bash
   git-id list
   git-id current
   ```

3. **Test profile operations**
   ```bash
   git-id add --manual  # Test profile creation
   git-id test <profile>  # Test SSH connection
   ```

## Submitting Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Test thoroughly

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes

## Pull Request Guidelines

### PR Description Should Include:

- **What**: Brief description of the changes
- **Why**: Reason for the changes
- **How**: How you implemented the changes
- **Testing**: How you tested the changes

### Before Submitting:

- [ ] Code builds without errors
- [ ] Functionality tested locally
- [ ] Documentation updated if needed
- [ ] No unnecessary files included

## Feature Requests

Have an idea for a new feature?

1. Check existing issues to avoid duplicates
2. Open a new issue with the "enhancement" label
3. Describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives you've considered

## Bug Reports

Found a bug?

1. Check if it's already reported
2. Open a new issue with the "bug" label
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Your environment (OS, Node version, etc.)
   - Any error messages

## Development Tips

### Debugging

Add debug output:
```typescript
console.log('Debug:', variable);
```

### Testing GitHub OAuth

For testing OAuth features, you may need to:
1. Create a GitHub OAuth App
2. Set environment variables
3. Test the device flow locally

### Common Issues

**npm link not working:**
```bash
npm unlink -g git-id
cd git-id-cli
npm link
```

**TypeScript errors:**
```bash
npm run build
# Check for errors and fix
```

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Questions?

- Open an issue for general questions
- Check existing documentation first
- Be patient and respectful

## Publishing Changes

If you're a maintainer publishing a new version:

1. **Update Version**
   ```bash
   cd git-id-cli
   npm version patch  # or minor/major
   ```

2. **Update Changelog**
   - Document changes in DOCUMENTATION.md

3. **Build and Test**
   ```bash
   npm run build
   npm pack  # Test package contents
   ```

4. **Publish**
   ```bash
   npm publish --access public
   ```

See [PUBLISHING.md](PUBLISHING.md) for detailed instructions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Git Identity Manager! 🎉
