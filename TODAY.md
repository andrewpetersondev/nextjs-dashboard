# Today

## Todo

### Invoices

- Invoice dates should be iso strings in the UI and maybe Actions layer. At some point they should be converted to Date objects for Database inserts.
- create a new DB property called revenue_period. This should be a date for the first day of the month. use foreign key to the Revenues table.
- 

### Revenues

- update period from "YYYY-MM" to "YYYY-MM-DD," but it is just the first day of the month.
- Period branding logic needs to be updated to use the new period format.
- rename revenue to total_amount in the Revenues table.
