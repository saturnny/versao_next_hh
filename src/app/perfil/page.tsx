'use client'
import { useState, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'

interface SessionUser { name?: string | null; email?: string | null; tipoUsuario?: string }

export default function PerfilPage() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  async function handleSenha(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (novaSenha !== confirmarSenha) {
      setError('A nova senha e a confirmação não coincidem.')
      return
    }
    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/perfil/senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    })
    setLoading(false)

    if (res.ok) {
      setMessage('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } else {
      const j = await res.json()
      setError(j.error || 'Erro ao alterar senha.')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h1>Meu Perfil</h1>
            <p>Suas informações e configurações</p>
          </div>
        </div>

        <div className="page-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Info card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title"><i className="bi bi-person-circle" /> Informações Pessoais</h2>
              </div>
              <div className="card-body">
                <div style={{
                  width: 80, height: 80, background: 'var(--primary)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontSize: '2rem',
                  fontWeight: 800, margin: '0 auto 24px',
                }}>
                  {initials}
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    { label: 'Nome', value: user?.name },
                    { label: 'Email', value: user?.email },
                    { label: 'Tipo', value: user?.tipoUsuario },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-sm text-muted fw-600" style={{ marginBottom: 4 }}>{item.label}</div>
                      <div style={{
                        padding: '8px 12px', background: '#f9fafb',
                        borderRadius: 8, fontWeight: 500,
                      }}>
                        {item.value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Password card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title"><i className="bi bi-shield-lock" /> Alterar Senha</h2>
              </div>
              <div className="card-body">
                {message && <div className="alert alert-success"><i className="bi bi-check-circle" /> {message}</div>}
                {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle" /> {error}</div>}

                <form onSubmit={handleSenha}>
                  <div className="form-group">
                    <label className="form-label">Senha atual</label>
                    <input
                      type="password"
                      className="form-control"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nova senha</label>
                    <input
                      type="password"
                      className="form-control"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar nova senha</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? <><i className="bi bi-hourglass-split" /> Salvando…</> : <><i className="bi bi-check-circle" /> Alterar Senha</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
