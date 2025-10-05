# DAL

## Return Null vs Exception

- DAL should return null for operations where null is an acceptable result.
    - If you search database for a record that does not exist, return null.
- DAL should throw exception for operations where null is not an acceptable result.
    - If you try to signup and get an error, throw exception.
