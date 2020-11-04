import 'dotenv/config';

import {
  EnvConfigInterface,
} from '../interfaces';

export const envConfig: EnvConfigInterface = {
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost',

  PORT: Number.parseInt(process.env.PORT || '3000', 10),
};
