import { motion } from "framer-motion";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";

export default function Blog() {
  return (
    <motion.div {...page} className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-5 md:p-7">
          <h1 className="text-2xl font-semibold">Բլոգ</h1>
          <p className="mt-2 text-sm text-slate-500">Շուտով այստեղ կլինեն հոդվածներ՝ սրահների բիզնեսի աճի և ամրագրումների մասին։</p>
        </Card>
      </div>
    </motion.div>
  );
}
