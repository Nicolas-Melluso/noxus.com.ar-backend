import { NestFactory } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { getAllowedOrigins, isAllowedOrigin } from './config/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const allowedOrigins = getAllowedOrigins();
  
  // Middleware para asegurar UTF-8 en todas las respuestas
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  app.use(json({ limit: '64kb' }));
  app.use(urlencoded({ extended: true, limit: '64kb' }));

  // Habilitar CORS solo para los origenes configurados.
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false
  });

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  
  // Responder OPTIONS de forma genérica (no se añadirá header de credenciales)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;
      if (origin && !isAllowedOrigin(String(origin))) {
        return res.sendStatus(403);
      }

      if (origin) {
        res.header('Access-Control-Allow-Origin', String(origin));
      }
      res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Content-Type', 'application/json; charset=utf-8');
      return res.sendStatus(200);
    }
    next();
  });

  app.use(cookieParser());
  // app.use(csurf({ cookie: true })); // Desactivado para API REST

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
