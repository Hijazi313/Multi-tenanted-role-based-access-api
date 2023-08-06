import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserBody, LoginBody } from "./users.schema";
import { SYSTEM_ROLE } from "../../config/permissions";
import { getRolesByName } from "../roles/roles.service";
import {
  assignRoleToUser,
  createUser,
  getUserByEmail,
  getUsersByApplication,
} from "./users.service";
import { DrizzleError } from "drizzle-orm";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

export async function createUserHandler(
  req: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
) {
  const { initialUser, ...data } = req.body;

  const roleName = initialUser
    ? SYSTEM_ROLE.SUPER_ADMIN
    : SYSTEM_ROLE.APPLICATION_USER;

  if (roleName === SYSTEM_ROLE.SUPER_ADMIN) {
    const appUsers = await getUsersByApplication(data.applicationId);
    if (appUsers.length > 0) {
      return reply.code(400).send({
        message: "Application already has super admin user",
        extensions: {
          code: "APPLICATION_ALREADY_SUPER_USER",
          applicationId: data.applicationId,
        },
      });
    }
  }

  const role = await getRolesByName({
    name: roleName,
    applicationId: data.applicationId,
  });

  if (!role) {
    return reply.code(404).send({
      message: "Role Not Found",
    });
  }
  try {
    const user = await createUser(data);

    // assign a role to the user
    await assignRoleToUser({
      userId: user.id,
      applicationId: data.applicationId,
      roleId: role.id,
    });
    return user;
  } catch (err) {
    return reply.code(500).send({
      message: err,
    });
  }
}

export async function logInHandler(
  req: FastifyRequest<{
    Body: LoginBody;
  }>,
  reply: FastifyReply
) {
  const { applicationId, email, password } = req.body;

  const user = await getUserByEmail({ email, applicationId });
  if (!user) {
    return reply.code(400).send({
      message: "Invalid email or password",
    });
  }
  return user;
  const token = jwt.sign(
    {
      email,
      applicationId,
    },
    "secret"
  ); //change this scret or signing  or get fired

  return token;
}
