import { z } from "zod";

/**
 * Frontend validation mirroring Umurava Talent Profile Schema.
 * This prevents malformed dummy data / CSV imports from entering the system.
 */

export const SkillSchema = z.object({
  name: z.string().min(1),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  yearsOfExperience: z.coerce.number().int().min(0).max(50),
});

export const LanguageSchema = z.object({
  name: z.string().min(1),
  proficiency: z.enum(["Basic", "Conversational", "Fluent", "Native"]),
});

export const WorkExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
  endDate: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal("Present")]),
  description: z.string().min(1),
  technologies: z.array(z.string()).default([]),
  isCurrent: z.boolean().default(false),
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startYear: z.coerce.number().int().min(1900).max(2100),
  endYear: z.coerce.number().int().min(1900).max(2100),
});

export const CertificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issueDate: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
});

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string()).default([]),
  role: z.string().min(1),
  link: z.string().url().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
});

export const AvailabilitySchema = z.object({
  status: z.enum(["Available", "Open to Opportunities", "Not Available"]),
  type: z.enum(["Full-time", "Part-time", "Contract"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
});

export const SocialLinksSchema = z
  .object({
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    portfolio: z.string().url().optional(),
  })
  .catchall(z.string().url().optional());

export const TalentProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  headline: z.string().min(1),
  bio: z.string().optional().nullable(),
  location: z.string().min(1),

  skills: z.array(SkillSchema).min(1),
  languages: z.array(LanguageSchema).optional().nullable(),

  experience: z.array(WorkExperienceSchema).min(1),
  education: z.array(EducationSchema).min(1),
  certifications: z.array(CertificationSchema).optional().nullable(),
  projects: z.array(ProjectSchema).min(1),

  availability: AvailabilitySchema,
  socialLinks: SocialLinksSchema.optional().nullable(),
});

export type TalentProfile = z.infer<typeof TalentProfileSchema>;