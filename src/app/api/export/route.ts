import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getWebsiteContent } from '@/lib/content';
import { getPublications } from '@/lib/publications';
import { getResearch } from '@/lib/research';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const user = verifyAdminToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
  }

  const [content, publications, research] = await Promise.all([
    getWebsiteContent(),
    getPublications(),
    getResearch(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    content,
    publications,
    research,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="vcail-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
