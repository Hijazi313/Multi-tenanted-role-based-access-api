import { FastifyInstance } from "fastify";
import { createUserHandler, logInHandler } from "./users.controller";
import { createUserJsonSchema, loginBodyJsonSchema } from "./users.schema";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", { schema: createUserJsonSchema }, createUserHandler);
  app.post("/login", { schema: loginBodyJsonSchema }, logInHandler);
}
