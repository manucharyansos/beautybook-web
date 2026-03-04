import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const emailFromQuery = sp.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return !!token && !!email && password.length >= 8 && password === password_confirmation;
  }, [token, email, password, password_confirmation]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation,
      });
      setMsg(r.data?.message || "Գաղտնաբառը փոխվեց։ Կարող ես մուտք գործել։");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Չհաջողվեց փոխել գաղտնաբառը։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#E8D5C4]/30 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-black/5">
        <div className="text-2xl font-light text-[#2C2C2C]">Վերականգնել գաղտնաբառը</div>
        <div className="mt-2 text-sm text-[#8F6B58] font-light">Մուտքագրիր նոր գաղտնաբառը։</div>

        {!token && (
          <div className="mt-4 text-sm text-red-600 font-light">Token-ը բացակայում է (հղումը սխալ է)։</div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-[#8F6B58] font-light mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-[#E8D5C4]/30 bg-white px-4 py-3 text-sm font-light text-[#2C2C2C] outline-none focus:border-[#C5A28A]/60"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8F6B58] font-light mb-1">Նոր գաղտնաբառ</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-2xl border border-[#E8D5C4]/30 bg-white px-4 py-3 text-sm font-light text-[#2C2C2C] outline-none focus:border-[#C5A28A]/60"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8F6B58] font-light mb-1">Կրկնել գաղտնաբառը</label>
            <input
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              type="password"
              required
              className="w-full rounded-2xl border border-[#E8D5C4]/30 bg-white px-4 py-3 text-sm font-light text-[#2C2C2C] outline-none focus:border-[#C5A28A]/60"
            />
          </div>

          <button
            disabled={loading || !canSubmit}
            className="w-full rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72] px-4 py-3 text-sm font-light text-white disabled:opacity-60"
          >
            {loading ? "Պահպանում ենք…" : "Պահպանել"}
          </button>
        </form>

        {msg && <div className="mt-4 text-sm text-[#8F6B58] font-light">{msg}</div>}

        <div className="mt-6 text-sm font-light text-[#8F6B58]">
          <Link to="/login" className="text-[#C5A28A] hover:underline">
            Գնալ Login
          </Link>
        </div>
      </div>
    </div>
  );
}
