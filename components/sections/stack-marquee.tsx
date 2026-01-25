"use client"

import * as React from "react"
import Image from "next/image"
import Section from "@/components/sections/components/section"
import {
    Container,
    ContainerIntro,
    ContainerEyebrow,
    ContainerContent
} from "@/components/sections/components/container"

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
        <Section id="stack" aria-label="Technology stack logos" variant="tight">
            <Container>
                <ContainerIntro>
                    <ContainerEyebrow variant="left">Stack</ContainerEyebrow>
                </ContainerIntro>

                <ContainerContent className="w-full min-w-0 items-stretch">
                    <div className="logo-carousel relative w-full max-w-full min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                        <div
                            className="cv-marquee inline-flex w-max shrink-0 items-center gap-10"
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
                </ContainerContent>
            </Container>
        </Section>
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

