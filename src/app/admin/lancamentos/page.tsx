'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Lancamento {
  id: string; usuarioNome: string; data: string
  horaInicio: string; horaFim: string
  atividadeNome: string; categoriaNome: string
  duracaoHoras: number; observacao?: string
}
interface Usuario { id: string; nome: string }

export default function AdminLancamentosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroUser, setFiltroUser] = useState('')
  const [filtroData, setFiltroData] = useState('')

  async function load() {
    setLoading(true)
    const qs = new URLSearchParams()
    if (filtroUser) qs.set('usuarioId', filtroUser)
    if (filtroData) qs.set('data', filtroData)
    const [lRes, uRes] = await Promise.all([
      fetch(`/api/admin/lancamentos?${qs}`),
      fetch('/api/admin/usuarios'),
    ])
    if (lRes.ok) setLancamentos(await lRes.json())
    if (uRes.ok) setUsuarios(await uRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filtroUser, filtroData])

  const totalHoras = lancamentos.reduce((s, l) => s + l.duracaoHoras, 0)

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title"><h1>Lançamentos (Admin)</h1><p>Visualizar todos os lançamentos</p></div>
        </div>

        <div className="page-content">
          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-center" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, maxWidth: 260 }}>
                  <label className="form-label">Filtrar por usuário</label>
                  <select className="form-select" value={filtroUser} onChange={(e) => setFiltroUser(e.target.value)}>
                    <option value="">Todos os usuários</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1, maxWidth: 220 }}>
                  <label className="form-label">Filtrar por data</label>
                  <input type="date" className="form-control" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
                </div>
                {(filtroUser || filtroData) && (
                  <button className="btn btn-secondary" style={{ marginTop: 22 }} onClick={() => { setFiltroUser(''); setFiltroData('') }}>
                    <i className="bi bi-x-circle" /> Limpar
                  </button>
                )}
                <div style={{ marginLeft: 'auto', marginTop: 22 }}>
                  <span className="badge badge-success" style={{ fontSize: '0.92rem', padding: '6px 14px' }}>
                    Total: {totalHoras.toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><i className="bi bi-clipboard-data" /> Lançamentos ({lancamentos.length})</h2>
            </div>
            {loading ? (
              <div className="empty-state"><div className="empty-state-icon"><i className="bi bi-hourglass-split" /></div></div>
            ) : lancamentos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-clipboard-x" /></div>
                <div className="empty-state-title">Nenhum lançamento</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Usuário</th><th>Data</th><th>Início</th><th>Fim</th><th>Atividade</th><th>Categoria</th><th>Duração</th><th>Observação</th></tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((l) => {
                      const [y, m, d] = l.data.split('-')
                      return (
                        <tr key={l.id}>
                          <td><strong>{l.usuarioNome}</strong></td>
                          <td><span className="badge badge-gray">{`${d}/${m}/${y}`}</span></td>
                          <td>{l.horaInicio}</td>
                          <td>{l.horaFim}</td>
                          <td><span className="badge badge-primary">{l.atividadeNome}</span></td>
                          <td><small className="text-muted">{l.categoriaNome}</small></td>
                          <td><span className="badge badge-success">{l.duracaoHoras.toFixed(1)}h</span></td>
                          <td><small className="text-muted">{l.observacao || '—'}</small></td>
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
    </div>
  )
}
