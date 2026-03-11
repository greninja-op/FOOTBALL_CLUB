const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MongoDB Restore Script
 * Restores database from backup with integrity verification
 * 
 * Validates Requirements: 25.3
 */

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

/**
 * List available backups
 */
const listBackups = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups directory found');
    return [];
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => {
      const filePath = path.join(BACKUP_DIR, file);
      return fs.statSync(filePath).isDirectory() && file.startsWith('backup_');
    })
    .sort()
    .reverse(); // Most recent first

  return backups;
};

/**
 * Verify backup integrity before restore
 */
const verifyBackupIntegrity = (backupPath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(backupPath)) {
      reject(new Error(`Backup not found: ${backupPath}`));
      return;
    }

    // Check if backup contains database files
    const files = fs.readdirSync(backupPath);
    if (files.length === 0) {
      reject(new Error('Backup directory is empty'));
      return;
    }

    // Check for BSON files (MongoDB backup format)
    let hasBsonFiles = false;
    let totalSize = 0;

    files.forEach(file => {
      const dirPath = path.join(backupPath, file);
      if (fs.statSync(dirPath).isDirectory()) {
        const dbFiles = fs.readdirSync(dirPath);
        dbFiles.forEach(f => {
          if (f.endsWith('.bson')) {
            hasBsonFiles = true;
            const filePath = path.join(dirPath, f);
            totalSize += fs.statSync(filePath).size;
          }
        });
      }
    });

    if (!hasBsonFiles) {
      reject(new Error('No BSON files found in backup'));
      return;
    }

    if (totalSize === 0) {
      reject(new Error('Backup files are empty'));
      return;
    }

    console.log(`✓ Backup verification passed`);
    console.log(`✓ Total backup size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    resolve();
  });
};

/**
 * Restore MongoDB from backup using mongorestore
 */
const restoreBackup = (backupName) => {
  return new Promise((resolve, reject) => {
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Verify backup integrity first
    verifyBackupIntegrity(backupPath)
      .then(() => {
        // Extract database name from MongoDB URI
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        
        // Build mongorestore command
        // --drop flag will drop existing collections before restore
        const command = `mongorestore --uri="${process.env.MONGODB_URI}" --drop "${backupPath}/${dbName}"`;

        console.log(`Starting restore from: ${backupPath}`);
        console.log(`Database: ${dbName}`);
        console.log('WARNING: This will drop existing collections!');

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('✗ Restore failed:', error.message);
            reject(error);
            return;
          }

          if (stderr) {
            console.log('Restore warnings:', stderr);
          }

          console.log('✓ Restore completed successfully');
          console.log(stdout);
          
          // Log restore operation
          logRestoreOperation(backupName);
          
          resolve();
        });
      })
      .catch(reject);
  });
};

/**
 * Log restore operation
 */
const logRestoreOperation = (backupName) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation: 'RESTORE',
    backup: backupName,
    database: process.env.MONGODB_URI.split('/').pop().split('?')[0]
  };

  const logFile = path.join(BACKUP_DIR, 'restore.log');
  const logLine = JSON.stringify(logEntry) + '\n';

  fs.appendFileSync(logFile, logLine);
  console.log(`✓ Restore operation logged to: ${logFile}`);
};

/**
 * Main restore function
 */
const runRestore = async () => {
  try {
    console.log('=== MongoDB Restore Started ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // List available backups
    const backups = listBackups();
    
    if (backups.length === 0) {
      console.log('✗ No backups available');
      process.exit(1);
    }

    console.log('\nAvailable backups:');
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup}`);
    });

    // Get backup name from command line argument
    const backupName = process.argv[2];
    
    if (!backupName) {
      console.log('\nUsage: node restore.js <backup_name>');
      console.log(`Example: node restore.js ${backups[0]}`);
      process.exit(1);
    }

    if (!backups.includes(backupName)) {
      console.log(`✗ Backup not found: ${backupName}`);
      process.exit(1);
    }

    // Restore backup
    await restoreBackup(backupName);
    
    console.log('=== Restore Process Completed ===');
    process.exit(0);
  } catch (error) {
    console.error('=== Restore Process Failed ===');
    console.error(error);
    process.exit(1);
  }
};

// Run restore if executed directly
if (require.main === module) {
  runRestore();
}

module.exports = {
  listBackups,
  verifyBackupIntegrity,
  restoreBackup
};
