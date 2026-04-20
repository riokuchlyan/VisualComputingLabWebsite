import { kv } from '@vercel/kv';

export interface WebsiteContent {
  homepage: {
    aboutUs: string;
    labName: string;
    contactEmail: string;
    heroTitle: string;
    heroSubtitle: string;
  };
  footer: {
    address: string;
    university: string;
    email: string;
    socialLinks: {
      twitter: string;
      linkedin: string;
      instagram: string;
      github: string;
    };
  };
  meta: {
    title: string;
    description: string;
    keywords: string;
  };
}

const KV_KEY = 'website:content';

function getDefaultContent(): WebsiteContent {
  return {
    homepage: {
      aboutUs: "Welcome to the Visual Computing and Augmented Intelligence Lab at UNC Chapel Hill. Our team is dedicated to advancing research in computational imaging, visual perception, and AI-driven solutions. We collaborate across disciplines to create transformative technologies that redefine the future of visual computing.",
      labName: "Visual Computing and Augmented Intelligence Lab",
      contactEmail: "cpk@cs.unc.edu",
      heroTitle: "VISUAL COMPUTING AND AUGMENTED INTELLIGENCE LAB",
      heroSubtitle: "Advancing the frontiers of computational imaging, AR/VR, and augmented intelligence"
    },
    footer: {
      address: "Sitterson 205",
      university: "University of North Carolina at Chapel Hill",
      email: "cpk@cs.unc.edu",
      socialLinks: {
        twitter: "https://x.com/unc_vcail",
        linkedin: "https://www.linkedin.com/company/unc-vcail",
        instagram: "https://www.instagram.com/unc_vcail",
        github: "https://github.com/unc-vcail"
      }
    },
    meta: {
      title: "Visual Computing and Augmented Intelligence Lab | UNC Chapel Hill",
      description: "The Visual Computing and Augmented Intelligence Lab at UNC Chapel Hill advances research in computational imaging, computer vision, AR/VR, nano-optics, and AI-driven solutions.",
      keywords: "visual computing, augmented intelligence, UNC, Chapel Hill, computational imaging, computer vision, AR, VR, nano-optics, research, Praneeth Chakravarthula"
    }
  };
}

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const stored = await kv.get<WebsiteContent>(KV_KEY);
    if (stored) return stored;
    // First run: seed from defaults
    const defaults = getDefaultContent();
    await kv.set(KV_KEY, defaults);
    return defaults;
  } catch (error) {
    console.error('Error reading website content from KV:', error);
    return getDefaultContent();
  }
}

export async function updateWebsiteContent(updates: Partial<WebsiteContent>): Promise<boolean> {
  try {
    const current = await getWebsiteContent();
    const updated: WebsiteContent = {
      homepage: { ...current.homepage, ...(updates.homepage ?? {}) },
      footer: {
        ...current.footer,
        ...(updates.footer ?? {}),
        socialLinks: {
          ...current.footer.socialLinks,
          ...(updates.footer?.socialLinks ?? {})
        }
      },
      meta: { ...current.meta, ...(updates.meta ?? {}) }
    };
    await kv.set(KV_KEY, updated);
    return true;
  } catch (error) {
    console.error('Error updating website content in KV:', error);
    return false;
  }
}

export async function updateHomepageContent(updates: Partial<WebsiteContent['homepage']>): Promise<boolean> {
  try {
    const current = await getWebsiteContent();
    const updated: WebsiteContent = {
      ...current,
      homepage: { ...current.homepage, ...updates }
    };
    await kv.set(KV_KEY, updated);
    return true;
  } catch (error) {
    console.error('Error updating homepage content in KV:', error);
    return false;
  }
}

export async function seedContentFromJson(data: WebsiteContent): Promise<boolean> {
  try {
    await kv.set(KV_KEY, data);
    return true;
  } catch (error) {
    console.error('Error seeding content into KV:', error);
    return false;
  }
}
