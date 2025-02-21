import React, { useState } from "react";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ButtonCombinations = ({ taskState, handleUpdateTask, permits }) => {
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

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {taskState === "OPEN" && permits.App_permit_Open && (
          <>
            <Button onClick={() => handleAction(`/tasks/release/${task_id}`, "Task released successfully!")} variant="contained">
              Release Task
            </Button>
            <Button onClick={() => {handleUpdateTask; setTimeout(() => navigate(-1),1000 )}} variant="contained">
              Save Changes
            </Button>
          </>
        )}
        {taskState === "TODO" && permits.App_permit_toDoList && (
          <>
            <Button onClick={() => handleAction(`/tasks/workon/${task_id}`, "Working on Task!")} variant="contained">
              Work On Task
            </Button>
            <Button onClick={handleUpdateTask} variant="contained">
              Save Changes
            </Button>
          </>
        )}
        {taskState === "DOING" && permits.App_permit_Doing && (
          <>
            <Button onClick={() => handleAction(`/tasks/returnTask/${task_id}`, "Task returned to ToDo list!")} variant="contained">
              Return Task to ToDo List
            </Button>
            <Button onClick={() => handleAction(`/tasks/approval/${task_id}`, "Approval requested!")} variant="contained">
              Seek Approval
            </Button>
            <Button onClick={() => handleAction(`/tasks/extend/${task_id}`, "Deadline extension requested!")} variant="contained">
              Request Deadline Extension
            </Button>
            <Button onClick={handleUpdateTask} variant="contained">
              Save Changes
            </Button>
          </>
        )}
        {taskState === "DONE" && permits.App_permit_Done && (
          <>
            <Button onClick={() => handleAction(`/tasks/reject/${task_id}`, "Task rejected!")} variant="contained">
              Reject Task
            </Button>
            <Button onClick={() => handleAction(`/tasks/approve/${task_id}`, "Task approved!")} variant="contained">
              Approve Task
            </Button>
            <Button onClick={handleUpdateTask} variant="contained">
              Save Changes
            </Button>
          </>
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
