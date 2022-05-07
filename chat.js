const express = require("express");
const app = express();
const server = require("http").createServer(app);

const io = require("socket.io").listen(server);

server.listen(80);

app.get("/", function (request, response) {
    response.send(__dirname + "/index.html");
});
