import CursorCanvas from "./components/CursorCanvas";
import Background from "./components/Background";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
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
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
