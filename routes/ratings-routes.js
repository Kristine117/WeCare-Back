const express = require('express');
const auth= require("../auth/auth");
const { createFeedback } = require('../controller/ratings-controller');
const router = express.Router();

router.post("/create-feedback/:appId",
    auth.verify,
    auth.verifySenior,
    createFeedback);

module.exports = router;