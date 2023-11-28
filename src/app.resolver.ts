import { Context, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { Request } from 'express';
import { Public } from './common/decorators/public.decorator';

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Query(() => String)
  hello(@Context('req') req: Request): string {
    return this.appService.getHello(
      `from cookie parsing jwt-token:${req.cookies['jwt-token']}`,
    );
  }
}
