import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import {
  Table,
  TableHead,
  TableBody,
  TextField,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Switch,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import getUserPerms from "../utils/getUserPerms.js";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [perms, setPerms] = React.useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState([]);
  const [status, setStatus] = useState(true);

  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = axios
    .get("/users/get")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  const fetchGroups = axios
    .get("/groups/get")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  useEffect(() => {
    fetchUsers.then((data) => {
      setUsers(data.users);
    });

    fetchGroups.then((data) => {
      setGroups(data);
    });



    getUserPerms().then((perms) => {
      if (!perms.includes("admin")) {
        navigate("/");
      }
      setPerms(perms);
    });
  }, []);

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/;
    return regex.test(password);
  };

  const validateUsername = (username) => {
    return !users.some((user) => user.user_username === username);
  };

  const handleCreate = async () => {
    if (!validatePassword(password)) {
      setError(
        "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
      );
      setOpenSnackbar(true);
      return;
    }

    if (!validateUsername(username)) {
      setError("Username already exists.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/users/create", {
        username,
        password,
        email,
        group,
        status,
      });

      fetchUsers.then((data) => {
        setUsers(data.users);
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Header />
      {perms.includes("admin") ? (
        <div
          sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <h1>Users</h1>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <TextField
                    label="Username"
                    variant="outlined"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Password"
                    variant="outlined"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Email"
                    variant="outlined"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Select onChange={(e) => setGroup(e.target.value)} value={group} multiple>
                    {groups?.map((group, i) => (
                      <MenuItem key={i} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch
                    defaultChecked
                    onChange={(e) => setStatus(e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" onClick={handleCreate}>
                    Create
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user, i) => (
                <TableRow key={i}>
                  <TableCell>{user.user_username}</TableCell>
                  <TableCell>
                    <TextField label="New Password" variant="outlined" />{" "}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <Select   >
                    {groups?.map((group, i) => (
                      <MenuItem key={i} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                  <TableCell>
                    <Switch />
                  </TableCell>
                  <TableCell>
                    <Button variant="contained">Update</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}