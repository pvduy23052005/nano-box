export abstract class ILogger {
  abstract info(context: Record<string, unknown>, message: string): void;
  abstract warn(context: Record<string, unknown>, message: string): void;
  abstract error(
    context: Record<string, unknown>,
    message: string,
    trace?: string,
  ): void;
}
