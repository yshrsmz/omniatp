/**
 *       +----------------------------------------+
 *       V                                        |
 * +--------------+     +-------------+     +------------+
 * | UNAUTHORIZED | --> | IN_PROGRESS | --> | AUTHORIZED |
 * +--------------+     +-------------+     +------------+
 *        A                 |  A
 *        |                 |  |
 *        |                 V  |
 *        |               +-------+
 *        +---------------| ERROR |
 *                        +-------+
 */

export type UNAUTHORIZED = { type: 'UNAUTHORIZED' }
export type IN_PROGRESS = { type: 'IN_PROGRESS' }
export type AUTHORIZED = { type: 'AUTHORIZED' }
export type ERROR = { type: 'ERROR'; message: string }

export const AuthProgress = {
  UNAUTHORIZED: () => ({ type: 'UNAUTHORIZED' } satisfies UNAUTHORIZED),
  IN_PROGRESS: () => ({ type: 'IN_PROGRESS' } satisfies IN_PROGRESS),
  AUTHORIZED: () => ({ type: 'AUTHORIZED' } satisfies AUTHORIZED),
  ERROR: (message: string) => ({ type: 'ERROR', message } satisfies ERROR),
}

export type AuthProgress = UNAUTHORIZED | IN_PROGRESS | AUTHORIZED | ERROR
