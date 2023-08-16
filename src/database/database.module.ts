import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
        }),
      ],
      useFactory: async (configService: ConfigService) => {
        const mongooseUri = configService.get<string>('MONGODB_URL');

        try {
          const mongooseOptions = {
            uri: mongooseUri,
          };

          return mongooseOptions;
        } catch (error) {
          // Log the error if connection fails
          console.error('Failed to connect to MongoDB:', error);
          throw error; // Rethrow the error to let NestJS handle it
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
