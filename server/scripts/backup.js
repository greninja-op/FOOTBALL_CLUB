const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MongoDB Backup Script
 * Creates database backups with timestamp and retains last 7 days
 * 
 * Validates Requirements: 25.1, 25.2
 */

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RETENTION_DAYS = 7;

/**
 * Create backup directory if it doesn't exist
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✓ Created backup directory: ${BACKUP_DIR}`);
  }
};

/**
 * Generate timestamp for backup filename
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '-');
};

/**
 * Create MongoDB backup using mongodump
 */
const createBackup = () => {
  return new Promise((resolve, reject) => {
    ensureBackupDir();

    const timestamp = getTimestamp();
    const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}`);
    
    // Extract database name from MongoDB URI
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
    
    // Build mongodump command
    const command = `mongodump --uri="${process.env.MONGODB_URI}" --out="${backupPath}"`;

    console.log(`Starting backup: ${backupPath}`);
    console.log(`Database: ${dbName}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('✗ Backup failed:', error.message);
        reject(error);
        return;
      }

      if (stderr) {
        console.log('Backup warnings:', stderr);
      }

      console.log('✓ Backup completed successfully');
      console.log(`✓ Backup location: ${backupPath}`);
      
      // Verify backup
      verifyBackup(backupPath)
        .then(() => {
          console.log('✓ Backup verification passed');
          resolve(backupPath);
        })
        .catch((err) => {
          console.error('✗ Backup verification failed:', err.message);
          reject(err);
        });
    });
  });
};

/**
 * Verify backup integrity
 */
const verifyBackup = (backupPath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(backupPath)) {
      reject(new Error('Backup directory not found'));
      return;
    }

    // Check if backup contains database files
    const files = fs.readdirSync(backupPath);
    if (files.length === 0) {
      reject(new Error('Backup directory is empty'));
      return;
    }

    // Check for BSON files (MongoDB backup format)
    const hasBsonFiles = files.some(file => {
      const dirPath = path.join(backupPath, file);
      if (fs.statSync(dirPath).isDirectory()) {
        const dbFiles = fs.readdirSync(dirPath);
        return dbFiles.some(f => f.endsWith('.bson'));
      }
      return false;
    });

    if (!hasBsonFiles) {
      reject(new Error('No BSON files found in backup'));
      return;
    }

    resolve();
  });
};

/**
 * Clean up old backups (retain last 7 days)
 */
const cleanupOldBackups = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    return;
  }

  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const backups = fs.readdirSync(BACKUP_DIR);
  let deletedCount = 0;

  backups.forEach(backup => {
    const backupPath = path.join(BACKUP_DIR, backup);
    const stats = fs.statSync(backupPath);
    const age = now - stats.mtimeMs;

    if (age > retentionMs) {
      fs.rmSync(backupPath, { recursive: true, force: true });
      console.log(`✓ Deleted old backup: ${backup}`);
      deletedCount++;
    }
  });

  if (deletedCount === 0) {
    console.log('✓ No old backups to clean up');
  } else {
    console.log(`✓ Cleaned up ${deletedCount} old backup(s)`);
  }
};

/**
 * Main backup function
 */
const runBackup = async () => {
  try {
    console.log('=== MongoDB Backup Started ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Create backup
    const backupPath = await createBackup();
    
    // Clean up old backups
    cleanupOldBackups();
    
    console.log('=== Backup Process Completed ===');
    process.exit(0);
  } catch (error) {
    console.error('=== Backup Process Failed ===');
    console.error(error);
    process.exit(1);
  }
};

// Run backup if executed directly
if (require.main === module) {
  runBackup();
}

module.exports = {
  createBackup,
  verifyBackup,
  cleanupOldBackups
};
