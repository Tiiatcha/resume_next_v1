 "use client"
 
 import * as React from "react"
 import * as DialogPrimitive from "@radix-ui/react-dialog"
 import { XIcon } from "lucide-react"
 
 import { cn } from "@/lib/utils"
 import { buttonVariants } from "@/components/ui/button"
 
 /**
  * shadcn/ui Sheet
  *
  * An off-canvas panel built on Radix Dialog primitives.
  * - Supports right-side slide-in by default.
  * - Styling is Tailwind-first (v4 friendly) and can be overridden via `className`.
  */
 const Sheet = DialogPrimitive.Root
 const SheetTrigger = DialogPrimitive.Trigger
 const SheetClose = DialogPrimitive.Close
 const SheetPortal = DialogPrimitive.Portal
 
 function SheetOverlay({
   className,
   ...props
 }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
   return (
     <DialogPrimitive.Overlay
       data-slot="sheet-overlay"
       className={cn(
         // Frosted "scrim" so the underlying page is visible but de-emphasized.
         "data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-50 bg-background/60 supports-[backdrop-filter]:bg-background/45 backdrop-blur-sm",
         className,
       )}
       {...props}
     />
   )
 }
 
 function SheetContent({
   className,
   children,
   ...props
 }: React.ComponentProps<typeof DialogPrimitive.Content>) {
   return (
     <SheetPortal>
       <SheetOverlay />
       <DialogPrimitive.Content
         data-slot="sheet-content"
         className={cn(
           // Right-side slide-in panel.
           "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-dvh flex-col border-l shadow-2xl",
           // Frosted glass background.
           "bg-background/70 supports-[backdrop-filter]:bg-background/45 backdrop-blur-xl",
           // Default sizing:
           // - Mobile: full width
           // - Small screens: "size-m" feel via max-w-md
           // - Desktop: ~50% viewport width
           "w-full sm:max-w-md lg:w-1/2 lg:max-w-none",
           className,
         )}
         {...props}
       >
         {children}
         <SheetClose
           className={cn(
             buttonVariants({ variant: "ghost", size: "icon-xs" }),
             "absolute top-4 right-4",
           )}
           aria-label="Close"
         >
           <XIcon className="size-4" />
         </SheetClose>
       </DialogPrimitive.Content>
     </SheetPortal>
   )
 }
 
 function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
   return (
     <div
       data-slot="sheet-header"
       className={cn("flex flex-col gap-1.5 p-6", className)}
       {...props}
     />
   )
 }
 
 function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
   return (
     <div
       data-slot="sheet-footer"
       className={cn("flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end", className)}
       {...props}
     />
   )
 }
 
 function SheetTitle({
   className,
   ...props
 }: React.ComponentProps<typeof DialogPrimitive.Title>) {
   return (
     <DialogPrimitive.Title
       data-slot="sheet-title"
       className={cn("text-base font-semibold tracking-tight", className)}
       {...props}
     />
   )
 }
 
 function SheetDescription({
   className,
   ...props
 }: React.ComponentProps<typeof DialogPrimitive.Description>) {
   return (
     <DialogPrimitive.Description
       data-slot="sheet-description"
       className={cn("text-muted-foreground text-sm", className)}
       {...props}
     />
   )
 }
 
 export {
   Sheet,
   SheetTrigger,
   SheetClose,
   SheetPortal,
   SheetOverlay,
   SheetContent,
   SheetHeader,
   SheetFooter,
   SheetTitle,
   SheetDescription,
 }
 
