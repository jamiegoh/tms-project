import { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Select, MenuItem, Typography, Box, Paper } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ButtonCombinations from "../components/ButtonCombinations";

const DetailedTask = ({type}) => {
  const [taskName, setTaskName] = useState("");
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState("");
  const [description, setDescription] = useState("");
  const [taskState, setTaskState] = useState("");

  const [newNote, setNewNote] = useState("");

  const [notes, setNotes] = useState([]);

    const id = useParams().id;
    useEffect(() => {
      axios.get(`/tasks/get/details/${id}`).then((response) => {
        const task = response.data;
        setTaskName(task.Task_name);
        setPlan(task.Task_plan);
        setDescription(task.Task_description);
        setNotes(JSON.parse(task.Task_notes));

        setTaskState(task.Task_state);

        const app_id = id.split('_')[0];

        axios.get(`/plans/get/${app_id}`).then((response) => {
          setPlans(response.data);
        });
      });
    }, [id]);
  
  const navigate = useNavigate();


  const handleUpdateTask = () => {
    const payload = { task_plan: plan, task_notes: newNote };
    axios.put(`/tasks/update/${id}`, payload).then(() => {
      alert("Task updated successfully!");
    });
  }

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
            disabled = {type === 'update' ? true : false}
            onChange={(e) => setTaskName(e.target.value)}

          />
        </Box>
        <Box sx={{flex:1}}>
          <Typography>Task State: {taskState} </Typography>
        </Box>
        </Box>
        <Box >
        <Select sx={{width: '30vw'}} value={plan} onChange={(e) => setPlan(e.target.value)} displayEmpty>
          <MenuItem value="">Select Plan</MenuItem>
          {plans?.map((plan, index) => (
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
            disabled = {true}
            sx={{minWidth: "35vw", minHeight: "50vh"}}
          />
        </Box>


        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2, minWidth: "35vw", minHeight: "50vh" }}>
          <Box sx={{  whiteSpace: "pre-wrap", height: 180, overflowY: "auto", paddingX: 2, marginBottom: 2, border:1, borderColor: "grey.400", borderRadius: 1 }}>
            <Typography variant="subtitle2">Notes History (Latest → Oldest)</Typography>
            {notes?.map((note, index) => (
              <Typography key={index} sx={{ marginTop: 1, wordWrap: "break-word", ...(note.type !== 'comment' ? { fontStyle: 'italic' } : { fontWeight: '1000'}) }} >{note.date_posted.split('T')[0]} {note.date_posted.split('T')[1].split('.')[0]} ({note.user}) {note.text}</Typography>
            ))}
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
       <ButtonCombinations taskState={taskState} handleUpdateTask={handleUpdateTask} />
    </Box>
    </Container>
  );
};

export default DetailedTask;
