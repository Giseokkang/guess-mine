"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _events = _interopRequireDefault(require("./events"));

var _words = require("./words");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var sockets = [];
var inProgress = false;
var word = null;
var leader = null;
var startGameMsg = null;
var startTimeout = null;

var chooseLeader = function chooseLeader() {
  return sockets[Math.floor(Math.random() * sockets.length)];
};

var socketController = function socketController(socket, io) {
  var broadcast = function broadcast(event, data) {
    return socket.broadcast.emit(event, data);
  };

  var superBroadcast = function superBroadcast(event, data) {
    return io.emit(event, data);
  };

  var sendPlayerUpdate = function sendPlayerUpdate() {
    return superBroadcast(_events["default"].playerUpdate, {
      sockets: sockets
    });
  };

  var startGame = function startGame() {
    if (sockets.length > 1) {
      if (inProgress === false) {
        inProgress = true;
        leader = chooseLeader();
        word = (0, _words.chooseWord)();
        startGameMsg = setTimeout(function () {
          superBroadcast(_events["default"].gameStarting);
        }, 2000);
        startTimeout = setTimeout(function () {
          superBroadcast(_events["default"].gameStarted);
          io.to(leader.id).emit(_events["default"].leaderNotif, {
            word: word
          });
        }, 10000);
      }
    }
  };

  var endGame = function endGame() {
    if (inProgress === true) {
      inProgress = false;
      superBroadcast(_events["default"].gameEnded);
    }

    if (startGameMsg !== null) {
      clearInterval(startGameMsg);
      startGameMsg = null;
    }

    if (startTimeout !== null) {
      clearInterval(startTimeout);
    }

    setTimeout(function () {
      return startGame();
    }, 2000);
  };

  var appPoint = function appPoint(id) {
    sockets = sockets.map(function (socket) {
      if (socket.id === id) {
        socket.point += 10;
        leader.point += 5;
      }

      return socket;
    });
    endGame();
    sendPlayerUpdate();
  };

  socket.on(_events["default"].sendTime, endGame);
  socket.on(_events["default"].setNickname, function (_ref) {
    var nickname = _ref.nickname;
    socket.nickname = nickname;
    sockets.push({
      id: socket.id,
      point: 0,
      nickname: nickname
    });
    broadcast(_events["default"].newUser, {
      nickname: nickname
    });
    sendPlayerUpdate();
    startGame();
  });
  socket.on(_events["default"].disconnect, function () {
    broadcast(_events["default"].disconnected, {
      nickname: socket.nickname
    });
    sockets = sockets.filter(function (aSocket) {
      return aSocket.id !== socket.id;
    });
    sendPlayerUpdate();

    if (sockets.length === 1) {
      endGame();
      (0, _words.initWords)();
    } else if (leader) {
      if (socket.id === leader.id) {
        endGame();
        (0, _words.initWords)();
      }
    }
  });
  socket.on(_events["default"].sendMsg, function (_ref2) {
    var message = _ref2.message;

    if (message === word && socket.id !== leader.id) {
      superBroadcast(_events["default"].newMsg, {
        message: "\uC2B9\uB9AC\uC790\uB294 ".concat(socket.nickname, "! \uC815\uB2F5\uC740 ").concat(word, " \uC774\uC600\uC2B5\uB2C8\uB2E4."),
        nickname: "Bot"
      });
      appPoint(socket.id);
    }

    broadcast(_events["default"].newMsg, {
      message: message,
      nickname: socket.nickname
    });
  });
  socket.on(_events["default"].beginPath, function (_ref3) {
    var x = _ref3.x,
        y = _ref3.y;
    return broadcast(_events["default"].beganPath, {
      x: x,
      y: y
    });
  });
  socket.on(_events["default"].strokePath, function (_ref4) {
    var x = _ref4.x,
        y = _ref4.y,
        color = _ref4.color;
    return broadcast(_events["default"].strokedPath, {
      x: x,
      y: y,
      color: color
    });
  });
  socket.on(_events["default"].fill, function (_ref5) {
    var color = _ref5.color;
    return broadcast(_events["default"].filled, {
      color: color
    });
  });
};

var _default = socketController;
exports["default"] = _default;