import { FastifyReply, FastifyRequest } from "fastify";
import { CreateApplicationBody } from "./applications.shcema";
import { createApplication, getApplications } from "./applications.service";
import { createRole } from "../roles/roles.service";
import {
  ALL_PERMISSIONS,
  SYSTEM_ROLE,
  USER_ROLE_PERMISSIONS,
} from "../../config/permissions";

export async function createApplicationHandler(
  req: FastifyRequest<{ Body: CreateApplicationBody }>,
  reply: FastifyReply
) {
  const { name } = req.body;

  const application = await createApplication({ name });

  const superAdminRolePromise = await createRole({
    applicationId: application.id,
    name: SYSTEM_ROLE.SUPER_ADMIN,
    permissions: ALL_PERMISSIONS as unknown as Array<string>,
  });

  const applicationUserRolePromise = await createRole({
    applicationId: application.id,
    name: SYSTEM_ROLE.APPLICATION_USER,
    permissions: USER_ROLE_PERMISSIONS,
  });

  const [superAdminRole, applicationUserRole] = await Promise.allSettled([
    superAdminRolePromise,
    applicationUserRolePromise,
  ]);

  if (superAdminRole.status === "rejected") {
    throw new Error("Error Creating super admin role");
  }
  if (applicationUserRole.status === "rejected") {
    throw new Error("Error Creating application user role");
  }
  return {
    application,
    superAdminRole: superAdminRole.value,
    applicationUserRole: applicationUserRole["value"],
  };
}

export async function getApplicationsHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  return getApplications();
}
