#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SHELL_FUNCTION = `
# Git Identity Manager - enables 'git --profile' support
git() {
    if [[ " $* " == *" --profile "* ]] || [[ " $* " == *" -p "* ]]; then
        gitp "$@"
    else
        command git "$@"
    fi
}
`;

const MARKER_START = '# Git Identity Manager - START';
const MARKER_END = '# Git Identity Manager - END';

const SHELL_FUNCTION_WITH_MARKERS = `${MARKER_START}
${SHELL_FUNCTION.trim()}
${MARKER_END}`;

function getShellConfigFiles() {
    const homeDir = os.homedir();
    const configFiles = [];

    // Check for common shell config files
    const possibleFiles = [
        '.bashrc',
        '.bash_profile',
        '.zshrc',
        '.profile'
    ];

    for (const file of possibleFiles) {
        const filePath = path.join(homeDir, file);
        if (fs.existsSync(filePath)) {
            configFiles.push(filePath);
        }
    }

    // If no config files exist, create .bashrc by default
    if (configFiles.length === 0) {
        const defaultFile = path.join(homeDir, '.bashrc');
        configFiles.push(defaultFile);
    }

    return configFiles;
}

function hasGitIdFunction(content) {
    // Check if the function already exists (with or without markers)
    return content.includes('# Git Identity Manager') || 
           content.includes('gitp "$@"') ||
           (content.includes('git()') && content.includes('--profile'));
}

function removeOldFunction(content) {
    // Remove old function if it exists between markers
    const markerRegex = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}\\n?`, 'g');
    return content.replace(markerRegex, '');
}

function setupShellConfig() {
    console.log('\n🔧 Setting up Git Identity Manager shell configuration...\n');

    const configFiles = getShellConfigFiles();
    let updatedFiles = [];
    let skippedFiles = [];

    for (const configFile of configFiles) {
        try {
            let content = '';
            
            // Read existing content if file exists
            if (fs.existsSync(configFile)) {
                content = fs.readFileSync(configFile, 'utf8');
                
                // Check if function already exists
                if (hasGitIdFunction(content)) {
                    skippedFiles.push(path.basename(configFile));
                    continue;
                }
            }

            // Remove old function if exists
            content = removeOldFunction(content);

            // Add the function at the end
            const newContent = content.trim() + '\n\n' + SHELL_FUNCTION_WITH_MARKERS + '\n';
            
            fs.writeFileSync(configFile, newContent, 'utf8');
            updatedFiles.push(path.basename(configFile));
            
        } catch (error) {
            console.error(`❌ Failed to update ${path.basename(configFile)}: ${error.message}`);
        }
    }

    // Display results
    if (updatedFiles.length > 0) {
        console.log('✅ Successfully configured shell profile(s):');
        updatedFiles.forEach(file => console.log(`   - ~/${file}`));
        console.log('\n📝 To activate the changes, run:');
        updatedFiles.forEach(file => {
            console.log(`   source ~/${file}`);
        });
        console.log('\n   Or restart your terminal.\n');
    }

    if (skippedFiles.length > 0) {
        console.log('ℹ️  Already configured (skipped):');
        skippedFiles.forEach(file => console.log(`   - ~/${file}`));
        console.log('');
    }

    if (updatedFiles.length === 0 && skippedFiles.length === 0) {
        console.log('⚠️  No shell configuration files found or updated.');
        console.log('   You may need to manually add the git function to your shell config.\n');
    }

    console.log('🎉 Git Identity Manager is ready to use!');
    console.log('   Try: git-id --version\n');
}

// Only run during global installation
if (process.env.npm_config_global === 'true') {
    setupShellConfig();
} else {
    console.log('\nℹ️  Git Identity Manager: Skipping shell setup (not a global install)');
    console.log('   For global installation with shell setup, run:');
    console.log('   npm i -g @guruvedhanth-s/git-id\n');
}
