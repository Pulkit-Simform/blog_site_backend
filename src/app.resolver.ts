import { Context, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { Request } from 'express';

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => String)
  hello(@Context('req') req: Request): string {
    return this.appService.getHello(
      `from cookie parsing jwt-token:${req.cookies['jwt-token']}`,
    );
  }
}
