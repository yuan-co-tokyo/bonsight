import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PurchaseCheckDto } from 'shared'
import BonsightShell from '../../components/BonsightShell'
import Button from '../../components/Button'
import { getPurchaseChecks } from '../../api/purchaseCheckApi'
import CheckRecommendation from './CheckRecommendation'
import CheckStatus from './CheckStatus'
import './checks.css'
export default function ChecksList() {
  const [checks, setChecks] = useState<PurchaseCheckDto[] | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let ignore = false
    getPurchaseChecks()
      .then((data) => {
        if (!ignore) setChecks(data)
      })
      .catch((error: unknown) => {
        if (!ignore) setError(error instanceof Error ? error.message : '読み込みに失敗しました')
      })
    return () => {
      ignore = true
    }
  }, [retry])
  return (
    <BonsightShell screen="checks" title="購入前チェック">
      <div className="checks-content">
        <div className="checks-toolbar">
          <p>気になる盆栽を、写真から確認。</p>
          <Link className="primary-action" to="/checks/new">
            新規チェック
          </Link>
        </div>
        {error ? (
          <div role="alert">
            <p className="checks-error">{error}</p>
            <Button
              onClick={() => {
                setError('')
                setRetry(retry + 1)
              }}
            >
              再試行
            </Button>
          </div>
        ) : checks === null ? (
          <p role="status">読み込み中…</p>
        ) : checks.length === 0 ? (
          <p>購入前チェックはまだありません。</p>
        ) : (
          <ul className="checks-list">
            {checks.map((check) => (
              <li key={check.id} className="checks-card">
                <Link to={`/checks/${check.id}`}>
                  <img
                    src={check.photoUrls[check.photoRoles.indexOf('OVERALL')]}
                    alt={check.result.species.name}
                  />
                  <div>
                    <strong>{check.result.species.name}</strong>
                    <p className="checks-note">
                      {new Date(check.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                    <CheckRecommendation value={check.result.overall.recommendation} />
                    <CheckStatus status={check.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BonsightShell>
  )
}
