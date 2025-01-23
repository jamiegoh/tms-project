

const db = require('../db');

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
        const {username, password, email, group, status} = req.body;
        if(!username || !password){
            return res.status(400).json({message: 'Username and password are required'});
        }
        //check if user already exists
        const [existingUsers] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);

        //if user exists, return error
        if(existingUsers.length > 0){
            return res.status(400).json({message: 'User already exists'});
        }

        //create user
        await db.execute("INSERT INTO users (username, password, email, group, status) VALUES (?, ?, ?, ?, ?)", [username, password, email, group, status]);
        res.json({message: 'User created'});

    }
    catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: 'Error creating user', error: err });
    }
}

module.exports = {getUsers, createUser};