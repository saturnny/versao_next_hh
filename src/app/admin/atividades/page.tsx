'use client'
import { useEffect, useState, FormEvent } from 'react'
import Sidebar from '@/components/Sidebar'

interface Categoria { id: string; nome: string }
interface Atividade { id: string; nome: string; categoriaId: string; categoriaNome: string }

export default function AdminAtividadesPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Atividade | null>(null)
  const [form, setForm] = useState({ nome: '', categoriaId: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [aRes, cRes] = await Promise.all([
      fetch('/api/admin/atividades'),
      fetch('/api/admin/categorias'),
    ])
    if (aRes.ok) setAtividades(await aRes.json())
    if (cRes.ok) setCategorias(await cRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditItem(null); setForm({ nome: '', categoriaId: '' }); setError(''); setShowModal(true) }
  function openEdit(a: Atividade) { setEditItem(a); setForm({ nome: a.nome, categoriaId: a.categoriaId }); setError(''); setShowModal(true) }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    const cat = categorias.find((c) => c.id === form.categoriaId)
    if (!cat) { setError('Selecione uma categoria.'); return }
    setSaving(true)
    const res = editItem
      ? await fetch('/api/admin/atividades', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItem.id, nome: form.nome, categoriaId: form.categoriaId, categoriaNome: cat.nome }),
        })
      : await fetch('/api/admin/atividades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: form.nome, categoriaId: form.categoriaId, categoriaNome: cat.nome }),
        })
    setSaving(false)
    if (res.ok) { setShowModal(false); load() }
    else { const j = await res.json(); setError(j.error || 'Erro ao salvar.') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta atividade?')) return
    await fetch('/api/admin/atividades', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title"><h1>Atividades</h1><p>Gerenciar atividades disponíveis</p></div>
          <button className="btn btn-primary ms-auto" onClick={openCreate}><i className="bi bi-plus-circle" /> Nova Atividade</button>
        </div>
        <div className="page-content">
          <div className="card">
            <div className="card-header"><h2 className="card-title"><i className="bi bi-list-task" /> Atividades ({atividades.length})</h2></div>
            {loading ? (
              <div className="empty-state"><div className="empty-state-icon"><i className="bi bi-hourglass-split" /></div></div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead><tr><th>Nome</th><th>Categoria</th><th>Ações</th></tr></thead>
                  <tbody>
                    {atividades.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.nome}</strong></td>
                        <td><span className="badge badge-info">{a.categoriaNome}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline btn-icon" title="Editar" onClick={() => openEdit(a)}><i className="bi bi-pencil" /></button>
                            <button className="btn btn-sm btn-danger btn-icon" title="Excluir" onClick={() => handleDelete(a.id)}><i className="bi bi-trash" /></button>
                          </div>
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
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><i className={`bi ${editItem ? 'bi-pencil' : 'bi-plus-circle'}`} /> {editItem ? 'Editar' : 'Nova'} Atividade</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input className="form-control" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria *</label>
                  <select className="form-select" value={form.categoriaId} onChange={(e) => setForm({...form, categoriaId: e.target.value})} required>
                    <option value="">Selecione…</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
