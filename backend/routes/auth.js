const express = require('express');
const router = express.Router();

const  { authenticateUser, logoutUser, checkUser } = require('../controllers/authenticationController');

const db = require('../db');

router.post("/", authenticateUser);
router.post("/logout", logoutUser);
router.get("/check", checkUser);


module.exports = router;