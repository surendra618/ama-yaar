// Usage: router.post('/', validate(schema), handler)
// `schema` is a Zod schema validated against { body, params, query }.
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    return next(new ApiError(400, 'Validation failed', result.error.flatten()));
  }
  next();
};

module.exports = validate;
