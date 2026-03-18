import { APP_NAME, APP_VERSION, API_VERSION } from '@/lib/constants';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: APP_NAME,
    version: APP_VERSION,
    api_version: API_VERSION,
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      yachts: '/api/v1/yachts',
      yacht: '/api/v1/yachts/:id',
      meta: '/api/v1/meta',
    },
  });
}
