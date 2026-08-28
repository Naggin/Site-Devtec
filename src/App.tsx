import CursorCanvas from "./components/CursorCanvas";
import Background from "./components/Background";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProofStrip from "./components/ProofStrip";
import About from "./components/About";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Process from "./components/Process";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { useNavScroll } from "./hooks/useNavScroll";
import { useLanguage } from "./i18n/useLanguage";

export default function App() {
  useScrollReveal();
  useNavScroll();
  const { t } = useLanguage();

  return (
    <>
      <a className="skip-link" href="#conteudo">{t.a11y.skipLink}</a>
      <CursorCanvas />
      <Background />
      <Header />
      <main id="conteudo">
        <Hero />
        <ProofStrip />
        <About />
        <Services />
        <Projects />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
