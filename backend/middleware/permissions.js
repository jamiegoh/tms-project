const db = require("../db");
const jwt = require("jsonwebtoken");
const { getGroupForSpecificUser } = require("../controllers/groupsController");

exports.checkPermissions = async (req, res, next) => {

    console.log("token: ", jwt.decode(req.cookies.token));
    const token = req.cookies.token;

    const user = jwt.decode(token).user.username;

    const group = await getGroupForSpecificUser(user);

    console.log("checking permissions for group: ", group);

    if(group.includes("admin")){
        next();
    }
    else{
        res.status(403).json({ message: 'Forbidden' });
    }
}

