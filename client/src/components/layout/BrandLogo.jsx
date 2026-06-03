import logoUrl from '../../assets/logo.png'

export default function BrandLogo({ className = '' }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${className}`}>
      <img
        src={logoUrl}
        alt="Golden-Intels International School logo"
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </span>
  )
}
