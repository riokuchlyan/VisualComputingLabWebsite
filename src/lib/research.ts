import fs from 'fs';
import path from 'path';

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

const RESEARCH_FILE_PATH = path.join(process.cwd(), 'src/data/research.json');

export async function getResearch(): Promise<ResearchData> {
  try {
    if (!fs.existsSync(RESEARCH_FILE_PATH)) {
      // Create default empty structure
      const defaultData: ResearchData = { present: [], past: [] };
      const dataDir = path.dirname(RESEARCH_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(RESEARCH_FILE_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }

    const jsonContent = fs.readFileSync(RESEARCH_FILE_PATH, 'utf-8');
    const data: ResearchData = JSON.parse(jsonContent);
    return data;
  } catch (error) {
    console.error('Error reading research data:', error);
    return { present: [], past: [] };
  }
}

export async function getResearchBySlug(slug: string): Promise<ResearchProject | null> {
  try {
    const data = await getResearch();
    const allProjects = [...data.present, ...data.past];
    return allProjects.find(p => p.slug === slug) || null;
  } catch (error) {
    console.error('Error finding research by slug:', error);
    return null;
  }
}
