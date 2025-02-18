import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";
import axios from "axios";

const CreatePlan = () => {
  const { appid } = useParams();
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const handleCreate = () => {
    const payload = { plan_name: planName, start_date: startDate, end_date: endDate };
    axios.post(`/plans/${appid}/create`, payload);

  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        CREATE PLAN
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography>Plan_app_Acronym:</Typography>
        <Paper sx={{ p: 1, backgroundColor: "#888", color: "white", fontWeight: "bold" }}>
          {appid}
        </Paper>
      </Box>
      <TextField
        fullWidth
        label="Plan Name"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Plan Start Date"
        type="date"
        value={startDate || ''}
        shrink={true}
        onChange={(e) => setStartDate(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        fullWidth
        label="Plan End Date"
        slotProps={{ inputLabel: { shrink: true } }}
        type="date"
        value={endDate || ''}
        onChange={(e) => setEndDate(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={handleCreate}>Create</Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
      </Box>
    </Container>
  );
};

export default CreatePlan;
