import type { PurchaseCheckResult } from 'shared'
import StatusBadge from '../../components/StatusBadge'
export default function CheckRecommendation({
  value,
}: {
  value: PurchaseCheckResult['overall']['recommendation']
}) {
  return (
    <StatusBadge
      tone={value === 'recommended' ? 'success' : value === 'caution' ? 'danger' : 'warning'}
    >
      {{ recommended: 'おすすめ', consider: '検討', caution: '慎重に検討' }[value]}
    </StatusBadge>
  )
}
