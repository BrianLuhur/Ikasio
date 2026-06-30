"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CreateSubjectModal } from "./create-subject-modal"
import { EditSubjectModal } from "./edit-subject-modal"
import { DeleteSubjectModal } from "./delete-subject-modal"
import { SubjectMenu } from "./subject-menu"
import { AccountMenu } from "./account-menu"
import { useSubjects, type Subject } from "./subjects-provider"

type SidebarUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function Sidebar({ user }: { user?: SidebarUser }) {
  const { subjects, isLoading, addSubject, updateSubject, removeSubject } =
    useSubjects()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const handleDeleted = (subjectId: string) => {
    removeSubject(subjectId)
    setSubjectToDelete(null)
    if (pathname === `/subjects/${subjectId}`) {
      router.push("/subjects")
    }
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/subjects"
          className="text-sm font-semibold text-neutral-500 uppercase tracking-wide hover:text-neutral-900"
        >
          iKasio
        </Link>
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        + New Subject
      </button>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {isLoading && (
          <p className="px-2 text-sm text-neutral-400">Loading...</p>
        )}
        {!isLoading && subjects.length === 0 && (
          <p className="px-2 text-sm text-neutral-400">No subjects yet</p>
        )}
        {subjects.map((subject) => {
          const isActive = pathname === `/subjects/${subject.id}`
          return (
            <div key={subject.id} className="group relative">
              <Link
                href={`/subjects/${subject.id}`}
                className={`flex items-center gap-2 rounded-md py-2 pl-2 pr-8 text-sm transition-colors ${
                  isActive
                    ? "bg-neutral-200 font-medium text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-300"
                }`}
              >
                {subject.colour && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.colour }}
                  />
                )}
                <span className="truncate">{subject.name}</span>
              </Link>
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <SubjectMenu
                  onEdit={() => setSubjectToEdit(subject)}
                  onDelete={() => setSubjectToDelete(subject)}
                />
              </div>
            </div>
          )
        })}
      </nav>
      {user && (
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <AccountMenu user={user} />
        </div>
      )}
      {isModalOpen && (
        <CreateSubjectModal
          onClose={() => setIsModalOpen(false)}
          onCreated={(subject) => {
            addSubject(subject)
            setIsModalOpen(false)
          }}
        />
      )}
      {subjectToEdit && (
        <EditSubjectModal
          subject={subjectToEdit}
          onClose={() => setSubjectToEdit(null)}
          onUpdated={(subject) => {
            updateSubject(subject)
            setSubjectToEdit(null)
          }}
        />
      )}
      {subjectToDelete && (
        <DeleteSubjectModal
          subjectId={subjectToDelete.id}
          subjectName={subjectToDelete.name}
          onClose={() => setSubjectToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </aside>
  )
}
