import express from "express";
import path from "path";
import socketIO from "socket.io";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import socketController from "./socketController";
import events from "./events";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "static")));
app.get("/", (req, res) =>
  res.render("home", { events: JSON.stringify(events) })
);

const handleListening = () => {
  console.log(`Listening on http://localhost:${PORT}`);
};

const server = app.listen(PORT, handleListening);
const io = socketIO.listen(server);

io.on("connection", socket => socketController(socket, io));
