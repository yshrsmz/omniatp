export type StatusCode = 401

export interface ResponseError {
  status: StatusCode
  error: string
  success: boolean
}
