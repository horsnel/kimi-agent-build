#!/usr/bin/env node

/**
 * Sigma Capital — Cron Scheduler
 * Runs fetch-real-data.cjs on a regular schedule.
 *
 * Usage:
 *   node scripts/cron-scheduler.cjs                # default: every 6 hours
 *   node scripts/cron-scheduler.cjs --interval=360  # every 6 hours (in minutes)
 *   node scripts/cron-scheduler.cjs --interval=180  # every 3 hours
 *   node scripts/cron-scheduler.cjs --once          # run once then exit
 *
 * The scheduler keeps running as a background process.
 * Logs are written to scripts/cron-scheduler.log
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOG_FILE = path.join(__dirname, 'cron-scheduler.log');
const PID_FILE = path.join(__dirname, 'cron-scheduler.pid');
const SCRIPT = path.join(__dirname, 'fetch-real-data.cjs');

// Parse arguments
const args = process.argv.slice(2);
const intervalArg = args.find(a => a.startsWith('--interval='));
const runOnce = args.includes('--once');
const INTERVAL_MS = (intervalArg ? parseInt(intervalArg.split('=')[1]) : 360) * 60 * 1000; // default 6 hours

// Logging
function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(LOG_FILE, line); } catch {}
}

// Run the fetch script
function runFetch() {
  return new Promise((resolve) => {
    log('▶ Starting fetch-real-data --type=all ...');
    const child = spawn('node', [SCRIPT, '--type=all'], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    child.on('close', (code) => {
      if (code === 0) {
        log('✓ fetch-real-data completed successfully');
      } else {
        log(`✗ fetch-real-data exited with code ${code}`);
        if (stderr) log(`  stderr: ${stderr.substring(0, 500)}`);
      }
      resolve(code);
    });

    child.on('error', (err) => {
      log(`✗ Failed to spawn: ${err.message}`);
      resolve(1);
    });
  });
}

// Write PID file
function writePID() {
  fs.writeFileSync(PID_FILE, String(process.pid));
  log(`PID ${process.pid} written to ${PID_FILE}`);
}

function cleanUp() {
  try { fs.unlinkSync(PID_FILE); } catch {}
  log('Scheduler stopped.');
}

// Check for existing instance
if (fs.existsSync(PID_FILE)) {
  try {
    const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
    // Check if process is still running
    try {
      process.kill(oldPid, 0); // throws if not running
      console.error(`Another scheduler instance is already running (PID ${oldPid}). Exiting.`);
      process.exit(1);
    } catch {
      // Old process not running, safe to proceed
      fs.unlinkSync(PID_FILE);
    }
  } catch {}
}

// Main
async function main() {
  const intervalMin = INTERVAL_MS / 60000;
  log(`Scheduler started. Interval: every ${intervalMin} minutes`);
  writePID();

  process.on('SIGINT', () => { cleanUp(); process.exit(0); });
  process.on('SIGTERM', () => { cleanUp(); process.exit(0); });

  // Run immediately on start
  await runFetch();

  if (runOnce) {
    log('Single run mode. Exiting.');
    cleanUp();
    return;
  }

  // Schedule recurring runs
  log(`Next run in ${intervalMin} minutes...`);
  const timer = setInterval(async () => {
    await runFetch();
    log(`Next run in ${intervalMin} minutes...`);
  }, INTERVAL_MS);

  // Keep process alive
  process.stdin.resume();
}

main().catch((e) => {
  log(`Fatal: ${e.message}`);
  cleanUp();
  process.exit(1);
});
