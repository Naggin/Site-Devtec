export default function About() {
  return (
    <section className="section" id="sobre">
      <div className="wrap">
        <p className="kicker">01 / Sobre</p>
        <h2>Um desenvolvedor que entrega produto, não só código.</h2>
        <div className="about-grid">
          <div className="about-copy">
            <p>
              A <strong>Devtec</strong> é o meu estúdio. Trabalho ponta a ponta: entender o
              problema, desenhar o fluxo, construir a aplicação e colocar no ar.
            </p>
            <p>
              Já entreguei controle financeiro com lançamento por WhatsApp, app de rotina
              para casais, gestão de dívidas, sites de suporte técnico e ferramentas
              desktop. O fio comum é o mesmo: software claro, rápido e útil no dia a dia.
            </p>
            <p>
              Se você tem uma ideia, um sistema antigo travado ou um processo que ainda
              vive em planilha, eu ajudo a transformar isso em produto.
            </p>
          </div>
          <div className="stat-list">
            <div className="stat">
              <b>Full-stack</b>
              <span>React, Next.js, TypeScript, APIs e banco</span>
            </div>
            <div className="stat">
              <b>Mobile</b>
              <span>React Native + Expo em produção</span>
            </div>
            <div className="stat">
              <b>IA no produto</b>
              <span>WhatsApp, NLP e copilots aplicados</span>
            </div>
            <div className="stat">
              <b>Suporte TI</b>
              <span>Consultoria e manutenção quando precisa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
