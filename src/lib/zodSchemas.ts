import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const clubCreateRequestSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(50),
  schedule: z.string().min(2).max(200)
});

export const postSchema = z.object({
  clubId: z.string().cuid(),
  title: z.string().min(3).max(150),
  content: z.string().min(10).max(5000)
});

export const approveClubSchema = z.object({
  clubId: z.string().cuid()
});

