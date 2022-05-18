const express = require("express");
const { disconnect } = require("process");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 80;
const db = require("./queries.js");
const bodyParser = require("body-parser");

server.listen(port, function () {
    console.log("Listening on port " + port + "...");
});

app.use("/public", express.static("public"));

app.get("/", function (request, response) {
    response.sendFile(__dirname + "\\index.html");
});

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);

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
