import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const CreatePlan = () => {
  const { appid } = useParams();
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });


  const isValidPlanName = (name) => {
    return /^[a-zA-Z0-9 ]{1,50}$/.test(name);
  };

  const handleCreate = async () => {
    if (!isValidPlanName(planName)) {
      setSnackbar({ open: true, message: "Plan name must be 1-50 alphanumeric characters and spaces only.", severity: "error" });
      return;
    }
    const payload = { plan_name: planName, start_date: startDate, end_date: endDate };

    try{
    await axios.post(`/plans/${appid}/create`, payload);
      setSnackbar({ open: true, message: "Plan created successfully!", severity: "success" });
      setPlanName("");
      setStartDate("");
      setEndDate("");
    } catch (error) {

    if (error.response && error.response.status === 403) {
      setSnackbar({ open: true, message: "Unauthorized", severity: "error" });
      return;
    }

    if(error.response && error.response.data?.message.includes("already exist")){
      setSnackbar({ open: true, message: "Plan of this name already exists", severity: "error" });
      return;
    }
    console.error("Error creating plan", error);
    setSnackbar({ open: true, message: "Failed to create plan.", severity: "error" });
};
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, width: "40%", alignItems: "center" }}>
      <Typography variant="button">Plan: </Typography>
      <TextField
        fullWidth
        label="Plan Name"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
      />
      <TextField
        fullWidth
        label="Plan Start Date"
        type="date"
        value={startDate || ''}
        shrink={"true"}
        onChange={(e) => setStartDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: "true" } }}
      />
      <TextField
        fullWidth
        label="Plan End Date"
        slotProps={{ inputLabel: { shrink: "true" } }}
        type="date"
        value={endDate || ''}
        onChange={(e) => setEndDate(e.target.value)}
      />
      
        <Button variant="contained" sx={{height: "60%", width: "70%"}}onClick={handleCreate}>Create</Button>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePlan;
