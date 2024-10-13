const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname
      cb(null, uniqueSuffix)
    }
  })

const upload = multer({ storage: storage })
const express = require('express');
const auth = require("../auth/auth");
const { getUserDataUsingAuthenticationToken,
    updateUserHandlerForProfile,retrieveListUserDetails,processProfile,
  getAssistantDetails } = require('../controller/user-controller');
const router = express.Router();

router.get("/user-profile",auth.verify,getUserDataUsingAuthenticationToken);

router.put("/user-profile/update",auth.verify,updateUserHandlerForProfile);

router.get("/user-list",auth.verify,retrieveListUserDetails);

router.post("/user-profile",upload.single('profileImage'),processProfile);

router.get("/assistant-details/:assistantId",auth.verify,getAssistantDetails)


module.exports = router;