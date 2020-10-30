import mongoose from 'mongoose';

export const connectOpt: mongoose.ConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};
