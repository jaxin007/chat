import mongoose from 'mongoose';
import {
  injectable,
  inject,
} from 'inversify';

import {
  TYPES,
} from '../constants';
import {
  messageSchema,
} from '../schemas/messageSchema';

import {
  Message,
  NewMessage,
} from '../models/messageModel';
import {
  MessageServiceInterface,
} from '../interfaces';

@injectable()
export class MessageService implements MessageServiceInterface {
  @inject(TYPES.MongoService) protected readonly connection: Promise<typeof mongoose>

  protected readonly messageModel: mongoose.Model<mongoose.Document>

  constructor() {
    this.messageModel = mongoose.model('Messages', messageSchema);
  }

  async addMessage(username: string, message: NewMessage): Promise<mongoose.Document> {
    return this.messageModel.create<Message>({
      username,
      image: message.image,
      text: message.text,
      video: message.video,
    });
  }

  async getMessages(offset: number = 0): Promise<Message[] | mongoose.Document[]> {
    try {
      return this.messageModel
        .find()
        .sort({
          createdAt: -1,
        })
        .limit(15)
        .skip(offset);
    } catch (err) {
      throw new Error(err);
    }
  }
}
