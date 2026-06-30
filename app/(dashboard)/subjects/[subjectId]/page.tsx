import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    notFound()
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  })

  if (!subject || subject.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-neutral-100">
        {subject.name}
      </h1>
      <p className="mt-4 text-sm text-neutral-500">
        Lectures and notes coming soon
      </p>
    </div>
  )
}
