  const express = require('express');
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  const { addNewUserHandler, grabSession, fetchAllEmails, retrievePasswordThruEmail } = require('../controller/user-controller');
  const { v4: uuidv4 } = require('uuid');

  const router = express.Router();

  // Create a storage engine
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const date = new Date();
        const datePath = path.join(__dirname, '../profilePictures', date.toISOString().split('T')[0]); // YYYY-MM-DD
        fs.mkdirSync(datePath, { recursive: true }); // Create directory if it doesn't exist
        cb(null, datePath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using UUID
        const uniqueFilename = `${uuidv4()}_${file.originalname}`; // UUID + original file name
        cb(null, uniqueFilename);
    },
  });

  const upload = multer({ storage: storage })

  // Apply multer middleware to handle file uploads for registering users
  router.post("/register-user", upload.single('profileImage'), addNewUserHandler);  // Add upload.single for handling 'profileImage'

  router.get("/register-user", grabSession);
  router.get("/get-all-email", fetchAllEmails);

  router.post("/retrieve-password", retrievePasswordThruEmail);

  module.exports = router;
