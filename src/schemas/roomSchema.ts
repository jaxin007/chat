/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  Schema,
} from 'mongoose';

export const roomSchema: Schema = new Schema({
  roomName: {
    type: Schema.Types.String,
    unique: true,
    required: true,
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
}, {
  timestamps: true,
  versionKey: false,
});
