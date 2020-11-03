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
  MessageServiceInterface,
  MongoServiceInterface,
} from './interfaces';
import {
  TYPES,
} from './constants';

export const container = new Container();

container.bind<MongoServiceInterface>(TYPES.MongoService).to(MongoService);
container.bind<MessageServiceInterface>(TYPES.MessageService).to(MessageService);
