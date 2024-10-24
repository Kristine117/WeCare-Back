  // const express = require('express');
  // const multer = require('multer');
  // const path = require('path');
  // const fs = require('fs');
  // const { addNewUserHandler, grabSession, fetchAllEmails, retrievePasswordThruEmail } = require('../controller/user-controller');
  // const { v4: uuidv4 } = require('uuid');

  // const router = express.Router();

  // // Create a storage engine
  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //       const date = new Date();
  //       const datePath = path.join(__dirname, '../profilePictures', date.toISOString().split('T')[0]); // YYYY-MM-DD
  //       fs.mkdirSync(datePath, { recursive: true }); // Create directory if it doesn't exist
  //       cb(null, datePath);
  //   },
  //   filename: (req, file, cb) => {
  //       // Generate a unique filename using UUID
  //       const uniqueFilename = `${uuidv4()}_${file.originalname}`; // UUID + original file name
  //       cb(null, uniqueFilename);
  //   },
  // });

  // const upload = multer({ storage: storage })

  // // Apply multer middleware to handle file uploads for registering users
  // router.post("/register-user", upload.single('profileImage'), addNewUserHandler);  // Add upload.single for handling 'profileImage'

  // router.get("/register-user", grabSession);
  // router.get("/get-all-email", fetchAllEmails);

  // router.post("/retrieve-password", retrievePasswordThruEmail);

  // module.exports = router;

  const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { addNewUserHandler, grabSession, fetchAllEmails } = require('../controller/user-controller');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Serve static files from the profilePictures directory
router.use('/profilePictures', express.static(path.join(__dirname, '../profilePictures')));

// Create a storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const folderName = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const datePath = path.join(__dirname, '../profilePictures', folderName);
    
    // Create the directory if it doesn't exist
    fs.mkdirSync(datePath, { recursive: true });
    
    cb(null, datePath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using UUID + original file name
    const uniqueFilename = `${uuidv4()}_${file.originalname}`;
    
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

// Route for registering users with a profile image upload
router.post("/register-user", upload.single('profileImage'), (req, res) => {
  const { file } = req;
  
  if (file) {
    // Store the relative path in the database (not the full path)
    const relativeFilePath = path.join(file.destination.split('profilePictures')[1], file.filename);
    
    // Call the controller with the relative file path
    addNewUserHandler(req, res, relativeFilePath);
  } else {
    // Handle case where no file is uploaded
    addNewUserHandler(req, res, null);
  }
});

// Other routes
router.get("/register-user", grabSession);
router.get("/get-all-email", fetchAllEmails);

module.exports = router;
