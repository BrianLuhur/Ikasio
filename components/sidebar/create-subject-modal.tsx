"use client"

import { useState } from "react"

type Subject = {
  id: string
  name: string
  description: string | null
  colour: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

type CreateSubjectModalProps = {
  onClose: () => void
  onCreated: (subject: Subject) => void
}

const PRESET_COLOURS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
]

export function CreateSubjectModal({ onClose, onCreated }: CreateSubjectModalProps) {
  const [name, setName] = useState("")
  const [selectedColour, setSelectedColour] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Subject name is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          colour: selectedColour,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? "Failed to create subject")
        setIsSubmitting(false)
        return
      }

      const newSubject: Subject = await res.json()
      onCreated(newSubject)
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
          New Subject
        </h3>

        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Operating Systems"
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

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

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
            onClick={handleCreate}
            disabled={isSubmitting}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}