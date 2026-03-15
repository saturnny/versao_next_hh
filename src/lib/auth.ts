import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUsuarioByEmail } from './sharepoint'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await getUsuarioByEmail(credentials.email)
          if (!user || !user.ativo) return null

          const senhaValida = await bcrypt.compare(credentials.password, user.senhaHash)
          if (!senhaValida) return null

          return {
            id: user.id,
            name: user.nome,
            email: user.email,
            tipoUsuario: user.tipoUsuario,
          }
        } catch (err) {
          console.error('Erro na autenticação:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tipoUsuario = (user as { tipoUsuario?: string }).tipoUsuario
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { tipoUsuario?: string }).tipoUsuario = token.tipoUsuario as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
}
