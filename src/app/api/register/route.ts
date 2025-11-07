import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

// Helper to read from db.json
const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return { users: [] };
    }
    throw error;
  }
};

// Helper to write to db.json
// NOTE: This will not work on Vercel's read-only filesystem in production.
const writeDb = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to write to db.json", error);
  }
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const db = readDb();

    if (db.users.find(u => u.username === username)) {
      return new NextResponse('User already exists', { status: 400 });
    }

    const newUser = { username, password }; // In a real app, hash the password!
    db.users.push(newUser);
    writeDb(db);

    return new NextResponse('User registered successfully', { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
