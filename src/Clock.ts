import getUnixTime from 'date-fns/getUnixTime'

export interface Clock {
  currentTimeSeconds(): number
}

export class DefaultClock implements Clock {
  currentTimeSeconds(): number {
    return getUnixTime(new Date())
  }
}

export default new DefaultClock()
