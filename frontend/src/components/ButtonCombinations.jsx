import React, {useState, useEffect} from 'react';
import { Box, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const ButtonCombinations = ({taskState, handleUpdateTask}) => {

    const task_id = useParams().id;
    const app_id = task_id.split('_')[0];

    const [permits, setPermits] = useState({});

    useEffect(() => {
        axios.get(`/application/get/permissions/${app_id}`).then((response) => {
            const permits = response.data;
            setPermits(permits);
        }
        );
    }, [taskState]);

    console.log("TASK STATE: ", taskState);

    const handleReleaseTask = () => {
        alert("Task Released!");
    }
    const handleWorkOnTask = () => {
        alert("Task is now in progress!");
    }
    const handleReturnToToDo = () => {
        alert("Task returned to ToDo list!");
    }
    const handleSeekApproval = () => {
        alert("Approval requested!");
    }
    const handleDeadlineExetension = () => {
        alert("Deadline extension requested!");
    }
    const handleRejectTask = () => {
        alert("Task rejected!");
    };
    const handleApproveTask = () => {
        alert("Task approved!");
    };

    if (taskState == 'OPEN' && permits.App_permit_Open) {
        return (
        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
        <Button onClick={handleReleaseTask} variant="contained" sx={{ marginTop: 2, }}>Release Task</Button>
        <Button onClick={handleUpdateTask} variant="contained" sx={{ marginTop: 2, }}>Save Changes</Button>
        </Box>
        )
  }
  else if (taskState == 'CLOSED') {
    return null;
  }
  else if (taskState == 'TODO' && permits.App_permit_toDoList) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
    <Button onClick={handleWorkOnTask} variant="contained" sx={{ marginTop: 2, }}>Work On Task</Button>
    <Button onClick={handleUpdateTask} variant="contained" sx={{ marginTop: 2, }}>Save Changes</Button>
    </Box>
    )
}
    else if (taskState == 'DOING' && permits.App_permit_Doing) {
        return (  <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
        <Button onClick={handleReturnToToDo} variant="contained" sx={{ marginTop: 2, }}>Return Task to ToDo List</Button>
        <Button onClick={handleSeekApproval} variant="contained" sx={{ marginTop: 2, }}>Seek Approval</Button>
        <Button onClick={handleDeadlineExetension} variant="contained" sx={{ marginTop: 2, }}>Request for Deadline Extension</Button>
        <Button onClick={handleUpdateTask} variant="contained" sx={{ marginTop: 2, }}>Save Changes</Button>
        </Box>)
    }
    else if (taskState == 'DONE' && permits.App_permit_Done) {
        return (  <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
            <Button onClick={handleRejectTask} variant="contained" sx={{ marginTop: 2, }}>Reject Task</Button>
            <Button onClick={handleApproveTask} variant="contained" sx={{ marginTop: 2, }}>Approve Task</Button>
            <Button onClick={handleUpdateTask} variant="contained" sx={{ marginTop: 2, }}>Save Changes</Button>
            </Box>)
    }
    else {
        return (
            <div>View Only</div>
        )
    }
  }

export default ButtonCombinations;
