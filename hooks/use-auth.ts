"use client"

import { useState, useEffect } from "react"
import type { User } from "@/payload-types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = (await response.json()) as unknown
          const userValue =
            isRecord(data) && "user" in data ? (data.user as unknown) : null

          if (userValue && typeof userValue === "object") {
            setIsAuthenticated(true)
            setUser(userValue as User)
          } else {
            setIsAuthenticated(false)
            setUser(null)
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return { isAuthenticated, isLoading, user }
}
