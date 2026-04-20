import { kv } from '@vercel/kv';

export interface Publication {
  title: string;
  slug: string;
  authors: string;
  meta: string;
  image: string;
  link: string;
  tags: string[];
}

const KV_KEY = 'publications';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function loadFromStaticData(): Promise<Publication[]> {
  try {
    const mod = await import('@/app/publications/data');
    return (mod.publications ?? []) as Publication[];
  } catch {
    return [];
  }
}

export async function getPublications(): Promise<Publication[]> {
  try {
    const stored = await kv.get<Publication[]>(KV_KEY);
    if (stored && stored.length > 0) return stored;

    // First run: seed from static data.ts
    const staticPubs = await loadFromStaticData();
    if (staticPubs.length > 0) {
      await kv.set(KV_KEY, staticPubs);
      return staticPubs;
    }
    return [];
  } catch (error) {
    console.error('Error reading publications from KV:', error);
    // Fallback to static data so public pages still render
    return loadFromStaticData();
  }
}

export async function addPublication(publicationData: Omit<Publication, 'slug'>): Promise<Publication | null> {
  try {
    const publications = await getPublications();
    const slug = generateSlug(publicationData.title);

    if (publications.some(p => p.slug === slug)) {
      throw new Error('Publication with this title already exists');
    }

    const newPublication: Publication = { ...publicationData, slug };
    const updated = [newPublication, ...publications];
    await kv.set(KV_KEY, updated);
    return newPublication;
  } catch (error) {
    console.error('Error adding publication:', error);
    return null;
  }
}

export async function updatePublication(slug: string, updateData: Partial<Omit<Publication, 'slug'>>): Promise<boolean> {
  try {
    const publications = await getPublications();
    const index = publications.findIndex(p => p.slug === slug);
    if (index === -1) return false;

    const updated = { ...publications[index], ...updateData };
    if (updateData.title && updateData.title !== publications[index].title) {
      updated.slug = generateSlug(updateData.title);
    }
    publications[index] = updated;
    await kv.set(KV_KEY, publications);
    return true;
  } catch (error) {
    console.error('Error updating publication:', error);
    return false;
  }
}

export async function deletePublication(slug: string): Promise<boolean> {
  try {
    const publications = await getPublications();
    const filtered = publications.filter(p => p.slug !== slug);
    if (filtered.length === publications.length) return false;
    await kv.set(KV_KEY, filtered);
    return true;
  } catch (error) {
    console.error('Error deleting publication:', error);
    return false;
  }
}

export async function getPublicationBySlug(slug: string): Promise<Publication | null> {
  try {
    const publications = await getPublications();
    return publications.find(p => p.slug === slug) ?? null;
  } catch (error) {
    console.error('Error finding publication by slug:', error);
    return null;
  }
}

export async function seedPublicationsFromJson(data: Publication[]): Promise<boolean> {
  try {
    await kv.set(KV_KEY, data);
    return true;
  } catch (error) {
    console.error('Error seeding publications into KV:', error);
    return false;
  }
}
