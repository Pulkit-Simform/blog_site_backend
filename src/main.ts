import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './pipes/validation-exception.filter';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  // global variables
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: '*',
    // origin: ['http://localhost:3000'],
    methods: ['POST', 'OPTIONS'],
    credentials: true,
  };

  // app.use(morgan('dev'));
  app.use(cookieParser());
  app.enableCors(corsOptions);
  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10 }));
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Application start
  await app.listen(5000);
}
bootstrap();
