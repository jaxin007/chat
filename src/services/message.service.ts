import mongoose from 'mongoose';
import {
  injectable,
  inject,
} from 'inversify';

import {
  SchemaNames,
  TYPES,
} from '../constants';
import {
  messageSchema,
} from '../schemas/messageSchema';
import {
  roomSchema,
} from '../schemas/roomSchema';

import {
  Message,
  NewMessage,
  NewRoomModel,
  RoomModel,
} from '../models';

import {
  MessageServiceInterface,
} from '../interfaces';

@injectable()
export class MessageService implements MessageServiceInterface {
  @inject(TYPES.MongoService) protected readonly connection: Promise<typeof mongoose>

  protected readonly messageModel: mongoose.Model<mongoose.Document>

  protected readonly roomModel: mongoose.Model<mongoose.Document>

  constructor() {
    this.messageModel = mongoose.model(SchemaNames.message, messageSchema).on('error', (err) => console.error(err.message));
    this.roomModel = mongoose.model(SchemaNames.room, roomSchema).on('error', (err) => console.error(err.message));
  }

  async addMessage(
    username: string,
    message: NewMessage,
    roomId: string,
  ): Promise<mongoose.DocumentQuery<null | mongoose.Document, mongoose.Document>> {
    const newMessage = await this.messageModel.create<Message>({
      ...message,
      roomId,
      username,
    });

    await this.roomModel.findByIdAndUpdate(
      roomId,
      {
        $push: {
          messages: newMessage,
        },
      },
    );

    return newMessage;
  }

  async createRoom(roomName: string): Promise<mongoose.Document> {
    return this.roomModel.create<NewRoomModel>({
      roomName,
    });
  }

  async findRoom(roomName: string): Promise<mongoose.Document | null> {
    return this.roomModel.findOne({
      roomName,
    });
  }

  async findRooms(): Promise<RoomModel[] | mongoose.Document[]> {
    return this.roomModel.find().populate('messages');
  }

  async findMessages(offset: number, roomId: string): Promise<Message[] | mongoose.Document[]> {
    try {
      return this.messageModel
        .find({
          roomId,
        })
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
