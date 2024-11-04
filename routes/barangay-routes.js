const express = require('express');
const {addNewBarangayFuncHandler,getAllBarangays,getSpecificBrangay} = require('../controller/barangay-controller');
const router = express.Router();

router.post("/register-barangay",addNewBarangayFuncHandler);

router.get("/registered-barangays",getAllBarangays);

router.get("/getSpecific-barangay/:brgId", getSpecificBrangay);

module.exports = router;