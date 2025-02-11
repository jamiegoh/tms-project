import React, {useState} from "react";
import axios from "axios";
import { Button, Snackbar, TextField, Alert, Box } from "@mui/material";


const CreateGroup = () => {

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/groups/create", {
                groupName: e.target.groupName.value,
            });
            setSnackbarSeverity("success");
            setSnackbarMessage("Group created successfully!");
            setSnackbarOpen(true);

        } catch (error) {
            console.error("Error creating group:", error);
            setSnackbarSeverity("error");
            setSnackbarMessage("Error creating group.");
            setSnackbarOpen(true);
            
        }
    };
    return (
        <Box>
            <form onSubmit={handleCreateGroup}>
                <Box  sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <TextField label="Group Name" variant="outlined" name="groupName" />
                <Button type="submit" variant="contained">Create Group</Button>
                </Box>
            </form>
             <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                  >
                    <Alert
                      onClose={() => setSnackbarOpen(false)}
                      severity={snackbarSeverity}
                      sx={{ width: "100%" }}
                    >
                      {snackbarMessage}
                    </Alert>
                  </Snackbar>
        </Box>
    );
}

export default CreateGroup;