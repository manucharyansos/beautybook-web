import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const companyLinks = [
  { label: "Մեր մասին", to: "/about" },
  { label: "Կապ մեզ հետ", to: "/contact" },
  { label: "Գներ", to: "/pricing" },
  { label: "Ֆունկցիաներ", to: "/features" },
  // Եթե հետո սարքես էջերը՝ կարող ես բացել
  // { label: "Կարիերա", to: "/careers" },
  // { label: "Բլոգ", to: "/blog" },
  // { label: "Մամուլ", to: "/press" },
];

const legalLinks = [
  { label: "Գաղտնիության քաղաքականություն", to: "/privacy-policy" },
  { label: "Պայմաններ", to: "/terms" },
  // Եթե հետո սարքես էջերը՝ կարող ես բացել
  // { label: "Cookies", to: "/cookies" },
  // { label: "Լիցենզիաներ", to: "/licenses" },
];

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-white pt-20 pb-10 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block group">
              <h3 className="text-3xl font-light tracking-tight mb-4">
                Beauty
                <span className="text-[#C5A28A] group-hover:text-[#B88E72] transition-colors">
                  Book
                </span>
              </h3>
            </Link>

            <p className="max-w-md text-[#E8D5C4] text-sm font-light leading-relaxed">
              Կատարյալ լուծում գեղեցկության սրահների համար։
              Նրբագեղություն և ֆունկցիոնալություն մեկ հարթակում։
            </p>

            {/* Social Links */}
            <div className="mt-8 flex gap-4">
              {[
                { name: "facebook", icon: "f", href: "#" },
                { name: "instagram", icon: "ig", href: "#" },
                { name: "linkedin", icon: "in", href: "#" },
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-full border border-[#E8D5C4]/20
                             flex items-center justify-center text-[#E8D5C4]
                             hover:bg-gradient-to-r hover:from-[#C5A28A] hover:to-[#B88E72]
                             hover:border-transparent hover:text-white
                             transition-all duration-500"
                >
                  <span className="sr-only">{social.name}</span>
                  <span className="text-xs font-light tracking-wider">
                    {social.icon}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6 text-[#E8D5C4] font-light">
              Ընկերություն
            </h4>
            <ul className="space-y-4">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-[#E8D5C4] hover:text-white
                               transition-colors duration-300 font-light inline-block
                               hover:translate-x-1 transform transition-transform"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6 text-[#E8D5C4] font-light">
              Իրավական
            </h4>
            <ul className="space-y-4">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-[#E8D5C4] hover:text-white
                               transition-colors duration-300 font-light inline-block
                               hover:translate-x-1 transform transition-transform"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-[#E8D5C4]/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-[#E8D5C4] font-light order-2 md:order-1">
              © {new Date().getFullYear()} SmartBook. Բոլոր իրավունքները պաշտպանված են։
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-[#E8D5C4] font-light order-1 md:order-2">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                <span>Հայաստան</span>
              </motion.div>

              <motion.a
                href="mailto:info@smartbook.am"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                <span>info@smartbook.am</span>
              </motion.a>

              <motion.a
                href="tel:+374xxxxxxxx"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                <span>+374 (XX) XXX-XXX</span>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ y: -5 }}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full
                     bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                     text-white shadow-lg shadow-[#C5A28A]/30
                     hover:shadow-xl hover:shadow-[#C5A28A]/40
                     transition-all duration-300 z-40
                     flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      </div>
    </footer>
  );
}