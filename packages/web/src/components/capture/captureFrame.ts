export function coverCrop(width: number, height: number, ratio: number) {
  if (width <= 0 || height <= 0 || !Number.isFinite(ratio) || ratio <= 0)
    throw new Error('カメラの準備ができていません')
  const cropWidth = Math.min(width, height * ratio)
  const cropHeight = Math.min(height, width / ratio)
  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  }
}
export async function captureFrame(video: HTMLVideoElement, ratio: number): Promise<File> {
  const crop = coverCrop(video.videoWidth, video.videoHeight, ratio)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(crop.width)
  canvas.height = Math.round(crop.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('写真を撮影できませんでした')
  context.drawImage(
    video,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('写真を作成できませんでした'))),
      'image/jpeg',
      0.92
    )
  )
  return new File([blob], `bonsai-${Date.now()}.jpg`, { type: 'image/jpeg' })
}
