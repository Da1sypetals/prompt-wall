export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.PROMPT_WALL_PASSWORD;
  if (!correctPassword) {
    throw new Error('PROMPT_WALL_PASSWORD environment variable is not set');
  }
  return password === correctPassword;
}
