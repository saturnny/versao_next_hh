import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLancamentoById, updateLancamento, deleteLancamento, getAtividades } from '@/lib/sharepoint'

interface RouteParams {
  params: { id: string }
}

// GET /api/lancamentos/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const lancamento = await getLancamentoById(params.id)
  if (!lancamento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const user = session.user as { id: string; tipoUsuario?: string }
  // Usuário normal só pode ver o próprio
  if (user.tipoUsuario !== 'Admin' && lancamento.usuarioId !== user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  return NextResponse.json(lancamento)
}

// PUT /api/lancamentos/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const lancamento = await getLancamentoById(params.id)
  if (!lancamento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const user = session.user as { id: string; tipoUsuario?: string }
  if (user.tipoUsuario !== 'Admin' && lancamento.usuarioId !== user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()

    let atividadeNome: string | undefined
    let categoriaNome: string | undefined

    if (body.atividadeId && body.atividadeId !== lancamento.atividadeId) {
      const atividades = await getAtividades()
      const atividade = atividades.find((a) => a.id === body.atividadeId)
      if (atividade) {
        atividadeNome = atividade.nome
        categoriaNome = atividade.categoriaNome
      }
    }

    await updateLancamento(params.id, {
      horaInicio: body.horaInicio,
      horaFim: body.horaFim,
      atividadeId: body.atividadeId,
      atividadeNome,
      categoriaNome,
      observacao: body.observacao,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao atualizar lançamento:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/lancamentos/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const lancamento = await getLancamentoById(params.id)
  if (!lancamento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const user = session.user as { id: string; tipoUsuario?: string }
  if (user.tipoUsuario !== 'Admin' && lancamento.usuarioId !== user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await deleteLancamento(params.id)
  return NextResponse.json({ success: true })
}
