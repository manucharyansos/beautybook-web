import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Star, Plus, Minus } from "lucide-react";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";

type Program = {
  id: number;
  business_id: number;
  is_enabled: boolean;
  currency_unit: number;
  points_per_currency_unit: number;
  min_booking_amount: number;
  notes?: string | null;
};

type ClientRow = { id: number; name: string; phone: string | null; points: number };

async function fetchProgram(): Promise<Program> {
  const r = await api.get("/loyalty/program");
  return r.data.data as Program;
}

async function updateProgram(payload: Partial<Program>): Promise<Program> {
  const r = await api.put("/loyalty/program", payload);
  return r.data.data as Program;
}

async function fetchClients(q: string): Promise<ClientRow[]> {
  const r = await api.get("/loyalty/clients", { params: q ? { q } : {} });
  return r.data.data as ClientRow[];
}

async function adjustClient(clientId: number, delta_points: number, reason?: string) {
  const r = await api.post(`/loyalty/clients/${clientId}/adjust`, { delta_points, reason });
  return r.data.data;
}

export default function Loyalty() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openAdjust, setOpenAdjust] = useState<null | ClientRow>(null);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState("");

  const programQ = useQuery({ queryKey: ["loyalty", "program"], queryFn: fetchProgram });
  const clientsQ = useQuery({ queryKey: ["loyalty", "clients", q], queryFn: () => fetchClients(q) });

  const saveProgram = useMutation({
    mutationFn: updateProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty"] }),
  });

  const adjustMut = useMutation({
    mutationFn: (p: { id: number; delta: number; reason?: string }) => adjustClient(p.id, p.delta, p.reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty", "clients"] }),
  });

  const program = programQ.data;

  const summary = useMemo(() => {
    if (!program) return null;
    return {
      label: `${program.points_per_currency_unit} միավոր / ${program.currency_unit} դրամ`,
    };
  }, [program]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Star className="w-6 h-6" /> Loyalty
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Հաճախորդների միավորներ՝ ավտոմատ ավելացում «Done» booking-ից + ձեռքով կարգավորում։
          </p>
        </div>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <div>
              <div className="font-medium">Ծրագիր (Program)</div>
              {summary && <div className="text-xs text-neutral-600">{summary.label}</div>}
            </div>
          </div>
          {programQ.isLoading ? (
            <Spinner />
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!program?.is_enabled}
                onChange={(e) => {
                  if (!program) return;
                  saveProgram.mutate({
                    is_enabled: e.target.checked,
                    currency_unit: program.currency_unit,
                    points_per_currency_unit: program.points_per_currency_unit,
                    min_booking_amount: program.min_booking_amount,
                    notes: program.notes ?? null,
                  });
                }}
              />
              Enabled
            </label>
          )}
        </div>

        {program && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <div>
              <div className="text-xs text-neutral-600 mb-1">Currency unit (դրամ)</div>
              <Input
                value={String(program.currency_unit)}
                onChange={(e) =>
                  qc.setQueryData(["loyalty", "program"], { ...program, currency_unit: Number(e.target.value || 0) })
                }
              />
            </div>
            <div>
              <div className="text-xs text-neutral-600 mb-1">Points per unit</div>
              <Input
                value={String(program.points_per_currency_unit)}
                onChange={(e) =>
                  qc.setQueryData(["loyalty", "program"], {
                    ...program,
                    points_per_currency_unit: Number(e.target.value || 0),
                  })
                }
              />
            </div>
            <div>
              <div className="text-xs text-neutral-600 mb-1">Min booking amount</div>
              <Input
                value={String(program.min_booking_amount)}
                onChange={(e) =>
                  qc.setQueryData(["loyalty", "program"], {
                    ...program,
                    min_booking_amount: Number(e.target.value || 0),
                  })
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={saveProgram.isPending}
                onClick={() =>
                  saveProgram.mutate({
                    is_enabled: program.is_enabled,
                    currency_unit: program.currency_unit,
                    points_per_currency_unit: program.points_per_currency_unit,
                    min_booking_amount: program.min_booking_amount,
                    notes: program.notes ?? null,
                  })
                }
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-medium">Clients points</div>
            <div className="text-xs text-neutral-600">Փնտրիր անունով կամ հեռախոսով, հետո ավելացրու/հանես միավորներ։</div>
          </div>
          <div className="w-full md:w-80">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {clientsQ.isLoading ? (
            <div className="py-10 flex justify-center"><Spinner /></div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-neutral-600">
                <tr>
                  <th className="py-2">Client</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Points</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {(clientsQ.data ?? []).map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3 text-neutral-600">{c.phone ?? "—"}</td>
                    <td className="py-3">{c.points}</td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => { setOpenAdjust(c); setDelta(0); setReason(""); }}>
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal open={!!openAdjust} onClose={() => setOpenAdjust(null)} title={openAdjust ? `Adjust points: ${openAdjust.name}` : "Adjust"}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-neutral-600 mb-1">Delta points (+/-)</div>
              <Input value={String(delta)} onChange={(e) => setDelta(Number(e.target.value || 0))} />
            </div>
            <div>
              <div className="text-xs text-neutral-600 mb-1">Reason (optional)</div>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDelta((d) => d + 10)}><Plus className="w-4 h-4" /> 10</Button>
              <Button variant="secondary" onClick={() => setDelta((d) => d - 10)}><Minus className="w-4 h-4" /> 10</Button>
            </div>
            <Button
              disabled={!openAdjust || adjustMut.isPending || delta === 0}
              onClick={() => {
                if (!openAdjust) return;
                adjustMut.mutate({ id: openAdjust.id, delta, reason: reason || undefined });
                setOpenAdjust(null);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
