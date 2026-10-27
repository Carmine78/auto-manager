 
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  plate: string;
};

type Fuelup = {
  id: number;
  vehicle_id: number;
  fuel_date: string;
  odometer_km: number;
  liters: number;
  price_per_liter: number;
  total_amount: number;
  station: string | null;
  full_tank: boolean;
  notes: string | null;
};

export default function FuelupsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelups, setFuelups] = useState<Fuelup[]>([]);
  const [userId, setUserId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [fuelDate, setFuelDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [price, setPrice] = useState("");
  const [station, setStation] = useState("");
  const [fullTank, setFullTank] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const totalAmount =
    Number(liters) > 0 && Number(price) > 0
      ? Number(liters) * Number(price)
      : 0;

  const euro = (value: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setMessage("Accedi per visualizzare i rifornimenti.");
      setLoading(false);
      return;
    }

    const currentUserId = authData.user.id;
    setUserId(currentUserId);

    const { data: vehicleData, error: vehicleError } =
      await supabase
        .from("vehicles")
        .select("id, brand, model, plate")
        .eq("user_id", currentUserId)
        .eq("is_active", true)
        .order("brand");

    if (vehicleError) {
      setMessage(
        "Errore nel caricamento dei veicoli: " + vehicleError.message
      );
      setLoading(false);
      return;
    }

    setVehicles(vehicleData ?? []);

    const { data: fuelupData, error: fuelupError } =
      await supabase
        .from("fuelups")
        .select(
          "id, vehicle_id, fuel_date, odometer_km, liters, price_per_liter, total_amount, station, full_tank, notes"
        )
        .eq("user_id", currentUserId)
        .order("fuel_date", { ascending: false });

    if (fuelupError) {
      setMessage(
        "Errore nel caricamento dei rifornimenti: " + fuelupError.message
      );
      setLoading(false);
      return;
    }

    setFuelups(fuelupData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveFuelup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Devi effettuare l'accesso.");
      return;
    }

    if (!vehicleId || !fuelDate || !odometer || !liters || !price) {
      setMessage("Compila tutti i campi obbligatori.");
      return;
    }

    if (
      Number(odometer) < 0 ||
      Number(liters) <= 0 ||
      Number(price) <= 0
    ) {
      setMessage("Controlla chilometri, litri e prezzo.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("fuelups").insert({
      user_id: userId,
      vehicle_id: Number(vehicleId),
      fuel_date: fuelDate,
      odometer_km: Number(odometer),
      liters: Number(liters),
      price_per_liter: Number(price),
      total_amount: Number(totalAmount.toFixed(2)),
      station: station.trim() || null,
      full_tank: fullTank,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
      return;
    }

    setMessage("Rifornimento salvato correttamente.");
    setOdometer("");
    setLiters("");
    setPrice("");
    setStation("");
    setFullTank(false);
    setNotes("");

    await loadData();
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <a
          href="/vehicles"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna ai veicoli
        </a>

        <h1 className="mt-3 text-3xl font-bold">Rifornimenti</h1>

        <p className="mt-2 text-gray-600">
          Registra e consulta i rifornimenti dei tuoi veicoli.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border p-3 text-sm" role="status">
          {message}
        </div>
      )}

      <section className="mb-8 rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Nuovo rifornimento</h2>

        {vehicles.length === 0 && !loading ? (
          <p className="text-gray-600">
            Non ci sono veicoli attivi. Aggiungi prima un veicolo nella sezione
            Veicoli.
          </p>
        ) : (
          <form onSubmit={saveFuelup} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Veicolo *
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="rounded-lg border p-2.5"
              >
                <option value="">Seleziona un veicolo</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} — {vehicle.plate}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Data *
              <input
                required
                type="date"
                value={fuelDate}
                onChange={(e) => setFuelDate(e.target.value)}
                className="rounded-lg border p-2.5"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Chilometraggio *
              <input
                required
                type="number"
                min="0"
                step="1"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 25100"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Litri *
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 40"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Prezzo al litro (€) *
              <input
                required
                type="number"
                min="0.001"
                step="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 1.800"
              />
            </label>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">Costo totale calcolato</p>
              <p className="text-2xl font-bold">{euro(totalAmount)}</p>
            </div>

            <label className="grid gap-1 text-sm font-medium">
              Distributore
              <input
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Nome del distributore"
              />
            </label>

            <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <input
                type="checkbox"
                checked={fullTank}
                onChange={(e) => setFullTank(e.target.checked)}
                className="h-4 w-4"
              />
              Ho fatto il pieno
            </label>

            <label className="grid gap-1 text-sm font-medium md:col-span-2">
              Note
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-lg border p-2.5"
                placeholder="Note facoltative"
              />
            </label>

            <button
              type="submit"
              disabled={saving || loading || vehicles.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
            >
              {saving ? "Salvataggio..." : "Salva rifornimento"}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Storico rifornimenti</h2>

        {loading ? (
          <p>Caricamento...</p>
        ) : fuelups.length === 0 ? (
          <p className="rounded-xl border p-5 text-gray-600">
            Non hai ancora registrato rifornimenti.
          </p>
        ) : (
          <div className="grid gap-3">
            {fuelups.map((fuelup) => {
              const vehicle = vehicles.find(
                (item) => item.id === fuelup.vehicle_id
              );

              return (
                <article
                  key={fuelup.id}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {vehicle
                          ? `${vehicle.brand} ${vehicle.model}`
                          : "Veicolo"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(
                          fuelup.fuel_date + "T12:00:00"
                        ).toLocaleDateString("it-IT")}
                        {" · "}
                        {Number(fuelup.odometer_km).toLocaleString("it-IT")} km
                      </p>
                    </div>

                    <p className="text-xl font-bold">
                      {euro(Number(fuelup.total_amount))}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                    <span>
                      {Number(fuelup.liters).toLocaleString("it-IT")} L
                    </span>
                    <span>
                      {euro(Number(fuelup.price_per_liter))}/L
                    </span>
                    <span>{fuelup.full_tank ? "Pieno" : "Parziale"}</span>
                    {fuelup.station && <span>{fuelup.station}</span>}
                  </div>

                  {fuelup.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      {fuelup.notes}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
