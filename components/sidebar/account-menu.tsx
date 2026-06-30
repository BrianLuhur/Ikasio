"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { signOutAction } from "@/lib/actions/auth"

type AccountMenuUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function AccountMenu({ user }: { user: AccountMenuUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-neutral-100"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Account"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neutral-300" />
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs text-neutral-500">{user.email}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full rounded-md border bg-white p-1 shadow-md">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
