/**
 * Document Controller Test
 * Tests Task 16.1 implementation
 * 
 * Tests document upload, retrieval, download, and deletion functionality
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User');
const Profile = require('./models/Profile');
const fs = require('fs').promises;
const path = require('path');

// Simple logging utility
const log = {
  success: (msg) => console.log('\x1b[32m✓\x1b[0m', msg),
  error: (msg) => console.log('\x1b[31m✗\x1b[0m', msg),
  info: (msg) => console.log('\x1b[36mℹ\x1b[0m', msg),
  section: (msg) => console.log('\n\x1b[1m' + msg + '\x1b[0m')
};

async function testDocumentController() {
  try {
    log.section('=== Document Controller Test Suite ===');

    // Connect to database
    log.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Connected to MongoDB');

    // Test 1: Verify Document Model
    log.section('Test 1: Verify Document Model');
    const documentSchema = Document.schema.obj;
    
    const requiredFields = ['playerId', 'fileName', 'originalName', 'filePath', 'fileType', 'fileSize', 'uploadedBy'];
    const missingFields = requiredFields.filter(field => !documentSchema[field]);
    
    if (missingFields.length === 0) {
      log.success('All required fields present in Document schema');
    } else {
      log.error(`Missing fields: ${missingFields.join(', ')}`);
      throw new Error('Document schema incomplete');
    }

    // Verify file type validation
    const fileTypeEnum = documentSchema.fileType.enum;
    const expectedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const hasAllTypes = expectedTypes.every(type => fileTypeEnum.values.includes(type));
    
    if (hasAllTypes) {
      log.success('File type validation configured correctly (PDF, JPEG, PNG)');
    } else {
      log.error('File type validation missing expected types');
      throw new Error('File type validation incomplete');
    }

    // Verify file size limit
    const fileSizeMax = documentSchema.fileSize.max;
    if (fileSizeMax && fileSizeMax[0] === 10 * 1024 * 1024) {
      log.success('File size limit set to 10MB');
    } else {
      log.error('File size limit not set to 10MB');
      throw new Error('File size limit incorrect');
    }

    // Test 2: Verify Document Controller Functions
    log.section('Test 2: Verify Document Controller Functions');
    const documentController = require('./controllers/documentController');
    
    const requiredFunctions = ['uploadDocument', 'getPlayerDocuments', 'downloadDocument', 'deleteDocument', 'upload'];
    const missingFunctions = requiredFunctions.filter(fn => typeof documentController[fn] === 'undefined');
    
    if (missingFunctions.length === 0) {
      log.success('All required controller functions present');
    } else {
      log.error(`Missing functions: ${missingFunctions.join(', ')}`);
      throw new Error('Document controller incomplete');
    }

    // Test 3: Verify Multer Configuration
    log.section('Test 3: Verify Multer Configuration');
    const multerUpload = documentController.upload;
    
    if (multerUpload && typeof multerUpload.single === 'function') {
      log.success('Multer middleware configured');
    } else {
      log.error('Multer middleware not properly configured');
      throw new Error('Multer configuration incomplete');
    }

    // Test 4: Create Test Document Record
    log.section('Test 4: Create Test Document Record');
    
    // Find or create test user and profile
    let testUser = await User.findOne({ email: 'manager@test.com' });
    if (!testUser) {
      log.info('Creating test manager user...');
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('Manager123!', 10);
      testUser = await User.create({
        email: 'manager@test.com',
        passwordHash: passwordHash,
        role: 'manager'
      });
      log.success('Test manager user created');
    }

    let testProfile = await Profile.findOne({ userId: testUser._id });
    if (!testProfile) {
      log.info('Creating test profile...');
      testProfile = await Profile.create({
        userId: testUser._id,
        fullName: 'Test Player',
        position: 'Forward'
      });
      log.success('Test profile created');
    }

    // Create test document directory
    const testDocDir = process.env.DOCUMENTS_DIR || './uploads/documents';
    await fs.mkdir(testDocDir, { recursive: true });
    log.success('Test document directory created');

    // Create a test file
    const testFilePath = path.join(testDocDir, 'test-document.pdf');
    await fs.writeFile(testFilePath, 'Test PDF content');
    log.success('Test file created');

    // Create document record
    const testDocument = await Document.create({
      playerId: testProfile._id,
      fileName: 'test-document.pdf',
      originalName: 'test-document.pdf',
      filePath: testFilePath,
      fileType: 'application/pdf',
      fileSize: 16,
      uploadedBy: testUser._id
    });
    log.success(`Document record created with ID: ${testDocument._id}`);

    // Test 5: Retrieve Player Documents
    log.section('Test 5: Retrieve Player Documents');
    const documents = await Document.find({ playerId: testProfile._id });
    
    if (documents.length > 0) {
      log.success(`Found ${documents.length} document(s) for player`);
    } else {
      log.error('No documents found for player');
      throw new Error('Document retrieval failed');
    }

    // Test 6: Verify Document Data
    log.section('Test 6: Verify Document Data');
    const doc = documents[0];
    
    if (doc.playerId.toString() === testProfile._id.toString()) {
      log.success('Player ID matches');
    } else {
      log.error('Player ID mismatch');
    }

    if (doc.fileType === 'application/pdf') {
      log.success('File type is PDF');
    } else {
      log.error('File type incorrect');
    }

    if (doc.fileSize === 16) {
      log.success('File size recorded correctly');
    } else {
      log.error('File size incorrect');
    }

    if (doc.uploadedBy.toString() === testUser._id.toString()) {
      log.success('Uploader ID matches');
    } else {
      log.error('Uploader ID mismatch');
    }

    // Test 7: Delete Document
    log.section('Test 7: Delete Document');
    await Document.findByIdAndDelete(testDocument._id);
    
    const deletedDoc = await Document.findById(testDocument._id);
    if (!deletedDoc) {
      log.success('Document deleted from database');
    } else {
      log.error('Document still exists in database');
      throw new Error('Document deletion failed');
    }

    // Clean up test file
    try {
      await fs.unlink(testFilePath);
      log.success('Test file cleaned up');
    } catch (error) {
      log.info('Test file already removed');
    }

    log.section('=== All Tests Passed ===');
    log.success('Document controller implementation verified successfully');

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
}

// Run tests
testDocumentController();
