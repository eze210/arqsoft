const express = require("express");

const app = express();

const PORT = 5000

const TIMEOUT_SECONDS = 5

app.get("/", (req, res) => {
	res.send("Hola, mundo!");
});

app.get("/timeout", (req, res) => {
	setTimeout(() => {
		res.send("Timeout reached");
	}, TIMEOUT_SECONDS * 1000);
});

app.listen(PORT, () => {
	console.log("Listenning on port", PORT);
});
