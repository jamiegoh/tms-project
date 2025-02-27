const db = require('../db');

const createPlan = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

       let {plan_name, start_date, end_date} = req.body;

        if(!/^[a-zA-Z0-9 ]{1,50}$/.test(plan_name)) {
            return res.status(400).json({ message: 'Invalid plan name' });
        }

        if(start_date === "") {
            start_date = null;
        }
        if(end_date === "") {
            end_date = null;
        }
        const { appid } = req.params;

        const [plan] = await connection.execute("SELECT * FROM Plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?", [plan_name, appid]);

        if(plan.length > 0) {
            return res.status(400).json({ message: 'Plan of this name already exists' });
        }
        

       const colorArray = ['#bdd0c4','#9ab7d3','#f5d2d3','#f7e1d3','#dfccf1'];
       const color = colorArray[Math.floor(Math.random() * colorArray.length)];

        await connection.execute("INSERT INTO Plan (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color) VALUES (?, ?, ?, ?, ?)", [plan_name, start_date, end_date, appid, color]);
        await connection.commit();

        res.json({ message: 'Plan created' });

    } catch (err) {
        await connection.rollback();
        console.error("Error creating plan:", err);
        res.status(500).json({ message: 'Error creating plan', error: err });
    } finally {
        connection.release();
    }
}

const getPlans = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { appid } = req.params;

        const [plans] = await connection.execute("SELECT * FROM Plan WHERE Plan_app_Acronym = ?", [appid]);

        res.json(plans);

    } catch (err) {
        console.error("Error fetching plans:", err);
        res.status(500).json({ message: 'Error fetching plans', error: err });
    } finally {
        connection.release();
    }
}

module.exports = { createPlan, getPlans };