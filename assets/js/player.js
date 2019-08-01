import {
  disableCanvas,
  hideControls,
  enableCanvas,
  showControls,
  cleanCanvas
} from "./paint";

const board = document.getElementById("jsPBoard");
const notifs = document.getElementById("jsNotifs");
const timeout = document.getElementById("jsTimeout");

const addPlayers = players => {
  board.innerHTML = "";
  players.forEach(player => {
    const playerElement = document.createElement("span");
    playerElement.innerText = `${player.nickname} : ${player.point}`;
    board.appendChild(playerElement);
  });
};

const setNotifs = text => {
  notifs.innerText = "";
  notifs.innerText = text;
};

let leftTime = 30;

const disableTimer = () => {
  timeout.style.display = "none";
};

const decreaseTime = () => {
  leftTime -= 1;
  timeout.innerText = `남은 시간 : ${leftTime}초`;
  if (leftTime === 0) {
    leftTime = 30;
    disableTimer();
    clearInterval(decreaseTime);
  }
};

const NotifTimeout = () => {
  setInterval(decreaseTime, 1000);
};

export const handlePlayerUpdate = ({ sockets }) => addPlayers(sockets);

export const handleGameStarted = () => {
  setNotifs("");
  NotifTimeout();
  disableCanvas();
  hideControls();
  cleanCanvas();
};

export const handleGameEnded = () => {
  setNotifs("Game ended");
  disableCanvas();
  hideControls();
  cleanCanvas();
  clearInterval(decreaseTime);
};

export const handleLeaderNotif = ({ word }) => {
  enableCanvas();
  showControls();
  const text = `You are the leader, paint: ${word}`;
  setNotifs(text);
};

export const handleGameStarting = () => setNotifs("Game will start soon");
