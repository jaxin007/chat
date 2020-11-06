import {
  inject,
  injectable,
} from 'inversify';
import mongoose from 'mongoose';

import {
  SchemaNames,
  TYPES,
} from '../constants';
import {
  MessageServiceInterface,
} from '../interfaces';
import {
  Message,
  NewRoomModel,
  RoomModel,
} from '../models';
import {
  messageSchema,
} from '../schemas/messageSchema';
import {
  roomSchema,
} from '../schemas/roomSchema';

@injectable()
export class MessageService implements MessageServiceInterface {
  @inject(TYPES.MongoService) protected readonly connection: Promise<typeof mongoose>;

  protected readonly messageModel: mongoose.Model<mongoose.Document>;

  protected readonly roomModel: mongoose.Model<mongoose.Document>;

  constructor() {
    this.messageModel = mongoose.model(SchemaNames.message, messageSchema).on('error', (err) => console.error(err.message));
    this.roomModel = mongoose.model(SchemaNames.room, roomSchema).on('error', (err) => console.error(err.message));
  }

  async addMessage(
    message: Message,
    roomId: string,
  ): Promise<mongoose.DocumentQuery<null | mongoose.Document, mongoose.Document>> {
    const newMessage = await this.messageModel.create<Message>({
      ...message,
      roomId,
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

  async deleteMessages(roomId: string): Promise<mongoose.Query<{n?: number | undefined, ok?: number | undefined}>> {
    await this.messageModel.deleteOne({
      roomId,
    });

    return this.messageModel.deleteMany({
      roomId,
    });
  }

  async deleteRoom(roomName?: string): Promise<mongoose.Query<{n?: number | undefined, ok?: number | undefined}> | undefined> {
    if (!roomName) {
      return;
    }

    const room = await this.findRoom(roomName);

    if (!room) {
      return;
    }

    await this.messageModel.deleteMany({
      roomId: room._id,
    });

    await this.roomModel.deleteOne({
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
