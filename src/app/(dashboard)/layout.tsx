import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* A Sidebar fica fixa ou na lateral */}
      <Sidebar />
      
      {/* O Conteúdo Principal ganha um padding-left no desktop para não ficar atrás da sidebar */}
      <main className="flex-1 md:pl-72 w-full">
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}