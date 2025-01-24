import React from "react";
import { TextField, Box, Button } from "@mui/material";
import Header from "../components/Header";
import axios from "axios";

const Login = () => {

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("/auth", {
      username: username,
      password: password,
    });
  }

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
        <TextField label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)} fullWidth />
        <TextField label="Password" variant="outlined"  onChange={(e) => setPassword(e.target.value)} fullWidth />
      </Box>
      <Button variant="contained" onClick={(e) => handleSubmit(e)}>Login</Button>
    </div>
    </>
  );
};

export default Login;
