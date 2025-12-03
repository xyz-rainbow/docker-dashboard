import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserStorage } from '@/lib/storage';
import { POST as authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, password } = await req.json();
    const userId = (session.user as any).id;

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (password) {
        updates.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = UserStorage.update(userId, updates);

    if (!updatedUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
}
