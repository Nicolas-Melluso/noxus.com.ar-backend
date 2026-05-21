import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('feedback_responses')
export class FeedbackResponse {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @CreateDateColumn({ name: 'received_at', type: 'datetime' })
  receivedAt: Date;

  @Column({
    name: 'identity_mode',
    type: 'enum',
    enum: ['anonimo', 'identificado'],
  })
  identityMode: 'anonimo' | 'identificado';

  @Column({ nullable: true, length: 160 })
  relationship: string;

  @Column({ name: 'respondent_name', nullable: true, length: 160 })
  respondentName: string;

  @Column({ name: 'respondent_team', nullable: true, length: 160 })
  respondentTeam: string;

  @Column({ name: 'perceived_role', nullable: true, length: 160 })
  perceivedRole: string;

  @Column({ name: 'future_direction', nullable: true, length: 160 })
  futureDirection: string;

  @Column({ name: 'technical_quality', type: 'tinyint', unsigned: true, nullable: true })
  technicalQuality: number;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  availability: number;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  judgement: number;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  resolution: number;

  @Column({ name: 'delivery_reliability', type: 'tinyint', unsigned: true, nullable: true })
  deliveryReliability: number;

  @Column({ name: 'communication_clarity', type: 'tinyint', unsigned: true, nullable: true })
  communicationClarity: number;

  @Column({ name: 'leadership_capacity', type: 'tinyint', unsigned: true, nullable: true })
  leadershipCapacity: number;

  @Column({ name: 'human_quality', type: 'tinyint', unsigned: true, nullable: true })
  humanQuality: number;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  innovation: number;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string;

  @Column({ name: 'keep_doing_text', type: 'text', nullable: true })
  keepDoingText: string;

  @Column({ name: 'improve_text', type: 'text', nullable: true })
  improveText: string;

  @Column({ name: 'summary_text', type: 'text', nullable: true })
  summaryText: string;

  @Column({ name: 'response_json', type: 'longtext' })
  responseJson: string;

  @Column({ name: 'user_agent', nullable: true, length: 500 })
  userAgent: string;

  @Column({ name: 'ip_hash', nullable: true, length: 64 })
  ipHash: string;
}
