import React from "react";
import { TextField, Box, Button } from "@mui/material";
import Header from "../components/Header";

const Login = () => {
  return (
    <>
    <Header/>
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "80vh",
      }}
    >
      <h1>Login</h1>
      <Box sx={{ width: '500px', display:'flex', gap: 2, flexDirection: 'column' }}>
        <TextField label="Username" variant="outlined" fullWidth />
        <TextField label="Password" variant="outlined" fullWidth />
      </Box>
      <Button variant="contained">Login</Button>
    </div>
    </>
  );
};

export default Login;
