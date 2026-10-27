
"use client";

import { useState } from "react";

const scadenze = [
  { titolo: "Revisione", data: "02/11/2026", giorni: 6, icona: "▦", colore: "pink" },
  { titolo: "Bollo", data: "12/11/2026", giorni: 16, icona: "▤", colore: "purple" },
  { titolo: "Assicurazione", data: "18/12/2026", giorni: 52, icona: "⬡", colore: "blue" },
];

const sezioni = [
  { nome: "Home", icona: "⌂" },
  { nome: "Auto", icona: "🚘" },
  { nome: "Rifornimenti", icona: "⛽" },
  { nome: "Manutenzione", icona: "🔧" },
  { nome: "Altro", icona: "•••" },
];

export default function Home() {
  const [periodo, setPeriodo] = useState<"Mese" | "Anno">("Mese");
  const [pagina, setPagina] = useState("Home");

  const importi = {
    Mese: { carburante: "245,60", manutenzione: "180,50" },
    Anno: { carburante: "2.840,90", manutenzione: "1.125,00" },
  };

  const totale = (
    Number(importi[periodo].carburante.replace(".", "").replace(",", ".")) +
    Number(importi[periodo].manutenzione.replace(".", "").replace(",", "."))
  ).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <main className="mg-app">
      <header className="mg-header">
        <div className="mg-brand">
          <div className="mg-logo">🚘</div>
          <div>
            <h1>My<span>Garage</span></h1>
            <p>Le tue auto, sempre sotto controllo</p>
          </div>
        </div>
        <button
          className="mg-add"
          aria-label="Aggiungi"
          onClick={() => setPagina("Auto")}
        >
          +
        </button>
      </header>

      <section className="mg-car">
        <div className="mg-car-info">
          <span className="mg-eyebrow">IL TUO GARAGE</span>
          <h2>La tua auto</h2>
          <p>Aggiungi marca e modello</p>
          <span className="mg-pill">Auto principale</span>
        </div>
        <div className="mg-car-art">🚙</div>
      </section>

      <div className="mg-section-heading">
        <h2>Riepilogo spese</h2>
        <div className="mg-toggle">
          {(["Mese", "Anno"] as const).map((p) => (
            <button
              key={p}
              className={periodo === p ? "selected" : ""}
              onClick={() => setPeriodo(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <section className="mg-total">
        <span>SPESA COMPLESSIVA · {periodo.toUpperCase()}</span>
        <strong>€ {totale}</strong>
        <p>Rifornimenti + manutenzione</p>
      </section>

      <section className="mg-expense-grid">
        <button
          className="mg-expense fuel"
          onClick={() => setPagina("Rifornimenti")}
        >
          <span className="mg-icon">⛽</span>
          <span className="mg-expense-title">Rifornimenti</span>
          <strong>€ {importi[periodo].carburante}</strong>
          <small>Vedi dettagli ↗</small>
        </button>

        <button
          className="mg-expense service"
          onClick={() => setPagina("Manutenzione")}
        >
          <span className="mg-icon">🔧</span>
          <span className="mg-expense-title">Manutenzione</span>
          <strong>€ {importi[periodo].manutenzione}</strong>
          <small>Vedi dettagli ↗</small>
        </button>
      </section>

      <div className="mg-section-heading mg-deadline-heading">
        <h2>Prossime scadenze</h2>
        <button onClick={() => setPagina("Altro")}>Vedi tutte →</button>
      </div>

      <section className="mg-deadlines">
        {scadenze.map((s) => (
          <div className="mg-deadline" key={s.titolo}>
            <div className={`mg-icon ${s.colore}`}>{s.icona}</div>
            <div className="mg-deadline-info">
              <strong>{s.titolo}</strong>
              <span>{s.data}</span>
            </div>
            <span className={`mg-days ${s.giorni <= 7 ? "urgent" : ""}`}>
              {s.giorni} gg
            </span>
          </div>
        ))}
      </section>

      <div className="mg-section-heading mg-quick-heading">
        <h2>Accesso rapido</h2>
      </div>

      <section className="mg-quick">
        <button onClick={() => setPagina("Rifornimenti")}>
          <span className="quick-icon fuel-bg">⛽</span>
          <span>Rifornimenti</span>
        </button>
        <button onClick={() => setPagina("Manutenzione")}>
          <span className="quick-icon service-bg">🔧</span>
          <span>Manutenzione</span>
        </button>
        <button onClick={() => setPagina("Altro")}>
          <span className="quick-icon tax-bg">▤</span>
          <span>Bollo</span>
        </button>
        <button onClick={() => setPagina("Altro")}>
          <span className="quick-icon insurance-bg">⬡</span>
          <span>Assicurazione</span>
        </button>
        <button onClick={() => setPagina("Altro")}>
          <span className="quick-icon inspection-bg">▦</span>
          <span>Revisione</span>
        </button>
      </section>

      {pagina !== "Home" && (
        <div className="mg-notice">
          <strong>{pagina}</strong>
          <p>
            Questa sezione verrà sviluppata nel prossimo passaggio.
            I dati non sono ancora collegati.
          </p>
          <button onClick={() => setPagina("Home")}>Torna alla Home</button>
        </div>
      )}

      <nav className="mg-nav">
        {sezioni.map((s) => (
          <button
            key={s.nome}
            className={pagina === s.nome ? "active" : ""}
            onClick={() => setPagina(s.nome)}
          >
            <span className="mg-nav-icon">{s.icona}</span>
            <span>{s.nome}</span>
          </button>
        ))}
      </nav>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        html { background: #07111f; }

        body {
          margin: 0;
          background: #07111f;
          color: #f3f7ff;
          font-family: 'Nunito', system-ui, sans-serif;
        }

        button { font: inherit; cursor: pointer; }

        .mg-app {
          width: 100%;
          max-width: 600px;
          min-height: 100vh;
          margin: 0 auto;
          padding: 26px 18px 112px;
          background:
            radial-gradient(ellipse at 90% 0%, #102b4a 0%, transparent 42%),
            #07111f;
        }

        .mg-header, .mg-brand, .mg-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .mg-header { margin-bottom: 25px; }
        .mg-brand { justify-content: flex-start; min-width: 0; }

        .mg-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 16px;
          background: #143e70;
          font-size: 25px;
        }

        .mg-brand h1 {
          margin: 0;
          font-size: 27px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .mg-brand h1 span { color: #35a7ff; }
        .mg-brand p { margin: 5px 0 0; color: #9aadc8; font-size: 12px; }

        .mg-add {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border: 0;
          border-radius: 50%;
          color: white;
          background: #1479f8;
          font-size: 29px;
          box-shadow: 0 5px 20px #1479f844;
        }

        .mg-car {
          position: relative;
          overflow: hidden;
          min-height: 172px;
          display: flex;
          align-items: center;
          padding: 22px;
          border: 1px solid #294b70;
          border-radius: 24px;
          background: linear-gradient(120deg, #123c68, #10233b 75%);
          margin-bottom: 27px;
        }

        .mg-car::after {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          right: -65px;
          top: -80px;
          border-radius: 50%;
          background: #248cff18;
        }

        .mg-car-info { z-index: 1; max-width: 75%; }
        .mg-eyebrow { color: #8cbcff; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; }
        .mg-car h2 { margin: 8px 0 4px; font-size: 23px; }
        .mg-car p { margin: 0 0 15px; color: #b9cbe3; font-size: 13px; }

        .mg-pill {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          background: #1479f8;
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .mg-car-art {
          position: absolute;
          right: 15px;
          bottom: 13px;
          font-size: clamp(55px, 16vw, 94px);
          filter: drop-shadow(0 8px 12px #0008);
          opacity: .9;
        }

        .mg-section-heading { margin-bottom: 14px; }
        .mg-section-heading h2 { margin: 0; font-size: 18px; font-weight: 900; }

        .mg-toggle {
          display: flex;
          padding: 4px;
          gap: 3px;
          border-radius: 22px;
          background: #14243a;
        }

        .mg-toggle button {
          border: 0;
          border-radius: 18px;
          padding: 7px 13px;
          color: #9fb2cd;
          background: transparent;
          font-size: 12px;
          font-weight: 800;
        }

        .mg-toggle button.selected {
          color: white;
          background: #1685ff;
          box-shadow: 0 3px 10px #1685ff35;
        }

        .mg-total {
          padding: 19px 20px;
          margin-bottom: 13px;
          border: 1px solid #254365;
          border-radius: 20px;
          background: linear-gradient(110deg, #142a44, #102039);
        }

        .mg-total > span { display: block; color: #9db5d3; font-size: 10px; font-weight: 900; letter-spacing: 1px; }
        .mg-total strong { display: block; margin-top: 7px; font-size: 31px; font-weight: 900; letter-spacing: -.5px; }
        .mg-total p { margin: 2px 0 0; color: #8da7c7; font-size: 12px; }

        .mg-expense-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .mg-expense {
          min-width: 0;
          padding: 15px 13px;
          text-align: left;
          color: white;
          border: 1px solid transparent;
          border-radius: 20px;
          transition: transform .15s ease;
        }

        .mg-expense:active { transform: scale(.98); }
        .mg-expense.fuel { background: linear-gradient(140deg, #49361e, #153d4b); border-color: #75582c; }
        .mg-expense.service { background: linear-gradient(140deg, #104b45, #123747); border-color: #17685e; }

        .mg-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 14px;
          font-size: 23px;
          font-weight: 900;
        }

        .mg-expense-title { display: block; margin: 12px 0 5px; font-size: 13px; font-weight: 800; }
        .mg-expense strong { display: block; font-size: clamp(17px, 4.7vw, 23px); font-weight: 900; white-space: nowrap; }
        .mg-expense small { display: block; margin-top: 9px; color: #b5d7f7; font-size: 11px; }

        .mg-deadline-heading { margin-top: 29px; }
        .mg-deadline-heading button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #43adff;
          font-size: 12px;
          font-weight: 800;
        }

        .mg-deadlines {
          padding: 4px 15px;
          border: 1px solid #213a58;
          border-radius: 20px;
          background: #0e1d30;
        }

        .mg-deadline {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 0;
        }

        .mg-deadline + .mg-deadline { border-top: 1px solid #22354d; }
        .mg-icon.pink { background: #6b2546; color: #ff719d; }
        .mg-icon.purple { background: #42246e; color: #c79aff; }
        .mg-icon.blue { background: #173e70; color: #71b9ff; }

        .mg-deadline-info { display: flex; flex: 1; flex-direction: column; gap: 3px; }
        .mg-deadline-info strong { font-size: 14px; }
        .mg-deadline-info span { color: #9bb0cc; font-size: 12px; }

        .mg-days {
          flex-shrink: 0;
          padding: 6px 9px;
          border-radius: 20px;
          background: #114d40;
          color: #67e8b3;
          font-size: 11px;
          font-weight: 900;
        }

        .mg-days.urgent { background: #61331b; color: #ffc16b; }

        .mg-quick-heading { margin-top: 28px; }

        .mg-quick {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 7px;
        }

        .mg-quick button {
          min-width: 0;
          padding: 10px 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          border: 1px solid #253a55;
          border-radius: 15px;
          background: #122239;
          color: #dce9fb;
          font-size: 10px;
          font-weight: 800;
        }

        .quick-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: white;
          font-size: 20px;
        }

        .fuel-bg { background: #f59e0b; }
        .service-bg { background: #10b981; }
        .tax-bg { background: #9b5de5; }
        .insurance-bg { background: #168bfa; }
        .inspection-bg { background: #f43f68; }

        .mg-notice {
          margin-top: 20px;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid #2b4d71;
          background: #11243b;
        }

        .mg-notice p { color: #a9bdd8; font-size: 13px; line-height: 1.5; }
        .mg-notice button { border: 0; border-radius: 12px; padding: 10px 14px; color: white; background: #1479f8; }

        .mg-nav {
          position: fixed;
          z-index: 10;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 600px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          padding: 10px 8px max(13px, env(safe-area-inset-bottom));
          border-top: 1px solid #243b57;
          background: #091626f5;
          backdrop-filter: blur(18px);
        }

        .mg-nav button {
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          border: 0;
          background: transparent;
          color: #8399b8;
          font-size: 10px;
          font-weight: 700;
        }

        .mg-nav button.active { color: #39a4ff; }
        .mg-nav-icon { font-size: 23px; line-height: 1.2; }

        @media (min-width: 520px) {
          .mg-app { padding: 32px 26px 120px; }
          .mg-expense { padding: 20px; }
        }

        @media (max-width: 360px) {
          .mg-app { padding-left: 12px; padding-right: 12px; }
          .mg-brand h1 { font-size: 23px; }
          .mg-brand p { font-size: 10px; }
          .mg-section-heading h2 { font-size: 16px; }
          .mg-expense { padding: 12px 9px; }
          .mg-deadlines { padding-left: 10px; padding-right: 10px; }
          .mg-days { padding: 5px 7px; font-size: 10px; }
        }
      `}</style>
    </main>
  );
}
