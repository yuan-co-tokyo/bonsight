import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { PurchaseCheckDto } from 'shared'
import BonsightShell from '../../components/BonsightShell'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import {
  deletePurchaseCheck,
  getPurchaseCheck,
  updatePurchaseCheck,
} from '../../api/purchaseCheckApi'
import CheckRecommendation from './CheckRecommendation'
import CheckStatus from './CheckStatus'
import './checks.css'
export default function CheckDetail() {
  const { id } = useParams<{ id: string }>()
  return <CheckDetailContent key={id} id={id} />
}
function CheckDetailContent({ id }: { id: string | undefined }) {
  const navigate = useNavigate()
  const [check, setCheck] = useState<PurchaseCheckDto | null>(null)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    if (!id) return
    let ignore = false
    getPurchaseCheck(id)
      .then((data) => {
        if (!ignore) setCheck(data)
      })
      .catch((error: unknown) => {
        if (!ignore) setError(error instanceof Error ? error.message : '読み込みに失敗しました')
      })
    return () => {
      ignore = true
    }
  }, [id])
  async function remove() {
    if (!id || deleting) return
    setDeleting(true)
    setError('')
    try {
      await deletePurchaseCheck(id)
      navigate('/checks', { replace: true })
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }
  async function changeStatus(status: 'CONSIDERING' | 'PASSED') {
    if (!id || deleting) return
    setDeleting(true)
    setError('')
    try {
      setCheck(await updatePurchaseCheck(id, status))
    } catch (error) {
      setError(error instanceof Error ? error.message : '状態の更新に失敗しました')
    } finally {
      setDeleting(false)
    }
  }
  const result = check?.result
  return (
    <BonsightShell
      screen="checks"
      title="購入前チェックの結果"
      breadcrumbs={[{ label: '購入前チェック', to: '/checks' }, { label: '結果' }]}
    >
      <div className="checks-content">
        {error && (
          <p role="alert" className="checks-error">
            {error}
          </p>
        )}
        {!check && !error && <p role="status">読み込み中…</p>}
        {check && result && (
          <>
            <section className="checks-card">
              <CheckRecommendation value={result.overall.recommendation} />
              <CheckStatus status={check.status} />
              <h2 style={{ marginTop: 12 }}>{result.species.name}</h2>
              <p>{result.overall.summary}</p>
              <p className="checks-note">
                {new Date(check.createdAt).toLocaleDateString('ja-JP')} · 信頼度{' '}
                {Math.round(result.confidence * 100)}%
              </p>
            </section>
            <section className="checks-card">
              <h2>6項目の評価</h2>
              {result.aspects.map((aspect) => (
                <div key={aspect.key}>
                  <h3>
                    {aspect.label}{' '}
                    <StatusBadge
                      tone={
                        aspect.rating === 'good'
                          ? 'success'
                          : aspect.rating === 'poor'
                            ? 'danger'
                            : aspect.rating === 'fair'
                              ? 'warning'
                              : 'neutral'
                      }
                    >
                      {
                        { good: '良好', fair: '普通', poor: '注意', unknown: '写真では不明' }[
                          aspect.rating
                        ]
                      }
                    </StatusBadge>
                  </h3>
                  <p>{aspect.comment}</p>
                </div>
              ))}
            </section>
            <section className="checks-card">
              <h2>注意点</h2>
              {result.risks.length === 0 ? (
                <p>写真から確認された注意点はありません。見えない部分は店頭で確認してください。</p>
              ) : (
                result.risks.map((risk, index) => (
                  <div key={index}>
                    <h3>
                      {risk.title}{' '}
                      <StatusBadge
                        tone={
                          risk.severity === 'high'
                            ? 'danger'
                            : risk.severity === 'medium'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {
                          { high: '注意度：高', medium: '注意度：中', low: '注意度：低' }[
                            risk.severity
                          ]
                        }
                      </StatusBadge>
                    </h3>
                    <p>{risk.detail}</p>
                  </div>
                ))
              )}
            </section>
            <section className="checks-card">
              <h2>自分に合うか</h2>
              <strong>
                {
                  { easy: '育てやすい', moderate: 'ある程度の経験が必要', hard: '難易度が高い' }[
                    result.suitability.level
                  ]
                }
              </strong>
              <p>{result.suitability.comment}</p>
              <p className="checks-note">
                選択した育成経験：
                {{ BEGINNER: '初心者', INTERMEDIATE: '中級', ADVANCED: '上級' }[check.experience]}
              </p>
            </section>
            <section className="checks-card">
              <h2>将来性</h2>
              <strong>{result.potential.styleDirection}</strong>
              <p>{result.potential.comment}</p>
            </section>
            <section className="checks-card">
              <h2>店頭で確かめること</h2>
              <ul>
                {result.checklist.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="checks-card">
              <h2>免責</h2>
              <p>{result.disclaimer}</p>
            </section>
            <section className="checks-card">
              <h2>チェック時の記録</h2>
              <div className="checks-thumbnails">
                {check.photoUrls.map((url, index) => (
                  <figure key={url}>
                    <img
                      src={url}
                      alt={
                        { OVERALL: '全体', BASE: '根元', FOLIAGE: '葉' }[check.photoRoles[index]]
                      }
                    />
                    <figcaption>
                      {{ OVERALL: '全体', BASE: '根元', FOLIAGE: '葉' }[check.photoRoles[index]]}
                    </figcaption>
                  </figure>
                ))}
              </div>
              {check.price !== null && (
                <p>
                  記録した価格：{check.price.toLocaleString('ja-JP')}
                  円（AI評価には使用していません）
                </p>
              )}
              {check.heightCm !== null && <p>樹高：{check.heightCm}cm</p>}
              {check.sellerNote && <p>店の説明：{check.sellerNote}</p>}
            </section>
            {check.status === 'CONSIDERING' && (
              <>
                <Button
                  fullWidth
                  disabled={deleting}
                  onClick={() =>
                    navigate('/bonsai/new', {
                      state: {
                        purchasePrefill: {
                          species: check.species || result.species.name,
                          name: check.species || result.species.name || '',
                          acquiredAt: new Date(Date.now() + 9 * 60 * 60 * 1000)
                            .toISOString()
                            .slice(0, 10),
                          purchaseCheckId: check.id,
                          origin: '購入',
                          currentState: result.overall.summary,
                        },
                      },
                    })
                  }
                >
                  この盆栽を購入した → 登録する
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={deleting}
                  onClick={() => void changeStatus('PASSED')}
                >
                  見送る（記録として残す）
                </Button>
              </>
            )}
            {check.status === 'PASSED' && (
              <Button disabled={deleting} onClick={() => void changeStatus('CONSIDERING')}>
                検討中に戻す
              </Button>
            )}
            {check.status === 'PURCHASED' && check.bonsaiId && (
              <Link to={`/bonsai/${check.bonsaiId}`}>登録した盆栽を見る</Link>
            )}
            {check.status === 'CONSIDERING' &&
              (confirm ? (
                <div role="group" aria-label="削除の確認" className="checks-confirm">
                  <p>このチェックと写真を削除しますか？</p>
                  <Button variant="danger" disabled={deleting} onClick={() => void remove()}>
                    {deleting ? '削除中…' : '削除する'}
                  </Button>{' '}
                  <Button variant="secondary" disabled={deleting} onClick={() => setConfirm(false)}>
                    キャンセル
                  </Button>
                </div>
              ) : (
                <Button
                  variant="danger"
                  fullWidth
                  style={{ marginTop: 16 }}
                  onClick={() => setConfirm(true)}
                >
                  チェックを削除
                </Button>
              ))}
          </>
        )}
      </div>
    </BonsightShell>
  )
}
