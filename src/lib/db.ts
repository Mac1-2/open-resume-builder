import {PrismaClient} from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export {prisma};

// Type exports for convenience
export type {
  User,
  Resume,
  Template,
  AIChat,
  Settings,
} from '@prisma/client';

// Helper to serialize JSON for SQLite
const serializeJson = (data: any): string => {
  return typeof data === 'string' ? data : JSON.stringify(data || {});
};

// Helper to parse JSON from SQLite
const parseJson = (data: string | null): any => {
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

// Database helper functions
export const getResumesByUser = async (userId: string) => {
  const resumes = await prisma.resume.findMany({
    where: {userId},
    orderBy: {updatedAt: 'desc'},
  });
  return resumes.map(r => ({...r, data: parseJson(r.data)}));
};

export const getResumeById = async (id: string, userId?: string) => {
  const resume = await prisma.resume.findFirst({
    where: {
      id,
      ...(userId ? {userId} : {}),
    },
  });
  if (!resume) return null;
  return {...resume, data: parseJson(resume.data)};
};

export const createResume = async (data: {
  userId: string;
  title: string;
  template: string;
  data?: any;
}) => {
  return prisma.resume.create({
    data: {
      ...data,
      data: serializeJson(data.data),
    },
  });
};

export const updateResume = async (id: string, data: any) => {
  return prisma.resume.update({
    where: {id},
    data: {
      ...data,
      data: data.data ? serializeJson(data.data) : undefined,
    },
  });
};

export const deleteResume = async (id: string) => {
  return prisma.resume.delete({
    where: {id},
  });
};

export const getActiveTemplates = async () => {
  const templates = await prisma.template.findMany({
    where: {isActive: true},
    orderBy: {createdAt: 'desc'},
  });
  return templates.map(t => ({
    ...t,
    config: parseJson(t.config),
    tags: parseJson(t.tags),
  }));
};

export const getChatHistory = async (resumeId: string) => {
  const chats = await prisma.aIChat.findMany({
    where: { resumeId },
    orderBy: { createdAt: 'asc' },
  });
  return chats.map(c => ({...c, messages: parseJson(c.messages)}));
};

export const createChat = async (data: {
  resumeId?: string;
  userId?: string;
  messages: any;
}) => {
  return prisma.aIChat.create({
    data: {
      ...data,
      messages: serializeJson(data.messages),
    },
  });
};