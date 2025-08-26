/**
 * Generate a random ID for database entities
 * Creates a 12-digit random string of numbers
 */
export function generateRandomId(length: number = 12): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().substring(2);
  const combined = timestamp + random;
  
  // Ensure we always get the requested length
  let id = '';
  for (let i = 0; i < length; i++) {
    id += combined[i % combined.length];
  }
  
  return id;
}

/**
 * Generate a girl-specific ID with a prefix
 */
export function generateGirlId(): string {
  return generateRandomId(12);
}