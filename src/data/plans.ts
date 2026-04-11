import { Plan } from '@/types'

export const PLANS: Plan[] = [
  {
    id: '1',
    slug: 'gluteos-de-acero',
    name_es: 'Glúteos de Acero',
    name_en: 'Steel Glutes',
    description_es: 'Plan de 84 días enfocado en glúteos y tren inferior. Transforma tu cuerpo con entrenamientos progresivos diseñados para moldear y fortalecer los glúteos.',
    description_en: '84-day plan focused on glutes and lower body. Transform your body with progressive workouts designed to shape and strengthen your glutes.',
    price: 49.9,
    duration_days: 84,
    plan_type: 'weeks_days',
    cover_image: '/images/fotos/gluteos.jpg',
    status: 'active',
  },
  {
    id: '2',
    slug: 'plan-padel',
    name_es: 'Plan Pádel',
    name_en: 'Padel Plan',
    description_es: 'Plan de 168 días para mejorar en pádel con entrenamiento de prevención, fuerza y velocidad específica para la pista.',
    description_en: '168-day plan to improve your padel game with prevention, strength and speed training specific for the court.',
    price: 49.9,
    duration_days: 168,
    plan_type: 'weeks_days',
    cover_image: '/images/fotos/plan-padel.jpg',
    status: 'not_purchased',
  },
  {
    id: '3',
    slug: 'fisico-en-pista-padel',
    name_es: 'Físico en Pista para Pádel',
    name_en: 'Court Fitness for Padel',
    description_es: 'Certificación completa de físico en pista para pádel: movilidad, golpes, reacción, coordinación, equilibrio, velocidad, explosividad y estiramientos.',
    description_en: 'Complete court fitness certification for padel: mobility, shots, reaction, coordination, balance, speed, explosiveness and stretching.',
    price: 249,
    duration_days: 19,
    plan_type: 'modules_exercises',
    cover_image: '/images/fotos/fisico-pista-padel.jpg',
    status: 'not_purchased',
  },
  {
    id: '4',
    slug: 'transforma-tu-cuerpo',
    name_es: 'Transforma Tu Cuerpo',
    name_en: 'Transform Your Body',
    description_es: 'Plan de 196 días para transformar tu cuerpo con entrenamiento de fuerza e hipertrofia. El programa más completo de VTeamFit.',
    description_en: '196-day plan to transform your body with strength and hypertrophy training. The most complete VTeamFit program.',
    price: 49.9,
    duration_days: 196,
    plan_type: 'weeks_days',
    cover_image: '/images/fotos/transforma-tu-cuerpo.jpg',
    status: 'not_purchased',
  },
]

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find(p => p.slug === slug)
}
