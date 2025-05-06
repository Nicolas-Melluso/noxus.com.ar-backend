// src/twitch/twitch.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // ✅ Importa el módulo
import { ConfigModule } from '@nestjs/config'; // ✅ Importa el módulo
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchUser } from './twitch-users.entity';
import { TwitchUsersService } from './twitch-users.service';
import { TwitchController } from './twitch.controller';
import { TwitchApiService } from './twitch-api.service';

@Module({
  imports: [
    // Módulos necesarios
    HttpModule, // ✅ Importa el módulo para usar HttpService
    ConfigModule, // ✅ Importa el módulo para usar ConfigService
    // Entidad
    TypeOrmModule.forFeature([TwitchUser]),
  ],
  providers: [
    TwitchUsersService,
    TwitchApiService, // ✅ Ya puedes usar HttpService y ConfigService aquí
  ],
  controllers: [TwitchController],
})
export class TwitchModule {}