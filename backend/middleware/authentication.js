const jwt = require('jsonwebtoken');
const db = require('../db'); // Import the database connection at the top

exports.cookieAuthentication = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
   
    const [users] = await db.execute("SELECT * FROM users WHERE user_username = ?", [user.user.username]);


    if (users.length === 0) {
      res.clearCookie('token'); 
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    if (req.ip !== user.ip || req.headers['user-agent'] !== user.browserType) {
      res.clearCookie('token'); 
      return res.status(401).json({ message: 'Unauthorized: Session mismatch' });
    }

    if(users[0].user_enabled === 0){
      console.log("in users[0].user_enabled === 0");
        res.clearCookie('token'); 
        return res.status(401).json({ message: 'Unauthorized: User is disabled' });
    }

    req.user = user;
    next();
    
  } catch (err) {
    console.error('Error verifying token:', err);
    res.clearCookie('token'); 
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
