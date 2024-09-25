const express = require('express');
const addNewBarangayFuncHandler = require('../controller/barangay-controller');
const router = express.Router();

router.post("/register-barangay",(req,res)=>{
    const data = [
        req.body.barangay
    ]
    const result = addNewBarangayFuncHandler(data);
    return res.send(result);
});


module.exports = router;