const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.cyan}=== Ambulance Booking System ====${colors.reset}`);

// Check if dist/spa directory exists, if not build the app
const spaDistPath = path.join(__dirname, 'quasar-project', 'dist', 'spa');
if (!fs.existsSync(spaDistPath)) {
  console.log(`${colors.yellow}Building Quasar application...${colors.reset}`);
  try {
    execSync('cd quasar-project && npm run build', { stdio: 'inherit' });
    console.log(`${colors.green}Build completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Build failed:${colors.reset}`, error);
    process.exit(1);
  }
}

// Start backend server
console.log(`${colors.blue}Starting backend server...${colors.reset}`);
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

console.log(`${colors.green}Application is running!${colors.reset}`);
console.log(`${colors.magenta}Backend API: http://localhost:5000/api${colors.reset}`);
console.log(`${colors.magenta}Frontend: http://localhost:5000${colors.reset}`);
console.log(`${colors.yellow}Press Ctrl+C to stop the application${colors.reset}`);

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Stopping servers...${colors.reset}`);
  backend.kill();
  process.exit();
});