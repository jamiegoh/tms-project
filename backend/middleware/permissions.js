const db = require("../db");
const jwt = require("jsonwebtoken");
const { checkGroup } = require("../controllers/groupsController");



exports.checkPermissions = async (req, res, next) => {

    const token = req.cookies.token;

    const user = jwt.decode(token).user.username;


    if(await checkGroup(user, "admin")){
        next();
    }
    else{
        res.status(403).json({ message: 'Forbidden' });

    }
}
    

