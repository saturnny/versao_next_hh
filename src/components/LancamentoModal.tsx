'use client'
import { useState, FormEvent } from 'react'
import type { Lancamento, Atividade } from '@/lib/types'

interface Props {
  atividades: Atividade[]
  editData?: Lancamento | null
  onClose: () => void
  onSaved: () => void
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function LancamentoModal({ atividades, editData, onClose, onSaved }: Props) {
  const isEdit = !!editData

  const [data, setData] = useState(editData?.data || todayStr())
  const [horaInicio, setHoraInicio] = useState(editData?.horaInicio || '')
  const [horaFim, setHoraFim] = useState(editData?.horaFim || '')
  const [atividadeId, setAtividadeId] = useState(editData?.atividadeId || '')
  const [observacao, setObservacao] = useState(editData?.observacao || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function calcDuracao() {
    if (!horaInicio || !horaFim) return null
    const [ah, am] = horaInicio.split(':').map(Number)
    const [bh, bm] = horaFim.split(':').map(Number)
    const mins = (bh * 60 + bm) - (ah * 60 + am)
    if (mins <= 0) return null
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h${m > 0 ? ` ${m}min` : ''}`
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!horaInicio || !horaFim || !atividadeId) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    const [ah, am] = horaInicio.split(':').map(Number)
    const [bh, bm] = horaFim.split(':').map(Number)
    if (bh * 60 + bm <= ah * 60 + am) {
      setError('A hora de fim deve ser maior que a hora de início.')
      return
    }

    setLoading(true)
    let res: Response

    if (isEdit && editData) {
      res = await fetch(`/api/lancamentos/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horaInicio, horaFim, atividadeId, observacao }),
      })
    } else {
      res = await fetch('/api/lancamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, horaInicio, horaFim, atividadeId, observacao }),
      })
    }

    setLoading(false)

    if (res.ok) {
      onSaved()
      onClose()
    } else {
      const j = await res.json()
      setError(j.error || 'Erro ao salvar lançamento.')
    }
  }

  const duracao = calcDuracao()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <i className={`bi ${isEdit ? 'bi-pencil' : 'bi-plus-circle'}`} />
            {' '}{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle" /> {error}</div>}

            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-control"
                value={data}
                onChange={(e) => setData(e.target.value)}
                readOnly={isEdit}
                required
              />
              {isEdit && <small className="text-muted text-sm mt-2">A data não pode ser alterada.</small>}
            </div>

            <div className="row row-2">
              <div className="form-group">
                <label className="form-label">Hora Início</label>
                <input
                  type="time"
                  className="form-control"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hora Fim</label>
                <input
                  type="time"
                  className="form-control"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />
              </div>
            </div>

            {duracao && (
              <div className="alert alert-info mb-4">
                <i className="bi bi-hourglass-split" />
                <strong>Duração calculada:</strong> {duracao}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Atividade</label>
              <select
                className="form-select"
                value={atividadeId}
                onChange={(e) => setAtividadeId(e.target.value)}
                required
              >
                <option value="">Selecione uma atividade…</option>
                {atividades.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.categoriaNome})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Observação <span className="text-muted">(opcional)</span></label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Descreva o que foi feito nesta atividade…"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><i className="bi bi-hourglass-split" /> Salvando…</>
              ) : (
                <><i className="bi bi-check-circle" /> {isEdit ? 'Atualizar' : 'Salvar'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
