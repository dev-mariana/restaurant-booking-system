export interface ILogger {
  info(data: Record<string, unknown>, msg?: string): void;
  warn(data: Record<string, unknown>, msg?: string): void;
  error(data: Record<string, unknown>, msg?: string): void;
}

export const noopLogger: ILogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};
