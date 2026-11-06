import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validate =
  (schemas: {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
  }): RequestHandler =>
  (request, _response, next) => {
    if (schemas.body) request.body = schemas.body.parse(request.body);
    if (schemas.query) {
      const parsedQuery = schemas.query.parse(
        request.query,
      ) as typeof request.query;
      Object.defineProperty(request, "query", {
        value: parsedQuery,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
    if (schemas.params)
      request.params = schemas.params.parse(
        request.params,
      ) as typeof request.params;
    next();
  };
