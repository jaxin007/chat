import 'reflect-metadata';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import {
  InversifyExpressServer,
} from 'inversify-express-utils';

import {
  container,
} from './inversify.config';
import './controllers/messagesController';
import {
  envConfig,
} from './config';

export const appPromise = (async () => {
  const server = new InversifyExpressServer(container);

  return server
    .setConfig((app) => {
      app.use(bodyParser.json({
        limit: '5mb',
      }));

      app.use(bodyParser.urlencoded({
        extended: true,
      }));

      app.use(cors({
        credentials: true,
        origin: envConfig.API_URL,
      }));

      app.use(express.static('public'));

      app.set('view engine', 'pug');
    })
    .setErrorConfig((app) => {
      app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err);

        return res.status(500).json(err);
      });
    })
    .build();
})();
