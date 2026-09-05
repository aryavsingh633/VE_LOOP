import crypto from 'crypto';
import { AuditLog } from '../models/AuditLog.js';

export const hashValue = (value = '') =>
  crypto.createHash('sha256').update(value).digest('hex');
export const clientIpHash = (req) =>
  hashValue(req.ip || req.socket?.remoteAddress || 'unknown');

export async function audit({
  actorId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  req,
  session,
}) {
  const safeMetadata = Object.fromEntries(
    Object.entries(metadata).filter(
      ([key]) => !['email', 'phone', 'address', 'password'].includes(key),
    ),
  );
  await AuditLog.create(
    [
      {
        actorId,
        action,
        resourceType,
        resourceId: String(resourceId),
        metadata: safeMetadata,
        ipHash: req ? clientIpHash(req) : undefined,
      },
    ],
    { session },
  );
}
