const express = require('express');
const auth = require("../auth/auth");
const { adminHeaderCardsDetails } = require('../controller/admin-controller');

const router = express.Router();

router.get("/admin-cards/details",auth.verify,adminHeaderCardsDetails)


module.exports = router;