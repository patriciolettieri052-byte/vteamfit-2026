import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json()
  const { password } = body

  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin no configurado' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_auth', 'valid', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
    sameSite: 'strict',
  })

  return NextResponse.json({ success: true })
}
