const express = require('express');
const router = express.Router();

const { createUser, getUsers, updateUser, currentUser, updateSelf, getSpecificUserByUsername } = require('../controllers/usersController');

const db = require('../db');
const { checkPermissions } = require("../middleware/permissions");


router.get("/get",checkPermissions, getUsers);
router.post("/create", checkPermissions, createUser);
router.post("/update", checkPermissions, updateUser);
router.get("/current", currentUser);
router.get("/currentDetails", getSpecificUserByUsername);
router.post("/updateSelf", updateSelf);



module.exports = router;