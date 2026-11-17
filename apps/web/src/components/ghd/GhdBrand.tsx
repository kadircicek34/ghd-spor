import { Link } from 'react-router-dom'

interface GhdBrandProps {
  to?: string
  subtitle?: string
  className?: string
  markSrc?: string
}

/**
 * Marca GHD Spor. El icono cuadrado se usa en cabeceras pequeñas; el medallón
 * completo (`logo-ghd.jpg`) se reserva para el hero y las pantallas de estado.
 */
export function GhdBrand({
  to = '/',
  subtitle = 'Global Hukukçular Derneği',
  className = '',
  markSrc = '/ghd-icon-512.png',
}: GhdBrandProps) {
  return (
    <Link to={to} className={`ghd-brand ${className}`.trim()} aria-label="GHD Spor ana sayfa">
      <span className="ghd-brand__mark" aria-hidden="true">
        <img src={markSrc} alt="" width={48} height={48} />
      </span>
      <span className="ghd-brand__text">
        <span className="ghd-brand__name">GHD SPOR</span>
        <span className="ghd-brand__sub">{subtitle}</span>
      </span>
    </Link>
  )
}
