import { create, enforce, test } from 'vest'

export interface LoginCredential {
  identifier: string
  password: string
}

export const suite = create((data: Partial<LoginCredential> = {}) => {
  test('identifier', 'Identifier is required', () => {
    enforce(data.identifier).isNotBlank()
  })

  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank()
  })
})
