'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import LancamentoModal from '@/components/LancamentoModal'
import type { Lancamento, Atividade } from '@/lib/types'

interface SessionUser { name?: string | null; email?: string | null; tipoUsuario?: string }

function calcDur(h1: string, h2: string) {
  const [ah, am] = h1.split(':').map(Number)
  const [bh, bm] = h2.split(':').map(Number)
  return Math.max(0, ((bh * 60 + bm) - (ah * 60 + am)) / 60)
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editLancamento, setEditLancamento] = useState<Lancamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const today = todayStr()

  async function loadData() {
    setLoading(true)
    const [lRes, aRes] = await Promise.all([
      fetch('/api/lancamentos?limit=20'),
      fetch('/api/atividades'),
    ])
    if (lRes.ok) setLancamentos(await lRes.json())
    if (aRes.ok) setAtividades(await aRes.json())
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const lancamentosHoje = lancamentos.filter((l) => l.data === today)
  const horasHoje = lancamentosHoje.reduce((s, l) => s + l.duracaoHoras, 0)
  // Pendentes: dias úteis sem lançamento nos últimos 7 dias (simplificado)
  const totalSemana = lancamentos
    .filter((l) => {
      const d = new Date(l.data); const now = new Date()
      return (now.getTime() - d.getTime()) < 7 * 86400000
    })
    .reduce((s, l) => s + l.duracaoHoras, 0)

  async function handleDelete(id: string) {
    const res = await fetch(`/api/lancamentos/${id}`, { method: 'DELETE' })
    if (res.ok) loadData()
    setDeleteId(null)
  }

  function isEditable(data: string) {
    const d = new Date(data)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    return d >= yesterday
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">
            <h1>Dashboard</h1>
            <p>Bem-vindo(a) de volta, {user?.name}!</p>
          </div>
          <button
            className="btn btn-primary ms-auto"
            onClick={() => { setEditLancamento(null); setShowModal(true) }}
          >
            <i className="bi bi-plus-circle" /> Novo Lançamento
          </button>
        </div>

        <div className="page-content">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary"><i className="bi bi-clipboard-data" /></div>
              <div>
                <div className="stat-value">{lancamentosHoje.length}</div>
                <div className="stat-label">Lançamentos Hoje</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><i className="bi bi-clock" /></div>
              <div>
                <div className="stat-value">{horasHoje.toFixed(1)}h</div>
                <div className="stat-label">Horas Hoje</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><i className="bi bi-calendar-week" /></div>
              <div>
                <div className="stat-value">{totalSemana.toFixed(1)}h</div>
                <div className="stat-label">Horas na Semana</div>
              </div>
            </div>
          </div>

          {/* Lançamentos recentes */}
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-center justify-between">
                <div>
                  <h2 className="card-title">
                    <i className="bi bi-clock-history" /> Atividades de Hoje
                  </h2>
                  <p className="card-description">Seus lançamentos recentes</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-hourglass-split" /></div>
                <div className="empty-state-desc">Carregando…</div>
              </div>
            ) : lancamentosHoje.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-clipboard-x" /></div>
                <div className="empty-state-title">Nenhum lançamento hoje</div>
                <div className="empty-state-desc">Clique em &ldquo;Novo Lançamento&rdquo; para registrar sua atividade.</div>
                <button className="btn btn-primary" onClick={() => { setEditLancamento(null); setShowModal(true) }}>
                  <i className="bi bi-plus-circle" /> Adicionar Lançamento
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
                      <th>Duração</th>
                      <th>Observação</th>
                      <th style={{ width: 100 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentosHoje.map((l) => {
                      const [y, m, d] = l.data.split('-')
                      const editable = isEditable(l.data)
                      return (
                        <tr key={l.id}>
                          <td>
                            <span className="badge badge-gray">{`${d}/${m}/${y}`}</span>
                          </td>
                          <td>{l.horaInicio}</td>
                          <td>{l.horaFim}</td>
                          <td>
                            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                              <span className="badge badge-primary">{l.atividadeNome}</span>
                              <small className="text-muted text-sm">{l.categoriaNome}</small>
                            </div>
                          </td>
                          <td><span className="badge badge-success">{l.duracaoHoras.toFixed(1)}h</span></td>
                          <td><small className="text-muted">{l.observacao || '—'}</small></td>
                          <td>
                            <div className="d-flex gap-2">
                              {editable && (
                                <>
                                  <button
                                    className="btn btn-sm btn-icon btn-outline"
                                    title="Editar"
                                    onClick={() => { setEditLancamento(l); setShowModal(true) }}
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
                                </>
                              )}
                            </div>
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

      {/* Lancamento Modal */}
      {showModal && (
        <LancamentoModal
          atividades={atividades}
          editData={editLancamento}
          onClose={() => { setShowModal(false); setEditLancamento(null) }}
          onSaved={loadData}
        />
      )}

      {/* Delete confirm */}
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
