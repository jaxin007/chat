import mongoose from 'mongoose';

import {
  Message,
  RoomModel,
} from '../models';

export interface MessageServiceInterface {
  addMessage(
    message: Message,
    roomId: string,
  ): Promise<mongoose.DocumentQuery<null | mongoose.Document, mongoose.Document>>;

  createRoom(roomName: string): Promise<mongoose.Document>;

  deleteMessages(roomId: string): Promise<mongoose.Query<{n?: number | undefined, ok?: number | undefined}>>;

  deleteRoom(roomName: string): Promise<mongoose.Query<{n?: number | undefined, ok?: number | undefined}> | undefined>;

  findMessages(offset: number, roomId: string): Promise<Message[] | mongoose.Document[]>;

  findRoom(roomName: string): Promise<mongoose.Document | null >;

  findRooms(): Promise<RoomModel[] | mongoose.Document[]>;
}
