const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Get the current git commit hash (short version)
  const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  
  // Create .env file with the commit hash
  const envContent = `REACT_APP_GIT_COMMIT=${commitHash}\n`;
  
  // Write to .env file
  fs.writeFileSync('.env', envContent);
  
  console.log(`✅ Git commit hash set: ${commitHash}`);
} catch (error) {
  console.error('❌ Error getting git commit hash:', error.message);
  // Fallback to 'dev' if git is not available
  const envContent = 'REACT_APP_GIT_COMMIT=dev\n';
  fs.writeFileSync('.env', envContent);
  console.log('✅ Fallback to "dev" version');
}
