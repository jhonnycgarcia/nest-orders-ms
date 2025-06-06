import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: envs.PORT,
    }
  });
  const logger = new Logger('Main');

  logger.log(`Microservice orders is running on port ${envs.PORT}`);
}
bootstrap();
