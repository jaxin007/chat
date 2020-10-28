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
  MessageServiceInterface,
} from './interfaces';
import {
  NewMessage,
} from './models/messageModel';

interface SocketTest extends socketIo.Socket {
  username: string,
}

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

io.on(SocketEvents.connection, async (socket: SocketTest) => {
  const messages = await messageService.getMessages();

  messages.forEach((message: any) => {
    io.sockets
      .emit(SocketEvents.displayMessages, {
        username: message.username,
        text: message.text || null,
        image: message.image || null,
        video: message.video || null,
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

    return moreMessages.forEach((message: any) => {
      io.sockets
        .emit(SocketEvents.displayMessages, {
          username: message.username,
          text: message.text || null,
          image: message.image || null,
          video: message.video || null,
        });
    });
  });

  socket.on(SocketEvents.newMessage, async (message: NewMessage): Promise<boolean | void> => {
    if (!socket.username || !message) {
      return socket.emit('no_username');
    }

    await messageService.addMessage(socket.username, message);

    return socket
      .emit(SocketEvents.receiveMessage, {
        username: socket.username,
        text: message.text || null,
        image: message.image || null,
        video: message.video || null,
      });
  });
});
