import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@calistenia/core/lib/analytics', () => ({
  op: { track: vi.fn() },
}))

import LandingPage from './LandingPage'

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    setTimeout(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver), 0)
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

function renderLanding() {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('GHD landing', () => {
  it('presenta el mensaje corporativo y la marca', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Hukukun disiplini')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('sporun gücü')
    expect(screen.getAllByText('GHD SPOR').length).toBeGreaterThan(0)
    expect(screen.getByText('Yalnızca Global Hukukçular Derneği üyelerine özel')).toBeInTheDocument()
  })

  it('todos los CTA de solicitud apuntan al formulario de alta', () => {
    renderLanding()
    const signupLinks = screen.getAllByRole('link', { name: /Üyelik Başvurusu/ })
    expect(signupLinks.length).toBeGreaterThanOrEqual(3)
    for (const link of signupLinks) expect(link).toHaveAttribute('href', '/auth?mode=signup')
  })

  it('los CTA de acceso apuntan al login', () => {
    renderLanding()
    const loginLinks = screen.getAllByRole('link', { name: /Üye Girişi/ })
    expect(loginLinks.length).toBeGreaterThanOrEqual(3)
    for (const link of loginLinks) expect(link).toHaveAttribute('href', '/auth?mode=login')
  })

  it('incluye las secciones de membresía, privacidad y preguntas', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /Dört adımda/ })).toBeInTheDocument()
    expect(screen.getAllByText('Justitia et Sapientia').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Merak edilenler.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'KVKK Aydınlatma Metni' })).toHaveAttribute('href', '/legal#privacy')
  })

  it('abre y cierra una pregunta frecuente con estado accesible', () => {
    renderLanding()
    const question = screen.getByRole('button', { name: 'Hangi belge gerekli?' })
    expect(question).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'false')
  })
})
