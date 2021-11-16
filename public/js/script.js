const socket = io('/chattings');
const getElementById = (id) => document.getElementById(id) || null;

const helloStrangerElement = getElementById('hello_stranger');
const chattingBoxElement = getElementById('chatting_box');
const formElement = getElementById('chat_form');

//접속하면 이름 물어보기
function helloUser() {
  const username = prompt('What is your name?');
  socket.emit('new_user', username, (data) => {
    //  console.log(data);
    drawHelloStranger(data);
  });
}

//접속 유저네임(me)을 상단에 표시함
const drawHelloStranger = (username) =>
  (helloStrangerElement.innerText = `안녕하세요! ${username}님 :)`);

//유저 접속
socket.on('user_connected', (username) => {
  drawNewChat(`${username}님이 접속했습니다.`);
});

//새로운 채팅
socket.on('new_chat', (data) => {
  const { chat, username } = data;
  drawNewChat(`${username}: ${chat}`);
});

//유저 채팅방 나감
socket.on('disconnect_user', (username) =>
  drawNewChat(`${username}님이 나갔습니다.`),
);

// 화면에 표시
const drawNewChat = (message, isMe = false) => {
  const wrapperChatBox = document.createElement('div');
  wrapperChatBox.className = 'clearfix';
  let chatBox;
  if (!isMe)
    //다른 유저의 채팅 (왼쪽 정렬)
    chatBox = `
      <div class='bg-gray-300 w-3/4 mx-4 my-2 p-2 rounded-lg clearfix break-all'>
        ${message}
      </div>
      `;
  else
    chatBox = `
    <div class='bg-white w-3/4 ml-auto mr-4 my-2 p-2 rounded-lg clearfix break-all'>
      ${message}
    </div>
    `;
  wrapperChatBox.innerHTML = chatBox;
  chattingBoxElement.append(wrapperChatBox);
};

//event callback functions
const handleSubmit = (event) => {
  event.preventDefault(); //이벤트 버블을 방지(새로고침 방지)
  const inputValue = event.target.elements[0].value;
  //console.log(inputValue);
  if (inputValue !== '') {
    socket.emit('submit_chat', inputValue);
    //채팅 표시
    drawNewChat(`me : ${inputValue}`, true);
    event.target.elements[0].value = ''; //호ㅏ면에 띄운다음 빈 창으로 만들기
  }
};

function init() {
  helloUser();
  //이벤트 연결
  formElement.addEventListener('submit', handleSubmit);
}

init();
