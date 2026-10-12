import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT_API || 4000;
  await app.listen(port);
  new Logger('knovra-api').log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
