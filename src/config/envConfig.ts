import 'dotenv/config';

import {
  EnvConfigInterface,
} from '../interfaces';

export const envConfig: EnvConfigInterface = {
  API_URL: process.env.API_URL || 'http://localhost',

  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost',

  PORT: Number.parseInt(process.env.PORT || '3000', 10),
};
