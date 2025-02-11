const db = require('../db');

const getTasks = async (req, res) => {
    try {
        const { task_app_acronym } = req.body;

        const [tasks] = await db.execute("SELECT * FROM tasks WHERE Task_app_Acronym = ?", [task_app_acronym]);
        res.json(tasks);
    } catch (err) {
        console.error("Error getting tasks:", err);
        res.status(500).json({ message: 'Error getting tasks', error: err });
    }
}

const createTask = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();  

        const { task_app_acronym, task_name, task_description, task_notes, task_plan } = req.body;

        const plan = task_plan ? task_plan : null;
        const notes = task_notes ? task_notes : [];

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
    // update task
}



module.exports = { getTasks, createTask, updateTask };