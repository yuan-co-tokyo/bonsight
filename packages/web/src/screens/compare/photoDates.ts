import type { MediaDtoEx } from '../../api/mediaApi'
export function photoDate(photo: MediaDtoEx) {
  return photo.takenAt || photo.createdAt
}
export function photoDateLabel(photo: MediaDtoEx) {
  return new Date(photoDate(photo)).toLocaleDateString('ja-JP')
}
export function dateGap(first: string, second: string): string {
  const dates = [new Date(first), new Date(second)].sort((a, b) => a.getTime() - b.getTime())
  const [a, b] = dates
  let months = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth()
  if (b.getDate() < a.getDate()) months--
  if (months > 0)
    return `${months >= 12 ? `${Math.floor(months / 12)}年` : ''}${months % 12 ? `${months % 12}か月` : ''}`
  const days = Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      86400000
  )
  return days ? `${days}日` : '同じ日'
}
