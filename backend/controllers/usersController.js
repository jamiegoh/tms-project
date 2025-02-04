

const db = require('../db');
var bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
           const [users] = await db.execute("SELECT * FROM users");
              for (let i = 0; i < users.length; i++) {
                const [groups] = await db.execute("SELECT user_group_groupName FROM user_group WHERE user_group_username = ?", [users[i].user_username]);
                users[i].groups = groups.map(group => group.user_group_groupName);
              }
           
           res.json({ users: users });
       } catch (err) {
           console.error("Error selecting data:", err);
           res.status(500).json({ message: 'Error selecting data', error: err });
       }
  };

const getSpecificUser = async (username) => {
    try {
        const [users] = await db.execute("SELECT * FROM users WHERE user_username = ?", [username]);
        const [groups] = await db.execute("SELECT user_group_groupName FROM user_group WHERE user_group_username = ?", [username]);
        users[0].groups = groups.map(group => group.user_group_groupName);

        return users[0];
    } catch (err) {
        console.error("Error selecting data:", err);
        throw err;
    }
};

const createUser = async (req, res) => {
    try{
        //only username and password are required
        const {username, password, inputEmail, inputGroup, enabled} = req.body;
        let email = inputEmail || null;
        let group = inputGroup || null;
        let status = enabled ? enabled : true;

        if(!username || !password){
            return res.status(400).json({message: 'Username and password are required'});
        }

        if(password.length < 8 || password.length > 10 || !password.match(/[a-z]/) || !password.match(/[!?@#$%^&*()./]/) || !password.match(/[0-9]/)){
            return res.status(400).json({message: 'Password must be 8-10 characters long, contain at least one lowercase letter, one number, and one special character'});
        }
        //check if user already exists
        const [existingUsers] = await db.execute("SELECT * FROM users WHERE user_username = ?", [username]);

        //if user exists, return error
        if(existingUsers.length > 0){
            return res.status(400).json({message: 'User already exists'});
        }

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                await db.execute("INSERT INTO users (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ? )", [username, hash, email, status]).then(() => {
                    group?.map(async (g) => {
                        db.execute("INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?,?)", [username, g]);
                });
            });
                return res.json({message: 'User created'});
            });
        });
    }
    catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: 'Error creating user', error: err });
    }
}

const updateUser = async (req, res) => {
    try{
        const {username, inputPassword, inputEmail, inputGroup, enabled} = req.body;

        const currUserProfile = getSpecificUser(username);

        console.log("CURRUSERPROFILE" , currUserProfile);

        let password = inputPassword != currUserProfile.user_password ? inputPassword : null;
        let email = inputEmail != currUserProfile.user_email ? inputEmail : null;
        let group = inputGroup != currUserProfile.groups ? inputGroup : null;
        let status = enabled != currUserProfile.user_enabled ? enabled : null;

        if(!username){
            return res.status(400).json({message: 'Username is required'});
        }

        if(password && (password.length < 8 || password.length > 10 || !password.match(/[a-z]/) || !password.match(/[!?@#$%^&*()./]/) || !password.match(/[0-9]/))){
            return res.status(400).json({message: 'Password must be 8-10 characters long, contain at least one lowercase letter, one number, and one special character'});
        }

        const [existingUsers] = await db.execute("SELECT * FROM users WHERE user_username = ?", [username]);

        if(existingUsers.length === 0){
            return res.status(400).json({message: 'User does not exist'});
        }

        if(password){
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, async function(err, hash) {
                    await db.execute("UPDATE users SET user_password = ? WHERE user_username = ?", [hash, username]);
                });
            });
        }

        if(email){
            await db.execute("UPDATE users SET user_email = ? WHERE user_username = ?", [email, username]);
        }

        if(status){
            await db.execute("UPDATE users SET user_enabled = ? WHERE user_username = ?", [status, username]);
        }

        if(group){
            const [existingGroups] = await db.execute("SELECT user_group_groupName FROM user_group WHERE user_group_username = ?", [username]);
            const existingGroupNames = existingGroups.map(group => group.user_group_groupName);
            const newGroupNames = group.map(g => g);

            const groupsToRemove = existingGroupNames.filter(g => !newGroupNames.includes(g));
            const groupsToAdd = newGroupNames.filter(g => !existingGroupNames.includes(g));

            groupsToRemove.map(async (g) => {
                await db.execute("DELETE FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?", [username, g]);
            });

            groupsToAdd.map(async (g) => {
                await db.execute("INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?,?)", [username, g]);
            });

        }

        return res.json({message: 'User updated'});
    }
    catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: 'Error updating user', error: err });
    }
}

module.exports = {getUsers, createUser, updateUser};