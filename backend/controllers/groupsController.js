
const db = require('../db');

const getGroupsByUser = async (req, res) => {
        try {
            const [groups] = await db.execute(
                "SELECT user_group_username, GROUP_CONCAT(user_group_groupname SEPARATOR ',') AS groupnames FROM User_Group WHERE user_group_username != '' GROUP BY user_group_username"
              );
              
            res.json(groups);
        } catch (err) {
            console.error("Error selecting data:", err);
            res.status(500).json({ message: 'Error selecting data', error: err });
        }
};

const getGroups = async (req, res) => {
    try {
        const [groups] = await db.execute("SELECT DISTINCT user_group_groupName FROM User_Group");

        res.json(groups.map(group => group.user_group_groupName));

    } catch (err) {
        console.error("Error selecting data:", err);
        res.status(500).json({ message: 'Error selecting data', error: err });
    }
};


const getGroupsForSpecificUser = async (req, res) => {
    try {
        const username = req.user.user.username;
        const [groups] = await db.execute(
            "SELECT user_group_groupName FROM User_Group WHERE user_group_username = ?", [username]
        );
        const response = groups.map(group => group.user_group_groupName);
        res.json({ groups: response, username: username });
    } catch (err) {
        console.error("Error selecting data:", err);
        res.status(500).json({ message: 'Error selecting data', error: err });
    }
};

const checkGroup = async (username, group) => {
    try {
        const groups = await db.execute(
            "SELECT user_group_groupName FROM user_group WHERE user_group_username = ?", [username]
        );

        return groups[0].some(g => g.user_group_groupName === group);
    } catch (err) {
        console.error("Error selecting data:", err);
        throw err; 
    }
};

const createGroup = async (req, res) => {
    try { 
        const groupName = req.body.groupName;

        if (!groupName.match(/^[a-zA-Z0-9_]{1,50}$/)) {
            return res.status(400).json({ message: 'Group name should only contain alphanumeric characters and be 1-50 characters' });
        }

        const [groups] = await db.execute("SELECT user_group_groupName FROM user_group WHERE user_group_groupName = ?", [groupName]);
        if (groups.length > 0) {
            return res.status(400).json({ message: 'Group already exists' });
        }

        await db.execute("INSERT INTO user_group (user_group_username, user_group_groupName) VALUES ('', ?)", [groupName]);

        res.json({ message: 'Group created successfully' });
    }
    catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ message: 'Error inserting data', error: err });
    }
};

module.exports = {getGroupsByUser, getGroups, getGroupsForSpecificUser, checkGroup, createGroup};
