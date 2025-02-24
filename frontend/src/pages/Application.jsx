import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";

const Application = () => {
  const [application, setApplication] = useState([]);
  const [groups, setGroups] = useState([]);

  const [newAppAcronym, setNewAppAcronym] = useState("");
  const [newAppDescription, setNewAppDescription] = useState("");
  const [newAppRNumber, setNewAppRNumber] = useState(0);
  const [newAppStartDate, setNewAppStartDate] = useState("");
  const [newAppEndDate, setNewAppEndDate] = useState("");

  const [newAppPermits, setNewAppPermits] = useState({
    create: "",
    open: "",
    toDoList: "",
    doing: "",
    done: "",
  });

  const [snackbarInfo, setSnackbarInfo] = useState({
    message: "",
    severity: "error",
    open: false,
  });

  useEffect(() => {
    axios.get("/application/get")
      .then((response) => {
        setApplication(response.data);
      })
      .catch((error) => {
        console.error("Error fetching application data:", error);
      });

    axios.get("/groups/get")
      .then((response) => {
        setGroups(response.data); // assuming this returns a list of groups
      })
      .catch((error) => {
        console.error("Error fetching groups data:", error);
      });
  }, []);

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    try {

      if(!/^[a-zA-Z0-9 ]{1,50}$/.test(newAppAcronym)){
        setSnackbarInfo({
          message: "Invalid application acronym. Acronym must be alphanumeric and have a maximum length of 50 characters.",
          severity: "error",
          open: true,
        });
        return;
      }

      if(application.some(app => app.App_acronym.toLowerCase() === newAppAcronym.toLowerCase())){
        setSnackbarInfo({
          message: "Application acronym already exists.",
          severity: "error",
          open: true,
        });
        return;
      }

      if(newAppRNumber < 0 ){
        setSnackbarInfo({ 
          message: "RNumber must be a positive integer.",
          severity: "error",
          open: true,
        });
        return;
      }

     if(newAppRNumber > Number.MAX_SAFE_INTEGER){
        setSnackbarInfo({ 
          message: "RNumber is too large.",
          severity: "error",
          open: true,
        });
        return;
      }
     
      if(newAppDescription.length > 1000){
        setSnackbarInfo({
          message: "Application description must have a maximum length of 1000 characters.",
          severity: "error",
          open: true,
        });
        return;
      }

      //validate permits on current existing groups
    
      const newApplication = {
        App_acronym: newAppAcronym,
        App_description: newAppDescription,
        App_rNumber: newAppRNumber,
        App_startDate: newAppStartDate,
        App_endDate: newAppEndDate,
        App_permit_Create: newAppPermits.create,
        App_permit_Open: newAppPermits.open,
        App_permit_toDoList: newAppPermits.toDoList,
        App_permit_Doing: newAppPermits.doing,
        App_permit_Done: newAppPermits.done,
      };

      setNewAppAcronym("");
      setNewAppDescription("");
      setNewAppRNumber(0);
      setNewAppStartDate("");
      setNewAppEndDate("");
      setNewAppPermits({
        create: "",
        open: "",
        toDoList: "",
        doing: "",
        done: "",
      });

      await axios.post("/application/create", newApplication);

      setApplication([...application, newApplication]);


      setSnackbarInfo({
        message: "Application created successfully.",
        severity: "success",
        open: true,
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setSnackbarInfo({
          message: "Forbidden. You do not have permission to create an application.",
          severity: "error",
          open: true,
        });
        return;
      }
      setSnackbarInfo({
        message: "Failed to create application. Please try again.",
        severity: "error",
        open: true,
      });
    }
  };

  const handleUpdateApplication = async (index) => {
    const appToUpdate = application[index];

    try {
      await axios.put("/application/update", appToUpdate);

      setSnackbarInfo({
        message: "Application updated successfully.",
        severity: "success",
        open: true,
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setSnackbarInfo({
          message: "Forbidden. You do not have permission to update an application.",
          severity: "error",
          open: true,
        });
        return;
      }
      setSnackbarInfo({
        message: "Failed to update application. Please try again.",
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

  return (
    <div>
      <Header />
      <div>Application Management</div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Application Acronym</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>R Number</strong></TableCell>
            <TableCell><strong>Start Date</strong></TableCell>
            <TableCell><strong>End Date</strong></TableCell>
            <TableCell><strong>Create Permit</strong></TableCell>
            <TableCell><strong>Open Permit</strong></TableCell>
            <TableCell><strong>To Do List Permit</strong></TableCell>
            <TableCell><strong>Doing Permit</strong></TableCell>
            <TableCell><strong>Done Permit</strong></TableCell>
            <TableCell><strong>Action</strong></TableCell>
          </TableRow>
          {/* Row for creating a new application */}
          <TableRow>
            <TableCell>
              <TextField
                label="Application Acronym"
                variant="outlined"
                onChange={(e) => setNewAppAcronym(e.target.value)}
                value={newAppAcronym}
              />
            </TableCell>
            <TableCell>
              <TextField
                label="Description"
                variant="outlined"
                onChange={(e) => setNewAppDescription(e.target.value)}
                value={newAppDescription}
              />
            </TableCell>
            <TableCell>
              <TextField
                label="R Number"
                variant="outlined"
                type="number"
                onChange={(e) => setNewAppRNumber(e.target.value)}
                value={newAppRNumber}
              />
            </TableCell>
            <TableCell>
              <TextField
                type="date"
                variant="outlined"
                onChange={(e) => setNewAppStartDate(e.target.value)}
                value = {newAppStartDate}
              />
            </TableCell>
            <TableCell>
              <TextField
                type="date"
                variant="outlined"
                onChange={(e) => setNewAppEndDate(e.target.value)}
                value = {newAppEndDate}
              />
            </TableCell>
            <TableCell>
              <Select
                value={newAppPermits.create || ""}
                onChange={(e) => setNewAppPermits({ ...newAppPermits, create: e.target.value })}
              >
                <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                {groups.map((group, index) => (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={newAppPermits.open || ""}
                onChange={(e) => setNewAppPermits({ ...newAppPermits, open: e.target.value })}
              >
                <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                {groups.map((group, index) => (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={newAppPermits.toDoList || ""}
                onChange={(e) => setNewAppPermits({ ...newAppPermits, toDoList: e.target.value })}
              >
                <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                {groups.map((group, index) => (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={newAppPermits.doing || ""}
                onChange={(e) => setNewAppPermits({ ...newAppPermits, doing: e.target.value })}
              >
                <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                {groups.map((group, index) => (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                value={newAppPermits.done || ""}
                onChange={(e) => setNewAppPermits({ ...newAppPermits, done: e.target.value })}
              >
                <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                {groups.map((group, index) => (
                  <MenuItem key={index} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Button variant="contained" onClick={handleCreateApplication}>
                Create
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {application.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Link href={`/tasks/${row.App_acronym}`}>
                  {row.App_acronym || ""}
                </Link>
              </TableCell>
              <TableCell>
                <TextField
                  value={row.App_description || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_description = e.target.value;
                    setApplication(updatedApp);
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={row.App_rNumber || ""}
                  disabled
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="date"
                  value={row.App_startDate?.split('T')[0] || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_startDate = e.target.value;
                    setApplication(updatedApp);
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="date"
                  value={row.App_endDate?.split('T')[0] || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_endDate = e.target.value;
                    setApplication(updatedApp);
                  }}
                />
              </TableCell>
              {/* Single select dropdowns for App_permit fields */}
              <TableCell>
                <Select
                  value={row.App_permit_Create || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_permit_Create = e.target.value;
                    setApplication(updatedApp);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {groups.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.App_permit_Open || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_permit_Open = e.target.value;
                    setApplication(updatedApp);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {groups.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.App_permit_toDoList || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_permit_toDoList = e.target.value;
                    setApplication(updatedApp);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {groups.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.App_permit_Doing || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_permit_Doing = e.target.value;
                    setApplication(updatedApp);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {groups.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.App_permit_Done || ""}
                  onChange={(e) => {
                    const updatedApp = [...application];
                    updatedApp[index].App_permit_Done = e.target.value;
                    setApplication(updatedApp);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {groups.map((group, index) => (
                    <MenuItem key={index} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  onClick={() => handleUpdateApplication(index)}
                >
                  Update
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
};

export default Application;
