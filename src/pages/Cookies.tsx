import { motion } from "framer-motion";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";

export default function Cookies() {
  return (
    <motion.div {...page} className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-5 md:p-7">
          <h1 className="text-2xl font-semibold">Կուկիներ (Cookies)</h1>
          <p className="mt-2 text-sm text-slate-500">Վերջին թարմացում՝ {new Date().toISOString().slice(0, 10)}</p>

          <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
            <p>
              Մենք օգտագործում ենք cookies՝ սեսիան պահպանելու, անվտանգության և հիմնական ֆունկցիոնալի համար։
              Գովազդային/տրեքինգային cookies հիմա չենք օգտագործում (կարող ես փոխել ըստ իրական իրավիճակի)։
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Auth cookie/token (Sanctum)՝ մուտքի սեսիայի համար</li>
              <li>Preference cookies՝ լեզու/տեսք (եթե ավելացնես)</li>
              <li>Security cookies՝ CSRF և այլն</li>
            </ul>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
