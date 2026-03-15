import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Bloquear acesso admin para não-admins
    if (pathname.startsWith('/admin') && token?.tipoUsuario !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        // Requer sessão ativa para qualquer rota protegida
        return !!token
      },
    },
    pages: {
      signIn: '/',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lancamentos/:path*',
    '/perfil/:path*',
    '/admin/:path*',
    '/api/lancamentos/:path*',
    '/api/atividades/:path*',
    '/api/categorias/:path*',
    '/api/admin/:path*',
  ],
}
