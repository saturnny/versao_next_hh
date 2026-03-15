import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsuarioById, updateUsuario } from '@/lib/sharepoint'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = session.user as { id: string }
  const { senhaAtual, novaSenha } = await req.json()

  if (!senhaAtual || !novaSenha) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  if (novaSenha.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  const usuario = await getUsuarioById(user.id)
  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash)
  if (!senhaValida) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })

  const senhaHash = await bcrypt.hash(novaSenha, 12)
  await updateUsuario(user.id, { senhaHash })

  return NextResponse.json({ success: true })
}
