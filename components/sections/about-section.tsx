import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Section from "@/components/sections/components/section"
import { Container, ContainerIntro, ContainerTitle, ContainerEyebrow, ContainerLead, ContainerContent } from "@/components/sections/components/container"
import { Tag } from "@/components/primitives/tag"
import type { SkillItem } from "@/lib/cv-types"
import { SkillProgress } from "@/components/about/skill-progress"

export function AboutSection({ skills }: { skills: SkillItem[] }) {
  return (
    <Section id="about" glow={{ side: "left", tone: "warm" }}>
      <Container variant="left">
        <ContainerIntro variant="left">
          <ContainerEyebrow>About</ContainerEyebrow>
          <ContainerTitle>
            Delivery-focused developer with a strong data background
          </ContainerTitle>
          <ContainerLead>
            I combine pragmatic engineering with clear communication and a bias toward shipping.
          </ContainerLead>
        </ContainerIntro>
        <ContainerContent variant="left">


          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            {/* Editorial-style narrative: no heavy card container */}
            <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="border-l pl-4">
                <p className="text-pretty text-lg leading-relaxed">
                  <span className="font-medium">
                    Transitioning into modern web development
                  </span>{" "}
                  after a proven career building high-impact reporting and data
                  solutions.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  As a seasoned technology professional with a proven track record in
                  SAP HANA and BW development, I am now focusing my expertise on web
                  development. My technical skill set spans JavaScript, Node.js,
                  React, PHP, MySQL, MongoDB, and a continuing commitment to
                  mastering Svelte/SvelteKit and Docker. Notable achievements
                  include developing an application that saved over £1 million on an
                  £8 million contract and designing a reporting suite that improved
                  operational efficiency by up to 30%.
                </p>

                <p className="text-muted-foreground text-pretty leading-relaxed">
                  In my previous role as a lead developer, I was instrumental in
                  introducing Agile methodologies such as Kanban and Scrum, creating
                  a more collaborative and efficient team environment. Since
                  founding my own web development business, Ncodeing, I’ve had the
                  opportunity to work on diverse client projects, ranging from
                  website builds to infrastructure-focused initiatives. This
                  entrepreneurial venture has sharpened my skills in DevOps, client
                  relations, and project management while allowing me to share
                  knowledge through blog posts, tutorials, and video content.
                </p>

                <p className="text-muted-foreground text-pretty leading-relaxed">
                  With strong abilities in requirement gathering, stakeholder
                  management, and effective communication, I am seeking a mid-tier
                  role in web development that allows me to apply and expand my
                  expertise. My ultimate goal is to grow into a senior leadership
                  position within a forward-thinking organization, whether in the
                  public utilities sector, a start-up, or a charity, where I can
                  contribute to meaningful projects and drive organizational
                  success.
                </p>
              </div>
            </div>

            {/* Visual interest: compact highlights card + strengths */}
            <div className="space-y-4">
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Skills (self-assessed)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <SkillProgress
                        key={skill.name}
                        label={skill.name}
                        level={skill.level}
                      />
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                      Strengths
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Tag>Stakeholder management</Tag>
                      <Tag>Requirements gathering</Tag>
                      <Tag>Delivery focus</Tag>
                      <Tag>Agile leadership</Tag>
                      <Tag>Mentoring</Tag>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-muted-foreground text-sm leading-relaxed">
                <p className="font-medium text-foreground">What I’m looking for</p>
                <p>
                  A mid-tier web role with strong engineering practices, room to grow,
                  and a team that values clarity, ownership, and impact.
                </p>
              </div>
            </div>
          </div>
        </ContainerContent>
      </Container>
    </Section>
  )
}

