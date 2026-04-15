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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.H_HOST,
    port: 3306,
    username: process.env.H_USER,
    password: process.env.H_PASS,
    database: process.env.H_DB_NAME,
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
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}