const express = require('express');
const auth = require("../auth/auth");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const { getUserDataUsingAuthenticationToken,
  updateUserHandlerForProfile,retrieveListUserDetails,processProfile,
getAssistantDetails, sendTestEmail, sendEmailForgotPassword, addNewAdmin } = require('../controller/user-controller');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, '/uploads')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + file.originalname
//       cb(null, uniqueSuffix)
//     }
//   })

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

router.get("/produce-admin", addNewAdmin);

router.get("/test-mail", sendTestEmail);

router.post("/forgot-password", sendEmailForgotPassword);

router.get("/user-profile",auth.verify,getUserDataUsingAuthenticationToken);

// router.put("/user-profile/update",auth.verify,updateUserHandlerForProfile);
router.put("/user-profile/update", auth.verify, upload.single('profileImage'), updateUserHandlerForProfile);

router.get("/user-list",auth.verify,retrieveListUserDetails);

router.post("/user-profile",upload.single('profileImage'),processProfile);

router.get("/assistant-details/:assistantId",auth.verify,auth.verifySenior,getAssistantDetails)


module.exports = router;