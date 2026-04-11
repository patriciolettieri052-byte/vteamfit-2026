'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      name: 'Stats',
      href: '/dashboard/stats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      name: 'Perfil',
      href: '/dashboard/perfil',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-white/5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-safe-offset-2">
      <div className="flex justify-around items-center h-[88px] pb-4 pt-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={isActive ? '#' : item.href}
              className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${
                isActive ? 'text-copper' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,107,74,0.5)]' : 'scale-100'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-widest uppercase transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
