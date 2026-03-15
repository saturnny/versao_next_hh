import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUsuario } from '@/lib/sharepoint'
import bcrypt from 'bcryptjs'

interface RouteParams { params: { id: string } }

// PATCH /api/admin/usuarios/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.json()
  const updateData: Parameters<typeof updateUsuario>[1] = {}

  if (body.nome) updateData.nome = body.nome
  if (body.gestao !== undefined) updateData.gestao = body.gestao
  if (body.area !== undefined) updateData.area = body.area
  if (body.equipe !== undefined) updateData.equipe = body.equipe
  if (body.especialidade !== undefined) updateData.especialidade = body.especialidade
  if (body.tipoUsuario) updateData.tipoUsuario = body.tipoUsuario
  if (body.ativo !== undefined) updateData.ativo = body.ativo
  if (body.senha) updateData.senhaHash = await bcrypt.hash(body.senha, 12)

  await updateUsuario(params.id, updateData)
  return NextResponse.json({ success: true })
}
