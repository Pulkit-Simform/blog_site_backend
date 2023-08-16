// src/common/filters/validation-exception.filter.ts

import { Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch(HttpException)
export class ValidationExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException) {
    throw exception;
  }
}
