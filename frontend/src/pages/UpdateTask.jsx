import { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Select, MenuItem, Typography, Box, Paper, Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ButtonCombinations from "../components/ButtonCombinations";

const DetailedTask = () => {
  const [taskName, setTaskName] = useState("");
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState("");
  const [description, setDescription] = useState("");
  const [taskState, setTaskState] = useState("");
  const [permits, setPermits] = useState({});

  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const id = useParams().id;
    const app_id = id.split('_')[0];

    useEffect(() => {
      axios.get(`/tasks/get/details/${id}`).then((response) => {
        const task = response.data;
        setTaskName(task.Task_name);
        setPlan(task.Task_plan);
        setDescription(task.Task_description);
        setNotes(JSON.parse(task.Task_notes));

        setTaskState(task.Task_state);
        console.log(task.Task_state);

        

        axios.get(`/plans/get/${app_id}`).then((response) => {
          setPlans(response.data);
        });
        
      });

      axios.get(`/application/get/permissions/${app_id}`).then((response) => {
        const permits = response.data;
        setPermits(permits);
    });

      setLoading(false);

    }, [id]);
  
  const navigate = useNavigate();
  
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const updateTaskNotes = async () => {
    try {
      if (newNote !== "") {
        await axios.put(`/tasks/update/notes/${id}`, { task_notes: newNote });
        showSnackbar("Task notes updated successfully!", "success");
        return true;
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "";
        if (errorMessage.includes("not found")) {
          showSnackbar("Task not found.", "error");
        } else {
          showSnackbar("No changes made to notes.", "warning");
        }
      } else if (error.response?.status === 403) {
        showSnackbar("Unauthorized", "error");
        setTimeout(() => navigate(-1), 1000);
        return false;
      } else {
        console.error(error);
        showSnackbar("Failed to update task notes.", "error");
      }
    }
    return false;
  };
  
  const updateTaskPlan = async () => {
    try {
      if (taskState === "OPEN" || taskState === "DONE") {
        await axios.put(`/tasks/update/plan/${id}`, { task_plan: plan === "" ? null : plan });
        showSnackbar("Task plan updated successfully!", "success");
        return true;
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "";
        if (errorMessage.includes("not found")) {
          showSnackbar("Task not found.", "error");
        } else {
          showSnackbar("Plan has not been changed", "warning");
        }
      } else {
        console.error(error);
        showSnackbar("Failed to update plan.", "error");
      }
    }
    return false;
  };
  
  const handleUpdateTask = async () => {
    const noteSuccess = await updateTaskNotes();
    const planSuccess = await updateTaskPlan();
  
    if (noteSuccess && planSuccess) {
      showSnackbar("Task notes & plan updated successfully!", "success");
    }
  };  


  const convertState = (state) => {
    switch(state) {
      case 'OPEN':
        return 'Open';
      case 'TODO':
        return 'toDoList';
      case 'DOING':
        return 'Doing';
      case 'DONE':
        return 'Done';
      default:
        return '';
    }
  }

  if(loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ marginTop: 4, mx: 20 }}>
      <Button variant="text" sx={{ marginBottom: 2 }} onClick={() => navigate(-1)}>{"< Back"}</Button>
      <Box sx={{display:'flex', flexDirection: 'column', gap: 4}}>
        <Box sx={{ display: "flex", flexDirection: "row", gap:16, justifyContent: 'space-between', alignItems:'center' }}>
        <Box sx={{flex: 4}}>
          <TextField
            fullWidth
            label="Task Name"
            value={taskName}
            disabled
            onChange={(e) => setTaskName(e.target.value)}

          />
        </Box>
        <Box sx={{flex:1}}>
          <Typography>Task State: {taskState} </Typography>
        </Box>
        </Box>
        <Box >
        <Select sx={{width: '30vw'}}  value={plans?.some(p => p.Plan_MVP_name === plan) ? plan : ""} onChange={(e) => setPlan(e.target.value)} displayEmpty disabled={!permits[`App_permit_${convertState(taskState)}`] || !(taskState === 'OPEN' || taskState === 'DONE')}
        >
          <MenuItem value={""} >Select Plan</MenuItem>
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
              <Typography key={index} sx={{ marginTop: 1, wordWrap: "break-word", ...(note.type !== 'comment' ? { fontStyle: 'italic' } : { fontWeight: '1000'}) }} >{note.date_posted.split('T')[0]} {note.date_posted.split('T')[1].split('.')[0]} {note.currState} ({note.user}) {note.text}</Typography>
            ))}
          </Box>
          <textarea
            disabled={!permits[`App_permit_${convertState(taskState)}`]}
            placeholder="Add a note..."
            value={newNote}
            style={{ resize: "vertical", width: "100%", height: "20%" }} 
            onChange={(e) => setNewNote(e.target.value)}
            
          />
        </Box>
      </Box>
    <Box sx={{display: 'flex', justifyContent: 'flex-end' }}>
       <ButtonCombinations taskState={taskState} handleUpdateTask={handleUpdateTask} permits={permits} newNote ={newNote} />
    </Box>
    <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DetailedTask;
