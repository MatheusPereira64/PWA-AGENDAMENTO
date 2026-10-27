export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isSlotConflict(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const message = 'message' in error ? String(error.message) : ''
  const code = 'code' in error ? String(error.code) : ''
  return message.includes('appointment_no_overlap') || message.includes('23P01') || code === '23P01'
}
