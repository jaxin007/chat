import 'dotenv/config';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import socketIo from 'socket.io';
import {
  container,
} from './inversify.config';

import {
  SocketEvents,
  TYPES,
} from './constants';
import {
  envConfig,
} from './config';

import {
  Message,
  NewMessage,
  NewRoomModel,
} from './models';
import {
  MessageServiceInterface,
} from './interfaces';

const messageService = container.get<MessageServiceInterface>(TYPES.MessageService);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cors({
  credentials: true,
  origin: '*',
}));
app.use(express.static('public'));

app.get('/', (req: express.Request, res: express.Response) => {
  res.render('index');
});

app.set('view engine', 'ejs');

const server = app.listen(envConfig.PORT, () => {
  console.log(`Server listened on port: ${envConfig.PORT}`);
});

const io = socketIo(server);

const defaultRoomName = 'default_room';

io.on(SocketEvents.connection, async (socket: socketIo.Socket) => {
  if (!socket.currentRoom) {
    socket.currentRoom = defaultRoomName;
  }

  const defaultRoom = await messageService.findRoom(defaultRoomName);

  if (!defaultRoom) {
    await messageService.createRoom(defaultRoomName); // create default room if not exists
  }

  const messages = await messageService.findMessages(0, defaultRoom?._id);

  socket.join(defaultRoomName); // connect to default room

  io.sockets
    .in(socket.currentRoom)
    .emit(SocketEvents.clearMessages);

  messages.forEach((message: any) => {
    io.sockets
      .in(socket.currentRoom)
      .emit(SocketEvents.displayMessages, {
        ...message._doc,
        currentRoom: socket.currentRoom,
      });
  });

  socket.on(SocketEvents.deleteMessages, async () => {
    const room = await messageService.findRoom(socket.currentRoom);

    await messageService.deleteMessages(room?._id);

    return io.sockets
      .in(socket.currentRoom)
      .emit(SocketEvents.clearMessages);
  });

  socket.on(SocketEvents.setUsername, (data): void | socketIo.Socket => {
    socket.username = data.username;
  });

  socket.on(SocketEvents.typing, () => {
    socket.broadcast.emit(SocketEvents.typing, {
      currentRoom: socket.currentRoom,
      username: socket.username,
    });
  });

  socket.on(SocketEvents.getMore, async (offset: number) => {
    const room = await messageService.findRoom(socket.currentRoom);
    const moreMessages = await messageService.findMessages(offset, room?._id);

    if (!moreMessages.length) {
      return io.sockets
        .in(socket.currentRoom)
        .emit(SocketEvents.noMoreMessages);
    }

    return (moreMessages as Message[]).forEach((message: Message) => {
      io.sockets
        .in(socket.currentRoom)
        .emit(SocketEvents.displayMessages, message);
    });
  });

  socket.on(SocketEvents.newMessage, async (message: NewMessage): Promise<boolean | void> => {
    if (!socket.username || !message) {
      return socket.emit(SocketEvents.noUsername);
    }

    const room = await messageService.findRoom(socket.currentRoom);

    const _id = room?._id;

    await messageService.addMessage(socket.username, message, _id);

    return io.sockets
      .in(socket.currentRoom)
      .emit(SocketEvents.receiveMessage, {
        ...message,
        currentRoom: socket.currentRoom,
        username: socket.username,
      });
  });

  socket.on(SocketEvents.roomChoose, async (data: NewRoomModel) => {
    socket.currentRoom = data.roomName;

    let isRoomExists = await messageService.findRoom(socket.currentRoom);

    if (!isRoomExists) {
      isRoomExists = await messageService.createRoom(socket.currentRoom);
    }

    socket.join(socket.currentRoom);

    io.sockets
      .in(socket.currentRoom)
      .emit(SocketEvents.clearMessages);

    const roomMessageHistory = await messageService.findMessages(0, isRoomExists._id);

    roomMessageHistory.forEach((message: any) => {
      io.sockets
        .in(socket.currentRoom)
        .emit(SocketEvents.displayMessages, {
          ...message._doc,
          currentRoom: socket.currentRoom,
        });
    });
  });

  socket.on(SocketEvents.disconnect, () => {
    console.log(`User ${socket.id} is disconnected`);

    socket.leave(socket.currentRoom);
  });
});
