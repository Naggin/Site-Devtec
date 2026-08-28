import CursorCanvas from "./components/CursorCanvas";
import Background from "./components/Background";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { useNavScroll } from "./hooks/useNavScroll";

export default function App() {
  useScrollReveal();
  useNavScroll();

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <CursorCanvas />
      <Background />
      <Header />
      <main id="conteudo">
        <Hero />
        <About />
        <Services />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
