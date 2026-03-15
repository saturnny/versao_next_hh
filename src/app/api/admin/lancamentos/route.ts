import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLancamentos, getCategorias, createCategoria, deleteCategoria, getAtividades, createAtividade, updateAtividade, deleteAtividade } from '@/lib/sharepoint'

// GET /api/admin/lancamentos?usuarioId=&data=
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const usuarioId = searchParams.get('usuarioId') || undefined
  const data = searchParams.get('data') || undefined

  const lancamentos = await getLancamentos({ usuarioId, data })
  return NextResponse.json(lancamentos)
}
