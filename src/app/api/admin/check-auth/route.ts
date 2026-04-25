import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/** Endpoint para verificar si la cookie de admin está presente y válida */
export async function GET() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (adminAuth?.value === 'valid') {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
