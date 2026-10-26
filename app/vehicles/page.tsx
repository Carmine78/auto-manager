
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
  is_active: boolean;
};

export default function VehiclesPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

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

  function resetForm() {
    setBrand("");
    setModel("");
    setPlate("");
    setFuelType("Benzina");
    setOdometer("");
    setEditingId(null);
    setMessage("");
  }

  function editVehicle(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setPlate(vehicle.plate);
    setFuelType(vehicle.fuel_type);
    setOdometer(String(vehicle.current_odometer_km));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Configurazione Supabase mancante.");
      return;
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/login");
      return;
    }

    const km = Number(odometer);

    if (!Number.isFinite(km) || km < 0 || !Number.isInteger(km)) {
      setMessage("Inserisci un chilometraggio valido, in km interi.");
      return;
    }

    setSaving(true);

    const vehicleData = {
      brand: brand.trim(),
      model: model.trim(),
      plate: plate.trim().toUpperCase(),
      fuel_type: fuelType,
      current_odometer_km: km,
    };

    const result =
      editingId === null
        ? await supabase
            .from("vehicles")
            .insert({
              ...vehicleData,
              user_id: user.id,
              initial_odometer_km: km,
              is_active: true,
            })
            .select()
            .single()
        : await supabase
            .from("vehicles")
            .update(vehicleData)
            .eq("id", editingId)
            .eq("user_id", user.id)
            .select()
            .single();

    const { data, error } = result;

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
    } else if (!data) {
      setMessage("Nessuna automobile aggiornata. Ricarica la pagina e riprova.");
    } else {
      const savedVehicle = data as Vehicle;

      setVehicles((previous) =>
        editingId === null
          ? [savedVehicle, ...previous]
          : previous.map((vehicle) =>
              vehicle.id === editingId ? savedVehicle : vehicle
            )
      );

      setMessage(
        editingId === null
          ? "Automobile salvata correttamente."
          : "Automobile modificata correttamente."
      );

      resetForm();
    }

    setSaving(false);
  }

  return (
    <main
      className="container"
      style={{ paddingTop: 32, paddingBottom: 40 }}
    >
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
        <h2>
          {editingId === null
            ? "Aggiungi un'automobile"
            : "Modifica automobile"}
        </h2>

        <form onSubmit={saveVehicle}>
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

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="button" type="submit" disabled={saving}>
              {saving
                ? "Salvataggio..."
                : editingId === null
                  ? "Salva automobile"
                  : "Salva modifiche"}
            </button>

            {editingId !== null && (
              <button
                className="button"
                type="button"
                disabled={saving}
                onClick={resetForm}
              >
                Annulla
              </button>
            )}
          </div>
        </form>

        {message && (
          <p
            role="status"
            style={{ marginTop: 16, overflowWrap: "anywhere" }}
          >
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
                  {Number(vehicle.current_odometer_km).toLocaleString(
                    "it-IT"
                  )}{" "}
                  km
                </p>

                <button
                  className="button"
                  type="button"
                  onClick={() => editVehicle(vehicle)}
                >
                  Modifica
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
