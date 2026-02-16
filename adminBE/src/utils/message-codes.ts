/**
 * HTTP status codes and messages for API responses
 */
export const MESSAGES = {
  SUCCESS: {
    _CODE: 200,
    _MESSAGE: "Success"
  },
  CREATED: {
    _CODE: 201,
    _MESSAGE: "Resource created successfully"
  },
  BAD_REQUEST: {
    _CODE: 400,
    _MESSAGE: "Bad request"
  },
  UNAUTHORIZED: {
    _CODE: 401,
    _MESSAGE: "Unauthorized access"
  },
  FORBIDDEN: {
    _CODE: 403,
    _MESSAGE: "Forbidden access"
  },
  NOT_FOUND: {
    _CODE: 404,
    _MESSAGE: "Resource not found"
  },
  CONFLICT: {
    _CODE: 409,
    _MESSAGE: "Conflict with existing resource"
  },
  UNPROCESSABLE_ENTITY: {
    _CODE: 422,
    _MESSAGE: "Unprocessable entity"
  },
  INTERNAL_SERVER_ERROR: {
    _CODE: 500,
    _MESSAGE: "Internal server error"
  }
};