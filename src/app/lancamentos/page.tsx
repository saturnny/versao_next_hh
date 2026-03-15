'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import LancamentoModal from '@/components/LancamentoModal'
import type { Lancamento, Atividade } from '@/lib/types'

export default function LancamentosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<Lancamento | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filtroData, setFiltroData] = useState('')

  async function loadData() {
    setLoading(true)
    const url = filtroData ? `/api/lancamentos?data=${filtroData}` : '/api/lancamentos'
    const [lRes, aRes] = await Promise.all([
      fetch(url),
      fetch('/api/atividades'),
    ])
    if (lRes.ok) setLancamentos(await lRes.json())
    if (aRes.ok) setAtividades(await aRes.json())
    setLoading(false)
  }

  useEffect(() => { loadData() }, [filtroData])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/lancamentos/${id}`, { method: 'DELETE' })
    if (res.ok) loadData()
    setDeleteId(null)
  }

  function isEditable(data: string) {
    const d = new Date(data)
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    return d >= yesterday
  }

  const totalHoras = lancamentos.reduce((s, l) => s + l.duracaoHoras, 0)

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h1>Meus Lançamentos</h1>
            <p>Histórico de atividades registradas</p>
          </div>
          <button
            className="btn btn-primary ms-auto"
            onClick={() => { setEditData(null); setShowModal(true) }}
          >
            <i className="bi bi-plus-circle" /> Novo Lançamento
          </button>
        </div>

        <div className="page-content">
          {/* Filtros e resumo */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-center" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, maxWidth: 260 }}>
                  <label className="form-label">Filtrar por data</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                  />
                </div>
                {filtroData && (
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: 22 }}
                    onClick={() => setFiltroData('')}
                  >
                    <i className="bi bi-x-circle" /> Limpar
                  </button>
                )}
                <div style={{ marginLeft: 'auto', marginTop: 22 }}>
                  <span className="badge badge-success" style={{ fontSize: '0.92rem', padding: '6px 14px' }}>
                    <i className="bi bi-clock me-1" />
                    Total: {totalHoras.toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <i className="bi bi-list-ul" /> Lançamentos ({lancamentos.length})
              </h2>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-hourglass-split" /></div>
                <div className="empty-state-desc">Carregando…</div>
              </div>
            ) : lancamentos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-clipboard-x" /></div>
                <div className="empty-state-title">Nenhum lançamento encontrado</div>
                <div className="empty-state-desc">
                  {filtroData ? 'Nenhum lançamento para esta data.' : 'Você ainda não possui lançamentos registrados.'}
                </div>
                <button className="btn btn-primary" onClick={() => { setEditData(null); setShowModal(true) }}>
                  <i className="bi bi-plus-circle" /> Novo Lançamento
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Início</th>
                      <th>Fim</th>
                      <th>Atividade</th>
                      <th>Categoria</th>
                      <th>Duração</th>
                      <th>Observação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((l) => {
                      const [y, m, d] = l.data.split('-')
                      const editable = isEditable(l.data)
                      return (
                        <tr key={l.id}>
                          <td><span className="badge badge-gray">{`${d}/${m}/${y}`}</span></td>
                          <td>{l.horaInicio}</td>
                          <td>{l.horaFim}</td>
                          <td><span className="badge badge-primary">{l.atividadeNome}</span></td>
                          <td><small className="text-muted">{l.categoriaNome}</small></td>
                          <td><span className="badge badge-success">{l.duracaoHoras.toFixed(1)}h</span></td>
                          <td><small className="text-muted">{l.observacao || '—'}</small></td>
                          <td>
                            {editable ? (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-icon btn-outline"
                                  title="Editar"
                                  onClick={() => { setEditData(l); setShowModal(true) }}
                                >
                                  <i className="bi bi-pencil" />
                                </button>
                                <button
                                  className="btn btn-sm btn-icon btn-danger"
                                  title="Excluir"
                                  onClick={() => setDeleteId(l.id)}
                                >
                                  <i className="bi bi-trash" />
                                </button>
                              </div>
                            ) : (
                              <small className="text-muted">—</small>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <LancamentoModal
          atividades={atividades}
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null) }}
          onSaved={loadData}
        />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--danger)' }}>
                <i className="bi bi-exclamation-triangle" /> Confirmar Exclusão
              </span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir este lançamento? Esta ação não poderá ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>
                <i className="bi bi-trash" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
