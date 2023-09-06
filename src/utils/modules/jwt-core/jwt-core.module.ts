import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [],
  exports: [JwtCoreModule],
})
export class JwtCoreModule {}
