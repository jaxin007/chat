import 'dotenv/config';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import socketIo,
{
  Socket,
} from 'socket.io';

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
  MessageServiceInterface,
} from './interfaces';
import {
  Message,
  NewMessage,
} from './models/messageModel';

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

io.on(SocketEvents.connection, async (socket: Socket) => {
  const messages = await messageService.getMessages();

  messages.forEach((message: any) => {
    io.sockets
      .emit(SocketEvents.displayMessages, {
        ...message._doc,
        username: message.username,
      });
  });

  socket.on(SocketEvents.setUsername, (data): void => {
    // eslint-disable-next-line no-param-reassign
    socket.username = data.username;
  });

  socket.on(SocketEvents.typing, () => {
    socket.broadcast.emit(SocketEvents.typing, {
      username: socket.username,
    });
  });

  socket.on(SocketEvents.getMore, async (offset: number) => {
    const moreMessages = await messageService.getMessages(offset);

    if (!moreMessages.length) {
      return io.sockets.emit(SocketEvents.noMoreMessages);
    }

    return (moreMessages as Message[]).forEach((message: Message) => {
      io.sockets
        .emit(SocketEvents.displayMessages, {
          username: message.username,
          text: message.text,
          image: message.image,
          video: message.video,
        });
    });
  });

  socket.on(SocketEvents.newMessage, async (message: NewMessage): Promise<boolean | void> => {
    if (!socket.username || !message) {
      return socket.emit(SocketEvents.noUsername);
    }

    await messageService.addMessage(socket.username, message);

    return socket
      .emit(SocketEvents.receiveMessage, {
        ...message,
        username: socket.username,
      });
  });
});
