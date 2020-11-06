(async () => {
  const socket = io();

  const socketEvents = {
    clearMessages: 'clear_messages',
    deleteMessages: 'delete_messages',
    deleteRoom: 'delete_room',
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

  const apiUrl = 'http://localhost:3000';

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

  let roomName = 'default_room';

  let nickname = '';

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

  const createMessage = async (roomName, content) => {
    const newMessage = await axios.post(`${apiUrl}/messages/${roomName}`, {
      ...content,
      username: nickname,
    }).catch((err) => console.error(err));

    await messageHandler(newMessage.data);

    socket.emit(socketEvents.newMessage, newMessage.data);
  };

  const deleteMessages = async (roomName) => {
    await axios.delete(`${apiUrl}/messages/${roomName}`);

    socket.emit(socketEvents.deleteRoom);
  };

  const getMessages = async (roomName, offset) => {
    const response = await axios.get(`${apiUrl}/messages/${roomName}?offset=${offset}`).catch((err) => console.error(err));

    if (!response || !response.data.length) {
      return;
    }

    response.data.forEach((message) => {
      const listItem = document.createElement('li');

      if (message.text) {
        info.textContent = ''; // clear status <username> is typing... after sending message

        listItem.innerHTML = `${message.username} : ${message.text}`;

        listItem.classList.add('list-group-item');

        return messageList.prepend(listItem);
      } if (message.image) {
        const image = document.createElement('img');

        listItem.textContent = `${message.username}: `;

        listItem.classList.add('list-group-item');

        image.src = message.image;

        messageList.prepend(listItem);

        return messageList.prepend(image);
      } if (message.video) {
        const video = document.createElement('video');

        video.controls = true;

        listItem.textContent = `${message.username}: `;

        listItem.classList.add('list-group-item');

        video.src = message.video;

        messageList.prepend(listItem);

        return messageList.prepend(video);
      }
    });
  };

  await getMessages(roomName, 0);

  message.addEventListener('keypress', async (e) => {
    if (!message.value || !nickname) {
      return;
    }

    if (e.key !== 'Enter') {
      socket.emit(socketEvents.typing);
      return;
    }

    await createMessage(roomName, {
      text: message.value,
    });

    message.value = '';
  });

  messageBtn.addEventListener('click', async () => {
    if (!message.value) {
      return alert('Message field must be not empty');
    } if (!username.textContent) {
      return alert('Provide username first');
    }

    await createMessage(roomName, {
      text: message.value,
    });

    message.value = '';
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

    await createMessage(roomName, {
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

    await createMessage(roomName, {
      video: baseVideo,
    });
  });

  const changeUsername = () => {
    if (!username.value) {
      return alert('Username field must be not empty');
    }

    nickname = username.value;

    socket.emit(socketEvents.setUsername, {
      username: username.value,
    });

    username.textContent = username.value;

    curUsername.textContent = `Current username: ${username.value}`;

    username.value = '';
  };

  usernameBtn.addEventListener('click', () => changeUsername());

  username.addEventListener('keypress', (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    changeUsername();
  });

  const changeRoom = async () => {
    if (!room.value) {
      return alert('Room value field must be not empty');
    }

    offset = 0;

    roomName = room.value;

    messageList.innerHTML = '';

    socket.emit(socketEvents.roomChoose, {
      roomName: room.value,
    });

    await getMessages(roomName, 0);

    room.textContent = room.value;

    curRoom.textContent = `Current room: ${room.value}`;

    room.value = '';
  };

  roomBtn.addEventListener('click', async () => changeRoom());

  room.addEventListener('keypress', async (e) => {
    if (e.key !== 'Enter') {
      return;
    }

    await changeRoom();
  });

  socket.on(socketEvents.clearMessages, () => {
    messageList.innerHTML = '';
    curRoom.textContent = `Current room: ${roomName}`;
  });

  socket.on(socketEvents.receiveMessage, (data) => {
    messageHandler(data);
  });

  let clearInfoTextContent;

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

  clearMessagesButton.addEventListener('click', async () => {
    await deleteMessages(roomName);
    return socket.emit(socketEvents.deleteRoom);
  });

  const getMoreMessagesButton = document.querySelector('#getMoreButton');

  let offset = 0;

  getMoreMessagesButton.addEventListener('click', () => {
    offset += 15;
    return getMessages(roomName, offset);
  });
})();
