import { useState } from 'react';
import Header from './components/Header.jsx';
import HeroReveal from './sections/HeroReveal.jsx';
import ScrollFilm from './sections/ScrollFilm.jsx';
import CanSpecs from './sections/CanSpecs.jsx';
import Moments from './sections/Moments.jsx';
import Flavors from './sections/Flavors.jsx';
import Faq from './sections/Faq.jsx';
import ClosingCta from './sections/ClosingCta.jsx';
import Footer from './sections/Footer.jsx';

export default function App() {
  // Ao fim da intro do hero, o filme do detalhe começa a baixar.
  const [heroDone, setHeroDone] = useState(false);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <HeroReveal onIntroEnd={() => setHeroDone(true)} />
        <ScrollFilm preloadNow={heroDone} />
        <CanSpecs />
        <Moments />
        <Flavors />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
