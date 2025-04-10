const fs = require('fs');
const path = require('path');

// Download backup file
exports.downloadBackup = async (req, res, next) => {
  try {
    const backupId = req.params.id;
    
    // In a real application, this would fetch the backup file from storage
    // For this demo, we'll create a mock backup file
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Create a mock backup file if it doesn't exist
    const backupFileName = `backup_${backupId}.json`;
    const backupFilePath = path.join(backupsDir, backupFileName);
    
    if (!fs.existsSync(backupFilePath)) {
      // Create mock backup data
      const mockData = {
        id: backupId,
        timestamp: new Date().toISOString(),
        data: {
          users: [{ id: 1, name: 'Admin User' }, { id: 2, name: 'Test User' }],
          settings: { siteName: 'Ambulance Booking System', theme: 'light' }
        }
      };
      
      // Write to file
      fs.writeFileSync(backupFilePath, JSON.stringify(mockData, null, 2));
    }
    
    // Set headers for the response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${backupFileName}`);
    
    // Send the file
    const fileStream = fs.createReadStream(backupFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading backup:', error);
    next(error);
  }
};