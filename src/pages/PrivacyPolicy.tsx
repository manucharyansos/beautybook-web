import { motion } from "framer-motion";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";

export default function PrivacyPolicy() {
  return (
    <motion.div {...page} className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-5 md:p-7">
          <h1 className="text-2xl font-semibold">Գաղտնիության քաղաքականություն</h1>
          <p className="mt-2 text-sm text-slate-500">
            Վերջին թարմացում՝ {new Date().toISOString().slice(0, 10)}
          </p>

          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. Ովքեր ենք</h2>
              <p className="mt-1">
                SmartBook-ը ամրագրման և ժամանակացույցի կառավարման համակարգ է գեղեցկության սրահների և
                կլինիկաների համար (“Ծառայություն”):
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. Ի՞նչ տվյալներ ենք հավաքում</h2>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Հաշվի տվյալներ՝ անուն, էլ․ հասցե, դերը (Owner/Manager/Staff)</li>
                <li>Բիզնեսի տվյալներ՝ սրահ/կլինիկա անվանում, հեռախոս, հասցե, ժամացույց, timezone</li>
                <li>Ամրագրումների տվյալներ՝ ծառայություն, աշխատակից, ժամանակ, հաճախորդի անուն/հեռախոս, նշումներ</li>
                <li>Տեխնիկական տվյալներ՝ IP, սարքի/բրաուզերի տեղեկատվություն, log-եր անվտանգության համար</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. Ինչի՞ համար ենք օգտագործում</h2>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Ծառայության տրամադրում՝ օրացույց, ամրագրումներ, staff schedule, blocks</li>
                <li>Անվտանգություն՝ մուտքերի վերահսկում, խարդախության կանխարգելում</li>
                <li>Աջակցություն՝ հարցերի պատասխան, տեխնիկական խնդիրների լուծում</li>
                <li>Բարելավում՝ անանուն վիճակագրական վերլուծություն (ոչ “re-sell”)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">4. Ո՞ւմ հետ կարող ենք կիսվել</h2>
              <p className="mt-1">
                Մենք չենք վաճառում ձեր տվյալները։ Տվյալները կարող են մշակվել միայն՝
                (ա) հոսթինգ/ինֆրա պրովայդերների միջոցով, (բ) օրենքով պահանջվող դեպքերում։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">5. Պահպանման ժամկետ</h2>
              <p className="mt-1">
                Տվյալները պահվում են այնքան ժամանակ, որքան անհրաժեշտ է ծառայության տրամադրման և
                օրինական պարտավորությունների համար։
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">6. Ձեր իրավունքները</h2>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Ստանալ ձեր տվյալների պատճեն</li>
                <li>Ուղղել/թարմացնել տվյալները</li>
                <li>Պահանջել ջնջում՝ օրենքով թույլատրելի սահմաններում</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">7. Կապ մեզ հետ</h2>
              <p className="mt-1">
                Գաղտնիության հարցերի համար գրեք support էլ․ հասցեին (դու կդնես քո իրական email-ը footer-ում)։
              </p>
            </section>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}