import { ServiceUnavailableException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma';
import { ASPECTS } from './purchase-check-prompt';

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function confidence(value: unknown) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}
function member(value: unknown, choices: string[]) {
  return typeof value === 'string' && choices.includes(value);
}

/** Validate model output before saving data the result screen relies on. */
export function parsePurchaseCheckResult(
  value: unknown,
): Prisma.InputJsonObject {
  if (
    !record(value) ||
    !record(value.species) ||
    !text(value.species.name) ||
    !confidence(value.species.confidence) ||
    !record(value.overall) ||
    !member(value.overall.recommendation, [
      'recommended',
      'consider',
      'caution',
    ]) ||
    !text(value.overall.summary) ||
    !Array.isArray(value.aspects) ||
    value.aspects.length !== 6 ||
    !value.aspects.every(
      (aspect: unknown) =>
        record(aspect) &&
        member(aspect.key, Object.keys(ASPECTS)) &&
        member(aspect.rating, ['good', 'fair', 'poor', 'unknown']) &&
        text(aspect.comment),
    ) ||
    new Set(value.aspects.map((aspect: Record<string, unknown>) => aspect.key))
      .size !== 6 ||
    !Array.isArray(value.risks) ||
    !value.risks.every(
      (risk: unknown) =>
        record(risk) &&
        text(risk.title) &&
        member(risk.severity, ['low', 'medium', 'high']) &&
        text(risk.detail),
    ) ||
    !record(value.suitability) ||
    !member(value.suitability.level, ['easy', 'moderate', 'hard']) ||
    !text(value.suitability.comment) ||
    !record(value.potential) ||
    !text(value.potential.styleDirection) ||
    !text(value.potential.comment) ||
    !Array.isArray(value.checklist) ||
    !value.checklist.every(text) ||
    !confidence(value.confidence) ||
    !text(value.disclaimer)
  ) {
    throw new ServiceUnavailableException(
      'AIの評価結果を読み取れませんでした。もう一度お試しください',
    );
  }
  // Persist only the schema fields; canonicalize aspect labels and order.
  const aspects = Object.entries(ASPECTS).map(([key, label]) => {
    const item = (value.aspects as Record<string, unknown>[]).find(
      (aspect) => aspect.key === key,
    )!;
    return {
      key,
      label,
      rating: item.rating as string,
      comment: item.comment as string,
    };
  });
  return {
    species: value.species as Prisma.InputJsonObject,
    overall: value.overall as Prisma.InputJsonObject,
    aspects,
    risks: value.risks as Prisma.InputJsonArray,
    suitability: value.suitability as Prisma.InputJsonObject,
    potential: value.potential as Prisma.InputJsonObject,
    checklist: value.checklist,
    confidence: value.confidence as number,
    disclaimer: value.disclaimer,
  };
}
