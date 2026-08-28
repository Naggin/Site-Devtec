import DependencyGraph from "./DependencyGraph";
import BentoGrid from "./BentoGrid";
import StatusBoard from "./StatusBoard";

export default function About() {
  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">01 / Sobre</p>
        <h2 className="section-title reveal" data-delay="1">
          Como eu construo.
        </h2>
        <p className="section-sub reveal" data-delay="2">
          Da interface ao deploy — arquitetura, código e pipeline em produção.
        </p>

        <DependencyGraph />

        <div className="about-showcase">
          <BentoGrid />
          <StatusBoard />
        </div>
      </div>
    </section>
  );
}
