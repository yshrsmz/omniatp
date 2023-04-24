/**
 *                             +----------------------------------------+
 *                             V                                        |
 * +--------------+     +--------------+     +-------------+     +------------+
 * | INITIALIZING |---->| UNAUTHORIZED | --> | IN_PROGRESS | --> | AUTHORIZED |
 * +--------------+     +--------------+     +-------------+     +------------+
 *                             A                 |  A
 *                             |                 |  |
 *                             |                 V  |
 *                             |               +-------+
 *                             +---------------| ERROR |
 *                                             +-------+
 */

export type INITIALIZING = { type: 'INITIALIZING' }
export type UNAUTHORIZED = { type: 'UNAUTHORIZED' }
export type IN_PROGRESS = { type: 'IN_PROGRESS' }
export type AUTHORIZED = { type: 'AUTHORIZED' }
export type ERROR = { type: 'ERROR'; message: string }

export const AuthProgress = {
  INITIALIZING: () => ({ type: 'INITIALIZING' } satisfies INITIALIZING),
  UNAUTHORIZED: () => ({ type: 'UNAUTHORIZED' } satisfies UNAUTHORIZED),
  IN_PROGRESS: () => ({ type: 'IN_PROGRESS' } satisfies IN_PROGRESS),
  AUTHORIZED: () => ({ type: 'AUTHORIZED' } satisfies AUTHORIZED),
  ERROR: (message: string) => ({ type: 'ERROR', message } satisfies ERROR),
}

export type AuthProgress =
  | INITIALIZING
  | UNAUTHORIZED
  | IN_PROGRESS
  | AUTHORIZED
  | ERROR
