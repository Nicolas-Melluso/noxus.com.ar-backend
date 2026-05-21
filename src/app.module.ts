import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchModule } from './twitch/twitch.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { FinanzasModule } from './finanzas/finanzas.module';
import { FixusModule } from './fixus/fixus.module';
import { NoxuraModule } from './noxura/noxura.module';
import { validateEnv } from './config/env';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || process.env.H_HOST,
      port: Number(process.env.DB_PORT || process.env.H_PORT),
      username: process.env.DB_USER || process.env.H_USER,
      password: process.env.DB_PASSWORD || process.env.H_PASS,
      database: process.env.DB_NAME || process.env.H_DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    TwitchModule,
    AuthModule,
    UsersModule,
    EventsModule,
    FinanzasModule,
    FixusModule,
    NoxuraModule,
    FeedbackModule,
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}
