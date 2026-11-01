// Every error ends here and is sent in the same JSON shape.
const { HttpError } = require("../routes/students");

const notFound = (req, res, next) => next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found.`));

function errorHandler(err, req, res, next) {
  let status = err.status || 500, message = err.message, errors = err.errors;

  if (err.name === "ValidationError") {                      // Mongoose schema rules failed
    status = 400; message = "Validation failed."; errors = {};
    for (const [field, e] of Object.entries(err.errors)) errors[field] = e.kind === "Number" || e.name === "CastError" ? `${field} must be a number.` : e.message;
  } else if (err.code === 11000) {                           // duplicate key (unique rollNo)
    status = 409; const field = Object.keys(err.keyPattern || { rollNo: 1 })[0];
    message = `${field} already exists.`; errors = { [field]: `${field} already exists.` };
  } else if (err.name === "CastError") { status = 400; message = `${err.path} has an invalid value.`; }
  else if (err.type === "entity.parse.failed") { status = 400; message = "Request body is not valid JSON."; }
  else if (err.type === "entity.too.large") { status = 413; message = "Request body is too large."; }

  if (status === 500) { console.error(err); message = "Internal server error."; errors = undefined; }
  res.status(status).json({ success: false, message, ...(errors && { errors }) });
}

module.exports = { notFound, errorHandler };
