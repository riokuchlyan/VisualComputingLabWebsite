import { kv } from '@vercel/kv';

export interface ResearchProject {
  title: string;
  slug: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
  authors: string;
  status: 'present' | 'past';
}

export interface ResearchData {
  present: ResearchProject[];
  past: ResearchProject[];
}

const KV_KEY = 'research';

const DEFAULT_DATA: ResearchData = { present: [], past: [] };

export async function getResearch(): Promise<ResearchData> {
  try {
    const stored = await kv.get<ResearchData>(KV_KEY);
    if (stored) return stored;
    await kv.set(KV_KEY, DEFAULT_DATA);
    return DEFAULT_DATA;
  } catch (error) {
    console.error('Error reading research data from KV:', error);
    return DEFAULT_DATA;
  }
}

export async function getResearchBySlug(slug: string): Promise<ResearchProject | null> {
  try {
    const data = await getResearch();
    return [...data.present, ...data.past].find(p => p.slug === slug) ?? null;
  } catch (error) {
    console.error('Error finding research by slug:', error);
    return null;
  }
}

export async function addResearch(project: ResearchProject): Promise<boolean> {
  try {
    const data = await getResearch();
    const list = project.status === 'present' ? data.present : data.past;
    if (list.some(p => p.slug === project.slug)) return false;
    const updated: ResearchData = {
      present: project.status === 'present' ? [project, ...data.present] : data.present,
      past: project.status === 'past' ? [project, ...data.past] : data.past,
    };
    await kv.set(KV_KEY, updated);
    return true;
  } catch (error) {
    console.error('Error adding research project:', error);
    return false;
  }
}

export async function updateResearch(slug: string, updates: Partial<ResearchProject>): Promise<boolean> {
  try {
    const data = await getResearch();
    const allProjects = [...data.present, ...data.past];
    const index = allProjects.findIndex(p => p.slug === slug);
    if (index === -1) return false;
    allProjects[index] = { ...allProjects[index], ...updates };
    const updated: ResearchData = {
      present: allProjects.filter(p => p.status === 'present'),
      past: allProjects.filter(p => p.status === 'past'),
    };
    await kv.set(KV_KEY, updated);
    return true;
  } catch (error) {
    console.error('Error updating research project:', error);
    return false;
  }
}

export async function deleteResearch(slug: string): Promise<boolean> {
  try {
    const data = await getResearch();
    const updated: ResearchData = {
      present: data.present.filter(p => p.slug !== slug),
      past: data.past.filter(p => p.slug !== slug),
    };
    const removed =
      updated.present.length + updated.past.length <
      data.present.length + data.past.length;
    if (!removed) return false;
    await kv.set(KV_KEY, updated);
    return true;
  } catch (error) {
    console.error('Error deleting research project:', error);
    return false;
  }
}

export async function seedResearchFromJson(data: ResearchData): Promise<boolean> {
  try {
    await kv.set(KV_KEY, data);
    return true;
  } catch (error) {
    console.error('Error seeding research into KV:', error);
    return false;
  }
}
