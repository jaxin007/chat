import {
  Message,
} from './messageModel';

export interface NewRoomModel {
  roomName: string;
}

export interface RoomModel extends NewRoomModel {
  _id: string;
  messages: Message[];
}
