import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { subDays, startOfDay } from 'date-fns';

export async function GET(request) {
    const today = startOfDay(new Date());
    const currentPeriodDaysAgo = subDays(today, 7);
    const previousPeriodDaysAgo = subDays(today, 14);
    
    try {
        const currentPeriod = await prisma.thing.findMany({
            where: {
                createdAt: {
                    gte: currentPeriodDaysAgo,
                    lt: today,
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    
        const previousPeriod = await prisma.thing.findMany({
            where: {
                createdAt: {
                    gte: previousPeriodDaysAgo,
                    lt: currentPeriodDaysAgo,
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json({
            currentPeriod,
            previousPeriod 
        }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}