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


const updateNotes = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;
        const { task_notes } = req.body;

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
                type: 'comment',
                currState: task[0].Task_state,
            }
    , ...parsedNotes] 
              : parsedNotes;   


        await connection.execute("UPDATE Task SET Task_notes = ? WHERE Task_id = ?", [notes, task_id]);

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

const updatePlan = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;
        const { task_plan } = req.body;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        if(task[0].Task_state !== 'DONE' && task[0].Task_state !== 'OPEN'){
            console.log("Task state is not DONE or OPEN" + task[0].Task_state);
            await connection.rollback();
            return res.status(400).json({ message: 'Task state must be DONE or OPEN' });
        }   

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];

                      
        if(task[0].Task_plan !== task_plan){
                
            const planNote = {
                text: 'Plan changed from ' + task[0].Task_plan + ' to ' + task_plan,
                user: req.user.user.username,
                date_posted: new Date(),
                type: 'system',
                currState: task[0].Task_state,
              }

                parsedNotes.unshift(planNote);
          }



        await connection.execute("UPDATE Task SET Task_plan = ?, Task_notes = ? WHERE Task_id = ?", [task_plan, JSON.stringify(parsedNotes), task_id]);
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

const releaseTask = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'OPEN >> TODO (Task Released)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];


        await connection.execute("UPDATE Task SET Task_state = 'TODO', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);

        await connection.commit();

        res.json({ message: 'Task released' });

    } catch (err) {
        await connection.rollback();
        console.error("Error releasing task:", err);
        res.status(500).json({ message: 'Error releasing task', error: err });
    } finally {
        connection.release();
    }
}

const workOnTask = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'TODO >> DOING (Working on Task)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];

        await connection.execute("UPDATE Task SET Task_state = 'DOING', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);
        
        await connection.commit();

        res.json({ message: 'Task started' });

    } catch (err) {
        await connection.rollback();
        console.error("Error starting task:", err);
        res.status(500).json({ message: 'Error starting task', error: err });
    } finally {
        connection.release();
    }
}

const returnTaskToToDo = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'DOING >> TODO (Returned to ToDo)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];

        await connection.execute("UPDATE Task SET Task_state = 'TODO', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);

        await connection.commit();

        res.json({ message: 'Task returned to ToDo' });

    } catch (err) {
        await connection.rollback();
        console.error("Error returning task to ToDo:", err);
        res.status(500).json({ message: 'Error returning task to ToDo', error: err });
    } finally {
        connection.release();
    }
}

const seekApproval = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'DOING >> DONE (Seeking Approval)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];

        await connection.execute("UPDATE Task SET Task_state = 'DONE', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);
        //email trigger to DONE permit group here
        console.log("TRIGGERING EMAIL");


        await connection.commit();

        res.json({ message: 'Task sent for approval' });

    } catch (err) {
        await connection.rollback();
        console.error("Error sending task for approval:", err);
        res.status(500).json({ message: 'Error sending task for approval', error: err });
    } finally {
        connection.release();
    }
}

const reqForExtension = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'DOING >> DONE (Deadline Extension Requested)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];

        await connection.execute("UPDATE Task SET Task_state = 'DONE', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);
        //email trigger to done group where email says task is sent for extension
        await connection.commit();

        res.json({ message: 'Task sent for extension' });

    } catch (err) {
        await connection.rollback();
        console.error("Error sending task for extension:", err);
        res.status(500).json({ message: 'Error sending task for extension', error: err });
    } finally {
        connection.release();
    }
}

const approveTask = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'DONE >> CLOSED (Task Approved)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];

        await connection.execute("UPDATE Task SET Task_state = 'CLOSED', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);
        //email trigger to task owner that task is approved
        await connection.commit();

        res.json({ message: 'Task approved' });

    } catch (err) {
        await connection.rollback();
        console.error("Error approving task:", err);
        res.status(500).json({ message: 'Error approving task', error: err });
    } finally {
        connection.release();
    }
}

const rejectTask = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const task_id = req.params.id;

        const [task] = await connection.execute("SELECT * FROM Task WHERE Task_id = ?", [task_id]);

        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Task not found' });
        }

        const note = {
            text: 'DONE >> DOING (Task Rejected)',
            user: req.user.user.username,
            date_posted: new Date(),
            type: 'system',
            currState: task[0].Task_state,
        }

        const parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];
        const notes = [note, ...parsedNotes];

        await connection.execute("UPDATE Task SET Task_state = 'DOING', Task_owner = ?, Task_notes = ? WHERE Task_id = ?", [req.user.user.username, JSON.stringify(notes), task_id]);
        await connection.commit();

        res.json({ message: 'Task rejected' });

    } catch (err) {
        await connection.rollback();
        console.error("Error rejecting task:", err);
        res.status(500).json({ message: 'Error rejecting task', error: err });
    } finally {
        connection.release();
    }
}



module.exports =  { getTasks, createTask, updateNotes, updatePlan, getDetailedTask, releaseTask, workOnTask, returnTaskToToDo, seekApproval, reqForExtension, approveTask, rejectTask };