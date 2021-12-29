const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
require("dotenv").config();
const router = require("./src/routes/index");

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1", router);

//not found
app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
