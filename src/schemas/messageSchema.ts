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
}, {
  timestamps: true,
  versionKey: false,
});
