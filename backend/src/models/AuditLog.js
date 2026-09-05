import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipHash: String,
  },
  { timestamps: true },
);
auditLogSchema.index({ createdAt: -1, action: 1 });
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
