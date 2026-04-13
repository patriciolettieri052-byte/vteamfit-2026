export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative z-10"
      style={{
        backgroundImage: "url('/images/carbon-texture-v4.webp')",
        backgroundRepeat: 'repeat',
        backgroundSize: '500px'
      }}
    >
      {children}
    </div>
  )
}
