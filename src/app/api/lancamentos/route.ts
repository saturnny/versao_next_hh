import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLancamentos, createLancamento, getAtividades } from '@/lib/sharepoint'
import type { LancamentoCreate } from '@/lib/types'

// GET /api/lancamentos
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = session.user as { id: string; tipoUsuario?: string }
  const { searchParams } = req.nextUrl
  const limitParam = searchParams.get('limit')
  const filtroData = searchParams.get('data') || undefined

  // Admin pode ver de todos; usuário normal só vê os próprios
  const usuarioId = user.tipoUsuario === 'Admin' ? undefined : user.id

  const lancamentos = await getLancamentos({
    usuarioId,
    data: filtroData,
    limit: limitParam ? parseInt(limitParam) : undefined,
  })

  return NextResponse.json(lancamentos)
}

// POST /api/lancamentos
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = session.user as { id: string; name?: string | null }

  try {
    const body = (await req.json()) as LancamentoCreate

    // Validações básicas
    if (!body.data || !body.horaInicio || !body.horaFim || !body.atividadeId) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // Buscar atividade para obter nome e categoria
    const atividades = await getAtividades()
    const atividade = atividades.find((a) => a.id === body.atividadeId)
    if (!atividade) {
      return NextResponse.json({ error: 'Atividade não encontrada' }, { status: 404 })
    }

    const lancamento = await createLancamento(
      body,
      { id: user.id, nome: user.name || 'Usuário' },
      { id: atividade.id, nome: atividade.nome, categoriaNome: atividade.categoriaNome }
    )

    return NextResponse.json(lancamento, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar lançamento:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
