/**
 * Iterative factorial calculation function to keep the JS thread busy
 * @param n the number to calculate factorial for
 * @returns the factorial of n (n!)
 */
export function factorial(n: number): number {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    // Add some extra computation to make it slower
    Math.sqrt(result);
    Math.sin(i);
  }

  return result;
}
