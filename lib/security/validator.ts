// lib/security/validator.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Request Validation with Zod
// ============================================================

import { NextRequest } from 'next/server';
import { z, ZodSchema } from 'zod';

/**
 * Parses and validates the JSON body of a NextRequest against a Zod schema.
 * Throws ZodError if validation fails, which API routes should catch.
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON body',
      path: [],
    }]);
  }

  return schema.parse(body);
}

/**
 * Sanitize string input — strip HTML tags, normalize whitespace
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')          // Strip HTML
    .replace(/javascript:/gi, '')     // Strip JS protocol
    .replace(/\s{3,}/g, '  ')         // Normalize whitespace
    .trim();
}

/**
 * Validate UUID format
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
