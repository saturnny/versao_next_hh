import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCategorias, createCategoria, deleteCategoria } from '@/lib/sharepoint'

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const categorias = await getCategorias()
  return NextResponse.json(categorias)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { nome } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  const categoria = await createCategoria(nome)
  return NextResponse.json(categoria, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await deleteCategoria(id)
  return NextResponse.json({ success: true })
}
