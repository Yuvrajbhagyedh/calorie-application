const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  dailyCalorieGoal: z.number().int().min(800).max(10000).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const entrySchema = z.object({
  food: z.string().min(2),
  calories: z.number().int().min(0),
  mealTime: z.string().datetime(),
  notes: z.string().max(500).optional().nullable(),
});

const updateGoalSchema = z.object({
  dailyCalorieGoal: z.number().int().min(800).max(10000),
});

const updateProfileSchema = z.object({
  heightCm: z.number().min(50).max(300).optional().nullable(),
  weightKg: z.number().min(30).max(250).optional().nullable(),
});

module.exports = {
  registerSchema,
  loginSchema,
  entrySchema,
  updateGoalSchema,
  updateProfileSchema,
};

