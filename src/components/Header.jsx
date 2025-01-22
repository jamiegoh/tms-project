import React from "react";
import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";

import { useLocation } from "react-router-dom";


const Header = () => {
  const pathname = useLocation().pathname;
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
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/users">Users</NavLink>
          </nav>
        ) : null }
      </Box>
    </div>
  );
};
export default Header;
