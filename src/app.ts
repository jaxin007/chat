import socketIo from 'socket.io';

import {
  envConfig,
} from './config';
import {
  SocketEvents,
} from './constants';
import {
  NewMessage,
  NewRoomModel,
} from './models';
import {
  appPromise,
} from './index';

appPromise.then((app) => {
  const server = app.listen(envConfig.PORT, () => {
    console.log(`Server listened on port: ${envConfig.PORT}`);
  });

  const io = socketIo(server);

  const defaultRoomName = 'default_room';

  io.on(SocketEvents.connection, async (socket: socketIo.Socket) => {
    if (!socket.currentRoom) {
      socket.currentRoom = defaultRoomName;
    }

    socket.join(socket.currentRoom); // connect to the default room

    socket.on(SocketEvents.deleteRoom, async () => {
      io.sockets
        .in(socket.currentRoom)
        .emit(SocketEvents.clearMessages);

      socket.currentRoom = defaultRoomName;

      socket.join(defaultRoomName);

      return socket.emit(SocketEvents.clearMessages);
    });

    socket.on(SocketEvents.setUsername, (data): void | socketIo.Socket => {
      socket.username = data.username;
    });

    socket.on(SocketEvents.typing, () => {
      socket.broadcast
        .in(socket.currentRoom)
        .emit(SocketEvents.typing, {
          currentRoom: socket.currentRoom,
          username: socket.username,
        });
    });

    socket.on(SocketEvents.newMessage, async (message: NewMessage): Promise<boolean | void> => {
      socket.join(socket.currentRoom);

      return socket.broadcast
        .to(socket.currentRoom)
        .emit(SocketEvents.receiveMessage, {
          ...message,
          currentRoom: socket.currentRoom,
        });
    });

    socket.on(SocketEvents.roomChoose, async (data: NewRoomModel) => {
      socket.currentRoom = data.roomName;

      socket.join(socket.currentRoom);
    });

    socket.on(SocketEvents.disconnect, () => {
      console.log(`User ${socket.id} is disconnected`);

      return socket.leave(socket.currentRoom);
    });
  });
});
