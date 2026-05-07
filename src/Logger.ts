export interface Logger {
  log(...args: unknown[]): void
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
  debug(...args: unknown[]): void
  withTag(tag: string): Logger
}

export class ConsoleLogger implements Logger {
  constructor(private readonly tag?: string) {}

  private get prefix(): string[] {
    return this.tag ? [`[${this.tag}]`] : []
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
    return new ConsoleLogger(this.tag ? `${this.tag}:${tag}` : tag)
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
