'use client'
import { useEffect, useState, FormEvent } from 'react'
import Sidebar from '@/components/Sidebar'

interface Usuario {
  id: string; nome: string; email: string
  gestao?: string; area?: string; equipe?: string
  especialidade?: string; tipoUsuario: string; ativo: boolean
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', gestao: '', area: '',
    equipe: '', especialidade: '', tipoUsuario: 'Usuário',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/usuarios')
    if (res.ok) setUsuarios(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setSaving(true)
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setSuccess('Usuário criado com sucesso!')
      setForm({ nome: '', email: '', senha: '', gestao: '', area: '', equipe: '', especialidade: '', tipoUsuario: 'Usuário' })
      setShowCreate(false)
      load()
    } else {
      const j = await res.json()
      setError(j.error || 'Erro ao criar usuário.')
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch(`/api/admin/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    load()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title"><h1>Usuários</h1><p>Gerenciar usuários do sistema</p></div>
          <button className="btn btn-primary ms-auto" onClick={() => setShowCreate(true)}>
            <i className="bi bi-person-plus" /> Novo Usuário
          </button>
        </div>

        <div className="page-content">
          {success && <div className="alert alert-success mb-4"><i className="bi bi-check-circle" /> {success}</div>}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><i className="bi bi-people" /> Usuários ({usuarios.length})</h2>
            </div>
            {loading ? (
              <div className="empty-state"><div className="empty-state-icon"><i className="bi bi-hourglass-split" /></div></div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th><th>Email</th><th>Tipo</th>
                      <th>Gestão</th><th>Área</th><th>Status</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.nome}</strong></td>
                        <td><small className="text-muted">{u.email}</small></td>
                        <td>
                          <span className={`badge ${u.tipoUsuario === 'Admin' ? 'badge-danger' : 'badge-info'}`}>
                            {u.tipoUsuario}
                          </span>
                        </td>
                        <td><small>{u.gestao || '—'}</small></td>
                        <td><small>{u.area || '—'}</small></td>
                        <td>
                          <span className={`badge ${u.ativo ? 'badge-success' : 'badge-gray'}`}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${u.ativo ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => toggleAtivo(u.id, u.ativo)}
                          >
                            <i className={`bi ${u.ativo ? 'bi-person-x' : 'bi-person-check'}`} />
                            {' '}{u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-person-plus" /> Novo Usuário</span>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row row-2">
                  <div className="form-group">
                    <label className="form-label">Nome *</label>
                    <input className="form-control" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                  </div>
                </div>
                <div className="row row-2">
                  <div className="form-group">
                    <label className="form-label">Senha *</label>
                    <input type="password" className="form-control" value={form.senha} onChange={(e) => setForm({...form, senha: e.target.value})} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={form.tipoUsuario} onChange={(e) => setForm({...form, tipoUsuario: e.target.value})}>
                      <option value="Usuário">Usuário</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="row row-2">
                  <div className="form-group">
                    <label className="form-label">Gestão</label>
                    <input className="form-control" value={form.gestao} onChange={(e) => setForm({...form, gestao: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Área</label>
                    <input className="form-control" value={form.area} onChange={(e) => setForm({...form, area: e.target.value})} />
                  </div>
                </div>
                <div className="row row-2">
                  <div className="form-group">
                    <label className="form-label">Equipe</label>
                    <input className="form-control" value={form.equipe} onChange={(e) => setForm({...form, equipe: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Especialidade</label>
                    <input className="form-control" value={form.especialidade} onChange={(e) => setForm({...form, especialidade: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Criando…' : <><i className="bi bi-check-circle" /> Criar Usuário</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
