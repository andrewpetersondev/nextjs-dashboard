# Shared Forms Module

___Implementing for all server actions with form data (Auth User Flow: signup & login; Admin User Flow: create & update
user, & finally Invoice Flow: create & update invoice )___

## Progress

- [ ] Auth Flow
- [ ] Admin Flow
- [ ] Invoice Flow

## Starting Point

- form component sends `formData: FormData` to a Server Action
- `create` & `update` server actions have different schemas because `create` requires all form fields whereas `update`
  does not
- some forms will trigger redirect (`signup`) and some will trigger feedback from server (`create invoice`)
- a good chunk of this code can be unified with slight variations in the action and ui

UI → Action → Service → Repository → DAL

UI ← Action ← Service ← Repository ← DAL

## Common Schema Patterns

Use Zod to transform/parse/validate/normalize as much code from the form as possible. This will make it easier to
maintain and test. Zod

## Create Flow

schema

## Update Flow
