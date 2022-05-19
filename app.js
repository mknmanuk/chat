const express = require("express");
const { disconnect } = require("process");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.SERVER_PORT;
const db = require("./queries.js");
const bodyParser = require("body-parser");
const session = require("express-session");

server.listen(port, function () {
    console.log("Listening on port " + port + "...");
});

app.use("/public", express.static("public"));

app.get("/", function (request, response) {
    response.sendFile(__dirname + "\\index.html");
});

app.get("/login", function (request, response) {
    response.sendFile(__dirname + "\\views\\login.html");
});

app.get("/registration", function (request, response) {
    response.sendFile(__dirname + "\\views\\registration.html");
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.post("/login", db.login);
app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/register", db.createUser);
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
