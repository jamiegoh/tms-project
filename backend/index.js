const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(express.json());

const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

require("dotenv").config();


app.use(cors(corsOptions));
app.use(cookieParser());

const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const authRoutes = require('./routes/auth');
const { cookieAuthentication } = require("./middleware/authentication");

app.use('/users', cookieAuthentication, userRoutes);
app.use('/groups',cookieAuthentication, groupRoutes);
app.use('/auth', authRoutes);
  
  app.listen(8000, () => {
    console.log("Server started on port 8000");
  });