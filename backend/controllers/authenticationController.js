
const db = require('../db');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


const authenticateUser = async (req, res) => {
    //check against bcryptjs hash and return token
    try{
        const {username, password} = req.body;

        if(!username || !password){
            return res.status(400).json({message: 'Username and password are required'});
        }

        const [users] = await db.execute("SELECT * FROM users WHERE user_username = ?", [username]);


        if(users[0].user_enabled === 0){
            return res.status(401).json({message: 'Authentication failed'});
        }

        if(users.length === 0){
            return res.status(401).json({message: 'Authentication failed'});
        }

        bcrypt.compare(password, users[0].user_password, function(err, result) {
            if(result){
                //generate token
                const user = {username: users[0].user_username};
                const payload = {user: user, ip: req.ip, browserType: req.headers['user-agent']};
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn : '7days'});
                res.cookie('token', token, {httpOnly: true});
                return res.json({message: 'Authentication successful'});
            }
            else{
                return res.status(401).json({message: 'Authentication failed'});
            }
        });
    }
    catch (err) {
        console.error("Error authenticating user:", err);
        res.status(500).json({ message: 'Error authenticating user', error: err });
    }

}

const logoutUser = async (req, res) => {
    res.clearCookie('token');
    return res.json({message: 'Logged out successfully'});
}

const checkUser = async (req, res) => {
    const isAuthenticated = req.cookies.token !== undefined; 
  res.json({ isAuthenticated });
}



module.exports = {authenticateUser, logoutUser, checkUser};