import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    
    const email = searchParams.get('email');

    try {
        let conditions = {};

        if (email) {
            conditions.where = {
                email
            }
        }

        const user = await prisma.user.findFirst(conditions);

        return NextResponse.json(user ? user : null, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
