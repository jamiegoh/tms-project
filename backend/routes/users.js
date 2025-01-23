const express = require('express');
const router = express.Router();

const db = require('../db');

router.get("/get", async (req, res) => {
    try {
        const [users] = await db.execute("SELECT * FROM users");
        
        res.json({ users: users });
    } catch (err) {
        console.error("Error selecting data:", err);
        res.status(500).json({ message: 'Error selecting data', error: err });
    }
});

  module.exports = router;