//// Example of a professional "Value Object" wrapper
//import type { AppError } from "@/shared/errors/core/app-error.entity";
//import type { Result } from "@/shared/results/result.types";
//
//export class ResultWrapper<T, E extends AppError> {
//  private readonly _inner: Result<T, E>;
//
//    constructor(_inner: Result<T, E>) { this._inner = _inner; }
//  map<U>(fn: (v: T) => U): ResultWrapper<U, E> {
//   // ...
//  }
//  flatMap<U, F extends AppError>(
//    fn: (v: T) => Result<U, F>,
//  ): ResultWrapper<U, E | F> {
//    ...
//  }
//}
