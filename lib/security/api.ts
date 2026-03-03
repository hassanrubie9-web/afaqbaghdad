import { NextResponse } from 'next/server';
import { z } from 'zod';

export function jsonOk(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonErr(message: string, code = 'ERROR', status = 400, extra?: any) {
  return NextResponse.json({ code, message, ...(extra ?? {}) }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof z.ZodError) {
    return jsonErr('خطأ في التحقق من المدخلات', 'VALIDATION_ERROR', 400, { details: err.flatten() });
  }
  return jsonErr('حدث خطأ داخلي غير متوقع', 'INTERNAL_ERROR', 500);
}
