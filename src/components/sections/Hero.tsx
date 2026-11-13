"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, FileText, MapPin } from "lucide-react";
import { BuildBlock } from "@/components/intro/BuildBlock";
import { useIntro } from "@/components/intro/IntroContext";
import { useStageStatus } from "@/components/intro/BuildStage";
import { portfolioData } from "@/data/portfolio";
import { useTextScramble } from "@/hooks/useTextScramble";

/** Espera o scanner do BuildBlock começar a imprimir antes de decodificar, para o efeito ser visto. */
const BUILD_DELAY = 800;

/** Texto acessível: leitores de tela recebem o texto final; o embaralhado é só visual. */
function ScrambleText({ text, scrambled }: { text: string; scrambled: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{scrambled}</span>
    </>
  );
}

export function Hero() {
  const { phase, runId } = useIntro();
  const reduce = useReducedMotion();
  const status = useStageStatus();
  const play = status !== "hidden";
  const delay = status === "building" ? BUILD_DELAY : 0;

  const name = useTextScramble(portfolioData.name, { play, replayKey: runId, delay, duration: 1100 });
  const role = useTextScramble(portfolioData.role, { play, replayKey: runId, delay: delay + 250, duration: 900 });

  const [first, ...rest] = portfolioData.name.split(" ");
  const [scrambledFirst, ...scrambledRest] = name.split(" ");

  return (
    <section
      id="topo"
      className="relative flex min-h-[100svh] items-center px-4 pb-20 pt-28 sm:px-6 sm:pt-32 2xl:pt-40"
    >
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-[96rem]">
        <BuildBlock label="<HeroSection />" order={0} className="rounded-3xl">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-green/25 bg-green/[0.08] px-3 py-1 text-xs font-medium text-green sm:text-sm 2xl:text-base">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
              </span>
              {portfolioData.availability}
            </span>

            <h1 className="mt-6 text-[clamp(3rem,13vw,11rem)] font-bold leading-[0.9] tracking-[-0.055em] text-ink sm:mt-8">
              <span className="block">
                <ScrambleText text={first} scrambled={scrambledFirst ?? first} />
              </span>
              {rest.length > 0 && (
                <span className="block pb-[0.08em] text-brand">
                  <ScrambleText text={rest.join(" ")} scrambled={scrambledRest.join(" ")} />
                </span>
              )}
            </h1>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-brand-ink sm:text-base 2xl:text-xl">
              <span className="text-brand-ink/50">&gt;</span>
              <ScrambleText text={portfolioData.role} scrambled={role} />
              <span className="hidden h-4 w-px bg-white/15 sm:inline-block" />
              <span className="text-ink-2">{portfolioData.specialty}</span>
            </p>
          </div>
        </BuildBlock>

        <BuildBlock label="<HeroCTA />" order={1} className="mt-8 rounded-3xl sm:mt-10">
          <p className="max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg 2xl:max-w-3xl 2xl:text-2xl">
            {portfolioData.bio}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 2xl:mt-12">
            <a
              href="#projetos"
              className="group relative isolate inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-hover shadow-[0_0_0_1px_rgb(224_32_32/0.4),0_8px_40px_-8px_rgb(224_32_32/0.7)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgb(224_32_32/0.6),0_12px_60px_-6px_rgb(224_32_32/0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:text-base 2xl:px-8 2xl:py-4 2xl:text-lg"
            >
              <span
                aria-hidden
                className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-brand to-brand-hover opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-80"
              />
              Ver Projetos
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href={portfolioData.cvUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base 2xl:px-8 2xl:py-4 2xl:text-lg"
            >
              <FileText className="h-4 w-4 text-ink-2" />
              Contato / CV
            </a>
          </div>

          <p className="mt-8 inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 2xl:text-sm">
            <MapPin className="h-3.5 w-3.5" />
            {portfolioData.location}
          </p>
        </BuildBlock>
      </div>

      {phase === "done" && (
        <motion.a
          href="#skills"
          aria-label="Rolar para Skills"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-ink-3 transition-colors hover:text-ink sm:flex"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, 6, 0] }}
          transition={reduce ? { duration: 0.3 } : { opacity: { duration: 0.6 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.a>
      )}
    </section>
  );
}
