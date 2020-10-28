(() => {
  const socket = io.connect('http://192.168.1.41:3000/');

  const username = document.querySelector('#username');
  const usernameBtn = document.querySelector('#usernameBtn');
  const curUsername = document.querySelector('#curUsername');

  const message = document.querySelector('#message');
  const messageBtn = document.querySelector('#messageBtn');
  const messageList = document.querySelector('#message-list');

  const info = document.querySelector('.info');

  username.textContent = '';

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

    socket.emit('new_message', {
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

    return socket.emit(socket.emit('new_message', {
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

    socket.emit('set_username', {
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

    socket.emit('set_username', {
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

    socket.emit('new_message', {
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

    socket.emit('new_message', {
      text: message.value,
    });
    message.value = '';
  });

  let clearInfoTextContent;

  socket.on('typing', (data) => {
    clearTimeout(clearInfoTextContent);

    if (!data || !data.username) {
      return;
    }

    info.textContent = `${data.username} is typing...`;

    clearInfoTextContent = setTimeout(() => {
      info.textContent = '';
    }, 4000);
  });

  socket.on('no_username', () => alert('Provide username first'));

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

      listItem.textContent = `${data.username} : ${data.text}`;
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

  socket.on('receive_message', (data) => messageHandler(data));

  socket.on('display_messages', (data) => displayMessageHandler(data));

  const getMoreMessagesButton = document.querySelector('#getMoreButton');

  socket.on('no_more_messages', () => alert('No more messages'));

  let offset = 1;
  getMoreMessagesButton.addEventListener('click', () => {
    offset += 15;
    return socket.emit('get_more', offset);
  })
})();
