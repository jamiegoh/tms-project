const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:5173"],
};

require("dotenv").config();

app.use(cors(corsOptions));

const userRoutes = require('./routes/users');

app.use('/users', userRoutes);
  
  app.listen(8000, () => {
    console.log("Server started on port 8000");
  });