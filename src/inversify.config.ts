import 'reflect-metadata';

import {
  Container,
} from 'inversify';

import {
  MessageService,
} from './services/message.service';
import {
  MongoService,
} from './services/mongo.service';

import {
  TYPES,
} from './constants';
import {
  MessageServiceInterface,
  MongoServiceInterface,
} from './interfaces';

export const container = new Container();

container.bind<MongoServiceInterface>(TYPES.MongoService).to(MongoService);
container.bind<MessageServiceInterface>(TYPES.MessageService).to(MessageService);
