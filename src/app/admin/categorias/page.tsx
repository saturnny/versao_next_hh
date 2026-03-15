'use client'
import { useEffect, useState, FormEvent } from 'react'
import Sidebar from '@/components/Sidebar'

interface Categoria { id: string; nome: string }

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/categorias')
    if (res.ok) setCategorias(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/admin/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    })
    setSaving(false)
    if (res.ok) { setNome(''); setShowModal(false); load() }
    else { const j = await res.json(); setError(j.error || 'Erro ao criar.') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta categoria? Atividades vinculadas podem ser afetadas.')) return
    await fetch('/api/admin/categorias', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title"><h1>Categorias</h1><p>Gerenciar categorias de atividades</p></div>
          <button className="btn btn-primary ms-auto" onClick={() => { setNome(''); setError(''); setShowModal(true) }}>
            <i className="bi bi-plus-circle" /> Nova Categoria
          </button>
        </div>
        <div className="page-content">
          <div className="card">
            <div className="card-header"><h2 className="card-title"><i className="bi bi-tags" /> Categorias ({categorias.length})</h2></div>
            {loading ? (
              <div className="empty-state"><div className="empty-state-icon"><i className="bi bi-hourglass-split" /></div></div>
            ) : categorias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-tags" /></div>
                <div className="empty-state-title">Nenhuma categoria cadastrada</div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><i className="bi bi-plus-circle" /> Criar Categoria</button>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead><tr><th>Nome</th><th style={{ width: 100 }}>Ações</th></tr></thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.nome}</strong></td>
                        <td>
                          <button className="btn btn-sm btn-danger btn-icon" title="Excluir" onClick={() => handleDelete(c.id)}>
                            <i className="bi bi-trash" />
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-plus-circle" /> Nova Categoria</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Desenvolvimento, Reuniões…" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Criando…' : 'Criar Categoria'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
