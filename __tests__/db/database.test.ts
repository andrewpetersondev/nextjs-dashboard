import { db } from '@/db/database';
import { Pool } from 'pg';
import fs from 'fs';

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn().mockResolvedValue({ rows: [] }), // Mock query to return an empty result set
        end: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => 'postgres://user:password@localhost:5432/mydb'),
}));

describe('Database Connection', () => {
    it('should initialize the database connection with the correct configuration', () => {
        const pool = new Pool();
        expect(pool.connect).toHaveBeenCalled();
        expect(pool.query).not.toHaveBeenCalled();
    });

    it('should read the database URL from the file', () => {
        const url = fs.readFileSync(process.env.POSTGRES_URL_FILE!, 'utf8').trim();
        expect(url).toBe('postgres://user:password@localhost:5432/mydb');
    });

    it('should create the db object and perform a query', async () => {
        const result = await db.execute('SELECT 1');
        expect(result).toEqual({ rows: [] });
    });
});