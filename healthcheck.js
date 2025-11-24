#!/usr/bin/env node

/**
 * Health Check Script for Claude-Flow
 * Used by Docker container for health monitoring
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const HEALTH_CHECK_PORT = process.env.PORT || 3000;
const HEALTH_CHECK_HOST = process.env.HOST || 'localhost';
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second

/**
 * Check if the application is healthy
 */
async function checkHealth() {
  const checks = {
    server: false,
    database: false,
    memory: false,
    filesystem: false,
    processes: false
  };

  try {
    // Check server responsiveness
    checks.server = await checkServerHealth();

    // Check database connectivity
    checks.database = await checkDatabaseHealth();

    // Check memory system
    checks.memory = await checkMemoryHealth();

    // Check filesystem access
    checks.filesystem = await checkFilesystemHealth();

    // Check process health
    checks.processes = await checkProcessHealth();

    const allHealthy = Object.values(checks).every(Boolean);

    if (allHealthy) {
      console.log('✅ All health checks passed');
      process.exit(0);
    } else {
      console.log('❌ Health check failed:', checks);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Health check error:', error.message);
    process.exit(1);
  }
}

/**
 * Check server health via HTTP request
 */
async function checkServerHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: HEALTH_CHECK_HOST,
      port: HEALTH_CHECK_PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Check database connectivity
 */
async function checkDatabaseHealth() {
  try {
    // Check if database files are accessible
    const dbPaths = [
      path.join(process.cwd(), 'data', 'claude-flow.db'),
      path.join(process.cwd(), '.swarm', 'memory.db')
    ];

    for (const dbPath of dbPaths) {
      if (fs.existsSync(dbPath)) {
        // Check if file is readable
        try {
          fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check memory system health
 */
async function checkMemoryHealth() {
  try {
    // Check if memory directories exist and are accessible
    const memoryPaths = [
      path.join(process.cwd(), '.swarm'),
      path.join(process.cwd(), 'data')
    ];

    for (const memPath of memoryPaths) {
      if (!fs.existsSync(memPath)) {
        try {
          fs.mkdirSync(memPath, { recursive: true });
        } catch (error) {
          return false;
        }
      }

      try {
        fs.accessSync(memPath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (error) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check filesystem health
 */
async function checkFilesystemHealth() {
  try {
    // Check critical directories
    const criticalPaths = [
      'src',
      'bin',
      'dist',
      'logs'
    ];

    for (const dirPath of criticalPaths) {
      const fullPath = path.join(process.cwd(), dirPath);

      if (!fs.existsSync(fullPath)) {
        // Create if it doesn't exist
        try {
          fs.mkdirSync(fullPath, { recursive: true });
        } catch (error) {
          return false;
        }
      }

      try {
        fs.accessSync(fullPath, fs.constants.R_OK);
      } catch (error) {
        return false;
      }
    }

    // Check if we can write to logs directory
    const testLogFile = path.join(process.cwd(), 'logs', 'health-test.log');
    try {
      fs.writeFileSync(testLogFile, `Health check at ${new Date().toISOString()}\n`);
      fs.unlinkSync(testLogFile);
    } catch (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check process health
 */
async function checkProcessHealth() {
  try {
    // Check memory usage
    const memUsage = process.memoryUsage();
    const totalMemoryMB = memUsage.rss / 1024 / 1024;

    // Warn if using more than 1GB
    if (totalMemoryMB > 1024) {
      console.warn(`⚠️ High memory usage: ${totalMemoryMB.toFixed(2)} MB`);
    }

    // Check uptime
    const uptime = process.uptime();
    if (uptime < 10) {
      console.warn(`⚠️ Recent startup: ${uptime.toFixed(2)}s uptime`);
    }

    // Check if we can still execute basic Node.js operations
    try {
      Buffer.alloc(1024);
      JSON.stringify({ test: true });
      Date.now();
    } catch (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Retry health check with delay
 */
async function retryHealthCheck(retries = MAX_RETRIES) {
  if (retries <= 0) {
    console.error('❌ Max retries exceeded');
    process.exit(1);
  }

  try {
    await checkHealth();
  } catch (error) {
    console.log(`⚠️ Health check failed, retrying in ${RETRY_DELAY}ms... (${retries} attempts remaining)`);

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    await retryHealthCheck(retries - 1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--retry')) {
    retryHealthCheck();
  } else {
    checkHealth();
  }
}

module.exports = {
  checkHealth,
  checkServerHealth,
  checkDatabaseHealth,
  checkMemoryHealth,
  checkFilesystemHealth,
  checkProcessHealth
};