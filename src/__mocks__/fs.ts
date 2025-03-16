// filepath: /Users/ap/WebstormProjects/nextjs-dashboard/__mocks__/fs.ts
const readFileSync = jest.fn(() => 'postgres://user:password@localhost:5432/mydb');

export { readFileSync };