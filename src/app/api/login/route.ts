import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

interface User {
  username: string;
  password?: string; // Password might not always be present, e.g., when verifying JWT
}

const dbPath = path.join(process.cwd(), 'db.json');
const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Helper to read from db.json
const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data) as { users: User[] };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return { users: [] };
    }
    throw error;
  }
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const db = readDb();

    const user = db.users.find((u: User) => u.username === username && u.password === password);

    if (!user) {
      return new NextResponse('Invalid credentials', { status: 400 });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
