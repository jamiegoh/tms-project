const express = require('express');
const router = express.Router();

const { createUser, getUsers, authenticateUser } = require('../controllers/usersController');

const db = require('../db');

router.get("/get", getUsers);
router.post("/create", createUser);


module.exports = router;