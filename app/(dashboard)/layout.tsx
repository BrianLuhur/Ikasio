import { Sidebar } from "@/components/sidebar/sidebar"
import { SubjectsProvider } from "@/components/sidebar/subjects-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubjectsProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SubjectsProvider>
  )
}
