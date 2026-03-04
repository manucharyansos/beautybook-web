import { motion } from "framer-motion";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";

export default function Support() {
  return (
    <motion.div {...page} className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-5 md:p-7">
          <h1 className="text-2xl font-semibold">Աջակցություն</h1>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>Տեխնիկական օգնության համար կարող ես գրել մեզ email-ով կամ WhatsApp-ով։</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email: support@yourdomain.com</li>
              <li>WhatsApp: +374 XX XX XX XX</li>
            </ul>
            <p className="text-slate-500">Փոխարինիր այս կոնտակտները քո իրական տվյալներով։</p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
