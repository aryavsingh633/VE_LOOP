import { FraudEvent } from '../models/FraudEvent.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { AppError } from '../utils/AppError.js';
import { clientIpHash, hashValue } from './auditService.js';

export function deviceHashFromRequest(req) {
  const suppliedId = String(req.get('x-device-id') || '').slice(0, 200);
  return suppliedId ? hashValue(suppliedId) : undefined;
}

export async function assessParticipationRisk({ req, user, giveawayId }) {
  const deviceHash = deviceHashFromRequest(req);
  const signals = [];
  let riskScore = 0;
  const accountAgeHours =
    (Date.now() - new Date(user.createdAt).getTime()) / 36e5;
  if (accountAgeHours < 1) {
    riskScore += 15;
    signals.push('NEW_ACCOUNT');
  }
  if (!deviceHash) {
    riskScore += 5;
    signals.push('MISSING_DEVICE_SIGNAL');
  }
  if (deviceHash) {
    const otherAccounts = await GiveawayParticipation.distinct('userId', {
      deviceHash,
      userId: { $ne: user._id },
    });
    if (otherAccounts.length >= 3) {
      riskScore += 55;
      signals.push('MULTI_ACCOUNT_DEVICE_PATTERN');
    } else if (otherAccounts.length) {
      riskScore += 15;
      signals.push('SHARED_DEVICE_SIGNAL');
    }
  }
  const event = {
    userId: user._id,
    giveawayId,
    riskScore,
    signals,
    action: riskScore >= 70 ? 'BLOCKED' : riskScore >= 35 ? 'REVIEW' : 'LOGGED',
    deviceHash,
    ipHash: clientIpHash(req),
  };
  if (signals.length) await FraudEvent.create(event);
  if (riskScore >= 70)
    throw new AppError(
      'SUSPICIOUS_ACTIVITY',
      'We could not verify this participation. Please contact support if this is unexpected.',
      403,
    );
  return { deviceHash, riskScore, signals };
}
