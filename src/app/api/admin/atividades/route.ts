import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAtividades, createAtividade, updateAtividade, deleteAtividade } from '@/lib/sharepoint'

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const atividades = await getAtividades()
  return NextResponse.json(atividades)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { nome, categoriaId, categoriaNome } = await req.json()
  if (!nome || !categoriaId || !categoriaNome) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }
  const atividade = await createAtividade({ nome, categoriaId, categoriaNome })
  return NextResponse.json(atividade, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id, nome, categoriaId, categoriaNome } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await updateAtividade(id, { nome, categoriaId, categoriaNome })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await deleteAtividade(id)
  return NextResponse.json({ success: true })
}
