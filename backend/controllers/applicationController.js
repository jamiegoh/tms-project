
const db = require('../db');
const getApplications = async (req, res) => {
    try {
        const [applications] = await db.execute("SELECT * FROM Application");

        applications.forEach(application => {

            if(application.App_startDate === null) {
                return;
            }
            else {
                const startDate = new Date(application.App_startDate);
                const startDateOffset = startDate.getTimezoneOffset();
                startDate.setMinutes(startDate.getMinutes() - startDateOffset);
                application.App_startDate = startDate.toISOString().split('T')[0];
            }

            if(application.App_endDate === null) {
                return;
            }
            else {
                const endDate = new Date(application.App_endDate);
                const endDateOffset = endDate.getTimezoneOffset();
                endDate.setMinutes(endDate.getMinutes() - endDateOffset);
                application.App_endDate = endDate.toISOString().split('T')[0];
            }
        });

        res.json(applications);
    } catch (err) {
        console.error("Error getting applications:", err);
        res.status(500).json({ message: 'Error getting applications', error: err });
    }
}

const createApplication = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { App_acronym, App_description, App_rNumber 
            , App_permit_Create, App_permit_Open, App_permit_toDoList,
             App_permit_Doing, App_permit_Done} = req.body;

        let { App_startDate, App_endDate } = req.body;

             if(App_acronym === undefined || App_description === undefined || App_rNumber === undefined){
                return res.status(400).json({ message: 'Application acronym, description and RNumber are required' });
             }
             
        const startDate = App_startDate === '' ? null : new Date(App_startDate);
        const endDate = App_endDate === '' ? null : new Date(App_endDate);


        await connection.execute("INSERT INTO Application (App_Acronym, App_Description, App_Rnumber, App_StartDate, App_EndDate, App_permit_create, App_permit_open, App_permit_toDoList, App_permit_doing, App_permit_done) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?)", [App_acronym, App_description, App_rNumber, startDate, endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done]);

        await connection.commit();

        res.json({ message: 'Application created' });
        
}
    catch (err) {
        await connection.rollback();
        console.error("Error creating application:", err);
        res.status(500).json({ message: 'Error creating application', error: err });
    }
    finally {
        connection.release();
    }
};

const updateApplication = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { App_acronym, App_description, App_rNumber, App_permit_Create, App_permit_Open, App_permit_toDoList,
             App_permit_Doing, App_permit_Done} = req.body;

        let { App_startDate, App_endDate } = req.body;

        const startDate = new Date(App_startDate);
        const endDate = new Date(App_endDate);

        const startDateOffset = startDate.getTimezoneOffset();
        const endDateOffset = endDate.getTimezoneOffset();

        startDate.setMinutes(startDate.getMinutes() - startDateOffset);
        endDate.setMinutes(endDate.getMinutes() - endDateOffset);

        App_startDate = startDate.toISOString().split('T')[0];
        App_endDate = endDate.toISOString().split('T')[0];
             
        await connection.execute("UPDATE Application SET App_Description = ?, App_Rnumber = ?, App_StartDate = ?, App_EndDate = ?, App_permit_create = ?, App_permit_open = ?, App_permit_toDoList = ?, App_permit_doing = ?, App_permit_done = ? WHERE App_Acronym = ?", [App_description, App_rNumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_acronym]);

        await connection.commit();

        res.json({ message: 'Application updated' });
    } catch (err) {
        await connection.rollback();
        console.error("Error updating application:", err);
        res.status(500).json({ message: 'Error updating application', error: err });
    } finally {
        connection.release();
    }
}

const getAppPermits = async (req, res) => {
    try {
        const {appid} = req.params;
        const username = req.user.user.username;


        const [appPermits] = await db.execute(
            "SELECT App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM Application WHERE App_Acronym = ?", [appid]
        );

        if (appPermits.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        //get groups for user
        const [groups] = await db.execute(
            "SELECT user_group_groupName FROM User_Group WHERE user_group_username = ?", [username]
        );

        const userGroups = groups.map(group => group.user_group_groupName);

        const appPermit = appPermits[0];
        const appPermitKeys = Object.keys(appPermit);

        for (let i = 0; i < appPermitKeys.length; i++) {
            if (!userGroups.includes(appPermit[appPermitKeys[i]])) {
                appPermit[appPermitKeys[i]] = false;
            } else {
                appPermit[appPermitKeys[i]] = true;
            }
        }
        
        res.json(appPermit);
    } catch (err) {
        console.error("Error getting application permits:", err);
        res.status(500).json({ message: 'Error getting application permits', error: err });
    }
}

const checkAppPermit = async (username, state, appid) => {
   try {

    if (state === "OPEN"){
        state = "Open";
    }
    else if (state === "TODO"){
        state = "toDoList";
    }
    else if (state === "DOING"){
        state = "Doing";
    }
    else if (state === "DONE"){
        state = "Done";
    }
    else if (state === "CREATE"){
        state = "Create";
    }

    const query = `SELECT App_permit_${state} FROM Application WHERE App_Acronym = ?`;
    const [appPermits] = await db.execute(query, [appid]);

    if (appPermits.length === 0) {
        return false;
    }

    let appPermit = "";

    switch(state) {
    case "Open":
        appPermit = appPermits[0].App_permit_Open;
        break;
    case "toDoList":
        appPermit = appPermits[0].App_permit_toDoList;
        break;
    case "Doing":
        appPermit = appPermits[0].App_permit_Doing;
        break;
    case "Done":
        appPermit = appPermits[0].App_permit_Done;
        break;
    case "Create":
        appPermit = appPermits[0].App_permit_Create;
        break;
    default:
        return false;
    }
    
    const [groups] = await db.execute(
        "SELECT user_group_groupName FROM User_Group WHERE user_group_username = ?", [username]
    );

    const userGroups = groups.map(group => group.user_group_groupName);

    if (!userGroups.includes(appPermit)) {
        return false;
    }

    return true;


   }
    catch (err) {
     console.error("Error getting application permits:", err);
     throw err;
};
}


module.exports = { getApplications, createApplication, updateApplication, getAppPermits, checkAppPermit };