import { motion } from "framer-motion";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Link } from "react-router-dom";

export default function Careers() {
  return (
    <motion.div {...page} className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 md:p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Կարիերա</h1>
          <p className="mt-3 text-[#5A5A5A] leading-relaxed">
            SmartBook-ը կառուցում է booking & CRM լուծում՝ գեղեցկության սրահների և կլինիկաների համար։
            Մենք հիմա փոքր թիմ ենք և արագ ենք շարժվում՝ կենտրոնանալով որակի, պարզության և real-world usability-ի վրա։
          </p>

          <div className="mt-8 rounded-2xl border border-black/5 bg-[#FAF9F7] p-5">
            <h2 className="text-lg font-medium">Բաց հաստիքներ</h2>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              Այս պահին ակտիվ vacancy-ներ չենք հրապարակել, բայց միշտ բաց ենք ուժեղ մարդկանց հետ խոսելու համար։
            </p>

            <ul className="mt-4 space-y-2 text-sm text-[#5A5A5A]">
              <li>• Frontend (React / TypeScript)</li>
              <li>• Backend (Laravel / MySQL)</li>
              <li>• QA / Product testing</li>
              <li>• Customer Success (սրահների onboarding)</li>
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium">Ինչպես միանալ թիմին</h2>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              Ուղարկեք կարճ նամակ՝ ձեր փորձի մասին և (եթե կա) portfolio / GitHub / CV։
              Մենք կպատասխանենք հնարավորինս շուտ։
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-[#2C2C2C] text-white text-sm hover:opacity-90 transition"
                href="mailto:support@smartbook.am"
              >
                Գրել email
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 border border-black/10 text-sm hover:bg-black/5 transition"
              >
                Կապ մեզ հետ
              </Link>
            </div>

            <p className="mt-4 text-xs text-[#8A8A8A]">
              * Email հասցեն կարող եք փոխել production-ում։ Հիմա սա placeholder է։
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
