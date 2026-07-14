export class DynamicResponseMessage<T> {
  status: boolean;
  apiStatusCode: number;
  message: string;
  errors: string[];
  data: T | null;
  timestamp: string;

  constructor(
    status: boolean,
    apiStatusCode: number,
    message: string,
    data: T | null = null,
    errors: string[] = [],
  ) {
    this.status = status;
    this.apiStatusCode = apiStatusCode;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}
