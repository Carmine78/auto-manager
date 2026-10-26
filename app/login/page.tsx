
"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage(
        "Configurazione Supabase mancante. Completa prima le variabili di ambiente."
      );
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          window.location.href = "/";
        } else {
          setMessage(
            "Registrazione avviata. Controlla la tua email per confermare l'account."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Si è verificato un errore."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <section className="card" style={{ maxWidth: 440, margin: "40px auto" }}>
        <p className="muted">AREA PERSONALE</p>
        <h1>Auto Manager</h1>
        <h2>{isRegister ? "Crea il tuo account" : "Accedi"}</h2>
        <p className="muted">
          {isRegister
            ? "Registrati per gestire le tue automobili."
            : "Accedi per consultare i tuoi dati."}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            Password
            <input
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            className="button"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading
              ? "Attendi..."
              : isRegister
                ? "Registrati"
                : "Accedi"}
          </button>
        </form>

        {message && (
          <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: 20 }}>
          {isRegister ? "Hai già un account?" : "Non hai ancora un account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            style={{
              border: 0,
              background: "transparent",
              color: "#176b52",
              fontWeight: 600,
              padding: 0,
            }}
          >
            {isRegister ? "Accedi" : "Crea un account"}
          </button>
        </p>

        <p>
          <a href="/" className="muted">
            Torna alla pagina iniziale
          </a>
        </p>
      </section>
    </main>
  );
}
