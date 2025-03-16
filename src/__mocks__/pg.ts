// filepath: /Users/ap/WebstormProjects/nextjs-dashboard/__mocks__/pg.ts
const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
};
const Pool = jest.fn(() => mPool);

export { Pool };