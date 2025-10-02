# Drizzle Errors

Drizzle Errors have type `DrizzleQueryError` which are basically just PostgresSQL errors.

`DrizzleQueryError` has the following properties:

- `code`
- `detail`
- `hint`
- `message`
- `position`
- `schema`
- `table`
- `where`
- `file`
- `line`
