"use client"

import { useState } from "react"

type DeleteSubjectModalProps = {
  subjectId: string
  subjectName: string
  onClose: () => void
  onDeleted: (subjectId: string) => void
}

export function DeleteSubjectModal({
  subjectId,
  subjectName,
  onClose,
  onDeleted,
}: DeleteSubjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/subjects?id=${subjectId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? "Failed to delete subject")
        setIsDeleting(false)
        return
      }

      onDeleted(subjectId)
    } catch {
      setError("Something went wrong. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
          Delete &quot;{subjectName}&quot;?
        </h3>
        <p className="mb-4 text-sm text-neutral-600">
          This permanently deletes all lectures, notes, chat messages, study
          sessions, and practice questions for this subject. This cannot be
          undone.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
