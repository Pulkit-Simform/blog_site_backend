import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = context.switchToHttp().getRequest();

    if (context.getType() !== 'http') {
      const ctx = GqlExecutionContext.create(context);

      // fetch token from request object
      const token = ctx.getContext().req.cookies['jwt-token'];

      // if not token then throw an error
      if (!token) {
        throw new BadRequestException(
          'You are not logged in and context is -> ' + context.getType(),
        );
      }

      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
        const user = await this.usersService.findUserById(decodedToken.id);

        if (!user) {
          throw new UnauthorizedException('You are not logged in');
        }

        ctx.getContext().res.locals.user_id = user.id;

        return true;
      } catch (e) {
        if (this.configService.get('NODE_ENV') === 'development') {
          throw new BadRequestException(e.message);
        }
        return false;
      }
    }
    // find the context
  }
}
