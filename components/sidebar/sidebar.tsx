"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreateSubjectModal } from "./create-subject-modal"
import { useSubjects } from "./subjects-provider"

export function Sidebar() {
  const { subjects, isLoading, addSubject } = useSubjects()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/subjects"
          className="text-sm font-semibold text-neutral-500 uppercase tracking-wide hover:text-neutral-900"
        >
          Subjects
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
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-neutral-200 font-medium text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {subject.colour && (
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: subject.colour }}
                />
              )}
              <span className="truncate">{subject.name}</span>
            </Link>
          )
        })}
      </nav>

      {isModalOpen && (
        <CreateSubjectModal
          onClose={() => setIsModalOpen(false)}
          onCreated={(subject) => {
            addSubject(subject)
            setIsModalOpen(false)
          }}
        />
      )}
    </aside>
  )
}
