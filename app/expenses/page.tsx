
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  plate: string;
};

type Expense = {
  id: number;
  vehicle_id: number | null;
  expense_date: string;
  category: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  notes: string | null;
};

const categories = [
  "Assicurazione",
  "Bollo",
  "Parcheggio",
  "Pedaggi",
  "Lavaggio",
  "Manutenzione",
  "Carburante",
  "Pneumatici",
  "Revisione",
  "Altro",
];

export default function ExpensesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userId, setUserId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [category, setCategory] = useState("Altro");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
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
      setMessage("Accedi per visualizzare le spese.");
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

    const { data: expenseData, error: expenseError } = await supabase
      .from("expenses")
      .select(
        "id, vehicle_id, expense_date, category, description, amount, due_date, notes"
      )
      .eq("user_id", currentUserId)
      .order("expense_date", { ascending: false });

    if (expenseError) {
      setMessage("Errore nel caricamento delle spese: " + expenseError.message);
      setLoading(false);
      return;
    }

    setExpenses(expenseData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Devi effettuare l'accesso.");
      return;
    }

    if (!vehicleId || !expenseDate || !category || !amount) {
      setMessage("Compila tutti i campi obbligatori.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setMessage("Inserisci un importo maggiore di zero.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      vehicle_id: Number(vehicleId),
      expense_date: expenseDate,
      category,
      description: description.trim() || null,
      amount: Number(Number(amount).toFixed(2)),
      due_date: dueDate || null,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage("Errore nel salvataggio: " + error.message);
      return;
    }

    setMessage("Spesa salvata correttamente.");
    setCategory("Altro");
    setDescription("");
    setAmount("");
    setDueDate("");
    setNotes("");

    await loadData();
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
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

        <h1 className="mt-3 text-3xl font-bold">Spese</h1>

        <p className="mt-2 text-gray-600">
          Registra e consulta le spese dei tuoi veicoli.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border p-3 text-sm" role="status">
          {message}
        </div>
      )}

      <section className="mb-8 rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Nuova spesa</h2>

        {vehicles.length === 0 && !loading ? (
          <p className="text-gray-600">
            Non ci sono veicoli attivi. Aggiungi prima un veicolo nella sezione
            Veicoli.
          </p>
        ) : (
          <form onSubmit={saveExpense} className="grid gap-4 md:grid-cols-2">
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
              Data della spesa *
              <input
                required
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
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
              Importo (€) *
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. 85,50"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium md:col-span-2">
              Descrizione
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Es. Rinnovo assicurazione"
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
              Note
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-lg border p-2.5"
                placeholder="Note facoltative"
              />
            </label>

            <button
              type="submit"
              disabled={saving || loading || vehicles.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
            >
              {saving ? "Salvataggio..." : "Salva spesa"}
            </button>
          </form>
        )}
      </section>

      <section className="mb-5 rounded-xl border p-5 shadow-sm">
        <p className="text-sm text-gray-600">Totale delle spese registrate</p>
        <p className="mt-1 text-3xl font-bold">{euro(totalExpenses)}</p>
        <p className="mt-1 text-sm text-gray-500">
          {expenses.length} {expenses.length === 1 ? "spesa" : "spese"}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Storico spese</h2>

        {loading ? (
          <p>Caricamento...</p>
        ) : expenses.length === 0 ? (
          <p className="rounded-xl border p-5 text-gray-600">
            Non hai ancora registrato spese.
          </p>
        ) : (
          <div className="grid gap-3">
            {expenses.map((expense) => {
              const vehicle = vehicles.find(
                (item) => item.id === expense.vehicle_id
              );

              return (
                <article
                  key={expense.id}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {expense.category}
                        {expense.description
                          ? ` — ${expense.description}`
                          : ""}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {new Date(
                          expense.expense_date + "T12:00:00"
                        ).toLocaleDateString("it-IT")}
                        {" · "}
                        {vehicle
                          ? `${vehicle.brand} ${vehicle.model}`
                          : "Veicolo"}
                      </p>
                    </div>

                    <p className="text-xl font-bold">
                      {euro(Number(expense.amount))}
                    </p>
                  </div>

                  {expense.due_date && (
                    <p className="mt-2 text-sm text-gray-600">
                      Scadenza:{" "}
                      {new Date(
                        expense.due_date + "T12:00:00"
                      ).toLocaleDateString("it-IT")}
                    </p>
                  )}

                  {expense.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      {expense.notes}
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
