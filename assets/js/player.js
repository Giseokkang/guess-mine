import {
  disableCanvas,
  hideControls,
  enableCanvas,
  showControls,
  cleanCanvas
} from "./paint";
import { getSocket } from "./sockets";

const board = document.getElementById("jsPBoard");
const notifs = document.getElementById("jsNotifs");
const timeout = document.getElementById("jsTimeout");

const TIME = 30;

let leftTime = TIME;
let timer = null;

const addPlayers = players => {
  board.innerHTML = "";
  players.forEach(player => {
    const playerElement = document.createElement("span");
    playerElement.innerText = `${player.nickname} : ${player.point}`;
    board.appendChild(playerElement);
  });
};

const setNotifs = text => {
  notifs.innerHTML = "";
  notifs.innerHTML = text;
};

const clearTimer = () => {
  clearInterval(timer);
  leftTime = TIME;
  timeout.style.display = "none";
};

const counter = () => {
  leftTime -= 1;
  timeout.innerText = `남은 시간 : ${leftTime}초`;
  if (leftTime < 1) {
    timeout.style.display = "none";
    leftTime = TIME;
    clearTimer();
    getSocket().emit(window.events.sendTime);
  } else {
    timeout.style.display = "block";
  }
};

export const handlePlayerUpdate = ({ sockets }) => addPlayers(sockets);

export const handleGameStarted = () => {
  clearInterval(timer);
  timer = setInterval(counter, 1000);
  setNotifs("");
  disableCanvas();
  hideControls();
  cleanCanvas();
};

export const handleGameEnded = () => {
  setNotifs("문제 끝");
  disableCanvas();
  hideControls();
  cleanCanvas();
  clearTimer();
};

export const handleLeaderNotif = ({ word }) => {
  enableCanvas();
  showControls();
  const text = `멋진 작품을 보여주세요! <br> 그릴 단어: ${word}`;
  setNotifs(text);
};

export const handleGameStarting = () => setNotifs("게임이 곧 시작됩니다!!!");
