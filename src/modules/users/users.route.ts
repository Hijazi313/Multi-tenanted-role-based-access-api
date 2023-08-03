import { FastifyInstance } from "fastify";
import { createUserHandler } from "./users.controller";
import { createUserJsonSchema } from "./users.schema";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", { schema: createUserJsonSchema }, createUserHandler);
}
