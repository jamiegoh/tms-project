const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();

const routes = require('./routes/three.js');

app.use('/', routes);
  
  app.listen(8000, () => {
    console.log("Server started on port 8000");
  });