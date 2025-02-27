import React, { useState } from "react";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ButtonCombinations = ({ taskState, handleUpdateTask, permits, newNote, task_plan, updateTaskNotes,isPlanChanged }) => {
  const task_id = useParams().id;
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAction = async (url, successMessage) => {
    try {
      await handleUpdateTask();
      await axios.post(url);
      showSnackbar(successMessage);
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        showSnackbar("Unauthorized", "error");
        setTimeout(() => navigate(-1), 1000);
        return;
      }
      console.error(error);
      showSnackbar("An error occurred", "error");
    }
  };

  const handleApprove = async () => {
    try {
      await axios.post(`/tasks/approve/${task_id}`, {newNote: newNote});
      showSnackbar("Task approved!");

      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        showSnackbar("Unauthorized", "error");
        setTimeout(() => navigate(-1), 1000);
        return;
      }
      console.error(error);
      showSnackbar("An error occurred", "error");
    }
  }

  const handleReject = async () => {
    try {
      await axios.post(`/tasks/reject/${task_id}`, {task_plan, newNote});
      showSnackbar("Task rejected!");


      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        showSnackbar("Unauthorized", "error");
        setTimeout(() => navigate(-1), 1000);
        return;
      }
      console.error(error);
      showSnackbar("An error occurred", "error");
    }
  }
  

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {taskState === "OPEN" && permits.App_permit_Open && (
          <Box sx={{display: "flex", justifyContent: "space-between", width: "75vw"}}>
            <Button onClick={() => handleAction(`/tasks/release/${task_id}`, "Task released successfully!")} >
              Release Task
            </Button>
            <Button onClick={async () => {
              try {
              await handleUpdateTask(); 
              setTimeout(() => navigate(-1),1000 )
              } catch (error) {
                if(error.response && error.response.status === 403) {
                  showSnackbar("Unauthorized", "error");
                  setTimeout(() => navigate(-1), 1000);
                  return;
                }
                console.error(error);
                showSnackbar("An error occurred", "error");
              }}} 
              >
              Save Changes
            </Button>
          </Box>
        )}
        {taskState === "TODO" && permits.App_permit_toDoList && (
          <Box sx={{display: "flex", justifyContent: "space-between", width: "75vw"}}>
            <Button onClick={() => handleAction(`/tasks/workon/${task_id}`, "Working on Task!")} >
              Work On Task
            </Button>
            <Button onClick={handleUpdateTask} >
              Save Changes
            </Button>
          </Box>
        )}
        {taskState === "DOING" && permits.App_permit_Doing && (
          <Box sx={{display: "flex", justifyContent: "space-between", gap: 2, width: "80vw"}}>
            <Box>
            <Button onClick={() => handleAction(`/tasks/returnTask/${task_id}`, "Task returned to ToDo list!")} >
              Return Task to ToDo List
            </Button>
            <Button onClick={() => handleAction(`/tasks/approval/${task_id}`, "Approval requested!")} >
              Seek Approval
            </Button>
            <Button onClick={() => handleAction(`/tasks/extend/${task_id}`, "Deadline extension requested!")} >
              Request Deadline Extension
            </Button>
            </Box>
            <Button onClick={handleUpdateTask} >
              Save Changes
            </Button>
          </Box>
        )}
        {taskState === "DONE" && permits.App_permit_Done && (
           <Box sx={{display: "flex", justifyContent: "space-between", width: "75vw"}}>
            <Box>
            <Button onClick={handleReject} >
              Reject Task
            </Button>
            <Button onClick={handleApprove}  disabled={isPlanChanged()} >
              Approve Task
            </Button>
            </Box>
            <Button onClick={updateTaskNotes} >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ButtonCombinations;
