class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: string | any[];

  constructor(
    statusCode: number,
    message: string | null,
    errors: string | any[],
    stack: string = ""
  ) {
    super(message ?? "");
    this.statusCode = statusCode;
    this.data = null;
    this.message = message ?? "";
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default ApiError;
