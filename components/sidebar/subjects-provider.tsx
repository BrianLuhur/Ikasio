"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react"

export type Subject = {
  id: string
  name: string
  description: string | null
  colour: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

type SubjectsContextValue = {
  subjects: Subject[]
  isLoading: boolean
  addSubject: (subject: Subject) => void
  refetch: () => Promise<void>
}

const SubjectsContext = createContext<SubjectsContextValue | null>(null)

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/subjects")
      if (res.ok) {
        const data: Subject[] = await res.json()
        setSubjects(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern; proper fix would require a data-fetching library (SWR/React Query), out of scope for Day 4
    fetchSubjects()
  }, [fetchSubjects])

  const addSubject = useCallback((subject: Subject) => {
    setSubjects((prev) => [...prev, subject])
  }, [])

  return (
    <SubjectsContext.Provider
      value={{ subjects, isLoading, addSubject, refetch: fetchSubjects }}
    >
      {children}
    </SubjectsContext.Provider>
  )
}

export function useSubjects() {
  const ctx = useContext(SubjectsContext)
  if (!ctx) {
    throw new Error("useSubjects must be used within a SubjectsProvider")
  }
  return ctx
}
