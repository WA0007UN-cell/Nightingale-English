import { and, desc, eq } from "drizzle-orm";
import { auditLogs, clinicMembers, users } from "../../../drizzle/schema";
import type { getDb } from "../../db";
import type { AuditReader } from "./types";

export function createDbAuditReader(database: ReturnType<typeof getDb>): AuditReader {
  return {
    async getMembership(userId, clinicId) {
      const [member] = await database.select({ clinicId: clinicMembers.clinicId, userId: clinicMembers.userId, role: clinicMembers.role })
        .from(clinicMembers)
        .where(and(eq(clinicMembers.userId, userId), eq(clinicMembers.clinicId, clinicId)));
      return member as AuditReader["getMembership"] extends (...args: any[]) => Promise<infer T> ? T : never;
    },
    async listEvents(clinicId, limit) {
      const rows = await database.select({
        id: auditLogs.id,
        actorUserId: auditLogs.actorUserId,
        actorName: users.name,
        role: clinicMembers.role,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        targetId: auditLogs.targetId,
        timestamp: auditLogs.createdAt,
        clinicScope: auditLogs.clinicId,
      })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.actorUserId, users.id))
        .leftJoin(clinicMembers, and(eq(clinicMembers.userId, auditLogs.actorUserId), eq(clinicMembers.clinicId, auditLogs.clinicId)))
        .where(eq(auditLogs.clinicId, clinicId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
      return rows.map((row) => ({
        id: row.id,
        actor: row.actorName ?? (row.actorUserId ? `User ${row.actorUserId}` : "System"),
        role: row.role ?? (row.actorUserId ? "Unknown" : "System"),
        action: row.action,
        targetEntity: `${row.targetType}:${row.targetId}`,
        timestamp: row.timestamp,
        clinicScope: row.clinicScope,
      }));
    },
  };
}
