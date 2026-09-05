export class AppError extends Error {
  constructor(code, message, statusCode = 400, details) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const assert = (condition, code, message, statusCode = 400) => {
  if (!condition) throw new AppError(code, message, statusCode);
};
