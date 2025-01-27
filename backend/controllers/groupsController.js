
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

const getGroupForSpecificUser = async (username) => {
    try {
        const [groups] = await db.execute(
            "SELECT user_group_groupName FROM User_Group WHERE user_group_username = ?", [username]
        );

        return groups.map(group => group.user_group_groupName);
    } catch (err) {
        console.error("Error selecting data:", err);
        throw err; 
    }
};

const getGroupsForSpecificUserEP = async (req, res) => {
    try {
        const username = req.user.user.username;
        const groups = await getGroupForSpecificUser(username);
        res.json(groups);
    } catch (err) {
        console.error("Error selecting data:", err);
        res.status(500).json({ message: 'Error selecting data', error: err });
    }
};

module.exports = {getGroupsByUser, getGroups, getGroupForSpecificUser, getGroupsForSpecificUserEP};
