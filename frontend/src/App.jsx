import React from "react";
import {
  Route,
  Routes,
} from "react-router-dom";
import Application from "./pages/Application";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Task from "./pages/Task";
import CreateTask from "./pages/CreateTask";
import CreatePlan from "./pages/CreatePlan";
import UpdateTask from "./pages/UpdateTask";

function App() {
  return (
    <Routes>
      <Route path="*" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Application /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/tasks/:appid" element={<ProtectedRoute><Task/></ProtectedRoute>} />
        <Route path="/tasks/:appid/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        <Route path="/tasks/update/:id" element={<ProtectedRoute><UpdateTask /></ProtectedRoute>} />
        <Route path="/plans/:appid/create" element={<ProtectedRoute><CreatePlan/></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
