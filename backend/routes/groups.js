const express = require('express');
const router = express.Router();
const { getGroups, getGroupsByUser, getGroupsForSpecificUser } = require('../controllers/groupsController');

const db = require('../db');
const { checkPermissions } = require('../middleware/permissions');

router.get("/get", getGroups);
router.get("/getbyuser", checkPermissions, getGroupsByUser);
router.get("/getperms", getGroupsForSpecificUser);


module.exports = router;