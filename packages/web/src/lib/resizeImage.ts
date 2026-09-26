/** Convert any browser-decodable photo to a bounded JPEG before upload. */
export async function resizeImage(file: File): Promise<File> {
  let source: CanvasImageSource
  let width: number
  let height: number
  let release: () => void
  try {
    if (typeof createImageBitmap !== 'function') throw new Error('Bitmap unavailable')
    const bitmap = await createImageBitmap(file)
    source = bitmap
    width = bitmap.width
    height = bitmap.height
    release = () => bitmap.close()
  } catch {
    const url = URL.createObjectURL(file)
    const img = new Image()
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () =>
          reject(new Error('写真を読み込めませんでした。別の写真を選択してください。'))
        img.src = url
      })
      source = img
      width = img.naturalWidth
      height = img.naturalHeight
      release = () => URL.revokeObjectURL(url)
    } catch (error) {
      URL.revokeObjectURL(url)
      throw error
    }
  }
  try {
    if (!width || !height) throw new Error('写真のサイズを確認できませんでした。')
    const scale = Math.min(1, 1568 / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('写真を変換できませんでした。')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(source, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error('写真を変換できませんでした。'))),
        'image/jpeg',
        0.85
      )
    })
    return new File([blob], `${file.name.replace(/\.[^.]*$/, '') || 'photo'}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } finally {
    release()
  }
}
