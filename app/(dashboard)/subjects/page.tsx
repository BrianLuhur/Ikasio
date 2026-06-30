"use client"

import { useState } from "react"
import Link from "next/link"
import { CreateSubjectModal } from "@/components/sidebar/create-subject-modal"
import { useSubjects } from "@/components/sidebar/subjects-provider"

export default function SubjectsPage() {
  const { subjects, isLoading, addSubject } = useSubjects()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-neutral-600">
          Create your first subject to get started
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + New Subject
        </button>

        {isModalOpen && (
          <CreateSubjectModal
            onClose={() => setIsModalOpen(false)}
            onCreated={(subject) => {
              addSubject(subject)
              setIsModalOpen(false)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-neutral-900">
            Your Subjects
          </h1>
          <p className="text-sm text-neutral-500">
            Select a subject from the sidebar, or click one below
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + New Subject
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className="rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <div className="mb-2 flex items-center gap-2">
              {subject.colour && (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: subject.colour }}
                />
              )}
              <span className="font-medium text-neutral-900 truncate">
                {subject.name}
              </span>
            </div>
            {subject.description && (
              <p className="text-xs text-neutral-500 line-clamp-2">
                {subject.description}
              </p>
            )}
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <CreateSubjectModal
          onClose={() => setIsModalOpen(false)}
          onCreated={(subject) => {
            addSubject(subject)
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
