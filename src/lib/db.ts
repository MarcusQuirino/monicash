import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;

declare global {
    var prisma: PrismaClient | undefined;
}

// Create Prisma client with better error handling
function createPrismaClient() {
    const adapter = new PrismaNeon({ connectionString });

    const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error', 'warn'],
        errorFormat: 'pretty',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return client;
}

// Retry wrapper for database operations
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            const isConnectionError =
                error instanceof Error &&
                (error.message.includes('Connection terminated unexpectedly') ||
                    error.message.includes('Connection timed out') ||
                    error.message.includes('Connection refused') ||
                    error.message.includes('connect ECONNREFUSED'));

            if (isConnectionError && attempt < maxRetries) {
                console.warn(`Database connection failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
    globalThis.prisma = prisma;
}

export default prisma;