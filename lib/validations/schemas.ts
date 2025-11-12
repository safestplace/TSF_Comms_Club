import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const clubRequestSchema = z.object({
  club_name: z.string().min(3, 'Club name must be at least 3 characters'),
  state_id: z.number().min(1, 'Please select a state'),
  district_id: z.number().min(1, 'Please select a district'),
  institution_text: z.string().min(3, 'Institution name required'),
})

export const meetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  level_id: z.number().min(1, 'Please select a level'),
  scheduled_at: z.string().min(1, 'Please select a date and time'),
  venue: z.string().min(3, 'Venue is required'),
  notes: z.string().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().min(10, 'Description required'),
  level_id: z.number().min(1, 'Select level'),
})

export const roleRequestSchema = z.object({
  role_id: z.number().min(1, 'Please select a role'),
})