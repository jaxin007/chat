import mongoose from 'mongoose';

import {
  Message,
  NewMessage,
} from '../models/messageModel';

export interface MessageServiceInterface {
  addMessage(username: string, message: NewMessage): Promise<mongoose.Document>;
  getMessages(offset?: number): Promise<Message[] | mongoose.Document[]>;
}
