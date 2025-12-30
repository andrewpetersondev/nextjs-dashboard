# Today's Concerns

Goals for today:

## Result and AppError

Result extends `AppError` so every `result` has to be an app error. change `Result` so it defaults to `AppError`
instead because then i can use custom errors when needed.

Right now when I have code that is expected to return `null` or `undefined` I have to use AppError which is not ideal.

## Logging
