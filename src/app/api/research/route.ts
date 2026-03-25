import { NextResponse } from 'next/server';
import { getResearch } from '@/lib/research';

export async function GET() {
  try {
    const research = await getResearch();
    return NextResponse.json(research);
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research' },
      { status: 500 }
    );
  }
}
