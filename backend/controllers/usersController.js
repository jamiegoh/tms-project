

const db = require('../db');
var bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
           const [users] = await db.execute("SELECT * FROM users");
           
           res.json({ users: users });
       } catch (err) {
           console.error("Error selecting data:", err);
           res.status(500).json({ message: 'Error selecting data', error: err });
       }
  };

const createUser = async (req, res) => {
    try{
        //only username and password are required
        const {username, password, inputEmail, inputGroup, enabled} = req.body;
        let email = inputEmail || null;
        let group = inputGroup || null;
        let status = enabled ? enabled : 1;

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

module.exports = {getUsers, createUser};