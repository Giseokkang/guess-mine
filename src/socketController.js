import events from "./events";
import { chooseWord } from "./words";

let sockets = [];
let inProgress = false;
let word = null;
let leader = null;
let timeout = null;
let leftTime = 30;

const chooseLeader = () => sockets[Math.floor(Math.random() * sockets.length)];

const socketController = (socket, io) => {
  const broadcast = (event, data) => socket.broadcast.emit(event, data);
  const superBroadcast = (event, data) => io.emit(event, data);
  const sendPlayerUpdate = () =>
    superBroadcast(events.playerUpdate, { sockets });

  const decreaseTime = () => {
    leftTime -= 1;
    if (leftTime === 0) {
      leftTime = 30;
      clearInterval(decreaseTime);
    }
  };

  const NotifTimeout = () => {
    setInterval(decreaseTime, 1000);
  };

  const startGame = () => {
    if (sockets.length > 1) {
      if (inProgress === false) {
        inProgress = true;
        leader = chooseLeader();
        word = chooseWord();
        setTimeout(() => {
          superBroadcast(events.gameStarting);
        }, 2000);
        setTimeout(() => {
          superBroadcast(events.gameStarted, { leftTime });
          io.to(leader.id).emit(events.leaderNotif, { word });
          timeout = setTimeout(endGame, 30000);
          NotifTimeout();
        }, 10000);
      }
    }
  };

  const endGame = () => {
    if (inProgress === true) {
      inProgress = false;
      superBroadcast(events.gameEnded);
    }
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    setTimeout(() => startGame(), 2000);
  };

  const appPoint = id => {
    sockets = sockets.map(socket => {
      if (socket.id === id) {
        socket.point += 10;
      }
      return socket;
    });
    endGame();
    sendPlayerUpdate();
    startGame();
  };

  socket.on(events.setNickname, ({ nickname }) => {
    socket.nickname = nickname;
    sockets.push({ id: socket.id, point: 0, nickname });
    broadcast(events.newUser, { nickname });
    sendPlayerUpdate();
    startGame();
  });

  socket.on(events.disconnect, () => {
    broadcast(events.disconnected, { nickname: socket.nickname });
    sockets = sockets.filter(aSocket => aSocket.id !== socket.id);
    sendPlayerUpdate();
    if (sockets.length === 1) {
      endGame();
    } else if (leader) {
      if (socket.id === leader.id) {
        endGame();
      }
    }
  });

  socket.on(events.sendMsg, ({ message }) => {
    if (message === word && socket.id !== leader.id) {
      superBroadcast(events.newMsg, {
        message: `Winner is ${socket.nickname} Ward was ${word}`,
        nickname: `Bot`
      });
      appPoint(socket.id);
    }
    broadcast(events.newMsg, { message, nickname: socket.nickname });
  });

  socket.on(events.beginPath, ({ x, y }) =>
    broadcast(events.beganPath, { x, y })
  );

  socket.on(events.strokePath, ({ x, y, color }) =>
    broadcast(events.strokedPath, { x, y, color })
  );

  socket.on(events.fill, ({ color }) => broadcast(events.filled, { color }));
};

export default socketController;
