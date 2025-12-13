# When to Use AppError

AppError is an “application/boundary-friendly error.” It tends to carry:

- stable codes
- metadata useful to translate into UI/HTTP responses

That’s fine for:

- server actions / routes
- application services/workflows
- infrastructure adapters if they’re mapping technical failures upward

But for pure domain policy decisions (like “absolute lifetime exceeded”), you often get better separation by not using AppError and instead returning a domain policy outcome.

A useful mental model:

- Policy decision → return a domain policy outcome type (value)
- Technical failure → return Err(AppError) (or a narrower infra error mapped to AppError one layer up)

If you later want to improve boundary separation, you can introduce narrower error types internally (e.g. SessionCodecError, CookieWriteError) and map them to AppError at the route/action boundary. But you don’t have to do that now.
