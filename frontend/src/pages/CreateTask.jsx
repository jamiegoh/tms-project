import { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Select, MenuItem, Typography, Box, Paper } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";


const CreateTask = () => {
  const [taskName, setTaskName] = useState("");
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState("");
  const [description, setDescription] = useState("");

  const [newNote, setNewNote] = useState("");

  const appid = useParams().appid;
    useEffect(() => {
      axios.get(`/plans/get/${appid}`).then((response) => {
        setPlans(response.data);
      });
    }, [appid]);


  const navigate = useNavigate();


  const handleCreateTask = () => {
    const payload = { task_name: taskName, task_plan: plan, task_description: description, task_notes: newNote };
    axios.post(`/tasks/${appid}/create`, payload).then(() => {
      alert("Task created successfully!");
    });
  };


  return (
    <Container sx={{ marginTop: 4 }}>
      <Button variant="text" sx={{ marginBottom: 2 }} onClick={() => navigate(-1)}>{"< Back"}</Button>
      <Box sx={{display:'flex', flexDirection: 'column', gap: 4}}>
        <Box sx={{ display: "flex", flexDirection: "row", gap:16, justifyContent: 'space-between', alignItems:'center' }}>
        <Box sx={{flex: 4}}>
          <TextField
            fullWidth
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}

          />
        </Box>
        <Box sx={{flex:1}}>
          <Typography>Task State: OPEN </Typography>
        </Box>
        </Box>
        <Box >
        <Select sx={{width: '30vw'}} value={plan} onChange={(e) => setPlan(e.target.value)} displayEmpty>
          <MenuItem value="">Select Plan</MenuItem>
          {plans.map((plan, index) => (
            <MenuItem key={index} value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</MenuItem>
          ))}
        </Select>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", mt: 8, gap: 4 }}>

        <Box sx={{ display: "flex", flex: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={6}
            label="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>


        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2, maxWidth: "90vw"}}>
          <Box sx={{ height: 180, overflowY: "auto", paddingX: 2, marginBottom: 2, border:1, borderColor: "grey.400", borderRadius: 1 }}>
            <Typography variant="subtitle2">Notes History (Latest → Oldest)</Typography>
            <Typography>No notes yet</Typography>
          </Box>
          <textarea
            placeholder="Add a note..."
            value={newNote}
            style={{ resize: "vertical", width: "100%", height: "20%" }} 
            onChange={(e) => setNewNote(e.target.value)}
            
          />
        </Box>
      </Box>
    <Box sx={{display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleCreateTask} variant="contained" sx={{ marginTop: 2, }}>Create Task</Button>
    </Box>
    </Container>
  );
};

export default CreateTask;
