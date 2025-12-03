import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserStorage } from '@/lib/storage';
import { POST as authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const users = UserStorage.getAll().map(({ passwordHash, ...u }) => u);
    return NextResponse.json(users);
}
