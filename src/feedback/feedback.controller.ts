import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request } from 'express';
import { isAllowedOrigin } from '../config/cors';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(@Body() body: any, @Req() req: Request) {
    if (!this.isJsonRequest(req)) {
      throw new UnsupportedMediaTypeException('Content-Type must be application/json');
    }

    const origin = req.headers.origin;
    if (origin && !isAllowedOrigin(String(origin))) {
      throw new ForbiddenException('Invalid origin');
    }

    const id = await this.feedbackService.create(body, {
      userAgent: req.headers['user-agent'],
      ip: this.getClientIp(req),
    });

    return { ok: true, id };
  }

  private isJsonRequest(req: Request): boolean {
    const contentType = req.headers['content-type'];
    const value = Array.isArray(contentType) ? contentType[0] : contentType;
    return Boolean(value && value.toLowerCase().startsWith('application/json'));
  }

  private getClientIp(req: Request): string | null {
    const forwardedFor = req.headers['x-forwarded-for'];
    const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const forwardedIp = value?.split(',')[0]?.trim();
    return forwardedIp || req.ip || req.socket?.remoteAddress || null;
  }
}
