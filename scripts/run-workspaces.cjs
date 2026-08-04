const { spawn } = require('child_process');

const command = process.argv[2] || 'start';
const workspaces = ['@ai-credit-bank/web', '@ai-credit-bank/api'];
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const children = workspaces.map((workspace) => {
  const child = spawn(pnpmCommand, ['--filter', workspace, command], {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });

  child.on('error', (error) => {
    console.error(`Failed to start ${workspace}:`, error.message);
    process.exit(1);
  });

  return child;
});

let shuttingDown = false;

const stopAll = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM');
  });
};

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

children.forEach((child) => {
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;

    if (signal) {
      stopAll();
      process.exit(1);
      return;
    }

    if (code !== 0) {
      stopAll();
      process.exit(code || 1);
    }
  });
});
