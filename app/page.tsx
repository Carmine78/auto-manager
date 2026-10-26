
const sections = [
  {
    title: "Le mie auto",
    description: "Gestisci automobili e chilometraggio.",
    icon: "🚘",
  },
  {
    title: "Rifornimenti",
    description: "Registra litri, prezzi e consumi.",
    icon: "⛽",
  },
  {
    title: "Spese",
    description: "Tieni sotto controllo i costi dell'auto.",
    icon: "💶",
  },
  {
    title: "Manutenzioni",
    description: "Consulta interventi e prossime scadenze.",
    icon: "🔧",
  },
  {
    title: "Promemoria",
    description: "Organizza bollo, assicurazione e revisione.",
    icon: "📅",
  },
  {
    title: "Statistiche",
    description: "Prepara riepiloghi ed esportazioni.",
    icon: "📊",
  },
];

export default function Home() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
      <header style={{ marginBottom: 28 }}>
        <p className="muted" style={{ marginBottom: 8 }}>
          LA TUA AREA PERSONALE
        </p>
        <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>
          Auto Manager
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Tutto sotto controllo, chilometro dopo chilometro.
        </p>
      </header>

      <section
        className="card"
        style={{
          background: "#176b52",
          color: "white",
          marginBottom: 24,
        }}
      >
        <p style={{ margin: "0 0 8px", opacity: 0.85 }}>
          BENVENUTO
        </p>
        <h2 style={{ margin: "0 0 10px", fontSize: 22 }}>
          Il riepilogo della tua auto
        </h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Registra i tuoi dati per iniziare a monitorare
          costi, consumi e manutenzioni.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 21 }}>
          Le tue funzionalità
        </h2>
        <span className="muted" style={{ fontSize: 13 }}>
          6 sezioni
        </span>
      </div>

      <section className="grid">
        {sections.map((section) => (
          <article className="card" key={section.title}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>
              {section.icon}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
              {section.title}
            </h3>
            <p
              className="muted"
              style={{ margin: "0 0 16px", lineHeight: 1.5 }}
            >
              {section.description}
            </p>
            <span className="muted" style={{ fontSize: 13 }}>
              Disponibile dopo la configurazione
            </span>
          </article>
        ))}
      </section>

      <footer
        className="muted"
        style={{
          textAlign: "center",
          fontSize: 12,
          paddingTop: 28,
        }}
      >
        Auto Manager · Area personale
      </footer>
    </main>
  );
}
