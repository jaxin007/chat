import mongoose from 'mongoose';

export const connectOpt: mongoose.ConnectionOptions = {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
