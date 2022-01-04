const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
require("dotenv").config();
const router = require("./src/routes/index");

//websocket server
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
require("./src/socket")(io);

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
