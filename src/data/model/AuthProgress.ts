/**
 *       +----------------------------------------+
 *       V                                        |
 * +--------------+     +-------------+     +------------+
 * | UNAUTHORIZED | --> | IN_PROGRESS | --> | AUTHORIZED |
 * +--------------+     +-------------+     +------------+
 *                          |  A
 *                          |  |
 *                          V  |
 *                        +-------+
 *                        | ERROR |
 *                        +-------+
 */
export type AuthProgress =
  | 'UNAUTHORIZED'
  | 'IN_PROGRESS'
  | 'AUTHORIZED'
  | 'ERROR'
