import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { seedContentFromJson } from '@/lib/content';
import { seedPublicationsFromJson } from '@/lib/publications';
import { seedResearchFromJson } from '@/lib/research';
import contentData from '@/data/content.json';
import publicationsData from '@/data/publications.json';
import researchData from '@/data/research.json';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const user = verifyAdminToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
  }

  const results = await Promise.allSettled([
    seedContentFromJson(contentData as Parameters<typeof seedContentFromJson>[0]),
    seedPublicationsFromJson(publicationsData as Parameters<typeof seedPublicationsFromJson>[0]),
    seedResearchFromJson(researchData as Parameters<typeof seedResearchFromJson>[0]),
  ]);

  const [content, publications, research] = results.map(r => r.status === 'fulfilled' && r.value);

  return NextResponse.json({
    success: content && publications && research,
    seeded: { content, publications, research },
  });
}
