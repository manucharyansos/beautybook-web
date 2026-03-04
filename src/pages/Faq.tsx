import React from "react";
import Navigation from "../components/Navigation";

const faqs = [
  {
    q: "Ինչպե՞ս է աշխատում փորձնական շրջանը (Trial)",
    a: "Գրանցվելուց հետո դուք ստանում եք սահմանափակված/լիարժեք փորձնական շրջան՝ ըստ պլանի։ Փորձաշրջանի ավարտին կարող եք ընտրել վճարովի փաթեթ։",
  },
  {
    q: "Հաճախորդը պետք է account ունենա՞ ամրագրելու համար",
    a: "Ոչ պարտադիր։ Հաճախորդը կարող է ամրագրել՝ նշելով անունը և հեռախոսահամարը։",
  },
  {
    q: "Կարո՞ղ եմ միաժամանակ մի քանի ծառայություն ամրագրել",
    a: "Այո։ Դուք կարող եք ընտրել մի քանի ծառայություն, իսկ համակարգը կհաշվի ընդհանուր տևողությունն ու գինը։ (Շուտով՝ տարբեր աշխատակից/ժամ յուրաքանչյուր ծառայության համար)։",
  },
  {
    q: "Ի՞նչ հաղորդագրություններ են ուղարկվում",
    a: "Business/Staff-ի համար՝ Email։ Հաճախորդի համար՝ Trial-ում WhatsApp, իսկ production փուլում՝ SMS հայկական օպերատորով։",
  },
  {
    q: "Տվյալները արդյո՞ք խառնվում են տարբեր սրահների միջև",
    a: "Ոչ։ Սա marketplace չէ։ Յուրաքանչյուր բիզնես ունի իր փակ համակարգը՝ multi-tenant մոդելով։",
  },
];

export default function Faq() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2C2C2C]">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-6">FAQ</h1>
        <p className="text-[#6B6B6B] mb-10">
          Ամենահաճախ տրվող հարցերը՝ SmartBook-ի մասին։
        </p>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
              <h3 className="text-lg font-medium mb-2">{item.q}</h3>
              <p className="text-[#5A5A5A] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
