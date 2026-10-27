
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  plate: string;
};

type Reminder = {
  id: number;
  vehicle_id: number;
  title: string;
  category: string;
  due_date: string | null;
  reminder_date: string | null;
  status: string;
  notes: string | null;
};

const categories = [
  "Revisione",
  "Assicurazione",
  "Bollo",
  "Manutenzione",
  "Tagliando",
  "Pneumatici",
  "Documenti",
  "Altro",
];

function formatDate(value: string | null) {
  if (!value) return "Non impostata";
  return new Date(value + "T12:00:00").toLocaleDateString("it-IT");
}

export default function RemindersPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<Reminder[]>([]);
  const [userId, setUserId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Revisione");
  const [dueDate, setDueDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setMessage("Accedi per visualizzare le scadenze.");
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
      setMessage("Errore nel caricamento dei veicoli: " + vehicleError.message);
      setLoading(false);
      return;
    }

    setVehicles(vehicleData ?? []);

    const { data: reminderData, error: reminderError } = await supabase
      .from("reminders")
      .select(
        "id, vehicle_id, title, category, due_date, reminder_date, status, notes"
      )
      .eq("user_id", currentUserId)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (reminderError) {
      setMessage("Errore nel caricamento delle scadenze: " + reminderError.message);
      setLoading(false);
      return;
    }

    setRecords(reminderData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Devi effettuare l'accesso.");
      return;
    }

    if (!vehicleId || !title.trim() || !category) {
      setMessage("Seleziona un veicolo e inserisci il titolo.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("reminders").insert({
      user_id: userId,
      vehicle_id: Number(vehicleId),
      title: title.trim(),
      category,
      due_date: dueDate || null,
      reminder_date: reminderDate || null,
      status: "Da fare",
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
      return;
    }

    setMessage("Scadenza salvata correttamente.");
    setTitle("");
    setCategory("Revisione");
    setDueDate("");
    setReminderDate("");
    setNotes("");

    await loadData();
  }

  async function toggleStatus(record: Reminder) {
    const newStatus = record.status === "Completata" ? "Da fare" : "Completata";
    setMessage("");

    const { error } = await supabase
      .from("reminders")
      .update({ status: newStatus })
      .eq("id", record.id)
      .eq("user_id", userId);

    if (error) {
      setMessage("Errore nell'aggiornamento: " + error.message);
      return;
    }

    setMessage(
      newStatus === "Completata"
        ? "Scadenza contrassegnata come completata."
        : "Scadenza riportata tra quelle da fare."
    );

    await loadData();
  }

  const pendingCount = records.filter(
    (record) => record.status !== "Completata"
  ).length;

  const completedCount = records.length - pendingCount;

  const vehicleName = (id: number) => {
    const vehicle = vehicles.find((item) => item.id === id);
    return vehicle
      ? `${vehicle.brand} ${vehicle.model} — ${vehicle.plate}`
      : "Veicolo";
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <a href="/vehicles" className="text-sm text-blue-600 hover:underline">
          ← Torna ai veicoli
        </a>

        <h1 className="mt-3 text-3xl font-bold">Scadenze e Promemoria</h1>

        <p className="mt-2 text-gray-600">
          Organizza le scadenze dei veicoli e tieni sotto controllo quelle da
          gestire.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border p-3 text-sm" role="status">
          {message}
        </div>
      )}

      <section className="mb-8 rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Nuova scadenza</h2>

        {vehicles.length === 0 && !loading ? (
          <p className="text-gray-600">
            Non ci sono veicoli attivi. Aggiungi prima un veicolo nella sezione
            Veicoli.
          </p>
        ) : (
          <form onSubmit={saveReminder} className="grid gap-4 md:grid-cols-2">
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

            <label className="grid gap-1 text-sm font-medium md:col-span-2">
              Titolo scadenza *
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. Revisione Toyota RAV4"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Data di scadenza
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border p-2.5"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Ricordami il
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="rounded-lg border p-2.5"
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
              {saving ? "Salvataggio..." : "Salva scadenza"}
            </button>
          </form>
        )}
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-600">Da gestire</p>
          <p className="mt-1 text-3xl font-bold">{pendingCount}</p>
        </div>

        <div className="rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-600">Completate</p>
          <p className="mt-1 text-3xl font-bold">{completedCount}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Elenco scadenze</h2>

        {loading ? (
          <p>Caricamento...</p>
        ) : records.length === 0 ? (
          <p className="rounded-xl border p-5 text-gray-600">
            Non hai ancora registrato scadenze.
          </p>
        ) : (
          <div className="grid gap-3">
            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{record.title}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {record.category} · {vehicleName(record.vehicle_id)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      record.status === "Completata"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {record.status || "Da fare"}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="font-medium">Scadenza:</span>{" "}
                    {formatDate(record.due_date)}
                  </p>
                  <p>
                    <span className="font-medium">Promemoria:</span>{" "}
                    {formatDate(record.reminder_date)}
                  </p>
                </div>

                {record.notes && (
                  <p className="mt-3 text-sm text-gray-600">{record.notes}</p>
                )}

                <button
                  type="button"
                  onClick={() => void toggleStatus(record)}
                  className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  {record.status === "Completata"
                    ? "Riporta tra le scadenze da fare"
                    : "Segna come completata"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
