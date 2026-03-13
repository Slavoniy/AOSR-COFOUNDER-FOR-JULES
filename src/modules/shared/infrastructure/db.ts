import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

export const memoryUsers: any[] = [];
export const memoryProjects: any[] = [];
export const memoryNotifications: any[] = [];
