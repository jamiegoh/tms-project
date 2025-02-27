const db = require("../db");
const jwt = require("jsonwebtoken");
const { checkGroup } = require("../controllers/groupsController");
const { checkAppPermit } = require("../controllers/applicationController");



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

exports.checkAppPermit = async (req, res, next) => {
    const token = req.cookies.token;

    const taskid = req.params.id;
    let state;
    let appid;

    if(taskid === undefined){
        state = "CREATE";

        appid = req.params.appid;
    }
    else {
        
            const result = await db.execute("SELECT Task_state FROM Task WHERE Task_id = ?", [taskid]);
        
            state = result[0][0].Task_state;
            appid = taskid.split("_")[0];

    }


    const user = jwt.decode(token).user.username;

    if (await checkAppPermit(user, state, appid )) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
}

exports.checkForPL = async (req, res, next) => {
    const token = req.cookies.token;

    const user = jwt.decode(token).user.username;

    if(await checkGroup(user, "pl")){
        next();
    }
    else{
        res.status(403).json({ message: 'Forbidden' });

    }
}

exports.checkForPM = async (req, res, next) => {
    const token = req.cookies.token;

    const user = jwt.decode(token).user.username;

    if(await checkGroup(user, "pm")){
        next();
    }
    else{
        res.status(403).json({ message: 'Forbidden' });

    }
}
    

