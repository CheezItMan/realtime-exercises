import express from "express";
// Parses through the request body (not needed)
import bodyParser from "body-parser";

// Limited Array (length 50)
import nanobuffer from "nanobuffer";

// Logging Framework
import morgan from "morgan";

const BUFFER_SIZE = 50;

// set up a limited array
const msg = new nanobuffer(BUFFER_SIZE);
const getMsgs = () => Array.from(msg).reverse();

// feel free to take out, this just seeds the server with at least one message
msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// get express ready to run
const app = express();
app.use(morgan("dev"));
// Deprecated
app.use(bodyParser.json());
app.use(express.static("frontend"));

app.get("/poll", function (req, res) {
  res.json({
    msg: getMsgs(),
  });
});

app.post("/poll", function (req, res) {
  const { user, text } = req.body;
  msg.push({
    user,
    text,
    time: Date.now(),
  });
  res.status(200).json({
    status: "ok",
    ok: true,
  });
});

// start the server
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`listening on http://localhost:${port}`);
