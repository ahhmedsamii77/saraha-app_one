export function validation(schema) {
  return (req, res, next) => {
    let validationErrors = [];
    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        validationErrors.push(error?.details);
      }
    }
    if (validationErrors.length) {
      throw new Error("validation error", { cause: 400, errors: validationErrors });
    }
    return next();
  }
}