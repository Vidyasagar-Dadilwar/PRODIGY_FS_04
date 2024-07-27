const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(
  "YOUR MONGO URI",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Import models
const User = require("./models/User");
const Message = require("./models/Message");

// Authentication routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", {
      user: "admin",
      text: `${username} has joined the room`,
    });
  });

  socket.on("sendMessage", async (message) => {
    const { sender, receiver, room, content } = message;
    const newMessage = new Message({ sender, receiver, room, content });
    await newMessage.save();
    io.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
