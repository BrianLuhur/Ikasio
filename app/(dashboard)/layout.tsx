import { Sidebar } from "@/components/sidebar/sidebar"
import { SubjectsProvider } from "@/components/sidebar/subjects-provider"
import { auth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SubjectsProvider>
      <div className="flex h-screen">
        <Sidebar user={session?.user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SubjectsProvider>
  )
}
