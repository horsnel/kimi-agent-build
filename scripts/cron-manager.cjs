#!/usr/bin/env node

/**
 * Sigma Capital — Cron Manager
 * Easy management of the data fetch cron scheduler.
 *
 * Usage:
 *   node scripts/cron-manager.cjs start    # Start scheduler (every 6 hours)
 *   node scripts/cron-manager.cjs stop     # Stop scheduler
 *   node scripts/cron-manager.cjs status   # Check if running
 *   node scripts/cron-manager.cjs run      # Run fetch once immediately
 *   node scripts/cron-manager.cjs logs     # View last 50 log lines
 *   node scripts/cron-manager.cjs restart  # Restart scheduler
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = __dirname;
const PID_FILE = path.join(SCRIPTS_DIR, 'cron-scheduler.pid');
const LOG_FILE = path.join(SCRIPTS_DIR, 'cron-scheduler.log');
const SCHEDULER = path.join(SCRIPTS_DIR, 'cron-scheduler.cjs');
const FETCH_SCRIPT = path.join(SCRIPTS_DIR, 'fetch-real-data.cjs');

function getPID() {
  if (!fs.existsSync(PID_FILE)) return null;
  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
    // Check if process is alive
    try { process.kill(pid, 0); return pid; } catch { return null; }
  } catch { return null; }
}

function startScheduler(intervalMin = 360) {
  const existing = getPID();
  if (existing) {
    console.log(`Scheduler already running (PID ${existing}). Use "stop" first or "restart".`);
    return;
  }

  console.log(`Starting scheduler (every ${intervalMin} minutes)...`);
  const child = spawn('node', [SCHEDULER, `--interval=${intervalMin}`], {
    cwd: path.resolve(SCRIPTS_DIR, '..'),
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  setTimeout(() => {
    const pid = getPID();
    if (pid) {
      console.log(`Scheduler started successfully (PID ${pid})`);
      console.log(`Log file: ${LOG_FILE}`);
    } else {
      console.log('Scheduler may have failed to start. Check logs.');
    }
  }, 2000);
}

function stopScheduler() {
  const pid = getPID();
  if (!pid) {
    console.log('Scheduler is not running.');
    try { fs.unlinkSync(PID_FILE); } catch {}
    return;
  }
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`Sent SIGTERM to scheduler (PID ${pid})`);
    setTimeout(() => {
      if (getPID()) {
        console.log('Process still running, sending SIGKILL...');
        try { process.kill(pid, 'SIGKILL'); } catch {}
      }
      try { fs.unlinkSync(PID_FILE); } catch {}
      console.log('Scheduler stopped.');
    }, 3000);
  } catch (e) {
    console.log(`Failed to stop: ${e.message}`);
    try { fs.unlinkSync(PID_FILE); } catch {}
  }
}

function showStatus() {
  const pid = getPID();
  if (pid) {
    console.log(`Scheduler is RUNNING (PID ${pid})`);
  } else {
    console.log('Scheduler is NOT running.');
  }
  if (fs.existsSync(LOG_FILE)) {
    const stat = fs.statSync(LOG_FILE);
    console.log(`Log file: ${LOG_FILE} (${(stat.size / 1024).toFixed(1)} KB, modified ${stat.mtime.toISOString()})`);
  }
}

function runOnce() {
  console.log('Running fetch-real-data --type=all once...');
  const child = spawn('node', [FETCH_SCRIPT, '--type=all'], {
    cwd: path.resolve(SCRIPTS_DIR, '..'),
    stdio: 'inherit',
  });
  child.on('close', (code) => {
    console.log(`Completed with exit code ${code}`);
  });
}

function showLogs(lines = 50) {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No log file found.');
    return;
  }
  const content = fs.readFileSync(LOG_FILE, 'utf8');
  const allLines = content.trim().split('\n');
  const last = allLines.slice(-lines);
  console.log(`=== Last ${last.length} log lines ===\n`);
  last.forEach(l => console.log(l));
}

// Parse command
const command = process.argv[2] || 'status';

switch (command) {
  case 'start':
    const intArg = process.argv.find(a => a.startsWith('--interval='));
    const intMin = intArg ? parseInt(intArg.split('=')[1]) : 360;
    startScheduler(intMin);
    break;
  case 'stop':
    stopScheduler();
    break;
  case 'status':
    showStatus();
    break;
  case 'run':
    runOnce();
    break;
  case 'logs':
    showLogs(parseInt(process.argv[3]) || 50);
    break;
  case 'restart':
    stopScheduler();
    setTimeout(() => startScheduler(), 4000);
    break;
  default:
    console.log(`Unknown command: ${command}`);
    console.log('Usage: node cron-manager.cjs [start|stop|status|run|logs|restart]');
}
