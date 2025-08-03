/**
 * @file src/features/revenues/revenue-result.repository.ts
 * This file defines the Result class for handling repository operation results.
 * It provides a structured way to represent success and failure outcomes,
 * allowing for better error handling and control flow in repository operations.
 * @remarks
 * This class is not implemented. I am keeping it here as a reference for future use.
 */

import "server-only";

/**
 * Represents the result of a repository operation.
 * This pattern allows for more explicit error handling without throwing exceptions.
 *
 * @template T - The type of data returned on success
 */
export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _data?: T,
    private readonly _error?: Error,
    private readonly _errorCode?: string,
    private readonly _errorDetails?: unknown,
  ) {}

  /**
   * Creates a successful result with data
   *
   * @param data - The data to return
   * @returns A successful Result instance
   */
  public static success<T>(data?: T): Result<T> {
    return new Result<T>(true, data);
  }

  /**
   * Creates a failed result with an error
   *
   * @param error - The error that occurred
   * @param errorCode - Optional error code for categorization
   * @param details - Optional additional error details
   * @returns A failed Result instance
   */
  public static failure<T>(
    error: Error,
    errorCode?: string,
    details?: unknown,
  ): Result<T> {
    return new Result<T>(false, undefined, error, errorCode, details);
  }

  /**
   * Checks if the result is successful
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Checks if the result is a failure
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Gets the data from a successful result
   * @throws Error if called on a failed result
   */
  public get data(): T | undefined {
    if (!this._isSuccess) {
      throw new Error("Cannot access data on a failed result");
    }
    return this._data;
  }

  /**
   * Gets the error from a failed result
   * @throws Error if called on a successful result
   */
  public get error(): Error | undefined {
    if (this._isSuccess) {
      throw new Error("Cannot access error on a successful result");
    }
    return this._error;
  }

  /**
   * Gets the error code from a failed result
   */
  public get errorCode(): string | undefined {
    return this._errorCode;
  }

  /**
   * Gets the error details from a failed result
   */
  public get errorDetails(): unknown {
    return this._errorDetails;
  }

  /**
   * Executes the appropriate callback based on the result status
   *
   * @param onSuccess - Function to execute if result is successful
   * @param onFailure - Function to execute if result is a failure
   * @returns The result of the executed callback
   */
  public match<U>(
    onSuccess: (data?: T) => U,
    onFailure: (error: Error, errorCode?: string, details?: unknown) => U,
  ): U {
    return this._isSuccess
      ? onSuccess(this._data)
      : onFailure(this._error!, this._errorCode, this._errorDetails);
  }
}
