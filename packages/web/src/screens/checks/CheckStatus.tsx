import type { PurchaseCheckStatus } from 'shared'
import StatusBadge from '../../components/StatusBadge'
export default function CheckStatus({ status }: { status: PurchaseCheckStatus }) {
  return (
    <StatusBadge tone={status === 'PURCHASED' ? 'success' : 'neutral'}>
      {{ CONSIDERING: '検討中', PURCHASED: '購入済み', PASSED: '見送り' }[status]}
    </StatusBadge>
  )
}
