
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
        req.user = user;
        next();
    });
}