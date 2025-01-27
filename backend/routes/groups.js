const express = require('express');
const router = express.Router();
const { getGroups, getGroupsByUser, getGroupsForSpecificUserEP } = require('../controllers/groupsController');

const db = require('../db');
const { checkPermissions } = require('../middleware/permissions');

router.get("/get", getGroups);
router.get("/getbyuser", checkPermissions, getGroupsByUser);
router.get("/getperms", getGroupsForSpecificUserEP);


module.exports = router;