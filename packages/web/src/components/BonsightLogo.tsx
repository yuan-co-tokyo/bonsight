interface BonsightLogoProps {
  size?: number
}

export default function BonsightLogo({ size = 24 }: BonsightLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="bonsight logo"
    >
      <path
        d="M12 3C7 8 7 16 12 21C17 16 17 8 12 3Z"
        fill="none"
        stroke="#2B2B28"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="#5C7A52" />
    </svg>
  )
}
