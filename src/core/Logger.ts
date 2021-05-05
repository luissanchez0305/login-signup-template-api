import { LoggerService } from '@nestjs/common';
import * as pino from 'pino';

export class Logger implements LoggerService {
  private readonly pretty: boolean = process.env.NODE_ENV !== 'production';
  private static PINO: pino.Logger;

  constructor(private readonly context: string = 'Default') {
    if (!Logger.PINO) {
      const options: pino.LoggerOptions = {
        level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
      };
      if (this.pretty) {
        options.prettyPrint = {
          translateTime: `yyyy-mm-dd HH:MM:ss.l o`,
          colorize: true,
        };
      }
      Logger.PINO = pino(options);
    }
  }

  public setLoggingLevel(level: pino.LevelWithSilent): void {
    Logger.PINO.level = level;
  }

  public getPINO(): pino.Logger {
    return Logger.PINO;
  }

  /**
   * @param message Can be a string or an object with arbitrary properties that
   * will all get logged as JSON. If using the object form, can use the `msg`
   * property to include a string message.
   * @param context This replaces the string that was used during instantiation
   * of the logger and is meant to help locate the log. It is not an alternative
   * to the message parameter or an additional message.
   */
  public log = (message: any, context?: string): void => {
    const logStatement = this.getMessage(message, context);
    Logger.PINO.info(logStatement);
  };

  /**
   * @param message Can be a string or an object with arbitrary properties that
   * will all get logged as JSON. If using the object form, can use the `msg`
   * property to include a string message.
   * @param context This replaces the string that was used during instantiation
   * of the logger and is meant to help locate the log. It is not an alternative
   * to the message parameter or an additional message.
   */
  public exception = (error: Error, message?: any, context?: string): void => {
    const logStatement = {
      ...this.getMessage(message, context),
      error,
      stack: error.stack,
    };
    Logger.PINO.error(logStatement);
  };

  /**
   * You probably want logger.exception, this is for custom use of error-level
   * logging, generally when an Error object isn't available
   *
   * @param message Can be a string or an object with arbitrary properties that
   * will all get logged as JSON. If using the object form, can use the `msg`
   * property to include a string message.
   * @param trace This is typically Error.stack
   * @param context This replaces the string that was used during instantiation
   * of the logger and is meant to help locate the log. It is not an alternative
   * to the message parameter or an additional message.
   */
  public error = (message: any, trace = '', context?: string): void => {
    const logStatement: Record<string, unknown> = {
      ...this.getMessage(message, context),
      stack: trace,
    };
    Logger.PINO.error(logStatement);
  };

  /**
   * @param message Can be a string or an object with arbitrary properties that
   * will all get logged as JSON. If using the object form, can use the `msg`
   * property to include a string message.
   * @param context This replaces the string that was used during instantiation
   * of the logger and is meant to help locate the log. It is not an alternative
   * to the message parameter or an additional message.
   */
  public warn = (message: any, context?: string): void => {
    const logStatement = this.getMessage(message, context);
    Logger.PINO.warn(logStatement);
  };

  private getMessage = (
    message: any,
    context?: string,
  ): Record<string, unknown> => {
    if (typeof message === 'object') {
      return { ...message, context: this.getContext(context) };
    }
    if (this.pretty) {
      return { msg: `[${this.getContext(context)}] ${message}` };
    }
    return { context: this.getContext(context), msg: message };
  };

  private getContext = (context?: string): string => {
    return context ? context : this.context;
  };
}
