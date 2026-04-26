import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface TemplateConfig {
  layout: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily: string;
  fontSize: string;
  spacing: 'compact' | 'normal' | 'relaxed';
  showPhoto: boolean;
  showSummary: boolean;
  showSkills: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showProjects: boolean;
  customSections?: string[];
}

interface TemplateData {
  name: string;
  description: string;
  thumbnail: string;
  config: TemplateConfig;
  category: string;
  tags: string[];
  previewImage: string;
}

async function main() {
  console.log('Starting database seed...');

  // ── Templates ──────────────────────────────────────────────────────────────
  const templates: TemplateData[] = [
    {
      name: 'Professional Executive',
      description: 'Polished executive resume with emphasis on leadership and achievements',
      thumbnail: '/templates/professional-executive-thumb.png',
      category: 'professional',
      tags: ['executive', 'corporate', 'business', 'leadership'],
      previewImage: '/templates/previews/professional-executive.png',
      config: {
        layout: 'two-column',
        primaryColor: '#1e3a5f',
        secondaryColor: '#c5a059',
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        spacing: 'normal',
        showPhoto: true,
        showSummary: true,
        showSkills: true,
        showExperience: true,
        showEducation: true,
        showProjects: false,
      },
    },
    {
      name: 'Modern Clean',
      description: 'Contemporary design with clean lines and modern typography',
      thumbnail: '/templates/modern-clean-thumb.png',
      category: 'modern',
      tags: ['modern', 'clean', 'minimal', 'stylish'],
      previewImage: '/templates/previews/modern-clean.png',
      config: {
        layout: 'single-column',
        primaryColor: '#0891b2',
        secondaryColor: '#f0f9ff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        spacing: 'normal',
        showPhoto: true,
        showSummary: true,
        showSkills: true,
        showExperience: true,
        showEducation: true,
        showProjects: true,
      },
    },
    {
      name: 'Creative Bold',
      description: 'Eye-catching design for creative professionals and designers',
      thumbnail: '/templates/creative-bold-thumb.png',
      category: 'creative',
      tags: ['creative', 'bold', 'design', 'artistic'],
      previewImage: '/templates/previews/creative-bold.png',
      config: {
        layout: 'grid',
        primaryColor: '#7c3aed',
        secondaryColor: '#f5f3ff',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '15px',
        spacing: 'relaxed',
        showPhoto: true,
        showSummary: true,
        showSkills: true,
        showExperience: true,
        showEducation: true,
        showProjects: true,
        customSections: ['Publications', 'Awards'],
      },
    },
    {
      name: 'Minimal Swiss',
      description: 'Swiss-inspired typographic hierarchy with maximum readability',
      thumbnail: '/templates/minimal-swiss-thumb.png',
      category: 'minimal',
      tags: ['minimal', 'swiss', 'typography', 'clean'],
      previewImage: '/templates/previews/minimal-swiss.png',
      config: {
        layout: 'single-column',
        primaryColor: '#111827',
        secondaryColor: '#e5e7eb',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '13px',
        spacing: 'normal',
        showPhoto: false,
        showSummary: true,
        showSkills: true,
        showExperience: true,
        showEducation: true,
        showProjects: false,
      },
    },
    {
      name: 'Tech Developer',
      description: 'Technical resume optimized for software engineers and developers',
      thumbnail: '/templates/tech-developer-thumb.png',
      category: 'tech',
      tags: ['tech', 'developer', 'engineering', 'code'],
      previewImage: '/templates/previews/tech-developer.png',
      config: {
        layout: 'two-column',
        primaryColor: '#059669',
        secondaryColor: '#ecfdf5',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        spacing: 'compact',
        showPhoto: false,
        showSummary: true,
        showSkills: true,
        showExperience: true,
        showEducation: true,
        showProjects: true,
        customSections: ['Technologies', 'Open Source', 'Projects'],
      },
    },
  ];

  for (const templateData of templates) {
      const template = await prisma.template.upsert({
        where: { name: templateData.name },
        update: {},
        create: {
          ...templateData,
          config: JSON.stringify(templateData.config),
          isActive: true,
          popularity: 0,
          tags: JSON.stringify(templateData.tags),
          id: uuidv4(),
        },
      });
    console.log(`✓ Template created or updated: ${template.name} (${template.id})`);
  }

  // ── Admin User ──────────────────────────────────────────────────────────────
  const adminEmail = 'admin@openresume.dev';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: uuidv4(),
      email: adminEmail,
      name: 'Admin',
      createdAt: new Date(),
    },
  });
  console.log(`✓ Admin user created or updated: ${adminUser.email} (${adminUser.id})`);

  // ── Sample Resume Data ──────────────────────────────────────────────────────
  const sampleResumeData = {
    basics: {
      name: 'Alex Johnson',
      label: 'Senior Software Engineer',
      email: 'alex.johnson@example.com',
      phone: '(555) 123-4567',
      url: 'https://alexjohnson.dev',
      summary:
        'Passionate full-stack engineer with 7+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud infrastructure.',
      location: {
        city: 'San Francisco',
        region: 'California',
        countryCode: 'US',
      },
      profiles: [
        { network: 'GitHub', username: 'alexj' },
        { network: 'LinkedIn', username: 'alexjohnson' },
      ],
    },
    work: [
      {
        name: 'TechCorp Inc.',
        position: 'Senior Software Engineer',
        url: 'https://techcorp.example.com',
        startDate: '2021-03-01',
        endDate: null,
        summary: 'Lead developer for the customer portal team.',
        highlights: [
          'Architected a microservices backend using Node.js and PostgreSQL, reducing API latency by 40%',
          'Mentored 4 junior engineers and established code review practices',
          'Implemented CI/CD pipelines with GitHub Actions',
        ],
      },
      {
        name: 'StartupXYZ',
        position: 'Full Stack Developer',
        url: 'https://startupxyz.io',
        startDate: '2018-06-01',
        endDate: '2021-02-01',
        summary: 'Built core product from ground up.',
        highlights: [
          'Developed a React/TypeScript frontend with real-time updates via WebSockets',
          'Designed RESTful APIs and integrated Stripe for payment processing',
          'Deployed infrastructure on AWS using Terraform',
        ],
      },
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        url: 'https://berkeley.edu',
        areaOfStudy: 'B.S. Computer Science',
        startDate: '2014-09-01',
        endDate: '2018-05-01',
      },
    ],
    skills: [
      { name: 'JavaScript / TypeScript', level: 'Expert' },
      { name: 'React / Next.js', level: 'Expert' },
      { name: 'Node.js', level: 'Expert' },
      { name: 'PostgreSQL / MongoDB', level: 'Advanced' },
      { name: 'AWS / GCP', level: 'Advanced' },
      { name: 'Docker / Kubernetes', level: 'Intermediate' },
    ],
    projects: [
      {
        name: 'Open Source CLI Tool',
        description: 'A command-line productivity tool written in Rust',
        url: 'https://github.com/alexj/cli-tool',
        roles: ['Creator', 'Maintainer'],
        startDate: '2022-01-01',
        endDate: null,
        highlights: ['500+ GitHub stars', 'Used by 10k+ developers'],
      },
    ],
  };

  // Attach sample resume to admin user (if none exists)
  const existingResumes = await prisma.resume.findMany({
    where: { userId: adminUser.id },
  });

  if (existingResumes.length === 0) {
    const sampleResume = await prisma.resume.create({
      data: {
        id: uuidv4(),
        userId: adminUser.id,
        title: 'Alex Johnson - Senior Software Engineer',
        template: 'Modern Clean',
        data: JSON.stringify(sampleResumeData),
        createdAt: new Date(),
      },
    });
    console.log(`✓ Sample resume created: ${sampleResume.title} (${sampleResume.id})`);
  } else {
    console.log(`✓ Admin already has ${existingResumes.length} resume(s) – skipping sample`);
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
