import { DynamicResponseMessage } from '../dto/dynamic-response.dto';
import { ApiResponseCode } from '../enums/api-status-code.enum';

export class ResponseHelper {
  static success<T>(
    data: T,
    message: string = 'Operación exitosa',
    statusCode: number = ApiResponseCode.SUCCESS,
  ): DynamicResponseMessage<T> {
    return new DynamicResponseMessage<T>(true, statusCode, message, data);
  }

  static created<T>(
    data: T,
    message: string = 'Recurso creado exitosamente',
  ): DynamicResponseMessage<T> {
    return new DynamicResponseMessage<T>(true, ApiResponseCode.CREATED, message, data);
  }

  static error(
    statusCode: number,
    message: string,
    errors: string[] = [],
  ): DynamicResponseMessage<null> {
    return new DynamicResponseMessage<null>(false, statusCode, message, null, errors);
  }

  static badRequest(message: string, errors: string[] = []): DynamicResponseMessage<null> {
    return this.error(ApiResponseCode.BAD_REQUEST, message, errors);
  }

  static unauthorized(message: string = 'No autorizado'): DynamicResponseMessage<null> {
    return this.error(ApiResponseCode.UNAUTHORIZED, message);
  }

  static notFound(message: string = 'Recurso no encontrado'): DynamicResponseMessage<null> {
    return this.error(ApiResponseCode.NOT_FOUND, message);
  }

  static conflict(message: string, errors: string[] = []): DynamicResponseMessage<null> {
    return this.error(ApiResponseCode.CONFLICT, message, errors);
  }

  static internalError(message: string = 'Error interno del servidor'): DynamicResponseMessage<null> {
    return this.error(ApiResponseCode.INTERNAL_ERROR, message);
  }
}
