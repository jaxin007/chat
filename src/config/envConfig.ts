import 'dotenv/config';

import {
  EnvConfigInterface,
} from '../interfaces';

export const envConfig: EnvConfigInterface = {
  PORT: Number.parseInt(process.env.PORT || '3000', 10),

  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost',
};
