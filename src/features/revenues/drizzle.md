# Drizzle

## Select vs Query

You should use db.select() when you want to build flexible, SQL-like queries with Drizzle’s type-safe query builder. This method allows you to select all or specific columns, use expressions, partial selects, and advanced query features directly in a fluent, composable way [(1)](https://orm.drizzle.team/docs/select)  [(2)](https://orm.drizzle.team/docs/select) .

The db.query.<table>.findMany() approach is used for a more concise, table-centric API that allows you to specify columns to include or exclude in the result. This is ideal when you want quick, structured access to a table’s data with simple options for controlling which columns are returned [(1)](https://orm.drizzle.team/docs/select) .

Example of select:
```typescript
const result = await db.select().from(users);
```
Example of query:
```typescript
await db.query.posts.findMany({
 columns: {
   title: true,
 },
});
```
Use select for more advanced, custom, or dynamic queries. Use query for simpler, table-focused access patterns and when you want to easily include or exclude columns.

### Prompt: What are the strengths of Drizzle Query?

The query API in Drizzle offers several strengths:

- It provides a concise, table-centric syntax for fetching data, making it easy to include related data (like nested relations) in a single call. [(1)](https://orm.drizzle.team/docs/rqb)
- You can use the with operator to combine and aggregate data from multiple related tables and fetch deeply nested relational data.- It supports partial field selection using the columns parameter, so you can control which columns to include or exclude, optimizing the amount of data transferred.- The API always outputs exactly one SQL query, ensuring efficient performance, especially when fetching nested or related data. [(2)](https://orm.drizzle.team/docs/overview)
- It is designed for great developer experience with type inference and type safety for all returned data. [(1)](https://orm.drizzle.team/docs/rqb)

### Prompt: What are the strengths of Drizzle Select?

The select API in Drizzle has several strengths:

- It offers a flexible, SQL-like query builder that supports advanced and dynamic query construction, including selecting all or only specific columns, using expressions, and partial selects [(1)](https://orm.drizzle.team/docs/select) ,  [(2)](https://orm.drizzle.team/docs/select) .
- It enables you to compose queries with complex filters, ordering, pagination, subqueries, and aggregations, closely mirroring raw SQL capabilities while remaining type-safe and composable [(1)](https://orm.drizzle.team/docs/select) ,  [(2)](https://orm.drizzle.team/docs/select) .
- You can include arbitrary SQL expressions using the sql template operator, allowing for custom computed fields and advanced use cases [(3)](https://orm.drizzle.team/docs/sql) .
- The select API guarantees explicit control over the fields returned and their order, which can help prevent issues with column ordering and optimize query performance [(1)](https://orm.drizzle.team/docs/select) .
- It supports parameterized queries and safe interpolation to help prevent SQL injection,  [(2)](https://orm.drizzle.team/docs/select) ,  [(3)](https://orm.drizzle.team/docs/sql) .
- All result types are inferred automatically based on the table definition, including correct handling of column nullability and types [(1)](https://orm.drizzle.team/docs/select) ,  [(2)](https://orm.drizzle.team/docs/select) .
