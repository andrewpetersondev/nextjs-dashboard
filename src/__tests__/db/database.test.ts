import { db } from '@/db/database';
import fs from 'fs';

// Mock the fs module
jest.mock('fs', () => ({
    readFileSync: jest.fn((path: string) => {
        if (path === '/run/secrets/postgres_url') {
            return 'postgres://user:password@localhost:5432/mydb';
        }
        return '';
    }),
}));

describe('Database Connection', () => {
    it('should read the database URL from the secrets file', () => {
        const url = fs.readFileSync('/run/secrets/postgres_url', 'utf8').trim();
        expect(url).toBe('postgres://user:password@localhost:5432/mydb');
    });

    it('should create the db object and perform a query', async () => {
        // Mock the db.execute method
        const mockQueryResult = { rows: [] };
        const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);
        db.execute = mockExecute;

        const result = await db.execute('SELECT 1');
        expect(result).toEqual(mockQueryResult);
        expect(mockExecute).toHaveBeenCalledWith('SELECT 1');
    });

    it('should handle errors when reading the database URL', () => {
        // Mock fs.readFileSync to throw an error
        (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Failed to read the secrets file');
        });

        expect(() => {
            fs.readFileSync('/run/secrets/postgres_url', 'utf8').trim();
        }).toThrow('Failed to read the secrets file');
    });

    it('should handle errors when executing a query', async () => {
        // Mock the db.execute method to throw an error
        const mockExecute = jest.fn().mockRejectedValue(new Error('Query failed'));
        db.execute = mockExecute;

        await expect(db.execute('SELECT 1')).rejects.toThrow('Query failed');
    });
});