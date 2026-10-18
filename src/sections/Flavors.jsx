import { FLAVORS } from '../content/copy.js';

// Seção condicional: só existe com mais de um sabor.
// [PLACEHOLDER] quando houver novos sabores, adicionar cor, imagem e CTA de cada um.
export default function Flavors() {
  if (FLAVORS.length <= 1) return null;
  return (
    <section id="linha" className="section section--ice" aria-labelledby="linha-title">
      <div className="container">
        <h2 id="linha-title" className="h2">
          A linha Raw Boost
        </h2>
        <ul className="moments">
          {FLAVORS.map((f) => (
            <li key={f} className="moment">
              <h3 className="moment__title">{f}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
