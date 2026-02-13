import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SiteBackground } from "@/components/shared/layout/site-background"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import { Separator } from "@/components/ui/separator"

/**
 * Loading skeleton specifically for individual blog post pages.
 * Shows a single article layout instead of multiple card skeletons.
 */
export default function BlogPostLoadingPage() {
  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="blog-post" surface="base">
          <Container variant="left">
            <div className="space-y-6 w-full">
              {/* Header section skeleton */}
              <div className="space-y-4 w-full">
                {/* Blog label */}
                <div className="h-3 w-12 rounded-full bg-muted/60 animate-pulse" />
                
                {/* Title skeleton */}
                <div className="space-y-2">
                  <div className="h-8 w-3/4 rounded-lg bg-muted/70 animate-pulse" />
                  <div className="h-8 w-1/2 rounded-lg bg-muted/60 animate-pulse" />
                </div>
                
                {/* Category badge skeleton */}
                <div className="h-7 w-24 rounded-full bg-muted/50 animate-pulse" />
                
                {/* Date skeleton */}
                <div className="h-4 w-32 rounded-full bg-muted/40 animate-pulse" />
                
                {/* Excerpt skeleton */}
                <div className="space-y-2 max-w-prose">
                  <div className="h-4 w-full rounded-full bg-muted/50 animate-pulse" />
                  <div className="h-4 w-5/6 rounded-full bg-muted/40 animate-pulse" />
                </div>
              </div>

              {/* Featured image skeleton */}
              <div className="bg-muted/40 text-muted-foreground rounded-xl aspect-[16/9] w-full animate-pulse overflow-hidden">
                {/* placeholder svg with currentColor */}
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
                  <path d="M0 0h100v100H0z" fill="currentColor" opacity="0"  />
                </svg>

              </div>

              {/* Separator */}
              <Separator className="my-10" />

              {/* Article content skeleton */}
              <article className="space-y-6">
                {/* Paragraph blocks */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-full rounded-full bg-muted/50 animate-pulse" />
                    <div className="h-4 w-full rounded-full bg-muted/50 animate-pulse" />
                    <div className="h-4 w-4/5 rounded-full bg-muted/40 animate-pulse" />
                  </div>
                ))}

                {/* Heading skeleton */}
                <div className="h-6 w-2/3 rounded-lg bg-muted/60 animate-pulse mt-8" />

                {/* More paragraph blocks */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-full rounded-full bg-muted/50 animate-pulse" />
                    <div className="h-4 w-full rounded-full bg-muted/50 animate-pulse" />
                    <div className="h-4 w-3/4 rounded-full bg-muted/40 animate-pulse" />
                  </div>
                ))}
              </article>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}
