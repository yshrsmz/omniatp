export interface Logger {
  log(...args: unknown[]): void
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
  debug(...args: unknown[]): void
  withTag(tag: string): Logger
}

export class ConsoleLogger implements Logger {
  private readonly prefix: readonly unknown[]

  constructor(private readonly tag?: string) {
    this.prefix = tag === undefined ? [] : [`[${tag}]`]
  }

  log(...args: unknown[]): void {
    console.log(...this.prefix, ...args)
  }
  info(...args: unknown[]): void {
    console.info(...this.prefix, ...args)
  }
  warn(...args: unknown[]): void {
    console.warn(...this.prefix, ...args)
  }
  error(...args: unknown[]): void {
    console.error(...this.prefix, ...args)
  }
  debug(...args: unknown[]): void {
    console.debug(...this.prefix, ...args)
  }

  withTag(tag: string): Logger {
    return new ConsoleLogger(this.tag === undefined ? tag : `${this.tag}:${tag}`)
  }
}

class NoopLogger implements Logger {
  log(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  debug(): void {}
  withTag(): Logger {
    return this
  }
}

export const noopLogger: Logger = new NoopLogger()
