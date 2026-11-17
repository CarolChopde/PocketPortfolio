import { PrismaClient } from '@prisma/client';

// Instantiate PrismaClient for database operations across the app
const prisma = new PrismaClient();

export default prisma;
