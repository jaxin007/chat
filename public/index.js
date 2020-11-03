(() => {
  const socket = io.connect();

  const socketEvents = {
    clearMessages: 'clear_messages',
    deleteMessages: 'delete_messages',
    displayMessages: 'display_messages',
    getMore: 'get_more',
    newMessage: 'new_message',
    noMoreMessages: 'no_more_messages',
    noUsername: 'no_username',
    receiveMessage: 'receive_message',
    roomChoose: 'room_choose',
    setUsername: 'set_username',
    typing: 'typing',
  };

  const curRoom = document.querySelector('#curRoom');
  const room = document.querySelector('#room');
  const roomBtn = document.querySelector('#roomIdBtn');

  const curUsername = document.querySelector('#curUsername');
  const username = document.querySelector('#username');
  const usernameBtn = document.querySelector('#usernameBtn');

  const message = document.querySelector('#message');
  const messageBtn = document.querySelector('#messageBtn');
  const messageList = document.querySelector('#message-list');

  const info = document.querySelector('.info');

  username.textContent = '';

  roomBtn.addEventListener('click', () => {
    if (!room.value) {
      return alert('Room value field must be not empty');
    }

    socket.emit(socketEvents.roomChoose, {
      roomName: room.value,
    });

    room.textContent = room.value;

    curRoom.textContent = `Current room: ${room.value}`;

    room.value = '';
  });

  const toBase = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const inputImageGroup = document.querySelector('#inputGroupImage');
  const uploadImageButton = document.querySelector('#inputGroupImageAddon');

  uploadImageButton.addEventListener('click', async () => {
    const image = inputImageGroup.files[0]; // file from input

    if (!image) {
      return alert('Upload your image first');
    }

    const baseImage = await toBase(image);

    socket.emit(socketEvents.newMessage, {
      image: baseImage,
    });
  });

  const inputVideoGroup = document.querySelector('#inputGroupVideo');
  const uploadVideoButton = document.querySelector('#inputGroupVideoAddon');

  uploadVideoButton.addEventListener('click', async () => {
    const video = inputVideoGroup.files[0];

    if (!video) {
      return alert('Upload your video first');
    }

    const baseVideo = await toBase(video);

    return socket.emit(socket.emit(socketEvents.newMessage, {
      video: baseVideo,
    }));
  });

  username.addEventListener('keypress', (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    if (!username.value) {
      return alert('Username field must be not empty');
    }

    socket.emit(socketEvents.setUsername, {
      username: username.value,
    });

    username.textContent = username.value;

    curUsername.textContent = `Current username: ${username.value}`;

    username.value = '';
  });

  usernameBtn.addEventListener('click', () => {
    if (!username.value) {
      return alert('Username field must be not empty');
    }

    socket.emit(socketEvents.setUsername, {
      username: username.value,
    });

    username.textContent = username.value;

    curUsername.textContent = `Current username: ${username.value}`;

    username.value = '';
  });

  message.addEventListener('keypress', (e) => {
    if (e.key !== 'Enter') {
      socket.emit('typing');
      return;
    }

    if (!message.value) {
      return;
    }

    socket.emit(socketEvents.newMessage, {
      text: message.value,
    });

    message.value = '';
  });

  messageBtn.addEventListener('click', () => {
    if (!message.value) {
      return alert('Message field must be not empty');
    } if (!username.textContent) {
      return alert('Provide username first');
    }

    socket.emit(socketEvents.newMessage, {
      text: message.value,
    });
    message.value = '';
  });

  let clearInfoTextContent;

  const messageHandler = (data) => {
    const listItem = document.createElement('li');

    if (data.text) {
      info.textContent = ''; // clear status <username> is typing... after sending message

      listItem.textContent = `${data.username} : ${data.text}`;

      listItem.classList.add('list-group-item');

      return messageList.appendChild(listItem);
    } if (data.image) {
      const image = document.createElement('img');
      listItem.textContent = `${data.username}: `;

      listItem.classList.add('list-group-item');

      image.src = data.image;

      messageList.appendChild(listItem);

      return messageList.appendChild(image);
    } if (data.video) {
      const video = document.createElement('video');

      video.controls = true;

      listItem.textContent = `${data.username}: `;
      listItem.classList.add('list-group-item');

      video.src = data.video;

      messageList.appendChild(listItem);

      return messageList.appendChild(video);
    }
  };

  const displayMessageHandler = (data) => {
    const listItem = document.createElement('li');

    if (data.text) {
      info.textContent = ''; // clear status <username> is typing... after sending message

      listItem.innerHTML = `${data.username} : ${data.text}`

      listItem.classList.add('list-group-item');

      return messageList.prepend(listItem);
    } if (data.image) {
      const image = document.createElement('img');

      listItem.textContent = `${data.username}: `;

      listItem.classList.add('list-group-item');

      image.src = data.image;

      messageList.prepend(listItem);

      return messageList.prepend(image);
    } if (data.video) {
      const video = document.createElement('video');

      video.controls = true;

      listItem.textContent = `${data.username}: `;
      listItem.classList.add('list-group-item');

      video.src = data.video;

      messageList.prepend(listItem);

      return messageList.prepend(video);
    }
  };

  socket.on(socketEvents.clearMessages, () => messageList.innerHTML = '');

  socket.on(socketEvents.displayMessages, (data) => displayMessageHandler(data));

  socket.on(socketEvents.receiveMessage, (data) => messageHandler(data));

  socket.on(socketEvents.noMoreMessages, () => alert('No more messages'));

  socket.on(socketEvents.noUsername, () => alert('Provide username first'));

  socket.on(socketEvents.typing, (data) => {
    clearTimeout(clearInfoTextContent);

    if (!data || !data.username) {
      return;
    }

    info.textContent = `${data.username} is typing...`;

    clearInfoTextContent = setTimeout(() => {
      info.textContent = '';
    }, 4000);
  });

  const clearMessagesButton = document.querySelector('#deleteMessages');

  clearMessagesButton.addEventListener('click', () => {
    return socket.emit(socketEvents.deleteMessages);
  });

  const getMoreMessagesButton = document.querySelector('#getMoreButton');
  let offset = 1;

  getMoreMessagesButton.addEventListener('click', () => {
    offset += 15;
    return socket.emit(socketEvents.getMore, offset);
  });
})();
