import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import LegalPage from './LegalPage'

/**
 * GHD Spor hukuki metinleri: KVKK aydınlatma metni ve üyelik koşulları.
 * Sayfa i18n kullanmaz; Türkçe metin doğrudan bileşende yer alır.
 */
function renderPage() {
  render(
    <MemoryRouter initialEntries={['/legal']}>
      <LegalPage />
    </MemoryRouter>,
  )
}

describe('LegalPage · KVKK ve üyelik koşulları', () => {
  it('iki bölümü ve güncelleme tarihini gösterir', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'KVKK Aydınlatma Metni' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Üyelik Koşulları' })).toBeInTheDocument()
    expect(screen.getAllByText('Son güncelleme: 17 Kasım 2026')).toHaveLength(2)
  })

  it('veri sorumlusunu ve iletişim adresini belirtir', () => {
    renderPage()
    expect(screen.getAllByText(/Global Hukukçular Derneği/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'info@globalhukukcular.com' }).length).toBeGreaterThan(0)
  })

  it('zorunlu üyelik verilerini sayar', () => {
    renderPage()
    for (const metin of ['doğum tarihi', 'hukuk öğrencisi veya hukuk mezunu', 'e-Devlet belgesi']) {
      expect(screen.getAllByText(new RegExp(metin, 'i')).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('heading', { name: '2. Başvuru ve doğrulama' })).toBeInTheDocument()
  })

  it('e-Devlet belgesine yalnızca sahibi ve yetkili yöneticilerin eriştiğini açıklar', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '5. e-Devlet belgesine erişim' })).toBeInTheDocument()
    expect(
      screen.getByText(/yalnızca siz ve dernek tarafından\s+yetkilendirilmiş üyelik yöneticileri/i),
    ).toBeInTheDocument()
  })

  it('eski İspanyolca metni ve upstream iletişim adresini içermez', () => {
    renderPage()
    expect(screen.queryByText(/Política de Privacidad/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Condiciones de Servicio/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/contacto@calisteniaapp\.com/i)).not.toBeInTheDocument()
  })
})
