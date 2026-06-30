"use client"

import { useState } from "react"
import type { Subject } from "./subjects-provider"

type EditSubjectModalProps = {
  subject: Subject
  onClose: () => void
  onUpdated: (subject: Subject) => void
}

const PRESET_COLOURS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
]

export function EditSubjectModal({ subject, onClose, onUpdated }: EditSubjectModalProps) {
  const [name, setName] = useState(subject.name)
  const [selectedColour, setSelectedColour] = useState<string | null>(subject.colour)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Subject name is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/subjects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subject.id,
          name: trimmedName,
          colour: selectedColour,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? "Failed to update subject")
        setIsSubmitting(false)
        return
      }

      const updatedSubject: Subject = await res.json()
      onUpdated(updatedSubject)
    } catch {
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
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
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">
          Edit Subject
        </h3>

        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />

        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Colour
        </label>
        <div className="mb-4 flex gap-2">
          {PRESET_COLOURS.map((colour) => (
            <button
              key={colour}
              type="button"
              onClick={() => setSelectedColour(colour)}
              className={`h-7 w-7 rounded-full transition-transform ${
                selectedColour === colour
                  ? "ring-2 ring-offset-2 ring-neutral-900 scale-110"
                  : ""
              }`}
              style={{ backgroundColor: colour }}
              aria-label={`Select colour ${colour}`}
            />
          ))}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
