import React, { useEffect } from "react";
import { TextField, Box, Button, Alert, Collapse } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import checkUserToken from "../utils/checkUserToken";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState(""); 
  const [openAlert, setOpenAlert] = React.useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!username || !password) {
      setErrorMessage("Both username and password are required.");
      setOpenAlert(true);
    }

    try {
      const response = await axios.post("/auth", {
        username: username,
        password: password,
      });
      if (response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password");
        setOpenAlert(true);
      } else {
        setErrorMessage("An error occurred. Please try again later.");
        setOpenAlert(true);
      }
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <>
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

        <Collapse in={openAlert} sx={{ width: "100%", maxWidth: "500px" }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleCloseAlert}
              >
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {errorMessage}
          </Alert>
        </Collapse>

        <Box sx={{ width: "500px", display: "flex", gap: 2, flexDirection: "column" }}>
          <TextField
            label="Username"
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password" 
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
        </Box>
        <Button variant="contained" onClick={handleSubmit}>
          Login
        </Button>
      </div>
    </>
  );
};

export default Login;
