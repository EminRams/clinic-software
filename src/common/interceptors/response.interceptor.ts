import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { DynamicResponseMessage } from '../dto/dynamic-response.dto';
import { ResponseHelper } from '../helpers/response.helper';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof DynamicResponseMessage) {
          return data;
        }

        return ResponseHelper.success(data, 'Operación exitosa');
      }),
    );
  }
}
