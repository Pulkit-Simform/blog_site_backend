import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './pipes/validation-exception.filter';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';

async function bootstrap() {
  // global variables
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: [
      '*',
      'http://localhost:3000',
      'http://localhost:5000/graphql',
      'https://sandbox.embed.apollographql.com',
    ],
    methods: ['POST', 'OPTIONS'],
    credentials: true,
  };

  app.use(morgan('dev'));
  app.use(cookieParser());
  app.enableCors(corsOptions);
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Application start
  await app.listen(5000);
}
bootstrap();
