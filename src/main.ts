import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  await app.listen(envs.PORT);
  logger.log(`Microservice orders is running on port ${envs.PORT}`);
}
bootstrap();
