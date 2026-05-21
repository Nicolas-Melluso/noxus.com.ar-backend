import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { FeedbackResponse } from './feedback.entity';

type IdentityMode = 'anonimo' | 'identificado';

type FeedbackPayload = {
  identityMode: IdentityMode;
  relationship: string | null;
  scores: Record<string, number>;
  answers: Record<string, string>;
  growth: Record<string, string>;
  person: null | {
    name: string;
    team: string;
  };
};

const scoreFields = [
  'technicalQuality',
  'availability',
  'judgement',
  'resolution',
  'deliveryReliability',
  'communicationClarity',
  'leadershipCapacity',
  'humanQuality',
  'innovation',
];

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackResponse)
    private readonly feedbackRepository: Repository<FeedbackResponse>,
  ) {}

  async create(payload: any, meta: { userAgent?: string; ip?: string | null }) {
    const feedback = this.validatePayload(payload);

    try {
      const result = await this.feedbackRepository.insert({
        identityMode: feedback.identityMode,
        relationship: feedback.relationship,
        respondentName: feedback.person?.name ?? null,
        respondentTeam: feedback.person?.team ?? null,
        perceivedRole: feedback.growth.currentRole,
        futureDirection: feedback.growth.futurePath,
        technicalQuality: feedback.scores.technicalQuality,
        availability: feedback.scores.availability,
        judgement: feedback.scores.judgement,
        resolution: feedback.scores.resolution,
        deliveryReliability: feedback.scores.deliveryReliability,
        communicationClarity: feedback.scores.communicationClarity,
        leadershipCapacity: feedback.scores.leadershipCapacity,
        humanQuality: feedback.scores.humanQuality,
        innovation: feedback.scores.innovation,
        valueText: feedback.answers.value,
        keepDoingText: feedback.answers.continue,
        improveText: feedback.answers.improve,
        summaryText: feedback.answers.summary,
        responseJson: JSON.stringify(payload),
        userAgent: meta.userAgent ? meta.userAgent.slice(0, 500) : null,
        ipHash: meta.ip ? this.hashIp(meta.ip) : null,
      });

      const id = result.identifiers[0]?.id ?? result.raw?.insertId;
      return Number.isSafeInteger(Number(id)) ? Number(id) : id;
    } catch (error) {
      console.error('[feedback] storage_error', error);
      throw new InternalServerErrorException({
        ok: false,
        error: 'storage_error',
      });
    }
  }

  private validatePayload(payload: any): FeedbackPayload {
    if (!this.isObject(payload)) {
      throw new BadRequestException('Invalid payload');
    }

    if (
      payload.identityMode !== 'anonimo' &&
      payload.identityMode !== 'identificado'
    ) {
      throw new BadRequestException('Invalid identityMode');
    }

    if (!this.isObject(payload.scores)) {
      throw new BadRequestException('Invalid scores');
    }

    for (const field of scoreFields) {
      const score = payload.scores[field];
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new BadRequestException(`Invalid score: ${field}`);
      }
    }

    if (!this.isObject(payload.answers)) {
      throw new BadRequestException('Invalid answers');
    }

    const answers = {
      value: this.requiredString(payload.answers.value, 'answers.value'),
      continue: this.requiredString(payload.answers.continue, 'answers.continue'),
      improve: this.requiredString(payload.answers.improve, 'answers.improve'),
      summary: this.requiredString(payload.answers.summary, 'answers.summary'),
    };

    if (!this.isObject(payload.growth)) {
      throw new BadRequestException('Invalid growth');
    }

    const growth = {
      currentRole: this.requiredString(
        payload.growth.currentRole,
        'growth.currentRole',
        160,
      ),
      futurePath: this.requiredString(
        payload.growth.futurePath,
        'growth.futurePath',
        160,
      ),
    };

    if (
      payload.identityMode === 'anonimo' &&
      payload.person !== null &&
      payload.person !== undefined
    ) {
      throw new BadRequestException('Invalid person');
    }

    const person =
      payload.identityMode === 'identificado'
        ? {
            name: this.requiredString(payload.person?.name, 'person.name', 160),
            team: this.requiredString(payload.person?.team, 'person.team', 160),
          }
        : null;

    return {
      identityMode: payload.identityMode,
      relationship: this.optionalString(payload.relationship, 'relationship', 160),
      scores: payload.scores,
      answers,
      growth,
      person,
    };
  }

  private requiredString(value: any, field: string, maxLength?: number): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`Invalid ${field}`);
    }

    if (maxLength && value.length > maxLength) {
      throw new BadRequestException(`${field} is too long`);
    }

    return value;
  }

  private optionalString(
    value: any,
    field: string,
    maxLength?: number,
  ): string | null {
    if (value === undefined || value === null) return null;
    return this.requiredString(value, field, maxLength);
  }

  private hashIp(ip: string): string {
    return createHash('sha256')
      .update(`${process.env.FEEDBACK_IP_SALT}:${ip}`)
      .digest('hex');
  }

  private isObject(value: any): value is Record<string, any> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }
}
