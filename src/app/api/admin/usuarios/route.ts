import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsuarios, createUsuario } from '@/lib/sharepoint'
import bcrypt from 'bcryptjs'

// GET /api/admin/usuarios
export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const usuarios = await getUsuarios()
  // Remover senhaHash antes de enviar
  return NextResponse.json(
    usuarios.map(({ senhaHash: _, ...u }) => u)
  )
}

// POST /api/admin/usuarios
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { tipoUsuario?: string } | undefined
  if (!session || user?.tipoUsuario !== 'Admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { nome, email, senha, gestao, area, equipe, especialidade, tipoUsuario } = body

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(senha, 12)
    const novoUsuario = await createUsuario({
      nome, email, senhaHash, gestao, area, equipe, especialidade,
      tipoUsuario: tipoUsuario || 'Usuário',
    })

    const { senhaHash: _, ...usuarioSemSenha } = novoUsuario
    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar usuário:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
