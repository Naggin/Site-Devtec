"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BuildBlock } from "@/components/intro/BuildBlock";
import { portfolioData, type TimelineItem } from "@/data/portfolio";

const items = portfolioData.timeline as readonly TimelineItem[];

/**
 * Timeline de experiência & qualificações.
 * O traço luminoso (vermelho da marca) preenche conforme o scroll e cada dot
 * acende quando o traço o alcança. Desktop alterna lados; mobile é coluna única.
 */
export function Timeline() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);

  // 0 quando o topo da lista chega a 70% da viewport; 1 quando o fim passa de 50%.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.7", "end 0.5"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const progress = reduce ? scrollYProgress : smooth;
  const scaleY = useTransform(progress, [0, 1], [0, 1]);
  const headY = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <section id="trajetoria" className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32 lg:px-8 2xl:py-40">
      <div className="mx-auto max-w-5xl 2xl:max-w-6xl">
        <BuildBlock label="<TimelineHeader />" order={0}>
          <header className="mb-14 max-w-2xl sm:mb-20">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-ink">
              <span aria-hidden>{"// "}</span>trajetória
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl lg:text-5xl 2xl:text-6xl">
              Experiência &amp; formação
            </h2>
            <p className="mt-4 text-base text-ink-2 sm:text-lg">
              Do primeiro site institucional aos produtos com IA em produção — o caminho até aqui.
            </p>
          </header>
        </BuildBlock>

        <BuildBlock label="<Timeline />" order={1}>
          <ol ref={listRef} className="relative">
            {/* Trilho apagado */}
            <span
              aria-hidden
              className="absolute bottom-0 left-4 top-0 w-px -translate-x-1/2 bg-white/10 md:left-1/2"
            />
            {/* Traço luminoso */}
            <motion.span
              aria-hidden
              style={{ scaleY }}
              className="absolute bottom-0 left-4 top-0 w-[2px] origin-top -translate-x-1/2 bg-gradient-to-b from-brand-ink via-brand to-brand-hover shadow-[0_0_12px_rgba(224,32,32,0.6)] md:left-1/2"
            />
            {/* Cabeça do traço */}
            {!reduce && (
              <motion.span
                aria-hidden
                style={{ top: headY }}
                className="absolute left-4 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_4px_rgba(224,32,32,0.7)] md:left-1/2"
              />
            )}

            {items.map((item, i) => (
              <TimelineEntry
                key={`${item.period}-${item.title}`}
                item={item}
                index={i}
                // Ponto do progresso em que o traço alcança este item.
                threshold={items.length > 1 ? i / (items.length - 1) : 0}
                progress={progress}
                reduce={!!reduce}
              />
            ))}
          </ol>
        </BuildBlock>
      </div>
    </section>
  );
}

interface EntryProps {
  item: TimelineItem;
  index: number;
  threshold: number;
  progress: MotionValue<number>;
  reduce: boolean;
}

function TimelineEntry({ item, index, threshold, progress, reduce }: EntryProps) {
  const [lit, setLit] = useState(() => progress.get() >= threshold - 0.02);
  useMotionValueEvent(progress, "change", (v) => {
    const next = v >= threshold - 0.02;
    if (next !== lit) setLit(next);
  });

  const right = index % 2 === 1;

  return (
    <li className="relative grid grid-cols-[2rem_1fr] gap-x-5 pb-12 last:pb-0 sm:gap-x-6 md:grid-cols-[1fr_3rem_1fr] md:gap-x-0 md:pb-16">
      {/* Dot */}
      <div className="relative col-start-1 row-start-1 flex justify-center pt-1.5 md:col-start-2">
        <span
          aria-hidden
          className={`relative z-20 grid size-4 place-items-center rounded-full border transition-all duration-500 ${
            lit
              ? "border-brand bg-bg shadow-[0_0_0_4px_rgba(224,32,32,0.15),0_0_18px_rgba(224,32,32,0.7)]"
              : "border-white/20 bg-bg"
          }`}
        >
          <span
            className={`size-1.5 rounded-full transition-all duration-500 ${
              lit ? "scale-100 bg-brand" : "scale-50 bg-white/30"
            }`}
          />
        </span>
      </div>

      {/* Card */}
      <motion.article
        initial={reduce ? false : { opacity: 0, x: right ? 24 : -24, y: 12 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`col-start-2 row-start-1 ${
          right ? "md:col-start-3 md:pl-10" : "md:col-start-1 md:pr-10 md:text-right"
        }`}
      >
        <div
          className={`group rounded-2xl border bg-bg-2/60 p-5 backdrop-blur-xl transition-colors duration-500 sm:p-6 2xl:p-8 ${
            lit ? "border-white/15" : "border-line"
          }`}
        >
          <p
            className={`font-mono text-xs tracking-wide transition-colors duration-500 ${
              lit ? "text-brand-ink" : "text-ink-2"
            }`}
          >
            {item.period}
          </p>
          <h3 className="mt-2 text-lg font-bold text-ink sm:text-xl 2xl:text-2xl">{item.title}</h3>
          <p className="mt-0.5 text-sm text-brand-ink">{item.org}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2 sm:text-base">{item.description}</p>
          <ul className={`mt-4 flex flex-wrap gap-1.5 ${right ? "" : "md:justify-end"}`}>
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-line bg-white/[0.03] px-2.5 py-0.5 font-mono text-[11px] text-ink-2"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </motion.article>
    </li>
  );
}
