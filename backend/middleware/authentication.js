
const jwt = require('jsonwebtoken');

exports.cookieAuthentication = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            res.clearCookie('token');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        db.execute("SELECT * FROM users WHERE user_username = ?", [user.username]).then(([users]) => {
            if (users.length === 0) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (req.ip !== user.ip | req.headers['user-agent'] !== user.browserType) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        });
        
        req.user = user;
        next();
    });
}