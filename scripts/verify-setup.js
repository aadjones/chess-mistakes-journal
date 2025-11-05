#!/usr/bin/env node

/**
 * Verify that the development environment is set up correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Chess Mistake Journal setup...\n');

let errors = 0;
let warnings = 0;

// Check package.json dependencies
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// Verify Tailwind CSS version
const tailwindVersion = packageJson.devDependencies?.tailwindcss;
if (!tailwindVersion) {
  console.error('❌ Tailwind CSS not found in devDependencies');
  errors++;
} else {
  // Extract major version (handle ^3.4.0, ~3.4.0, 3.4.0, etc.)
  const versionMatch = tailwindVersion.match(/(\d+)\./);
  const majorVersion = versionMatch ? parseInt(versionMatch[1], 10) : null;

  if (majorVersion === 4) {
    console.error(`❌ Tailwind CSS v4 detected: ${tailwindVersion}`);
    console.error('   Must use v3.4.x. Run: npm install -D tailwindcss@^3.4.0');
    errors++;
  } else if (majorVersion === 3) {
    console.log(`✅ Tailwind CSS v3 installed: ${tailwindVersion}`);
  } else {
    console.warn(`⚠️  Unexpected Tailwind version: ${tailwindVersion}`);
    warnings++;
  }
}

// Check for required dependencies
const requiredDeps = {
  next: packageJson.dependencies?.next,
  react: packageJson.dependencies?.react,
  'react-dom': packageJson.dependencies?.['react-dom'],
  '@prisma/client': packageJson.dependencies?.['@prisma/client'],
  'chess.js': packageJson.dependencies?.['chess.js'],
  'react-chessboard': packageJson.dependencies?.['react-chessboard'],
};

const requiredDevDeps = {
  prisma: packageJson.devDependencies?.prisma,
  typescript: packageJson.devDependencies?.typescript,
  vitest: packageJson.devDependencies?.vitest,
  postcss: packageJson.devDependencies?.postcss,
  autoprefixer: packageJson.devDependencies?.autoprefixer,
};

Object.entries(requiredDeps).forEach(([name, version]) => {
  if (!version) {
    console.error(`❌ Missing dependency: ${name}`);
    errors++;
  } else {
    console.log(`✅ ${name}: ${version}`);
  }
});

Object.entries(requiredDevDeps).forEach(([name, version]) => {
  if (!version) {
    console.error(`❌ Missing dev dependency: ${name}`);
    errors++;
  } else {
    console.log(`✅ ${name}: ${version}`);
  }
});

// Check for required config files
const requiredFiles = [
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'next.config.js',
  'prisma/schema.prisma',
  '.env',
];

console.log('\n📄 Checking configuration files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    errors++;
  }
});

// Check PostCSS config
const postcssConfig = require('../postcss.config.js');
if (postcssConfig.plugins?.tailwindcss !== undefined) {
  console.log('✅ PostCSS configured for Tailwind CSS v3');
} else {
  console.error('❌ PostCSS not configured correctly for Tailwind');
  errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Setup is correct.');
  console.log('\nRun `npm run dev` to start development server.');
  process.exit(0);
} else {
  if (errors > 0) {
    console.error(`❌ ${errors} error(s) found.`);
  }
  if (warnings > 0) {
    console.warn(`⚠️  ${warnings} warning(s) found.`);
  }
  console.log('\nPlease fix the issues above before continuing.');
  process.exit(errors > 0 ? 1 : 0);
}
