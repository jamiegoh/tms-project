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
  Box,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import getUserPerms from "../utils/getUserPerms.js";
import CreateGroup from "../components/CreateGroup";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [perms, setPerms] = useState({});

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [status, setStatus] = useState(true);

  const [updatedUserPassword, setUpdatedUserPassword] = useState([]);

  const [snackbarInfo, setSnackbarInfo] = useState({
    message: "",
    severity: "error",
    open: false,
  });

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

    getUserPerms().then((res) => {
      if (!res.groups.includes("admin") && res.username !== "admin" ) {
        navigate("/home");
      }
      console.log(res);
      setPerms(res);
    });
  }, []);

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/;
    return regex.test(password);
  };

  const validateUsername = (username) => {
    return !users.some((user) => user.user_username === username);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setSnackbarInfo({
        message: "Username and password are required.",
        severity: "error",
        open: true,
      });
      return;
    }
    if (!validatePassword(password)) {
      setSnackbarInfo({
        message:
          "Password must be 8-10 characters long and include alphabets, numbers, and special characters.",
        severity: "error",
        open: true,
      });
      return;
    }

    if (!validateUsername(username)) {
      setSnackbarInfo({
        message: "Username already exists.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      const newUser = {
        user_username: username,
        user_email: email,
        groups: selectedGroups,
        user_enabled: status,
      };

      const response = await axios.post("http://localhost:8000/users/create", {
        username,
        password,
        inputEmail: email,
        inputGroup: selectedGroups,
        enabled: status,
      });

      setUsers([...users, newUser]);

      setSnackbarInfo({
        message: "User created successfully.",
        severity: "success",
        open: true,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      
      if(error.response.status === 403 && perms.username !== 'admin'){
        navigate("/home");
      }

      setSnackbarInfo({
        message: "Failed to create user. Please try again.",
        severity: "error",
        open: true,
      });
    }
  };

  const handleUpdate = async (user, i) => {
    try {
      if (updatedUserPassword[i] && !validatePassword(updatedUserPassword[i])) {
        setSnackbarInfo({
          message:
            "Password must be 8-10 characters long and include alphabets, numbers, and special characters.",
          severity: "error",
          open: true,
        });
        return;
      }

      await axios.put("http://localhost:8000/users/update", {
        username: user.user_username,
        inputPassword: updatedUserPassword[i],
        inputEmail: user.user_email,
        inputGroup: user.groups,
        enabled: user.user_enabled,
      });

      const updatedUsers = users.map((u) =>
        u.user_username === user.user_username ? user : u
      );
      setUsers([...updatedUsers]);

      setSnackbarInfo({
        message: "User updated successfully.",
        severity: "success",
        open: true,
      });
    } catch (error) {
      console.error("Error updating user:", error);

      if(error.response.status === 403 && perms.username !== 'admin'){
        navigate("/home");
      }

      setSnackbarInfo({
        message: "Failed to update user. Please try again.",
        severity: "error",
        open: true,
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarInfo((prevInfo) => ({
      ...prevInfo,
      open: false,
    }));
  };

  // should probably change these to a form .........

  return (
    <div>
      <Header />
      {perms?.groups?.includes("admin") || perms?.username === 'admin' ? (
        <div>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
              py: 2,
              px: 4,
            }}
          >
            <h1>Users</h1>
            <CreateGroup />
          </Box>
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
                    type="password"
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
                  <Select
                    onChange={(e) => setSelectedGroups(e.target.value)}
                    value={selectedGroups}
                    renderValue = {(selected) => selected.join(', ')} 
                    multiple
                    sx={{ width: "200px" }}
                  >
                    {groups?.map((group, i) => (
                      <MenuItem key={i} value={group}>
                      <Checkbox checked={selectedGroups?.includes(group)} />
                      <ListItemText primary={group} />
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
                  <Button variant="contained" onClick={(e) => handleCreate(e)}>
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
                    <TextField
                      label="New Password"
                      variant="outlined"
                      type="password"
                      value={updatedUserPassword[i] || ""}
                      onChange={(e) => {
                        const updatedUserPasswordCopy = [
                          ...updatedUserPassword,
                        ];
                        updatedUserPasswordCopy[i] = e.target.value;
                        setUpdatedUserPassword(updatedUserPasswordCopy);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Email"
                      variant="outlined"
                      value={user.user_email || ""}
                      onChange={(e) => {
                        const updatedUsers = [...users];
                        updatedUsers[i].user_email = e.target.value;
                        setUsers(updatedUsers);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                  <Select
                    multiple
                    value={user.groups || []}
                    renderValue = {(selected) => selected.join(', ')} 
                    sx={{ width: "200px" }}
                    onChange={(e) => {
                      const updatedUsers = [...users];
                      updatedUsers[i].groups = e.target.value;
                      setUsers(updatedUsers);
                    }}
                  >
                    {groups?.map((group, i) => (
                      <MenuItem key={i} value={group}>
                        <Checkbox checked={user.groups?.includes(group)} />
                        <ListItemText primary={group} />
                      </MenuItem>
                    ))}
                  </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.user_enabled}
                      onChange={(e) => {
                        const updatedUsers = [...users];
                        updatedUsers[i].user_enabled = e.target.checked;
                        setUsers(updatedUsers);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleUpdate(user, i)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
      <Snackbar
        open={snackbarInfo.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarInfo.severity}
          sx={{ width: "100%" }}
        >
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
