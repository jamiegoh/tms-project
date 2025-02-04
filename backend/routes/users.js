const express = require('express');
const router = express.Router();

const { createUser, getUsers, updateUser } = require('../controllers/usersController');

const db = require('../db');
const { checkPermissions } = require("../middleware/permissions");


router.get("/get", getUsers);
router.post("/create", checkPermissions, createUser);
router.post("/update", checkPermissions, updateUser);



module.exports = router;