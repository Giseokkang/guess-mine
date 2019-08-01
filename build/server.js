"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _socket = _interopRequireDefault(require("socket.io"));

var _morgan = _interopRequireDefault(require("morgan"));

var _helmet = _interopRequireDefault(require("helmet"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _socketController = _interopRequireDefault(require("./socketController"));

var _events = _interopRequireDefault(require("./events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var PORT = process.env.PORT || 5000;
var app = (0, _express["default"])();
app.use((0, _helmet["default"])());
app.set("view engine", "pug");
app.set("views", _path["default"].join(__dirname, "views"));
app.use((0, _morgan["default"])("dev"));
app.use(_express["default"]["static"](_path["default"].join(__dirname, "static")));
app.get("/", function (req, res) {
  return res.render("home", {
    events: JSON.stringify(_events["default"])
  });
});

var handleListening = function handleListening() {
  console.log("Listening on http://localhost:".concat(PORT));
};

var server = app.listen(PORT, handleListening);

var io = _socket["default"].listen(server);

io.on("connection", function (socket) {
  return (0, _socketController["default"])(socket, io);
});