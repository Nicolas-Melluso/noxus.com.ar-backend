// src/twitch/twitch.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchUser } from './twitch-user.entity';
import { TwitchUsersService } from './twitch-users.service';
import { TwitchController } from './twitch.controller';

@Module({
  imports: [
    // Registrar la entidad TwitchUser
    TypeOrmModule.forFeature([TwitchUser]),
  ],
  providers: [
    // Registrar el servicio TwitchUsersService
    TwitchUsersService,
  ],
  controllers: [
    // Registrar el controlador TwitchController
    TwitchController,
  ],
})
export class TwitchModule {}