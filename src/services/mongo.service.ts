import {
  injectable,
} from 'inversify';
import mongoose from 'mongoose';

import {
  connectOpt,
  envConfig,
} from '../config';
import {
  MongoServiceInterface,
} from '../interfaces';

@injectable()
export class MongoService implements MongoServiceInterface {
  readonly connection: Promise<typeof mongoose>;

  constructor() {
    this.connection = mongoose.connect(envConfig.MONGO_URL, connectOpt);
  }
}
