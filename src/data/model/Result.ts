export interface Success<T> {
  success: true
  data: T
}

export interface Failure {
  success: false
  error: Error
}

export type Result<T = void> = Success<T> | Failure
