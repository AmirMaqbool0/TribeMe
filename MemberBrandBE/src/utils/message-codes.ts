export const MESSAGES = {
  SUCCESS: {
    message: "Success",
    _CODE: 200,
  } as const,
  CREATED: {
    message: "Created",
    _CODE: 201,
  } as const,
  BAD_REQUEST: {
    message: "Bad Request",
    _CODE: 400,
  } as const,

  UNAUTHORIZED: {
    message: "Unauthorized",
    _CODE: 401,
  } as const,
  FORBIDDEN: {
    message: "Forbidden",
    _CODE: 403,
  } as const,
  NOT_FOUND: {
    message: "Not Found",
    _CODE: 404,
  } as const,
  CONFLICT: {
    message: "Conflict",
    _CODE: 409,
  } as const,
  INTERNAL_SERVER_ERROR: {
    message: "Internal Server Error",
    _CODE: 500,
  } as const,
  TOO_MANY_REQUESTS: {
    message: "Too many requests",
    _CODE: 429,
  } as const,
  UNVERIFIED_ACCOUNT: {
    message: "Unverified account",
    _CODE: 434,
  } as const,
  RETRIEVED_SUCCESSFULLY: {
    message: "Retrieved successfully",
    _CODE: 200,
  } as const,
  INVALID_FILE_KEY: {
    message: "Bad request: Invalid file key",
    400: 400,
  } as const,
  FILE_UPLOADED_SUCCESSFULLY: {
    message: "File uploaded successfully",
    _CODE: 201,
  } as const,
  INVALID_FILE_TYPE: {
    message: "Bad request: Invalid file type",
    _CODE: 400,
  } as const,
  NO_FILES_SELECTED: {
    message: "Bad request: No files selected",
    _CODE: 400,
  } as const,
  INVALID_INPUT: {
    message: "Invalid input",
    _CODE: 400,
  } as const,
  REQ_MUST_INCLUDE_ID: {
    message: "Bad request: Request must include ID",
    _CODE: 400,
  } as const,
  INCORRECT_CREDENTIALS: {
    message: "Unauthorized: Incorrect credentials",
    _CODE: 401,
  } as const,
  INVALID_PERMISSION: {
    message: "Bad request: Inavlid Permission",
    _CODE: 400,
  } as const,
};
