import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

const { H_HOST, H_USER, H_PASS, H_DB_NAME, ENV } = process.env
let synchronize = true

if (ENV === "PROD") {
  synchronize = false
}
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: H_HOST,
    port: 3306,
    username: H_USER,
    password: H_PASS,
    database: H_DB_NAME,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize,
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 
