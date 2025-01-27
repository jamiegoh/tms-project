import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";

import { useLocation } from "react-router-dom";
import getUserPerms from "../utils/getUserPerms.js";
import axios from "axios";

const Header = () => {
  const pathname = useLocation().pathname;

  const [perms, setPerms] = React.useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios
      .post("auth/logout")
      .then((response) => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  React.useEffect(() => {
    getUserPerms().then((perms) => {
      setPerms(perms);
    });
  }, []);

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

        {pathname != "/login" ? (
          <nav
            style={{ display: "flex", flex: 2, gap: 50, alignItems: "center" }}
          >
            <NavLink to="/">Task Management</NavLink>

            {perms.includes("admin") ? (
              <NavLink to="/users">User Management</NavLink>
            ) : null}
          </nav>
        ) : null}
        <Button onClick={handleLogout}>Log out</Button>
      </Box>
    </div>
  );
};
export default Header;
