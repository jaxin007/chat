/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  Schema,
} from 'mongoose';

export const messageSchema: Schema = new Schema({
  username: {
    type: Schema.Types.String,
    required: true,
  },
  text: {
    type: Schema.Types.String,
    maxlength: [1000, 'Too long text message'],
  },
  image: {
    type: Schema.Types.String,
    default: null,
  },
  video: {
    type: Schema.Types.String,
    default: null,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
  },
}, {
  timestamps: true,
  versionKey: false,
});
