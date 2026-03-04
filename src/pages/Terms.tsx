import { motion } from "framer-motion";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";

export default function Terms() {
  return (
    <motion.div {...page} className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-5 md:p-7">
          <h1 className="text-2xl font-semibold">Օգտագործման պայմաններ</h1>
          <p className="mt-2 text-sm text-slate-500">
            Վերջին թարմացում՝ {new Date().toISOString().slice(0, 10)}
          </p>

          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. Ընդհանուր</h2>
              <p className="mt-1">
                Օգտվելով SmartBook-ից դուք համաձայնում եք այս պայմաններին։ Եթե համաձայն չեք, խնդրում ենք
                չօգտվել ծառայությունից։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. Հաշիվներ և հասանելիություն</h2>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Դուք պատասխանատու եք ձեր մուտքի տվյալների գաղտնիության համար</li>
                <li>Արգելվում է չարտոնված մուտք, փորձեր bypass անել սահմանափակումները</li>
                <li>Պլանի/դերի սահմանափակումները պահպանվում են (feature gating)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. Օգտատիրոջ բովանդակություն</h2>
              <p className="mt-1">
                Ամրագրումների և հաճախորդների տվյալները ձերն են։ Դուք եք պատասխանատու դրանց օրինականության
                և օգտագործման իրավունքի համար։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">4. Ծառայության մատչելիություն</h2>
              <p className="mt-1">
                Մենք ձգտում ենք ապահովել կայուն աշխատանք, բայց հնարավոր են տեխնիկական ընդհատումներ։
                Կլինեն նաև թարմացումներ/սպասարկում։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">5. Վճարներ և պլաններ</h2>
              <p className="mt-1">
                Եթե ակտիվացվում է վճարովի պլան՝ վճարները, սահմանափակումները և trial-ը գործում են ըստ pricing էջի։
                Չվճարելու դեպքում որոշ հնարավորություններ կարող են սառեցվել։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">6. Պատասխանատվության սահմանափակում</h2>
              <p className="mt-1">
                Ծառայությունը տրամադրվում է “ինչպես կա” սկզբունքով։ Մենք չենք պատասխանատվություն կրում
                ձեր բիզնեսի կորուստների համար՝ օրենքով թույլատրելի սահմաններում։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">7. Դադարեցում</h2>
              <p className="mt-1">
                Կարող ենք սահմանափակել կամ դադարեցնել հասանելիությունը՝ խախտումների, չարաշահման կամ
                անվտանգության ռիսկերի դեպքում։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">8. Կապ</h2>
              <p className="mt-1">
                Հարցերի համար գրեք support էլ․ հասցեին (դու կդնես քո իրական email-ը footer-ում)։
              </p>
            </section>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}