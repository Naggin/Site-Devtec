import { IntroProvider } from "@/components/intro/IntroContext";
import { BuildStage } from "@/components/intro/BuildStage";
import { SiteCamera } from "@/components/intro/squad/SiteCamera";
import { SquadIntro } from "@/components/intro/squad/SquadIntro";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { SkillsBento } from "@/components/sections/SkillsBento";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Timeline } from "@/components/sections/Timeline";
import { TerminalFooter } from "@/components/sections/TerminalFooter";

export default function Home() {
  return (
    <IntroProvider>
      <AmbientBackground />
      <SiteCamera>
        <BuildStage id="nav">
          <Navbar />
        </BuildStage>
        <main className="relative">
          <BuildStage id="hero">
            <Hero />
          </BuildStage>
          <BuildStage id="skills">
            <SkillsBento />
          </BuildStage>
          <BuildStage id="projects">
            <ProjectsGrid />
          </BuildStage>
          <BuildStage id="timeline">
            <Timeline />
          </BuildStage>
        </main>
        <BuildStage id="footer">
          <TerminalFooter />
        </BuildStage>
      </SiteCamera>
      <SquadIntro />
    </IntroProvider>
  );
}
