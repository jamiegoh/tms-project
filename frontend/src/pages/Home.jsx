import React, { useEffect } from "react";
import Header from "../components/Header";
import checkUserToken from "../utils/checkUserToken";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div>Task Management</div>
    </div>
  );
};

export default Home;
