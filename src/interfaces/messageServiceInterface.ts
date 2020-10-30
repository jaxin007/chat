import mongoose from 'mongoose';

import {
  Message,
  NewMessage,
  RoomModel,
} from '../models';

export interface MessageServiceInterface {
  addMessage(
    username: string,
    message: NewMessage,
    messageId: string,
  ): Promise<mongoose.DocumentQuery<null | mongoose.Document, mongoose.Document>>

  createRoom(roomName: string): Promise<mongoose.Document>;

  findRoom(roomName: string): Promise<mongoose.Document | null>;

  findRooms(): Promise<RoomModel[] | mongoose.Document[]>

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  findMessages(offset?: number, roomId: string): Promise<Message[] | mongoose.Document[]>
}
