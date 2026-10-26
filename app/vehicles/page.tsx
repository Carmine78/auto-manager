"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  plate: string;
  fuel_type: string;
  initial_odometer_km: number;
  current_odometer_km: number;
  notes: string | null;
};

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [fuelType, setFuelType] = useState("Benzina");
  const [odometer, setOdometer] = useState("");

  useEffect(() => {
    async function loadVehicles() {
      if (!supabase) {
        setMessage("Configurazione Supabase mancante.");
        setLoading(false);
        return;
      }

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Errore nel caricamento: " + error.message);
      } else {
        setVehicles((data ?? []) as Vehicle[]);
      }

      setLoading(false);
    }

    void loadVehicles();
  }, [router]);

  async function addVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Configurazione Supabase mancante.");
      return;
    }

    const { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/login");
      return;
    }

    const km = Number(odometer);

    if (!Number.isFinite(km) || km < 0) {
      setMessage("Inserisci un chilometraggio valido.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        user_id: user.id,
        brand: brand.trim(),
        model: model.trim(),
        plate: plate.trim().toUpperCase(),
        fuel_type: fuelType,
        initial_odometer_km: km,
        current_odometer_km: km,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
    } else {
      setVehicles((previous) => [data as Vehicle, ...previous]);
      setBrand("");
      setModel("");
      setPlate("");
      setOdometer("");
      setMessage("Automobile salvata correttamente.");
    }

    setSaving(false);
  }

  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
      <p className="muted">
        <a href="/">← Torna alla pagina iniziale</a>
      </p>

      <header style={{ marginBottom: 24 }}>
        <p className="muted">AREA PERSONALE</p>
        <h1>Le mie auto</h1>
        <p className="muted">
          Registra le automobili e tieni aggiornato il chilometraggio.
        </p>
      </header>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2>Aggiungi un'automobile</h2>

        <form onSubmit={addVehicle}>
          <label className="field">
            Marca
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              maxLength={80}
              placeholder="Es. Toyota"
            />
          </label>

          <label className="field">
            Modello
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              maxLength={100}
              placeholder="Es. RAV4"
            />
          </label>

          <label className="field">
            Targa
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              required
              maxLength={20}
              placeholder="Es. AB123CD"
            />
          </label>

          <label className="field">
            Alimentazione
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              <option>Benzina</option>
              <option>Diesel</option>
              <option>Full hybrid</option>
              <option>Plug-in hybrid</option>
              <option>Elettrica</option>
              <option>GPL</option>
              <option>Metano</option>
              <option>Altro</option>
            </select>
          </label>

          <label className="field">
            Chilometraggio attuale (km)
            <input
              type="number"
              min="0"
              step="1"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              required
              placeholder="Es. 25000"
            />
          </label>

          <button className="button" type="submit" disabled={saving}>
            {saving ? "Salvataggio..." : "Salva automobile"}
          </button>
        </form>

        {message && (
          <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>
            {message}
          </p>
        )}
      </section>

      <section>
        <h2>Automobili registrate</h2>

        {loading ? (
          <p className="muted">Caricamento in corso...</p>
        ) : vehicles.length === 0 ? (
          <div className="card">
            <p>Non hai ancora registrato automobili.</p>
          </div>
        ) : (
          <div className="grid">
            {vehicles.map((vehicle) => (
              <article className="card" key={vehicle.id}>
                <h3>
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="muted">Targa: {vehicle.plate}</p>
                <p>Alimentazione: {vehicle.fuel_type}</p>
                <p>
                  Chilometraggio:{" "}
                  {Number(vehicle.current_odometer_km).toLocaleString("it-IT")} km
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

