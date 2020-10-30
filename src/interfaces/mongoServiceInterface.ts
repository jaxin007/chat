import mongoose from 'mongoose';

export interface MongoServiceInterface {
  connection: Promise<typeof mongoose>;
}
