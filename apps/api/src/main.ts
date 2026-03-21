import { loadEnvironment } from './config/load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { Server } from 'node:http';
import { AppModule } from './app.module';
import { RealtimeService } from './realtime/realtime.service';

async function bootstrap() {
  loadEnvironment();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 4000);
  const realtimeService = app.get(RealtimeService);
  const httpServer = app.getHttpServer() as Server;
  realtimeService.attachServer(httpServer);
  await app.listen(port);
}

void bootstrap();
