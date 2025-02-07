const db = require('../db');
var bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
           const [users] = await db.execute("SELECT user_username, user_email, user_enabled FROM users");
              for (let i = 0; i < users.length; i++) {
                const [groups] = await db.execute("SELECT user_group_groupName FROM user_group WHERE user_group_username = ? AND user_group_groupName != ?", [users[i].user_username, "HARDCODED_ADMIN"]);
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

const getSpecificUserByUsername = async (req, res) => {
    try {
        const {username} = req.user.user;
        const user = await getSpecificUser(username);
        res.json({ user });
    } catch (err) {
        console.error("Error selecting data:", err);
        res.status(500).json({ message: 'Error selecting data', error: err });
    }
};

const createUser = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { username, password, inputEmail, inputGroup, enabled } = req.body;
        let email = inputEmail || null;
        let group = inputGroup || null;
        let status = enabled ? enabled : true;

        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        if (!username.match(/^[a-zA-Z0-9]{1,50}$/)) {
            return res.status(400).json({ message: 'Username should only contain alphanumeric characters' });
        }
        
        if (!password.match(/^[a-zA-Z0-9!?@#$%^&*()./]{8,10}$/) || !password.match(/[a-z]/) || !password.match(/[0-9]/) || !password.match(/[!?@#$%^&*()./]/)) {
            return res.status(400).json({ message: 'Password must be 8-10 characters long, contain at least one lowercase letter, one number, and one special character' });
        }

        if(email.length > 100){
            return res.status(400).json({ message: 'Email must be less than 100 characters' });
        }

        const [existingUsers] = await connection.execute("SELECT * FROM users WHERE user_username = ?", [username]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await connection.execute("INSERT INTO users (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ?)", [username, hash, email, status]);


        if (group) {
            for (let g of group) {
                await connection.execute("INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)", [username, g]);
            }
        }

        await connection.commit();
        res.json({ message: 'User created' });
    } catch (err) {
        await connection.rollback();
        console.error("Error creating user:", err);
        res.status(500).json({ message: 'Error creating user', error: err });
    } finally {
        connection.release(); 
    }
};


const updateUser = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();  

        const { username, inputPassword, inputEmail, inputGroup, enabled } = req.body;
        const currUserProfile = await getSpecificUser(username);

        let password = inputPassword || null;
        let email = inputEmail !== currUserProfile.user_email ? inputEmail : null;
        let group = inputGroup !== currUserProfile.groups ? inputGroup : null;
        let status = enabled !== currUserProfile.user_enabled ? enabled : null;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        if (password && (password.length < 8 || password.length > 10 || !password.match(/[a-z]/) || !password.match(/[!?@#$%^&*()./]/) || !password.match(/[0-9]/))) {
            return res.status(400).json({ message: 'Password must be 8-10 characters long, contain at least one lowercase letter, one number, and one special character' });
        }

        const [existingUsers] = await connection.execute("SELECT * FROM users WHERE user_username = ?", [username]);

        if (existingUsers.length === 0) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await connection.execute("UPDATE users SET user_password = ? WHERE user_username = ?", [hash, username]);
        }

        if (email) {
            await connection.execute("UPDATE users SET user_email = ? WHERE user_username = ?", [email, username]);
        }

        if (status !== null) {
            if(currUserProfile.includes("HARDCODED_ADMIN")){
                return res.status(403).json({ message: 'Hardcoded Admin cannot be disabled' });
            }
            await connection.execute("UPDATE users SET user_enabled = ? WHERE user_username = ?", [status, username]);
        }

        if (group) {
            const [existingGroups] = await connection.execute("SELECT user_group_groupName FROM user_group WHERE user_group_username = ?", [username]);
            const existingGroupNames = existingGroups.map(group => group.user_group_groupName);
            const newGroupNames = group.map(g => g);

            const groupsToRemove = existingGroupNames.filter(g => !newGroupNames.includes(g));
            const groupsToAdd = newGroupNames.filter(g => !existingGroupNames.includes(g));

            if (groupsToRemove.includes("HARDCODED_ADMIN") || groupsToAdd.includes("HARDCODED_ADMIN")) {
                return res.status(403).json({ message: 'Hardcoded Admin cannot be removed/added' });
            }

            for (let g of groupsToRemove) {
                await connection.execute("DELETE FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?", [username, g]);
            }

            for (let g of groupsToAdd) {
                await connection.execute("INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)", [username, g]);
            }
        }

        await connection.commit();

        return res.json({ message: 'User updated' });
    } catch (err) {
        await connection.rollback(); 
        console.error("Error updating user:", err);
        res.status(500).json({ message: 'Error updating user', error: err });
    } finally {
        connection.release(); 
    }
};


const updateSelf = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction(); 
        const { username } = req.user.user;
        const { inputPassword, inputEmail } = req.body;

        if (inputPassword) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(inputPassword, salt);
            await connection.execute("UPDATE users SET user_password = ? WHERE user_username = ?", [hash, username]);
        }

        if (inputEmail) {
            await connection.execute("UPDATE users SET user_email = ? WHERE user_username = ?", [inputEmail, username]);
        }

        await connection.commit();
        return res.json({ message: 'User updated' });
    } catch (err) {
        await connection.rollback(); 
        console.error("Error updating user:", err);
        res.status(500).json({ message: 'Error updating user', error: err });
    } finally {
        connection.release(); 
};
};

const currentUser = async (req, res) => {
    const user = req.user.user.username;
    res.json({user});
};


module.exports = {getUsers, createUser, updateUser, currentUser, updateSelf, getSpecificUserByUsername};