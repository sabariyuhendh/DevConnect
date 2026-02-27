import { Response } from 'express';

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type MCPMeta = {
  module: string;
  version: string;
  capabilities?: string[];
};

type SuccessResponse<T> = {
  status: 'success';
  data: T;
  message?: string;
  meta?: PaginationMeta;
  mcp?: MCPMeta;
};

type ErrorResponse = {
  status: 'error';
  message: string;
  error?: any;
  errors?: Array<{ field: string; message: string }>;
};

export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message = 'Operation successful',
  meta?: PaginationMeta,
  mcpModule?: string
): Response<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = { status: 'success', data, message };
  
  if (meta) {
    response.meta = meta;
  }
  
  // Add MCP metadata for microservices compatibility
  if (mcpModule) {
    response.mcp = {
      module: mcpModule,
      version: '1.0.0'
    };
  }
  
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: any,
  errors?: Array<{ field: string; message: string }>
): Response<ErrorResponse> => {
  const response: ErrorResponse = { status: 'error', message };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

export const notFoundResponse = (res: Response, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

export const unauthorizedResponse = (res: Response, message = 'Not authorized to access this resource') => {
  return errorResponse(res, message, 401);
};

export const forbiddenResponse = (res: Response, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

export const validationErrorResponse = (
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message = 'Validation failed'
) => {
  return errorResponse(res, message, 400, undefined, errors);
};

export const serverErrorResponse = (res: Response, error: Error) => {
  console.error('Server Error:', error);
  return errorResponse(
    res,
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development' ? error : undefined
  );
};

export const asyncHandler = (fn: Function) => 
  (req: any, res: Response, next: any) => 
    Promise.resolve(fn(req, res, next)).catch(next);

export {};
