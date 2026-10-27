
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  plate: string;
};

type Maintenance = {
  id: number;
  vehicle_id: number;
  maintenance_date: string;
  odometer_km: number | null;
  category: string;
  description: string | null;
  amount: number;
  next_date: string | null;
  next_odometer_km: number | null;
  notes: string | null;
};

const categories = [
  "Tagliando",
  "Cambio olio e filtri",
  "Pneumatici",
  "Freni",
  "Batteria",
  "Riparazione",
  "Revisione",
  "Carrozzeria",
  "Impianto elettrico",
  "Altro",
];

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [userId, setUserId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [odometer, setOdometer] = useState("");
  const [category, setCategory] = useState("Tagliando");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextOdometer, setNextOdometer] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
      setMessage("Accedi per visualizzare le manutenzioni.");
      setLoading(false);
      return;
    }

    const currentUserId = authData.user.id;
    setUserId(currentUserId);

    const { data: vehicleData, error: vehicleError } = await supabase
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

    const { data: maintenanceData, error: maintenanceError } =
      await supabase
        .from("maintenance")
        .select(
          "id, vehicle_id, maintenance_date, odometer_km, category, description, amount, next_date, next_odometer_km, notes"
        )
        .eq("user_id", currentUserId)
        .order("maintenance_date", { ascending: false });

    if (maintenanceError) {
      setMessage(
        "Errore nel caricamento delle manutenzioni: " +
          maintenanceError.message
      );
      setLoading(false);
      return;
    }

    setRecords(maintenanceData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveMaintenance(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Devi effettuare l'accesso.");
      return;
    }

    if (!vehicleId || !maintenanceDate || !category || !amount) {
      setMessage("Compila tutti i campi obbligatori.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      setMessage("Inserisci un costo valido, pari o superiore a zero.");
      return;
    }

    if (odometer && Number(odometer) < 0) {
      setMessage("Inserisci un chilometraggio valido.");
      return;
    }

    if (nextOdometer && Number(nextOdometer) < 0) {
      setMessage("Controlla il chilometraggio del prossimo intervento.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("maintenance").insert({
      user_id: userId,
      vehicle_id: Number(vehicleId),
      maintenance_date: maintenanceDate,
      odometer_km: odometer ? Number(odometer) : null,
      category,
      description: description.trim() || null,
      amount: Number(Number(amount).toFixed(2)),
      next_date: nextDate || null,
      next_odometer_km: nextOdometer ? Number(nextOdometer) : null,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
      return;
    }

    setMessage("Manutenzione salvata correttamente.");
    setOdometer("");
    setDescription("");
    setAmount("");
    setNextDate("");
    setNextOdometer("");
    setNotes("");
    setCategory("Tagliando");

    await loadData();
  }

  const totalAmount = records.reduce(
    (total, record) => total + Number(record.amount || 0),
    0
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <a
          href="/vehicles"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna ai veicoli
        </a>

        <h1 className="mt-3 text-3xl font-bold">Manutenzioni</h1>

        <p className="mt-2 text-gray-600">
          Registra gli interventi e tieni sotto controllo i prossimi tagliandi.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border p-3 text-sm" role="status">
          {message}
        </div>
      )}

      <section className="mb-8 rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Nuovo intervento</h2>

        {vehicles.length === 0 && !loading ? (
          <p className="text-gray-600">
            Non ci sono veicoli attivi. Aggiungi prima un veicolo nella sezione
            Veicoli.
          </p>
        ) : (
          <form
            onSubmit={saveMaintenance}
            className="grid gap-4 md:grid-cols-2"
          >
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
              Data intervento *
              <input
                required
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="rounded-lg border p-2.5"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Categoria *
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border p-2.5"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Chilometraggio (km)
              <input
                type="number"
                min="0"
                step="1"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 30000"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Costo (€) *
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 250,00"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Descrizione intervento
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. Sostituzione olio e filtri"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Data prossimo intervento
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="rounded-lg border p-2.5"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Prossimo intervento a (km)
              <input
                type="number"
                min="0"
                step="1"
                value={nextOdometer}
                onChange={(e) => setNextOdometer(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 40000"
              />
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
              {saving ? "Salvataggio..." : "Salva intervento"}
            </button>
          </form>
        )}
      </section>

      <section className="mb-5 rounded-xl border p-5 shadow-sm">
        <p className="text-sm text-gray-600">Totale manutenzioni registrate</p>
        <p className="mt-1 text-3xl font-bold">{euro(totalAmount)}</p>
        <p className="mt-1 text-sm text-gray-500">
          {records.length} {records.length === 1 ? "intervento" : "interventi"}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Storico manutenzioni</h2>

        {loading ? (
          <p>Caricamento...</p>
        ) : records.length === 0 ? (
          <p className="rounded-xl border p-5 text-gray-600">
            Non hai ancora registrato interventi.
          </p>
        ) : (
          <div className="grid gap-3">
            {records.map((record) => {
              const vehicle = vehicles.find(
                (item) => item.id === record.vehicle_id
              );

              return (
                <article
                  key={record.id}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {record.category}
                        {record.description ? ` — ${record.description}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {new Date(
                          record.maintenance_date + "T12:00:00"
                        ).toLocaleDateString("it-IT")}
                        {" · "}
                        {vehicle
                          ? `${vehicle.brand} ${vehicle.model} — ${vehicle.plate}`
                          : "Veicolo"}
                      </p>
                    </div>

                    <p className="text-xl font-bold">
                      {euro(Number(record.amount || 0))}
                    </p>
                  </div>

                  {record.odometer_km != null && (
                    <p className="mt-2 text-sm text-gray-700">
                      Chilometraggio:{" "}
                      {Number(record.odometer_km).toLocaleString("it-IT")} km
                    </p>
                  )}

                  {(record.next_date || record.next_odometer_km != null) && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                      <p className="font-medium">Prossimo intervento</p>
                      {record.next_date && (
                        <p>
                          Data:{" "}
                          {new Date(
                            record.next_date + "T12:00:00"
                          ).toLocaleDateString("it-IT")}
                        </p>
                      )}
                      {record.next_odometer_km != null && (
                        <p>
                          Chilometraggio:{" "}
                          {Number(record.next_odometer_km).toLocaleString(
                            "it-IT"
                          )}{" "}
                          km
                        </p>
                      )}
                    </div>
                  )}

                  {record.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      {record.notes}
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
