import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { code, planPrice } = await request.json()
  const supabase = await createClient()

  const { data: discount } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (!discount) {
    return NextResponse.json({ valid: false, message: 'Código inválido' })
  }

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: 'Código vencido' })
  }

  if (discount.used_count >= discount.max_uses) {
    return NextResponse.json({ valid: false, message: 'Código agotado' })
  }

  // Calcular precio final
  let finalPrice = planPrice
  if (discount.type === 'free') finalPrice = 0
  else if (discount.type === 'percent') finalPrice = planPrice * (1 - discount.value / 100)
  else if (discount.type === 'fixed') finalPrice = Math.max(0, planPrice - discount.value)

  const roundedPrice = Math.round(finalPrice * 100) / 100

  return NextResponse.json({
    valid: true,
    type: discount.type,
    value: discount.value,
    finalPrice: roundedPrice,
    discountId: discount.id,
    code: discount.code,
    message: discount.type === 'free'
      ? '🎉 ¡Acceso gratuito activado!'
      : `✅ Descuento aplicado — Pagás $${roundedPrice.toFixed(2)} USD`,
  })
}
