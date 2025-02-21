import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Container,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CreatePlan from "./CreatePlan";

const Task = () => {
  const [loading, setLoading] = useState(true);

  const { appid } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (!appid) return;

    axios
      .get(`/tasks/get/${appid}`)
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });
  }, [appid]);


  const handleCreateTask = () => {
    navigate(`/tasks/${appid}/create`);
  };

  return (
    <>
        <Header/>
    <Box sx={{ mt: 4, mx: 4 }}>
        <Typography variant="h4" align="center" sx={{ my: 3 }}> Task Board </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <CreatePlan/>
        <Button variant="contained" onClick={handleCreateTask}>
          Create Task
        </Button>
      </Box>

      {loading ? (
        <Typography variant="h6" align="center">
          Loading tasks...
        </Typography>
      ) : (
        <Box sx={{display: "flex", justifyContent: "center", gap: 2 }}>
          {["open", "todo", "doing", "done", "closed"].map((status) => (
            <Box key={status}  >
              <Box
                sx={{
                  textAlign: "center",
                  padding: 2,
                  border: "2px solid #ddd",
                  width: "100%",
                  
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", textTransform: "capitalize", mb: 2 }}
                >
                  {status}
                </Typography>
                <Box sx={{  minWidth: "15vw", maxWidth: "15vw", display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {tasks[status]?.map((task) => (
                    <Card raised={true}key={task.Task_id} sx={{  border: 4, borderColor: task.Plan_color, maxHeight: "15vh", maxWidth: "13vw", minHeight: "15vh", "minWidth": "13vw" }} onClick={() => navigate(`/tasks/update/${task.Task_id}`)}>
                      <CardContent sx={{display : 'flex', flexDirection: 'column'}}>
                      <Typography variant="caption" sx={{justifyContent: 'start', display: 'flex'}}>
                          {task.Task_plan}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", padding: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: "13vw" }}
                        >
                          {task.Task_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{justifyContent: 'start', display: 'flex'}}
                        >
                          {task.Task_id}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
    </>
  );
};

export default Task;
