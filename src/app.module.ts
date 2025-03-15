import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

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
    TransactionsModule,
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 
