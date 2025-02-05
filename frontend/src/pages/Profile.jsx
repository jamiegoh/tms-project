import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { Button, TextField, Box, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const Profile = () => {
  const [currUser, setCurrUser] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [inputEmail, setInputEmail] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    getCurrentUser().then((response) => {
      setCurrUser(response);
    });
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await axios.get("/users/currentDetails");
      return response.data.user;
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const isPasswordValid = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
    return regex.test(password);
  };


  const handleUpdate = async () => {
    if (!isPasswordValid(inputPassword)) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Password must be between 8-10 characters and contain letters, numbers, and special characters.");
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.post("/users/updateSelf", {
        inputPassword,
        inputEmail,
      });

      setSnackbarSeverity("success");
      setSnackbarMessage("User updated successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating user:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error updating user.");
      setSnackbarOpen(true);
    }
  };


  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!currUser) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <Header />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 10, p: 2 }}>
        <h2>Profile Page</h2>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 5, p: 2, width: "25%", margin: "auto" }}>
        <TextField label="Username" variant="outlined" value={currUser.user_username} disabled />
        <TextField label="Email" variant="outlined" value={currUser.user_email} disabled />
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <TextField
          label="New Email"
          variant="outlined"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleUpdate}>
          Update
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;
