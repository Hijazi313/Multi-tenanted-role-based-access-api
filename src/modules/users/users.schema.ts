import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string(),
  applicationId: z.string().uuid(),
  password: z.string().min(6),
  initialUser: z.boolean().optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const createUserJsonSchema = {
  body: zodToJsonSchema(createUserBodySchema, "createUserBodySchema"),
};

// Login
export const loginSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string(),
  applicationId: z.string(),
});
export type LoginBody = z.infer<typeof loginSchema>;

export const loginBodyJsonSchema = {
  body: zodToJsonSchema(loginSchema, "loginSchema"),
};
