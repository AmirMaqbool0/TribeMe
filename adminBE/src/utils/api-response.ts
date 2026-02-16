/**
 * Class representing an API response
 */
class ApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;

  /**
   * Create an API response.
   * @param {number} statusCode - HTTP status code of response
   * @param {any} data - Data to be sent in response
   * @param {string} message - Response message
   */
  constructor(
    statusCode: number,
    data: any,
    message = "Success"
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;