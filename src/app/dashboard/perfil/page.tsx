'use client'

import { useAppStore } from '@/store/appStore'
import UserCard from '@/components/perfil/UserCard'
import MorePlans from '@/components/perfil/MorePlans'
import LanguageToggle from '@/components/ui/LanguageToggle'

export default function PerfilPage() {
  const { lang } = useAppStore()

  const profileLinks = [
    { 
        id: 'config', 
        name: lang === 'es' ? 'Configuración' : 'Settings', 
        icon: '⚙️' 
    },
    { 
        id: 'noti', 
        name: lang === 'es' ? 'Notificaciones' : 'Notifications', 
        icon: '🔔' 
    },
    { 
        id: 'help', 
        name: lang === 'es' ? 'Soporte y Ayuda' : 'Help & Support', 
        icon: '💬' 
    },
    { 
        id: 'legal', 
        name: lang === 'es' ? 'Políticas Legales' : 'Privacy & Legal', 
        icon: '📄' 
    }
  ]

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full px-6 pt-12 pb-12 flex flex-col gap-10">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
          {lang === 'es' ? 'Mi Perfil' : 'Profile'}
        </h1>
        <LanguageToggle />
      </header>

      {/* User Basic Info */}
      <section>
        <UserCard lang={lang} />
      </section>

      {/* Exploration Section */}
      <section>
        <MorePlans lang={lang} />
      </section>

      {/* Settings List Mockups */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 ml-2">
            {lang === 'es' ? 'Cuenta y Preferencias' : 'Account & Preferences'}
        </h3>
        {profileLinks.map((link) => (
            <button
                key={link.id}
                className="w-full flex items-center justify-between p-6 bg-surface border border-white/5 rounded-3xl hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex items-center gap-5">
                    <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                    <span className="text-white font-bold text-sm tracking-wide">{link.name}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-copper transition-colors">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
            </button>
        ))}
      </section>

      {/* Log out mock */}
      <section className="mt-4">
        <button className="w-full py-6 rounded-3xl text-dim text-sm uppercase tracking-widest hover:text-copper transition-colors">
            {lang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
        </button>
      </section>
    </main>
  )
}
