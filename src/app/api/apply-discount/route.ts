import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Verificar sesión activa
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { discountId } = body

  if (!discountId) {
    return NextResponse.json({ error: 'discountId es requerido' }, { status: 400 })
  }

  // Obtenemos el registro actual
  const { data: currentDiscount } = await supabase
    .from('discount_codes')
    .select('used_count')
    .eq('id', discountId)
    .single()

  if (!currentDiscount) {
    return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
  }

  // Incrementamos el uso
  const { error } = await supabase
    .from('discount_codes')
    .update({ used_count: currentDiscount.used_count + 1 })
    .eq('id', discountId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
