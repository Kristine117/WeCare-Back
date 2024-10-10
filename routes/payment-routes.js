const express = require('express');
const { processPayment } = require('../controller/payment-controller');

const router = express.Router();

router.post("/process-payment",processPayment);


module.exports = router;