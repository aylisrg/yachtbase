import { listYachts } from '@/lib/yachts';
import { NextResponse } from 'next/server';

export async function GET() {
  const yachts = await listYachts();

  return NextResponse.json({
    data: yachts,
    count: yachts.length,
  });
}
