import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Permitir CORS desde producción y localhost:5501 solo en desarrollo
  const allowedOrigins = ['https://noxus.com.ar', 'http://localhost:5501'];
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir sin origin (por ejemplo, curl) o si está en la lista
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true
  });

  app.setGlobalPrefix('api');
  
  // Middleware adicional para asegurar respuesta a OPTIONS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (req.method === 'OPTIONS' && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin); 
      res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.sendStatus(200);
    }
    next();
  });

  app.use(cookieParser());
  // app.use(csurf({ cookie: true })); // Desactivado para API REST

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
