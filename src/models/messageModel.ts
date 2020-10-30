export interface NewMessage {
  roomId: string;
  text: string | null;
  image: string | null;
  video: string | null;
}

export interface Message extends NewMessage {
  username: string;
}
