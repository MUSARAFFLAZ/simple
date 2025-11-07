import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json({ message: `Welcome, ${user.username}! This is your protected profile.` });

  } catch (error) {
    console.error('Profile error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
