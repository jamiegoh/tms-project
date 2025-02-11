
const db = require('../db');
const getApplications = async (req, res) => {
    try {
        const [applications] = await db.execute("SELECT * FROM Application");
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

        const { app_acronym, app_description, app_rNumber, app_startDate, 
            app_endDate, app_permit_Create, app_permit_Open, app_permit_toDoList,
             app_permit_Doing, app_permit_Done} = req.body;

             if(app_acronym === undefined || app_description === undefined || app_rNumber === undefined){
                return res.status(400).json({ message: 'Application acronym, description and RNumber are required' });
             }

        await connection.execute("INSERT INTO Application (App_Acronym, App_Description, App_Rnumber, App_StartDate, App_EndDate, App_permit_create, App_permit_open, App_permit_toDoList, App_permit_doing, App_permit_done) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?)", [app_acronym, app_description, app_rNumber, app_startDate, app_endDate, app_permit_Create, app_permit_Open, app_permit_toDoList, app_permit_Doing, app_permit_Done]);

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


module.exports = { getApplications, createApplication };