
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  plate: string | null;
};

type Reminder = {
  id: number;
  user_id: string;
  vehicle_id: number;
  title: string;
  category: string | null;
  due_date: string | null;
  reminder_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
};

function isCompleted(status: string | null) {
  return status?.toLowerCase() === "completed";
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("it-IT");
}

export default function RemindersPage() {
  const router = useRouter();

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
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async (currentUserId: string) => {
    const [vehicleResult, reminderResult] = await Promise.all([
      supabase
        .from("vehicles")
        .select("id, brand, model, plate")
        .eq("user_id", currentUserId)
        .eq("is_active", true)
        .order("brand"),
      supabase
        .from("reminders")
        .select(
          "id, user_id, vehicle_id, title, category, due_date, reminder_date, status, notes, created_at"
        )
        .eq("user_id", currentUserId)
        .order("due_date", { ascending: true }),
    ]);

    if (vehicleResult.error) {
      setMessage("Errore nel caricamento dei veicoli: " + vehicleResult.error.message);
      return;
    }

    if (reminderResult.error) {
      setMessage("Errore nel caricamento delle scadenze: " + reminderResult.error.message);
      return;
    }

    setVehicles(vehicleResult.data ?? []);
    setRecords(reminderResult.data ?? []);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session?.user) {
        setMessage("Sessione non valida. Accedi nuovamente.");
        setLoading(false);
        return;
      }

      const currentUserId = data.session.user.id;
      setUserId(currentUserId);
      await loadData(currentUserId);

      if (active) setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session?.user) {
        setUserId("");
        setVehicles([]);
        setRecords([]);
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
      loadData(session.user.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadData, router]);

  async function saveReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Sessione utente non disponibile. Accedi nuovamente.");
      return;
    }

    if (!vehicleId || !title.trim()) {
      setMessage("Seleziona un veicolo e inserisci il titolo.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: userId,
        vehicle_id: Number(vehicleId),
        title: title.trim(),
        category,
        due_date: dueDate || null,
        reminder_date: reminderDate || null,
        status: "pending",
        notes: notes.trim() || null,
      })
      .select(
        "id, user_id, vehicle_id, title, category, due_date, reminder_date, status, notes, created_at"
      )
      .single();

    setSaving(false);

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
      return;
    }

    setRecords((current) => [...current, data].sort((a, b) =>
      (a.due_date ?? "9999-12-31").localeCompare(b.due_date ?? "9999-12-31")
    ));
    setTitle("");
    setDueDate("");
    setReminderDate("");
    setNotes("");
    setMessage("Scadenza salvata correttamente.");
  }

  async function toggleStatus(record: Reminder) {
    setMessage("");

    if (!userId) {
      setMessage("Sessione utente non disponibile. Accedi nuovamente.");
      return;
    }

    if (updatingId !== null) return;

    setUpdatingId(record.id);

    const newStatus = isCompleted(record.status) ? "pending" : "completed";

    const { data, error } = await supabase
      .from("reminders")
      .update({ status: newStatus })
      .eq("id", record.id)
      .eq("user_id", userId)
      .select("id, status")
      .maybeSingle();

    setUpdatingId(null);

    if (error) {
      setMessage("Errore nell'aggiornamento: " + error.message);
      return;
    }

    if (!data) {
      setMessage(
        "Nessuna riga aggiornata. Verifica che la scadenza appartenga all'utente connesso e che la policy UPDATE sia corretta."
      );
      return;
    }

    setRecords((current) =>
      current.map((item) =>
        item.id === record.id ? { ...item, status: data.status } : item
      )
    );

    setMessage(
      newStatus === "completed"
        ? "Scadenza contrassegnata come completata."
        : "Scadenza riportata tra quelle da fare."
    );
  }

  if (loading) {
    return <main className="mx-auto max-w-5xl p-6">Caricamento scadenze…</main>;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">Scadenze e promemoria</h1>
        <p className="mt-2 text-gray-600">
          Gestisci le scadenze dei tuoi veicoli.
        </p>
      </header>

      {message && (
        <p role="status" className="rounded-lg border p-3">
          {message}
        </p>
      )}

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-xl font-semibold">Nuova scadenza</h2>

        <form onSubmit={saveReminder} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            Veicolo
            <select
              className="rounded border p-2"
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              required
            >
              <option value="">Seleziona un veicolo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model}
                  {vehicle.plate ? ` — ${vehicle.plate}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            Titolo
            <input
              className="rounded border p-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Es. Revisione"
              required
            />
          </label>

          <label className="grid gap-1">
            Categoria
            <select
              className="rounded border p-2"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Revisione</option>
              <option>Assicurazione</option>
              <option>Bollo</option>
              <option>Manutenzione</option>
              <option>Pneumatici</option>
              <option>Altro</option>
            </select>
          </label>

          <label className="grid gap-1">
            Data scadenza
            <input
              className="rounded border p-2"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>

          <label className="grid gap-1">
            Ricordami il
            <input
              className="rounded border p-2"
              type="date"
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            Note
            <textarea
              className="rounded border p-2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </label>

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
            type="submit"
            disabled={saving || !userId || vehicles.length === 0}
          >
            {saving ? "Salvataggio…" : "Salva scadenza"}
          </button>
        </form>

        {vehicles.length === 0 && (
          <p className="mt-3 text-sm text-gray-600">
            Non risultano veicoli attivi. Aggiungi prima un veicolo.
          </p>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-xl font-semibold">Elenco scadenze</h2>

        {records.length === 0 ? (
          <p>Nessuna scadenza presente.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const vehicle = vehicles.find(
                (item) => item.id === record.vehicle_id
              );
              const completed = isCompleted(record.status);

              return (
                <article key={record.id} className="rounded-lg border p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h3 className="font-semibold">{record.title}</h3>
                      <p className="text-sm text-gray-600">
                        {vehicle
                          ? `${vehicle.brand} ${vehicle.model}`
                          : `Veicolo ID ${record.vehicle_id}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Categoria: {record.category || "Altro"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Scadenza: {formatDate(record.due_date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Promemoria: {formatDate(record.reminder_date)}
                      </p>
                      {record.notes && (
                        <p className="mt-2 text-sm">{record.notes}</p>
                      )}
                      <p className="mt-2 font-medium">
                        Stato: {completed ? "Completata" : "Da fare"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStatus(record)}
                      disabled={updatingId !== null}
                      className="h-fit rounded-lg border px-4 py-2 disabled:opacity-50"
                    >
                      {updatingId === record.id
                        ? "Aggiornamento…"
                        : completed
                          ? "Riporta tra le attività da fare"
                          : "Segna come completata"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
