"use client"

import * as React from "react"
import Image from "next/image"

type StackLogo = {
    src: string
    alt: string
}

const stackLogos: StackLogo[] = [
    { src: "/assets/icons8-html.svg", alt: "HTML" },
    { src: "/assets/icons8-css.svg", alt: "CSS" },
    { src: "/assets/icons8-javascript.svg", alt: "JavaScript" },
    { src: "/assets/icons8-node-js.svg", alt: "Node.js" },
    { src: "/assets/icons8-react.svg", alt: "React" },
    { src: "/assets/icons8-svelte.svg", alt: "Svelte" },
    { src: "/assets/icons8-php.svg", alt: "PHP" },
    { src: "/assets/icons8-mysql.svg", alt: "MySQL" },
    { src: "/assets/icons8-tailwind-css.svg", alt: "Tailwind CSS" },
]


export function StackMarquee({
    durationSeconds = 30,
}: {
    durationSeconds?: number
}) {
    const duration = `${durationSeconds}s`

    return (
        <section aria-label="Technology stack logos" className="pt-4 sm:pt-6">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                Stack
            </p>

            <div className="mt-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <div
                    className="cv-marquee flex w-max items-center gap-10 pr-10"
                    style={{ ["--cv-marquee-duration" as never]: duration }}
                >
                    {stackLogos.map((logo) => (
                        <Logo key={logo.src} logo={logo} />
                    ))}
                    {/* duplicate for seamless loop */}
                    {stackLogos.map((logo) => (
                        <Logo key={`${logo.src}-dup`} logo={logo} ariaHidden />
                    ))}
                </div>
            </div>
        </section>
    )
}

function Logo({
    logo,
    ariaHidden,
}: {
    logo: StackLogo
    ariaHidden?: boolean
}) {
    return (
        <div
            aria-hidden={ariaHidden ? "true" : undefined}
            className="flex items-center gap-3"
            title={logo.alt}
        >
            <div className="bg-background/60 ring-border/60 grid size-9 place-items-center rounded-lg ring-1">
                <Image
                    src={logo.src}
                    alt={ariaHidden ? "" : logo.alt}
                    width={22}
                    height={22}
                    className="opacity-80"
                />
            </div>
            <span className="text-muted-foreground text-sm">{logo.alt}</span>
        </div>
    )
}

