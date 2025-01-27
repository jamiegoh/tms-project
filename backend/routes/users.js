const express = require('express');
const router = express.Router();

const { createUser, getUsers, logoutUser } = require('../controllers/usersController');

const db = require('../db');
const { checkPermissions } = require("../middleware/permissions");


router.get("/get", getUsers);
router.post("/create", checkPermissions, createUser);



module.exports = router;