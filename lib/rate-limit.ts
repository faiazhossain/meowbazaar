/**
 * Rate limiting utilities for API endpoints and auth actions
 * Provides in-memory rate limiting for development and production-ready structure
 */

// In-memory store for development (should use Redis in production)
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (email, IP, userId, etc.)
 * @param options - Rate limiting options
 * @returns Object indicating if request is allowed
 */
export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: Date;
  message?: string;
}

export interface RateLimitOptions {
  windowMs?: number;      // Time window in milliseconds (default: 10 minutes)
  maxRequests?: number;   // Maximum requests per window (default: 10)
}

/**
 * Check rate limit using in-memory storage
 * Note: In production, use Redis-based rate limiting for distributed systems
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const { windowMs = 10 * 60 * 1000, maxRequests = 10 } = options;
  const now = Date.now();
  const resetTime = new Date(now + windowMs);

  // Get or create rate limit entry
  let entry = inMemoryStore.get(identifier);

  if (!entry || now >= entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    inMemoryStore.set(identifier, entry);
  } else {
    // Increment count
    entry.count += 1;
    inMemoryStore.set(identifier, entry);
  }

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const remaining = 0;
    return {
      success: false,
      remaining,
      resetTime: new Date(entry.resetTime),
      message: getRateLimitMessage(options),
    };
  }

  // Success
  const remaining = maxRequests - entry.count;
  return {
    success: true,
    remaining,
    resetTime: new Date(entry.resetTime),
  };
}

/**
 * Get user-friendly rate limit message
 */
function getRateLimitMessage(options: RateLimitOptions): string {
  const windowMinutes = Math.round((options.windowMs || 10 * 60 * 1000) / 60 / 1000);

  if (windowMinutes <= 1) {
    return `খুব দ্রুত অপেক্ষা 1 মিনিটে আবার চেষ্টা করুন।`;
  }

  return `খুব দ্রুত ${windowMinutes} মিনিটে ${options.maxRequests || 10} বার অনুরোধ দিতে পার পাবেন।`;
}

/**
 * Reset rate limit for a specific identifier (admin use)
 * @param identifier - The identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  inMemoryStore.delete(identifier);
}

/**
 * Clean up expired rate limit entries
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of inMemoryStore.entries()) {
    if (now >= entry.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}

/**
 * Get rate limit info for display purposes
 * @param identifier - Unique identifier
 * @param options - Rate limiting options
 */
export async function getRateLimitInfo(
  identifier: string,
  options: RateLimitOptions = {}
) {
  const result = await checkRateLimit(identifier, options);

  return {
    limit: options.maxRequests || 10,
    remaining: result.remaining ?? 10,
    resetAt: result.resetTime,
    isBlocked: !result.success,
    message: result.message,
  };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,               // 5 attempts
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 3,               // 3 attempts
  },
  registration: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 3,               // 3 attempts
  },
  api: {
    windowMs: 1 * 60 * 1000,   // 1 minute
    maxRequests: 60,              // 60 requests
  },
  cart: {
    windowMs: 1 * 60 * 1000,   // 1 minute
    maxRequests: 20,              // 20 actions
  },
  checkout: {
    windowMs: 10 * 60 * 1000,  // 10 minutes
    maxRequests: 5,               // 5 attempts
  },
};

/**
 * Helper function to check rate limit with pre-configured settings
 */
export async function checkAuthRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(identifier, rateLimiters.auth);
}

export async function checkPasswordResetRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(identifier, rateLimiters.passwordReset);
}

export async function checkRegistrationRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(identifier, rateLimiters.registration);
}
