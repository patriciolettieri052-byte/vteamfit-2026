import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtener sesión — NO usar getSession() en proxy, usar getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/dashboard')
  const isOnboarding = pathname.startsWith('/onboarding')
  const isProtected = isDashboard || isOnboarding
  const isLoginWithExpired = pathname.startsWith('/login') &&
    request.nextUrl.searchParams.get('expired') === 'true'
  // /onboarding NO va en isAuthRoute — un usuario logueado SÍ puede estar ahí
  const isAuthRoute = (pathname.startsWith('/login') ||
    pathname.startsWith('/registro') ||
    pathname.startsWith('/recuperar') ||
    pathname.startsWith('/auth')) &&
    !isLoginWithExpired  // excepción: /login?expired=true siempre es accesible

  // Usuario sin sesión intenta entrar a ruta protegida → redirigir al login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Usuario con sesión intenta entrar al login/registro → redirigir al dashboard
  // EXCEPCIÓN: /login?expired=true siempre se muestra (plan vencido)
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Usuario con sesión en /onboarding → verificar si ya completó el onboarding
  // Si onboarding_complete = true → redirigir al dashboard (evita re-entrada manual)
  if (isOnboarding && user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    if (profile?.onboarding_complete) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Usuario con sesión en dashboard → verificar plan activo
  if (isDashboard && user) {
    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('id, status, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .maybeSingle()

    // Sin plan activo o plan vencido → redirigir al login con mensaje
    if (!userPlan) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('expired', 'true')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Excluir:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos con extensión (imágenes, fuentes, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
