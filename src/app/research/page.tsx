'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../animations.css';

interface ResearchProject {
  title: string;
  slug: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
  authors: string;
  status: 'present' | 'past';
}

interface ResearchData {
  present: ResearchProject[];
  past: ResearchProject[];
}

export default function Research() {
  const [research, setResearch] = useState<ResearchData>({ present: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'present' | 'past'>('present');

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      const response = await fetch('/api/research');
      if (response.ok) {
        const data = await response.json();
        setResearch(data);
      }
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentProjects = activeTab === 'present' ? research.present : research.past;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carolina-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading research...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in font-sans bg-neutral-50 text-neutral-900">
      {/* Hero banner section */}
      <div className="w-full h-64 md:h-80 relative mb-8">
        <Image 
          src="/lab-photos/lab-work-23.jpg" 
          alt="Research at VCAIL" 
          fill
          className="object-cover object-center rounded-b-lg shadow-md" 
        />
      </div>

      {/* Research Philosophy - Campus Sandstone translucent banner */}
      <div className="w-full bg-campus-sandstone backdrop-blur-sm py-3 mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <h2 className="text-2xl font-bold text-dome-copper text-center mb-3">RESEARCH</h2>
          <p className="text-md text-neutral-700 max-w-4xl mx-auto leading-relaxed">
            Our lab pushes the boundaries of visual computing and augmented intelligence, 
            spanning computational imaging, computer vision, AR/VR, nano-optics, and AI-driven solutions.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="content-container">
        {/* Tabs for Present / Past */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={() => setActiveTab('present')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
              activeTab === 'present'
                ? 'bg-carolina-blue text-white shadow-lg'
                : 'bg-white text-carolina-blue border-2 border-carolina-blue hover:bg-carolina-blue/10'
            }`}
          >
            Present Research
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
              activeTab === 'past'
                ? 'bg-carolina-blue text-white shadow-lg'
                : 'bg-white text-carolina-blue border-2 border-carolina-blue hover:bg-carolina-blue/10'
            }`}
          >
            Past Research
          </button>
        </div>

        {/* Research Projects Grid */}
        <div className="space-y-10">
          {currentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProjects.map((project, idx) => (
                <div
                  key={project.slug}
                  className="section-card group transition-all duration-500 transform hover:-translate-y-2 unc-shadow-hover"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {project.image && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-carolina-blue mb-2 transition-colors duration-300">
                    {project.title}
                  </h3>
                  {project.authors && (
                    <p className="text-sm text-neutral-500 mb-2 font-medium">{project.authors}</p>
                  )}
                  {project.description && (
                    <p className="text-neutral-600 mb-4 leading-relaxed">{project.description}</p>
                  )}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="text-xs bg-carolina-blue/10 text-carolina-blue px-3 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <Link
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-carolina-blue text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-300 hover:bg-unc-navy"
                    >
                      Learn More →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="section-card text-center py-16">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-2xl font-bold text-carolina-blue mb-3">
                {activeTab === 'present' ? 'Current Research Coming Soon' : 'Past Research Coming Soon'}
              </h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                {activeTab === 'present' 
                  ? 'Our ongoing research projects will be showcased here. Stay tuned!' 
                  : 'Our completed research projects will be archived here. Stay tuned!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
