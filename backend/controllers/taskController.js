const db = require("../db");
const { checkAppPermit } = require("./applicationController");

const getTasks = async (req, res) => {
    try {
        const task_app_acronym = req.params.appid;

        const [tasks] = await db.execute(
            `SELECT 
                t.Task_id, 
                t.Task_name, 
                t.Task_description, 
                t.Task_state, 
                t.Task_plan,
                p.Plan_color
             FROM Task t
             LEFT JOIN Plan p ON t.Task_plan = p.Plan_MVP_name
             WHERE t.Task_app_Acronym = ?`, 
            [task_app_acronym]
        );

  
        const taskData = {
            open: [],
            todo: [],
            doing: [],
            done: [],
            closed: [],
        };

        tasks.forEach(task => {
            const state = task.Task_state.toLowerCase();
            if (taskData[state]) {
                taskData[state].push(task);
            }
        });

        res.json(taskData);
    } catch (err) {
        console.error("Error getting tasks:", err);
        res.status(500).json({ message: 'Error getting tasks', error: err });
    }
};

const getDetailedTask = async (req, res) => {
    try {
        const task_id = req.params.id;

        const [task] = await db.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);
        res.json(task[0]);
    } catch (err) {
        console.error("Error getting task:", err);
        res.status(500).json({ message: 'Error getting task', error: err });
    }
}

const createTask = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();
        
        const user = req.user.user.username;

        if (await checkAppPermit(user, "CREATE", req.params.appid) === false) {
            await connection.rollback();
            return res.status(403).json({ message: 'Forbidden' });
        }

        const task_app_acronym = req.params.appid;

        const {  task_name, task_description, task_notes, task_plan } = req.body;

        const plan = task_plan ? task_plan : null;
        const notes = task_notes ? [task_notes] : [];

        const task_creator = req.user.user.username;

        const task_createDate = new Date();
        const task_state = "OPEN";

        const [app_r_number] = await connection.execute("SELECT App_Rnumber FROM Application WHERE App_Acronym = ?", [task_app_acronym]);

        if (app_r_number.length === 0) {
            await connection.rollback(); 
            return res.status(400).json({ message: 'Application not found' });
        }

        const app_r_number_value = app_r_number[0].App_Rnumber;
        const task_id = task_app_acronym + "_" + app_r_number_value;

        await connection.execute("INSERT INTO Task (Task_id, Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_name, task_description, notes, plan, task_app_acronym, task_state, task_creator, task_creator, task_createDate]);

        const new_r_number = app_r_number_value + 1;
        await connection.execute("UPDATE Application SET App_Rnumber = ? WHERE App_Acronym = ?", [new_r_number, task_app_acronym]);

        await connection.commit();

        res.json({ message: 'Task created and App_Rnumber incremented' });

    } catch (err) {
        await connection.rollback();
        console.error("Error creating task:", err);
        res.status(500).json({ message: 'Error creating task', error: err });
    } finally {
        connection.release();
    }
};


const updateTask = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;
        const { task_notes, task_plan } = req.body;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

    
        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : []; 

        const notes = task_notes 
          ? [{
            text: task_notes,
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'comment'
        }
, ...parsedNotes] 
          : parsedNotes;        

        const plan = task_plan ? task_plan : task[0].Task_plan;

        await connection.execute("UPDATE Task SET Task_notes = ?, Task_plan = ? WHERE Task_id = ?", [notes, plan, task_id]);

        await connection.commit();

        res.json({ message: 'Task updated' });

    } catch (err) {
        await connection.rollback();
        console.error("Error updating task:", err);
        res.status(500).json({ message: 'Error updating task', error: err });
    } finally {
        connection.release();
    }
}


module.exports =  { getTasks, createTask, updateTask, getDetailedTask };