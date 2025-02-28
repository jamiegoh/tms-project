const db = require('../db');
const bcrypt = require('bcryptjs');
const mail = require('../util/emailService');

const checkAppPermit = async (username, state, appid) => {
    const stateMap = {
        "OPEN": "Open",
        "TODO": "toDoList",
        "DOING": "Doing",
        "DONE": "Done",
        "CREATE": "Create",
        "CLOSED": null
    };

    const mappedState = stateMap[state];
    if (!mappedState) return false;

    const query = `SELECT App_permit_${mappedState} FROM Application WHERE App_Acronym = ?`;
    const [appPermits] = await db.execute(query, [appid]);

    if (appPermits.length === 0) return false;

    const appPermit = appPermits[0][`App_permit_${mappedState}`];

    const [groups] = await db.execute(
        "SELECT user_group_groupName FROM User_Group WHERE user_group_username = ?", 
        [username]
    );

    return groups.some(group => group.user_group_groupName === appPermit);
};


 const checkCredentials = async (username, password) => {
        const [users] = await db.execute("SELECT * FROM Users WHERE user_username = ?", [username]);
        if (users.length === 0) {
            return false;
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.user_password);
        return isMatch;
    } 

 const createTask = async (req, res) => {
    const connection = await db.getConnection(); 


    try {
        await connection.beginTransaction();
        
        if(Object.keys(req.query).length > 0){
            return res.status(400).json({ code:"E1002"});
        }

        // Check App Permit
        const { task_app_acronym, task_name, task_description, task_plan, username, password } = req.body;


        //PAYLOAD ERRORS 

        // Validate required fields
        const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/;
        
        if (!username || typeof username !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2001"});
        }
        if (!password || typeof password !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2002"});
        }
        
        if (!task_name || typeof task_name !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2003"});
        }
        if (!nameRegex.test(task_name)) {
            await connection.rollback();
            return res.status(400).json({code: "E2003"});
        }

        //App acronym
        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2004" });
        }

        //Plan
        if (task_plan && typeof task_plan !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: "E2005" });
        }

        //Description
        if (task_description && (typeof task_description !== 'string' || task_description.length > 65535)) {
            await connection.rollback();
            return res.status(400).json({ code: "E2006" });
        }

        //IAM ERRORS 

        // Check username and password
        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            await connection.rollback();
            return res.status(400).json({code: "E3001"});
        }

        //TRANSACTION ERRORS 

        
        
        if (!(await checkAppPermit(username, "CREATE", task_app_acronym))) {
            await connection.rollback();
            return res.status(403).json({ code: "E3002" });
        }
        
        const [app_r_number] = await connection.execute("SELECT App_Rnumber FROM Application WHERE App_Acronym = ?", [task_app_acronym]);
        if (app_r_number.length === 0) {
            await connection.rollback();
            return res.status(400).json({ code: "E3002" });
        }        
        
        // Check if task plan exists (if provided)
        if (task_plan) {
            const [plan] = await connection.execute("SELECT * FROM Plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?", [task_plan, task_app_acronym]);
            if (plan.length === 0) {
                await connection.rollback();
                return res.status(400).json({ code: "E4001"});
            }
        }

        // Generate task_id
        const app_r_number_value = app_r_number[0].App_Rnumber;
        if(app_r_number_value ===  2147483647){
            await connection.rollback();
            return res.status(400).json({code: "E4003"});
        }

        const task_id = `${task_app_acronym}_${app_r_number_value}`;

        // Create Task
        const task_creator = username;
        const task_createDate = new Date();
        const task_state = "OPEN";
        const task_notes = [{
            text: "Task created",
            user: username,
            date_posted: new Date(),
            type: 'system',
            currState: task_state
        }]

        await connection.execute("INSERT INTO Task (Task_id, Task_name, Task_description, Task_plan, Task_notes, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [task_id, task_name, task_description || null, task_plan || null, task_notes, task_app_acronym, task_state, task_creator, task_creator, task_createDate]);

        // Increment App_Rnumber
        const new_r_number = app_r_number_value + 1;
        await connection.execute("UPDATE Application SET App_Rnumber = ? WHERE App_Acronym = ?", [new_r_number, task_app_acronym]);

        await connection.commit();
        res.status(200).json({ code: "S0001" });

    } catch (err) {
        await connection.rollback();
        console.error("Error creating task:", err);
        res.status(400).json({ code: "E5001"});
    } finally {
        connection.release();
    }
};

const getTaskbyState = async (req, res) => {
    //no transaction as it is a read operation
    const connection = await db.getConnection();
    try {

        if(Object.keys(req.query).length > 0){
            return res.status(400).json({ code:"E1002"});
        }


        const { username, password, task_app_acronym, state } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ code: "E2001" });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({code: "E2002"});
        }
        if (!state || typeof state !== 'string' || !['OPEN', 'TODO', 'DOING', 'DONE', 'CLOSED'].includes(state.toUpperCase())) {
            return res.status(400).json({ code: "E2008" });
        }

        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            return res.status(400).json({code: "E2004" });
        }

        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            return res.status(400).json({code: "E3001"});
        }

        const [tasks] = await connection.execute("SELECT * FROM Task WHERE Task_state = ? AND Task_app_Acronym = ?", [state, task_app_acronym]);

        res.status(200).json({code: "S0001", tasks: tasks});

    } catch (err) {
        console.error("Error getting tasks by state:", err);
        res.status(400).json({code: "E5001"});
    } 
};

const promoteTask2Done = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if(Object.keys(req.query).length > 0){
            return res.status(400).json({ code:"E1002"});
        }


        const { username, password, task_id, notes } = req.body;

        
        if (!username || typeof username !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2001"});
        }
        if (!password || typeof password !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2002"});
        }
        
        if(!task_id || typeof task_id !== 'string') {
            await connection.rollback();
            return res.status(400).json({code: "E2007"});
        }

        if(notes && (typeof notes !== 'string')){ 
            await connection.rollback();
            return res.status(400).json({code: "E2009"});
        }
        
        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            await connection.rollback();
            return res.status(400).json({ code: "E3001" });
        }

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);
        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ code: "E3002"});
        }

        const task_state = task[0].Task_state;
        if (task_state !== 'DOING') {
            await connection.rollback();
            return res.status(400).json({ code: "E4002" });
        }

        let parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];

        const auditNote = {
            text: "Task promoted to DONE",
            user: username,
            date_posted: new Date(),
            type: 'system',
            currState: task_state
        }
        
        if(notes){

            const note = {
                text: notes,
                user: username,
                date_posted: new Date(),
                type: 'comment',
                currState: task[0].Task_state,
            }

            parsedNotes.unshift(note);
        }

        parsedNotes.unshift(auditNote);



        const task_app_acronym = task[0].Task_app_Acronym;
        if (!(await checkAppPermit(username, 'DONE', task_app_acronym))) {
            await connection.rollback();
            return res.status(400).json({ code: "E3002" });
        }

        if(JSON.stringify(parsedNotes).length > 4294967295){
            await connection.rollback();
            return res.status(400).json({ code: "E4004" });
        }

        await connection.execute("UPDATE Task SET Task_state = 'DONE', Task_notes = ? WHERE Task_id = ?", [ parsedNotes, task_id]);
        
        mail({ app_acronym: task[0].Task_app_Acronym, task_id: task_id });

       
        await connection.commit();
        res.status(200).json({ code: "S0001" });


    } catch (err) {
        await connection.rollback();
        res.status(400).json({ code: "E5001" });
    } finally {
        connection.release();
    }
}


module.exports = {createTask, getTaskbyState, promoteTask2Done};