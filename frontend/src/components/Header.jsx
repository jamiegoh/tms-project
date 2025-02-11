import React, {useState} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";

import { useLocation } from "react-router-dom";
import getUserPerms from "../utils/getUserPerms.js";
import axios from "axios";

const Header = () => {
  const pathname = useLocation().pathname;

  const [perms, setPerms] = useState([]);
  const [currUser, setCurrUser] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios
      .post("auth/logout")
      .then((response) => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  React.useEffect(() => {
    getUserPerms().then((perms) => {
      setPerms(perms);
    });

    getCurrentUser().then((response) => {
      setCurrUser(response);
    });
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await axios.get("/users/current");
      return response.data.user;
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          px: 2,
          height: 75,
        }}
      >
        <h1>Task Management System</h1>

        {pathname != "/" ? (
          <nav
            style={{ display: "flex", flex: 2, gap: 50, alignItems: "center" }}
          >
            <NavLink to="/home">Task Management</NavLink>

            {perms.includes("admin") ? (
              <NavLink to="/users">User Management</NavLink>
            ) : null}
          </nav>
        ) : null}
        <Box style={{display: 'flex', gap: 10}}>
          <h4>Logged in as: {currUser}</h4>
        <Button onClick={() => navigate("/profile")}>Profile</Button>
        <Button onClick={handleLogout}>Log out</Button>
        </Box>
      </Box>
    </div>
  );
};
export default Header;
