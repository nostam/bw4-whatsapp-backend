class APIError extends Error {
  constructor(message, statusCode = 500, operational = true) {
    super(message);
    this.httpStatusCode = statusCode;
    this.message = message;
    this.isOperational = operational;
  }
}

const accessTokenOptions = {
  httpOnly: true,
  path: "/",
  overwrite: true,
};

const refreshTokenOptions = {
  httpOnly: true,
  path: "/users/refreshToken",
  overwrite: true,
};

const httpErrorHandler = (err, req, res, next) => {
  if (!res.headersSent) {
    res.status(err.httpStatusCode || 500).send({ message: err.message });
  }
};

module.exports = {
  APIError,
  accessTokenOptions,
  refreshTokenOptions,
  httpErrorHandler,
};
