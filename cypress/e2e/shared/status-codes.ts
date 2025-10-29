export const STATUS_CODES = {
  badRequest: 400,
  conflict: 409,
  created: 201,
  forbidden: 403,
  internalServerError: 500,
  notFound: 404,
  ok: 200,
  unauthorized: 401,
} as const satisfies Readonly<Record<string, number>>;
