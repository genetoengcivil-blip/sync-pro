import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  console.log('Middleware - Path:', url.pathname, 'User:', !!user)

  // Rotas públicas
  const isPublicRoute = url.pathname === '/login' || url.pathname === '/'
  const isProtectedRoute = url.pathname.startsWith('/personal') || url.pathname.startsWith('/aluno')

  // Redireciona para login se tentar acessar rota protegida sem estar logado
  if (!user && isProtectedRoute) {
    console.log('Middleware - Redirecionando para login')
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redireciona para dashboard se tentar acessar login já logado
  if (user && isPublicRoute) {
    console.log('Middleware - Redirecionando para dashboard')
    const redirectUrl = new URL('/personal', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}