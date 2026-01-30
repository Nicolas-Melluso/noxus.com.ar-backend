import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS abierto para permitir peticiones desde los microfrontends
  // Nota: configurado con origin: '*' y sin credenciales (no usar cookies)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false
  });

  app.setGlobalPrefix('api');
  
  // Responder OPTIONS de forma genérica (no se añadirá header de credenciales)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.sendStatus(200);
    }
    next();
  });

  app.use(cookieParser());
  // app.use(csurf({ cookie: true })); // Desactivado para API REST

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
