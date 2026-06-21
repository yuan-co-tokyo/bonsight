interface PhotoPlaceholderProps {
  label?: string
  aspectRatio?: string
  className?: string
}

export default function PhotoPlaceholder({
  label,
  aspectRatio = '1/1',
  className,
}: PhotoPlaceholderProps) {
  return (
    <div
      className={className}
      style={{
        aspectRatio,
        background:
          'repeating-linear-gradient(135deg, #EDEBE6 0px 9px, #F4F2EE 9px 18px)',
        border: '1px solid #E5E3DD',
        position: 'relative',
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    >
      {label && (
        <span
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            fontFamily: 'ui-monospace, monospace',
            fontSize: 10,
            color: '#9A938A',
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
