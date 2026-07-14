import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DynamicResponseMessage } from '../dto/dynamic-response.dto';
import { ApiResponseCode } from '../enums/api-status-code.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;

        if (Array.isArray(responseObj.message)) {
          errors = responseObj.message;
          message = 'Error de validación';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const apiStatusCode = this.getApiStatusCode(status);

    const errorResponse = new DynamicResponseMessage<null>(
      false,
      apiStatusCode,
      message,
      null,
      errors,
    );

    response.status(status).json(errorResponse);
  }

  private getApiStatusCode(httpStatus: number): number {
    const statusMap: Record<number, number> = {
      [HttpStatus.BAD_REQUEST]: ApiResponseCode.BAD_REQUEST,
      [HttpStatus.UNAUTHORIZED]: ApiResponseCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ApiResponseCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ApiResponseCode.NOT_FOUND,
      [HttpStatus.CONFLICT]: ApiResponseCode.CONFLICT,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ApiResponseCode.INTERNAL_ERROR,
    };

    return statusMap[httpStatus] || httpStatus;
  }
}
