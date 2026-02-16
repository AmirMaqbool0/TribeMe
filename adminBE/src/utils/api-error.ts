/**
 * Class representing an API error
 */
class ApiError {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
  errors: any[];

  /**
   * Create an API error.
   * @param {number} statusCode - HTTP status code of error
   * @param {any} data - Additional data to be sent with error
   * @param {string} message - Error message
   * @param {any[]} errors - List of validation or other errors
   */
  constructor(
    statusCode: number,
    data: any = null,
    message = "Something went wrong",
    errors: any[] = []
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;
    this.errors = errors;
  }
}

export default ApiError;