import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/auth/forgot-password", { email });
      setMsg(r.data?.message || "Եթե email-ը ճիշտ է, ուղարկեցինք հղումը։");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Չհաջողվեց ուղարկել։ Փորձիր նորից։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#E8D5C4]/30 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-black/5">
        <div className="text-2xl font-light text-[#2C2C2C]">Մոռացե՞լ ես գաղտնաբառը</div>
        <div className="mt-2 text-sm text-[#8F6B58] font-light">
          Մուտքագրիր email-ը՝ մենք կուղարկենք վերականգնման հղումը։
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-[#8F6B58] font-light mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-[#E8D5C4]/30 bg-white px-4 py-3 text-sm font-light text-[#2C2C2C] outline-none focus:border-[#C5A28A]/60"
              placeholder="example@mail.com"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72] px-4 py-3 text-sm font-light text-white disabled:opacity-60"
          >
            {loading ? "Ուղարկում ենք…" : "Ուղարկել հղումը"}
          </button>
        </form>

        {msg && <div className="mt-4 text-sm text-[#8F6B58] font-light">{msg}</div>}

        <div className="mt-6 text-sm font-light text-[#8F6B58]">
          <Link to="/login" className="text-[#C5A28A] hover:underline">
            Վերադառնալ Login
          </Link>
        </div>
      </div>
    </div>
  );
}
