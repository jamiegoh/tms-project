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

  const handleCreatePlan = () => {
    navigate(`/plans/${appid}/create`);
  };

  const handleCreateTask = () => {
    navigate(`/tasks/${appid}/create`);
    console.log("Create task button clicked");
  };

  return (
    <>
        <Header/>
    <Container>
        <Typography variant="h4" align="center" sx={{ my: 3 }}> Task Board </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Button variant="contained" onClick={handleCreatePlan}>
          Create Plan
        </Button>
        <Button variant="contained" onClick={handleCreateTask}>
          Create Task
        </Button>
      </Box>

      {loading ? (
        <Typography variant="h6" align="center">
          Loading tasks...
        </Typography>
      ) : (
        <Grid container spacing={10} sx={{display: "flex", justifyContent: "space-between", px: 0, }}>
          {["open", "todo", "doing", "done", "closed"].map((status) => (
            <Grid item xs={2} key={status}>
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
                  sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                >
                  {status}
                </Typography>
                <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
                  {tasks[status]?.map((task) => (
                    <Card raised={true}key={task.Task_id} sx={{ margin: 3, border: 4, borderColor: task.Plan_color }} onClick={() => navigate(`/tasks/update/${task.Task_id}`)}>
                      <CardContent>
                      <Typography variant="caption" sx={{justifyContent: 'start', display: 'flex'}}>
                          {task.Task_plan}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", padding: 1 }}
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
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
    </>
  );
};

export default Task;
