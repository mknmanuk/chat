const express = require("express");
const { disconnect } = require("process");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 80;

server.listen(port, function () {
    console.log("Listening on port " + port + "...");
});

app.use("/public", express.static("public"));

app.get("/", function (request, response) {
    response.sendFile(__dirname + "\\index.html");
});

users = [];
connections = [];

io.sockets.on("connection", function (socket) {
    console.log("Connected!");
    connections.push(socket);

    socket.on("disconnect", function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnected!");
    });

    socket.on("send_message", function (data) {
        io.sockets.emit("add_message", data);
    });
});
