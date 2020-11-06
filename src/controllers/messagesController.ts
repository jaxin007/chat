import {
  inject,
} from 'inversify';
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPost,
  queryParam,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import express from 'express';

import {
  BadRequestResult,
  JsonResult,
} from 'inversify-express-utils/dts/results';
import {
  TYPES,
} from '../constants';
import {
  MessageServiceInterface,
} from '../interfaces';
import {
  Message,
} from '../models';

@controller('')
export class MessagesController extends BaseHttpController {
  @inject(TYPES.MessageService) private messageService: MessageServiceInterface;

  @httpGet('/')
  private async getHome(req: express.Request, res: express.Response): Promise<void> {
    return res.render('index');
  }

  @httpGet('/messages/:roomName')
  private async getMessages(
    @queryParam('offset') offset: string,
    @requestParam('roomName') roomName?: string,
  ): Promise<JsonResult | BadRequestResult> {
    if (!roomName) {
      return this.badRequest();
    }

    let room = await this.messageService.findRoom(roomName);

    if (!room) {
      room = await this.messageService.createRoom(roomName);
    }

    const messages = await this.messageService.findMessages(+offset, room._id);

    return this.json(messages);
  }

  @httpPost('/messages/:roomName')
  private async addMessage(
    @requestBody() message: Message,
    @requestParam('roomName') roomName?: string,
  ): Promise<JsonResult | BadRequestResult> {
    if (!message.username || !roomName) {
      return this.badRequest();
    }

    let room = await this.messageService.findRoom(roomName);

    if (!room) {
      room = await this.messageService.createRoom(roomName);
    }

    const newMessage = await this.messageService.addMessage(message, room._id);

    return this.json(newMessage);
  }

  @httpDelete('/messages/:roomName')
  private async deleteMessages(
    @requestParam('roomName') roomName?: string,
  ): Promise<JsonResult | BadRequestResult> {
    if (!roomName) {
      return this.badRequest();
    }

    const room = await this.messageService.findRoom(roomName);

    if (!room) {
      return this.badRequest();
    }

    await this.messageService.deleteRoom(roomName);

    return this.json({
      msg: 'Successfully deleted',
    });
  }
}
