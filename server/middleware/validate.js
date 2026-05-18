import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      400,
      'Validation failed',
      errors.array().map((e) => e.msg)
    );
  }
  next();
};

export default validate;
