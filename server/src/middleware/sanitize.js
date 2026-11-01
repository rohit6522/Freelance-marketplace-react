// Strips MongoDB operator keys ("$ne", "$where", ...) and dotted keys from request bodies.
// Query strings are covered by the express-validator rules on each route.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("$") && !key.includes("."))
        .map(([key, v]) => [key, clean(v)])
    );
  }
  return value;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") req.body = clean(req.body);
  next();
};