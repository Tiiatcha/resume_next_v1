import { headers as getHeaders } from "next/headers"
import { getPayloadClient } from "./get-payload-client"

/**
 * Gets the currently authenticated Payload user from the session.
 * Returns null if no user is authenticated.
 * 
 * This function uses Payload's built-in auth method which checks the request
 * headers (including cookies) to determine if a user is logged in and retrieves
 * their user data if they are.
 * 
 * Payload automatically handles JWT token validation and user session management
 * through the auth() method when provided with the request headers.
 */
export async function getCurrentUser() {
  try {
    const payload = await getPayloadClient()
    const headers = await getHeaders()
    
    // Use Payload's auth method to check authentication from request headers
    // This method automatically extracts and validates the JWT token from cookies
    const { user } = await payload.auth({ headers })
    
    return user || null
  } catch (error) {
    // Token is invalid, expired, or user is not authenticated
    console.error("Error getting authenticated user:", error)
    return null
  }
}
