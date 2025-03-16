import { DockerComposeEnvironment, Wait } from "testcontainers";
import { db } from '@/db/database';

const composeFilePath = "/Users/ap/WebstormProjects/nextjs-dashboard";
const composeFile = "compose.dev.yaml";

const environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withProjectName("testcontainers")
    .withWaitStrategy("db-1", Wait.forLogMessage("database system is ready to accept connections"))
    .withWaitStrategy("adminer-1", Wait.forLogMessage("PHP 8.4.5 Development Server (http://[::]:8080) started"))
    .withWaitStrategy("web-1", Wait.forLogMessage("Starting..."))
    .withBuild()
    .up();

describe('Database Connection', () => {
    beforeAll(async () => {
        await environment;
    });

    afterAll(async () => {
        await environment.down({ removeVolumes: false });
    });

    it('should connect to the database', async () => {
        const client = db.$client;
        await client.connect();
        const res = await client.query('SELECT 1 + 1 AS result');
        expect(res.rows[0].result).toBe(2);
    });
});