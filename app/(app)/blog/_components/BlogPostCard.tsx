
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Media = {
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
  }

  type Category = {
    id: string
    name?: string | null
    slug?: string | null
  }

interface CardProps {
  featuredImage?: Media | null
  title?: string | null
  category?: Category | null
  publishedAt?: string | null
  excerpt?: string | null
  className?: string
}

const BlogPostCard = (
    { featuredImage, title, category, publishedAt, excerpt, ...props }: CardProps
  ) => {
  const hasFeaturedImage = Boolean(featuredImage?.url)

  return (
    <Card
      className="blog-post-card grid row-span-5 grid-rows-subgrid bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full overflow-hidden transition-all hover:border-primary/50 p-0 pb-4"
      {...props}
    >
        {hasFeaturedImage ? (
          <div 
            className="blog-post-card__image-container row-span-1 relative aspect-[3/2] w-full overflow-hidden"
          >
            <Image
              src={featuredImage!.url as string}
              alt={featuredImage!.alt || title || ""}
              width={featuredImage!.width ?? 800}
              height={featuredImage!.height ?? 600}
              className="h-full object-cover h-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className="blog-post-card__image-placeholder row-span-1"
            aria-hidden="true"
          />
        )}
        <CardHeader 
          className="blog-post-card__header contents grid row-span-3 grid-rows-subgrid gap-0"
          style={{
            container:"unset"
          }}
        >
          <CardDescription 
            className="blog-post-card__category text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase pb-4"
          >
              {category ? category.name : null}
          </CardDescription>
          <CardTitle 
            className="blog-post-card__title justify-start text-lg group-hover:text-primary transition-colors"
          >
            {title}
          </CardTitle>
          <CardDescription 
            className="blog-post-card__published-at text-muted-foreground text-xs"
          >
          {publishedAt ? (
            <>
              {new Date(publishedAt).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </>
          ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent 
          className="blog-post-card__excerpt row-span-1"
        >
          {excerpt ? (
            <p className="text-muted-foreground text-pretty leading-relaxed">
              {excerpt.length > 200 ? excerpt.substring(0, 200) + "..." : excerpt}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Read post →
            </p>
          )}
        </CardContent>
      </Card>
  )
}

export default BlogPostCard