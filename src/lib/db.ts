import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;
declare global {
    var prisma: PrismaClient | undefined;
}

const adapter = new PrismaNeon({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = globalThis.prisma || new PrismaClient({ adapter } as any);

if (process.env.NODE_ENV === 'development') globalThis.prisma = prisma;

export default prisma;