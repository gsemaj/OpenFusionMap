var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var net = require("net");

var ip = "144.202.52.9";

var buffer = [];

var options = {
	port: 8003,
	host: ip,
};

var socket = net.connect(options, () => {
	console.log("connected to server");
});

function onErr() {
	setTimeout(attemptReconnect, 5000);
}

function onDat(data) {
	console.log(data.toString());
	var tokens = data.toString().split('\n');
	tokens.forEach(e => {
		if(e.length > 0) buffer.push(e);
	});
	
	if(buffer.includes("end")) {
		console.log(buffer);
		io.emit("addr", ip);
		io.emit("payload", buffer);
		buffer = [];
	}
}

function onEnd() {
	console.log("disconnected from server");
	io.emit("dc");
	setTimeout(attemptReconnect, 5000);
}

socket.on("data", onDat);
socket.on("end", onEnd);

function attemptReconnect() {
	console.log("attempting to reconnect...");
	io.emit("dc");
	socket = net.connect(options, () => {
		console.log("reconnected to server");
	});
	socket.on("error", onErr);
	socket.on("data", onDat);
	socket.on("end", onEnd);
}

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.use("/res", express.static("res"));

http.listen(80, () => {
	console.log("listening on *:80");
});
