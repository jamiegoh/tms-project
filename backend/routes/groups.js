const express = require('express');
const router = express.Router();
const { getGroups, getGroupsByUser } = require('../controllers/groupsController');

const db = require('../db');

router.get("/get", getGroups);
router.get("/getbyuser", getGroupsByUser);

module.exports = router;