const express = require('express');
const {addNewBarangayFuncHandler,getAllBarangays} = require('../controller/barangay-controller');
const router = express.Router();

router.post("/register-barangay",addNewBarangayFuncHandler);

router.get("/registered-barangays",getAllBarangays);

module.exports = router;