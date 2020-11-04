export interface NewMessage {
  image: string | null;
  roomId: string;
  text: string | null;
  video: string | null;
}

export interface Message extends NewMessage {
  username: string;
}
