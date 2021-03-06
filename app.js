const express = require("express");
const { disconnect } = require("process");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.SERVER_PORT;
const bodyParser = require("body-parser");
const session = require("express-session");
const MemoryStore = session.MemoryStore;
const url = require("url");
const db = require("./queries.js");

// app.use(cookieParser());
app.set("view engine", "ejs");

server.listen(port, function () {
    console.log("Listening on port " + port + "...");
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        name: "app.sid",
        resave: true,
        store: new MemoryStore(),
        saveUninitialized: false,
    })
);

app.use("/public", express.static("public"));

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

var user;
function check_login() {
    // return request.session.auth == undefined ? false : true;
    return user == undefined ? false : true;
}

app.get("/", function (req, res) {
    // let users = res.get("/users");
    user = req.session.user;
    // console.info(user);
    if (check_login()) {
        res.render("index", { username: user });
    } else {
        res.render("login");
    }
});

app.get("/login", function (request, response) {
    if (check_login()) {
        response.redirect("/");
    } else {
        response.render("login");
    }
});

app.get("/registration", function (request, response) {
    if (check_login()) {
        response.redirect("/");
    } else {
        response.render("registration");
    }
});

app.get("/logout", function (request, response) {
    session.user = undefined;
    response.redirect("/login");
});

app.post("/login", db.login);
app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/registration", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);
app.post("/save_data", db.save_data);
app.get("/load_data/:id", db.load_data);

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
