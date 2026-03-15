'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

interface SessionUser {
  name?: string | null
  email?: string | null
  tipoUsuario?: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const isAdmin = user?.tipoUsuario === 'Admin'
  const [open, setOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const navLinks = [
    { href: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { href: '/lancamentos', icon: 'bi-clock-history', label: 'Meus Lançamentos' },
    { href: '/perfil', icon: 'bi-person-circle', label: 'Meu Perfil' },
  ]

  const adminLinks = [
    { href: '/admin/lancamentos', icon: 'bi-clipboard-data', label: 'Lançamentos' },
    { href: '/admin/usuarios', icon: 'bi-people', label: 'Usuários' },
    { href: '/admin/atividades', icon: 'bi-list-task', label: 'Atividades' },
    { href: '/admin/categorias', icon: 'bi-tags', label: 'Categorias' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, display: 'none',
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <Link href="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <i className="bi bi-clock-fill" />
          </div>
          <div className="sidebar-logo-text">
            <strong>Sistema HH</strong>
            <span>Controle de Horas</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu Principal</div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${pathname === link.href || pathname.startsWith(link.href + '/') ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <i className={`bi ${link.icon}`} />
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 8 }}>Administração</div>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link${pathname === link.href || pathname.startsWith(link.href + '/') ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <i className={`bi ${link.icon}`} />
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <strong>{user?.name || 'Usuário'}</strong>
              <span>{user?.tipoUsuario || 'Usuário'}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="nav-link"
            style={{
              width: '100%', border: 'none', background: 'none',
              cursor: 'pointer', marginBottom: 0, color: 'rgba(255,255,255,0.5)'
            }}
          >
            <i className="bi bi-box-arrow-right" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
