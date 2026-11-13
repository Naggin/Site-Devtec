"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  Container,
  GraduationCap,
  LayoutTemplate,
  Network,
  Server,
  Smartphone,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { BuildBlock } from "@/components/intro/BuildBlock";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { portfolioData, type Qualification, type SkillGroup, type SkillLevel } from "@/data/portfolio";

const GROUP_ICONS: Record<SkillGroup["id"], LucideIcon> = {
  frontend: LayoutTemplate,
  backend: Server,
  mobile: Smartphone,
  ai: Sparkles,
  agents: Network,
  devops: Container,
};

const KIND_META: Record<Qualification["kind"], { icon: LucideIcon; label: string }> = {
  formacao: { icon: GraduationCap, label: "Formação" },
  certificacao: { icon: Award, label: "Certificação" },
  curso: { icon: BookOpen, label: "Curso" },
};

const LEVELS = [1, 2, 3, 4, 5] as const;

// Classes compartilhadas para que BuildBlock e card ocupem a célula inteira do grid.
const BLOCK_CLS = "h-full rounded-3xl [&>div]:h-full";

function LevelDots({ level }: { level: SkillLevel }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex shrink-0 items-center gap-1" role="img" aria-label={`Nível ${level} de 5`}>
      {LEVELS.map((n) => (
        <motion.span
          key={n}
          className={`h-1.5 w-3 rounded-full min-[400px]:w-4 xl:w-5 ${n <= level ? "bg-brand shadow-[0_0_8px_rgb(224_32_32/0.6)]" : "bg-white/10"}`}
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.35, delay: n * 0.06, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: 0 }}
        />
      ))}
    </span>
  );
}

function CardHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-ink">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">{title}</h3>
    </header>
  );
}

function StackCard() {
  return (
    <SpotlightCard className="h-full p-6 sm:p-8">
      <CardHeader eyebrow="01 · stack principal" title="Do pixel ao deploy" />
      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:gap-x-6 xl:gap-x-10">
        {portfolioData.skillGroups.map((group) => {
          const Icon = GROUP_ICONS[group.id];
          return (
            <div key={group.id}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg border border-line bg-white/5 text-brand-ink">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-sm font-medium text-ink">{group.label}</span>
              </div>
              <ul className="space-y-2.5">
                {group.skills.map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-ink-2">{skill.name}</span>
                    <LevelDots level={skill.level} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </SpotlightCard>
  );
}

function QualificationsCard() {
  return (
    <SpotlightCard className="h-full p-6 sm:p-8" color="rgb(255 95 95 / 0.3)">
      <CardHeader eyebrow="02 · qualificações" title="Formação & certificações" />
      <ol className="relative space-y-5 border-l border-line pl-5">
        {portfolioData.qualifications.map((q) => {
          const { icon: Icon, label } = KIND_META[q.kind];
          return (
            <li key={q.title} className="relative">
              <span className="absolute -left-[29px] top-0.5 grid size-4 place-items-center rounded-full border border-brand-line bg-bg">
                <span className="size-1.5 rounded-full bg-brand-ink" />
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-brand-ink">
                <Icon className="size-3.5" aria-hidden />
                {label}
                {q.year !== "—" && <span className="text-ink-2">· {q.year}</span>}
              </div>
              <p className="mt-1 font-medium leading-snug text-ink">{q.title}</p>
              <p className="text-sm text-ink-2">{q.issuer}</p>
            </li>
          );
        })}
      </ol>
    </SpotlightCard>
  );
}

function ImpactCard() {
  return (
    <SpotlightCard className="h-full p-6 sm:p-8" color="rgb(255 255 255 / 0.14)">
      <CardHeader eyebrow="03 · diferenciais" title="Impacto, não promessa" />
      <dl className="grid grid-cols-2 gap-3">
        {portfolioData.metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <dt className="sr-only">{m.label}</dt>
            <dd>
              <span className="flex items-center gap-1.5 text-3xl font-semibold tracking-tight text-ink">
                {m.value}
                <TrendingUp className="size-4 text-green" aria-hidden />
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink-2">{m.label}</span>
            </dd>
          </div>
        ))}
      </dl>
      <ul className="mt-5 space-y-2.5">
        {portfolioData.differentials.map((d) => (
          <li key={d} className="flex gap-2.5 text-sm text-ink-2">
            <Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden />
            {d}
          </li>
        ))}
      </ul>
    </SpotlightCard>
  );
}

export function SkillsBento() {
  return (
    <section id="skills" className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl min-[1920px]:max-w-[1600px]">
        <BuildBlock label="<SectionHeader />" order={0} className="mb-12 max-w-2xl">
          <p className="font-mono text-xs text-brand-ink">{"// skills.tsx"}</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-5xl min-[1920px]:text-6xl">
            Stack, qualificações e o que entrego de diferente.
          </h2>
        </BuildBlock>

        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:gap-5">
          <BuildBlock label="<SkillsBento />" order={1} className={`${BLOCK_CLS} lg:col-span-7 lg:row-span-2`}>
            <StackCard />
          </BuildBlock>
          <BuildBlock label="<Qualifications />" order={2} className={`${BLOCK_CLS} lg:col-span-5`}>
            <QualificationsCard />
          </BuildBlock>
          <BuildBlock label="<ImpactMetrics />" order={3} className={`${BLOCK_CLS} lg:col-span-5`}>
            <ImpactCard />
          </BuildBlock>
        </div>
      </div>
    </section>
  );
}
