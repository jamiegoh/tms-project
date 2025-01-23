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
  Button
} from "@mui/material";

export default function Users() {
  const [users, setUsers] = useState([]);

  const fetchUsers = axios
    .get("http://localhost:8000/users")
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
  }, []);

  return (
    <div>
      <Header />
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
                <TextField label="Username" variant="outlined" />
              </TableCell>
              <TableCell>
                <TextField label="Password" variant="outlined" />
              </TableCell>
              <TableCell>
                <TextField label="Email" variant="outlined" />
              </TableCell>
              <TableCell>
                <Select>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Switch defaultChecked />
              </TableCell>
              <TableCell>
                <Button variant="contained">Create</Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, i) => (
              <TableRow key={i}>
                <TableCell>{user.user_username}</TableCell>
                <TableCell>
                  <TextField label="New Password" variant="outlined" />{" "}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <Select>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
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
    </div>
  );    
}
