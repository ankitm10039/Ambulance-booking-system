const { spawn } = require('child_process');
const path = require('path');

// Start backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Start frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'quasar-project'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});

console.log('Development servers started:');
console.log('- Backend: http://localhost:5000');
console.log('- Frontend: http://localhost:9000');