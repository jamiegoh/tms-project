const db = require('../db');
const bcrypt = require('bcryptjs');
const mail = require('../util/emailService');

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
     else if (state === "CLOSED"){
         return false;
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

 const checkCredentials = async (username, password) => {
    try {

        const [users] = await db.execute("SELECT * FROM Users WHERE user_username = ?", [username]);
        if (users.length === 0) {
            return false;
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.user_password);
        return isMatch;
    } catch (err) {
        console.error("Error checking credentials:", err);
        throw err;
    }
 }

 const createTask = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();
        

        // Check App Permit
        const { task_app_acronym, task_name, task_description, task_plan, username, password } = req.body;


        //PAYLOAD ERRORS 
        
        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing task application acronym' });
        }


        // Validate required fields

        if (!task_name || typeof task_name !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing task name' });
        }
        if (task_plan && typeof task_plan !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid task plan' });
        }
        if (task_description && typeof task_description !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid task description' });
        }

        
        
        // Validate formats
        const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/;
        const planRegex = /^[a-zA-Z0-9_ -]{1,50}$/;
        if (!nameRegex.test(task_name)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid task name format' });
        }
        if (task_plan && !planRegex.test(task_plan)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid task plan format' });
        }
        if (task_description && task_description.length > 65535) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task description too long' });
        }


        //IAM ERRORS 

        if (!username || typeof username !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing username' });
        }
        if (!password || typeof password !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing password' });
        }

        // Check username and password
        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            await connection.rollback();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        //TRANSACTION ERRORS 

        
        
        if (!(await checkAppPermit(username, "CREATE", task_app_acronym))) {
            await connection.rollback();
            return res.status(403).json({ message: 'Forbidden: No Create Permission' });
        }
        
        const [app_r_number] = await connection.execute("SELECT App_Rnumber FROM Application WHERE App_Acronym = ?", [task_app_acronym]);
        if (app_r_number.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Application not found' });
        }        
        
        // Check if task plan exists (if provided)
        if (task_plan) {
            const [plan] = await connection.execute("SELECT * FROM Plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?", [task_plan, task_app_acronym]);
            if (plan.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Task plan not found' });
            }
        }

        // Generate task_id
        const app_r_number_value = app_r_number[0].App_Rnumber;
        if(app_r_number_value ===  2147483647){
            await connection.rollback();
            return res.status(400).json({ message: 'Max App_Rnumber reached' });
        }

        const task_id = `${task_app_acronym}_${app_r_number_value}`;

        // Create Task
        const task_creator = username;
        const task_createDate = new Date();
        const task_state = "OPEN";

        await connection.execute("INSERT INTO Task (Task_id, Task_name, Task_description, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [task_id, task_name, task_description || null, task_plan || null, task_app_acronym, task_state, task_creator, task_creator, task_createDate]);

        // Increment App_Rnumber
        const new_r_number = app_r_number_value + 1;
        await connection.execute("UPDATE Application SET App_Rnumber = ? WHERE App_Acronym = ?", [new_r_number, task_app_acronym]);

        await connection.commit();
        res.json({ message: 'Task created successfully' });

    } catch (err) {
        await connection.rollback();
        console.error("Error creating task:", err);
        res.status(500).json({ message: 'Internal server error', error: err });
    } finally {
        connection.release();
    }
};

const getTaskbyState = async (req, res) => {
    //no transaction as it is a read operation
    const connection = await db.getConnection();
    try {
        const { username, password, task_app_acronym, state } = req.body;

      

        if (!state || typeof state !== 'string' || !['OPEN', 'TODO', 'DOING', 'DONE', 'CLOSED'].includes(state.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid or missing task state' });
        }


        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing task application acronym' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing username' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing password' });
        }

        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        try {
        const [tasks] = await connection.execute("SELECT * FROM Task WHERE Task_state = ? AND Task_app_Acronym = ?", [state, task_app_acronym]);}
        catch (err) {
            //task app acronym not found
            return res.status(500).json({ message: 'Failed to get tasks' });
        }

        res.json(tasks);

    } catch (err) {
        console.error("Error getting tasks by state:", err);
        res.status(500).json({ message: 'Internal server error', error: err });
    } 
};

const promoteTask2Done = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { username, password, task_id, notes } = req.body;

        
        if(!task_id || typeof task_id !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing task id' });
        }

        if(notes && typeof notes !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid notes' });
        }

        if (notes && notes.length > 65535) {
            await connection.rollback();
            return res.status(400).json({ message: 'Notes too long' });
        }

        if (!username || typeof username !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing username' });
        }
        if (!password || typeof password !== 'string') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing password' });
        }
        
        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            await connection.rollback();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);
        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const task_state = task[0].Task_state;
        if (task_state !== 'DOING') {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not in DOING state' });
        }

        const note = {
            text: notes,
            user: username,
            date_posted: new Date(),
            type: 'comment',
            currState: task[0].Task_state,
        }

        let parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        parsedNotes.unshift(note);

        parsedNotes = notes ? parsedNotes : null;

        const task_app_acronym = task[0].Task_app_Acronym;
        if (!(await checkAppPermit(username, 'DONE', task_app_acronym))) {
            await connection.rollback();
            return res.status(403).json({ message: 'Forbidden' });
        }

        await connection.execute("UPDATE Task SET Task_state = 'DONE', Task_notes = ? WHERE Task_id = ?", [ parsedNotes, task_id]);
        await mail({ app_acronym: task[0].Task_app_Acronym, task_id: task_id });


        await connection.commit();
        res.json({ message: 'Task promoted to DONE state' });

    } catch (err) {
        await connection.rollback();
        console.error("Error promoting task to DONE:", err);
        res.status(500).json({ message: 'Internal server error', error: err });
    } finally {
        connection.release();
    }
}


module.exports = {createTask, getTaskbyState, promoteTask2Done};