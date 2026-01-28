"use client"

import { useState, useEffect } from "react"

/**
 * Client-side hook to check if a user is authenticated with Payload CMS.
 * 
 * This hook fetches the current authentication status from Payload's REST API
 * on the client side, allowing pages to be statically generated while still
 * showing user-specific content after hydration.
 * 
 * @returns Object containing authentication state:
 *  - isAuthenticated: boolean indicating if user is logged in
 *  - isLoading: boolean indicating if auth check is in progress
 *  - user: the authenticated user object (if available)
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Use Payload's built-in me endpoint to check authentication
        // This endpoint checks the httpOnly cookie automatically
        const response = await fetch("/api/users/me", {
          credentials: "include", // Include cookies in the request
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setIsAuthenticated(true)
            setUser(data.user)
          }
        }
      } catch (error) {
        // Silently handle errors - user is simply not authenticated
        console.debug("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return { isAuthenticated, isLoading, user }
}
