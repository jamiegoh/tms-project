const express = require('express');
const router = express.Router();

const { getApplications, createApplication, updateApplication, getAppPermits } = require('../controllers/applicationController');
const { checkForPL } = require('../middleware/permissions');

router.get('/get', getApplications);
router.post('/create',checkForPL, createApplication);
router.put('/update', checkForPL, updateApplication);
router.get('/get/permissions/:appid', getAppPermits);



module.exports = router;