"use client"

import Link from "next/link"
import { PlusIcon, ListIcon, Edit2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

/**
 * Admin controls for blog management that appear when a user is authenticated.
 * Provides quick access to Payload CMS for managing blog posts.
 * 
 * Authentication is checked client-side to allow the page to be statically generated.
 * The controls will appear after hydration if the user is logged in.
 * 
 * Responsive design:
 * - Mobile: Compact dropdown menu
 * - Desktop: Individual action buttons
 * 
 * @param postId - Optional post ID for the Edit button on individual post pages
 * @param variant - 'list' for blog listing page, 'post' for individual post page
 */
export function BlogAdminControls({ 
  postId, 
  variant = 'post' 
}: { 
  postId?: string
  variant?: 'list' | 'post'
}) {
  const { isAuthenticated, isLoading } = useAuth()

  // Don't render anything while checking authentication or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Mobile: Compact dropdown */}
      <div className="flex gap-2 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-card/60 supports-[backdrop-filter]:bg-card/40"
            >
              <ListIcon className="size-4 mr-2" />
              Admin
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/admin/collections/blog-posts" className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All Posts</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/collections/blog-posts/create" className="flex items-center gap-2">
                <PlusIcon className="size-4" />
                <span>New Post</span>
              </Link>
            </DropdownMenuItem>
            {postId && (
              <DropdownMenuItem asChild>
                <Link href={`/admin/collections/blog-posts/${postId}`} className="flex items-center gap-2">
                  <Edit2Icon className="size-4" />
                  <span>Edit This Post</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: Individual buttons */}
      <div className="hidden md:flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          asChild
          className="bg-card/60 supports-[backdrop-filter]:bg-card/40"
        >
          <Link href="/admin/collections/blog-posts">
            <ListIcon className="size-4 mr-2" />
            All Posts
          </Link>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          asChild
          className="bg-card/60 supports-[backdrop-filter]:bg-card/40"
        >
          <Link href="/admin/collections/blog-posts/create">
            <PlusIcon className="size-4 mr-2" />
            New Post
          </Link>
        </Button>
        {postId && (
          <Button 
            size="sm" 
            variant="default" 
            asChild
            className="bg-primary/90 hover:bg-primary"
          >
            <Link href={`/admin/collections/blog-posts/${postId}`}>
              <Edit2Icon className="size-4 mr-2" />
              Edit This Post
            </Link>
          </Button>
        )}
      </div>
    </>
  )
}
