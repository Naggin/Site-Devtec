"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { PointerEvent } from "react";
import { BuildBlock } from "@/components/intro/BuildBlock";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { portfolioData, type Project } from "@/data/portfolio";

const MAX_TILT = 6;
const MAX_TILT_COMPACT = 4;

// lucide-react v1 não traz mais ícones de marca.
function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function hostOf(url?: string) {
  if (!url) return "app desktop · Windows";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Preview({ project, compact }: { project: Project; compact: boolean }) {
  return (
    <div className={`relative ${compact ? "aspect-[16/7]" : "aspect-[16/10]"} overflow-hidden rounded-2xl border border-line bg-bg-2`}>
      {project.image ? (
        <Image
          src={project.image}
          alt={`Preview de ${project.title}`}
          fill
          sizes={compact ? "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 45vw, 100vw"}
          className="object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
        />
      ) : (
        <>
          <div aria-hidden className={`absolute inset-0 bg-linear-to-br ${project.accent}`} />
          <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
          {/* Mock de janela */}
          <div
            aria-hidden
            className={`absolute bottom-0 rounded-t-xl border border-b-0 border-line bg-bg/80 shadow-2xl backdrop-blur-md transition-transform duration-700 group-hover/card:-translate-y-1.5 ${compact ? "inset-x-5 top-5" : "inset-x-6 top-8 sm:inset-x-10 sm:top-10"}`}
          >
            <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
              <span className="ml-2 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-ink-2">
                {hostOf(project.liveUrl)}
              </span>
            </div>
            <div className="space-y-2.5 p-4">
              <div className="h-2.5 w-2/5 rounded-full bg-white/20" />
              <div className="h-2 w-4/5 rounded-full bg-white/10" />
              <div className="h-2 w-3/5 rounded-full bg-white/10" />
              <div className={`grid grid-cols-3 gap-2 pt-2 ${compact ? "hidden" : ""}`}>
                <div className="h-10 rounded-lg bg-white/5" />
                <div className="h-10 rounded-lg bg-white/5" />
                <div className="h-10 rounded-lg bg-white/5" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const reduce = useReducedMotion();
  const tilt = compact ? MAX_TILT_COMPACT : MAX_TILT;
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), spring);

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    // Sem tilt em touch/caneta e em reduced-motion.
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div className="h-full [perspective:1200px]">
      <motion.article
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={reduce ? undefined : { rotateX, rotateY }}
        whileHover={reduce ? undefined : { y: compact ? -4 : -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="group/card h-full"
      >
        <SpotlightCard className="flex h-full flex-col p-3 transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgb(224_32_32/0.25)] sm:p-4">
          <Preview project={project} compact={compact} />

          <div className={`flex flex-1 flex-col px-2 pb-2 sm:px-3 ${compact ? "pt-4" : "pt-5"}`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-ink">{project.kind}</p>
            <h3 className={`mt-1.5 font-bold tracking-[-0.03em] text-ink ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>{project.title}</h3>

            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tecnologias">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-ink-2"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <dl className={`grid text-sm ${compact ? "mt-4 gap-3" : "mt-5 gap-4 sm:grid-cols-2"}`}>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Problema</dt>
                <dd className="mt-1 leading-relaxed text-ink-2">{project.problem}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-green/80">Solução</dt>
                <dd className="mt-1 leading-relaxed text-ink/90">{project.solution}</dd>
              </div>
            </dl>

            {(project.liveUrl || project.repoUrl) && (
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition hover:shadow-[0_0_24px_rgb(224_32_32/0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                  >
                    Live Demo
                    <ArrowUpRight className="size-4" aria-hidden />
                    <span className="sr-only">de {project.title} (abre em nova aba)</span>
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-ink transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <GithubMark className="size-4" />
                    GitHub
                    <span className="sr-only">: código de {project.title} (abre em nova aba)</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </SpotlightCard>
      </motion.article>
    </div>
  );
}

// BuildBlock e card ocupam a célula inteira do grid.
const BLOCK_CLS = "h-full rounded-3xl [&>div]:h-full";

export function ProjectsGrid() {
  const featured = portfolioData.projects.filter((p) => p.featured);
  const others = portfolioData.projects.filter((p) => !p.featured);

  return (
    <section id="projetos" className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl min-[1920px]:max-w-[1600px]">
        <BuildBlock
          label="<SectionHeader />"
          order={0}
          className="mb-12 [&>div]:flex [&>div]:flex-col [&>div]:gap-4 sm:[&>div]:flex-row sm:[&>div]:items-end sm:[&>div]:justify-between"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs text-brand-ink">{"// projetos.tsx"}</p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-5xl min-[1920px]:text-6xl">
              Projetos em produção, com gente usando.
            </h2>
          </div>
          <p className="font-mono text-xs text-ink-2">
            {portfolioData.projects.length.toString().padStart(2, "0")} deploys
          </p>
        </BuildBlock>

        <div className="grid gap-5 md:grid-cols-2 lg:gap-6 min-[1920px]:gap-8">
          {featured.map((project, i) => (
            <BuildBlock key={project.title} label="<ProjectsGrid />" order={1 + i} className={BLOCK_CLS}>
              <ProjectCard project={project} />
            </BuildBlock>
          ))}
        </div>

        {others.length > 0 && (
          <>
            <h3 className="mb-6 mt-16 font-mono text-xs uppercase tracking-[0.14em] text-ink-2 sm:mt-20">
              {"// mais projetos no ar"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 min-[1920px]:grid-cols-4">
              {others.map((project, i) => (
                <BuildBlock
                  key={project.title}
                  label="<ProjectCard compact />"
                  order={1 + featured.length + i}
                  className={BLOCK_CLS}
                >
                  <ProjectCard project={project} compact />
                </BuildBlock>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
