const express = require('express');
const router = express.Router();

const  { authenticateUser } = require('../controllers/authenticationController');

const db = require('../db');

router.post("/", authenticateUser);


module.exports = router;