"use client"

import Link from "next/link"
import { Edit2Icon, ListIcon, PlusIcon } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BlogAdminControls({
  postId,
  variant = "post",
}: {
  postId?: string
  variant?: "list" | "post"
}) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <>
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
              <Link
                href="/admin/collections/blog-posts"
                className="flex items-center gap-2"
              >
                <ListIcon className="size-4" />
                <span>All Posts</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/collections/blog-posts/create"
                className="flex items-center gap-2"
              >
                <PlusIcon className="size-4" />
                <span>New Post</span>
              </Link>
            </DropdownMenuItem>
            {postId && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/collections/blog-posts/${postId}`}
                  className="flex items-center gap-2"
                >
                  <Edit2Icon className="size-4" />
                  <span>Edit This Post</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
        {postId && variant === "post" ? (
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
        ) : null}
      </div>
    </>
  )
}

