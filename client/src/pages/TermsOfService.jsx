import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-xl font-semibold text-slate-800">{title}</h2>
    <div className="space-y-3 leading-7 text-slate-600">{children}</div>
  </section>
)

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 text-slate-900">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Golden-Intels International School</p>
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Terms of Service</h1>
        <p className="mb-8 text-sm text-slate-500">Effective date: 11 November 2026</p>
        <p className="mb-8 leading-7 text-slate-600">These terms govern your use of the Golden-Intels International School public website and online school portal. By using these services, you agree to use them responsibly and in accordance with these terms and applicable law.</p>
        <Section title="1. About the services"><p>The website provides information about the school, its programmes, admissions, activities and contact channels. The school portal provides authorised users with online access to relevant school and account functions. Features may change as the school improves its services.</p></Section>
        <Section title="2. Portal accounts"><p>Portal access is intended for authorised learners, parents or guardians, staff and school administrators. You must provide accurate information, keep your login details confidential, and notify the school promptly if you suspect that your account has been accessed without permission. You are responsible for activity carried out through your account unless caused by a failure attributable to the school.</p><p>Do not share another person's account, attempt to access records without permission, or interfere with the security or operation of the portal.</p></Section>
        <Section title="3. Acceptable use"><p>You must not use the website or portal to break the law, submit false or misleading information, upload malicious content, infringe another person's rights, disrupt services, or attempt to bypass access controls. The school may restrict or suspend access where reasonably necessary to protect users, records or systems.</p></Section>
        <Section title="4. School records and communications"><p>Information displayed in the portal is provided for school communication and administration. If you believe a learner, attendance, assessment or fee record is inaccurate, contact the school through its official channels so the matter can be reviewed. Portal information does not replace formal school notices or documents where those are required.</p></Section>
        <Section title="5. Intellectual property"><p>Unless otherwise stated, website text, designs, logos, photographs and other materials are owned by or used with permission by Golden-Intels International School. You may view and use them for personal, non-commercial purposes related to the school. You must not reproduce, alter, distribute or commercially exploit them without permission, except where the law allows.</p></Section>
        <Section title="6. Privacy"><p>Our collection and use of personal information is explained in our <Link className="text-blue-700 underline" to="/privacy-policy">Privacy Policy</Link>, which forms part of these terms. Please review it before using forms or the school portal.</p></Section>
        <Section title="7. Availability and third-party services"><p>We aim to keep the website and portal available, but access may occasionally be interrupted for maintenance, updates, security or events outside our reasonable control. Some functions rely on third-party hosting, database, storage or email services and may be affected by those providers.</p></Section>
        <Section title="8. Information and educational decisions"><p>Website information is general information about the school and may be updated from time to time. Specific admissions, fee, academic or administrative decisions are subject to the school's current official policies and direct confirmation from the school.</p></Section>
        <Section title="9. Limitation and responsibility"><p>To the extent permitted by applicable law, the school is not responsible for indirect loss arising from temporary unavailability, misuse of an account by its authorised user, or reliance on outdated third-party information. Nothing in these terms excludes liability that cannot lawfully be excluded or limits any rights that applicable law gives you.</p></Section>
        <Section title="10. Changes to these terms"><p>We may revise these terms when our services or legal obligations change. The updated version will be published on this page with its effective date. Continued use after an update means you accept the revised terms to the extent permitted by law.</p></Section>
        <Section title="11. Governing law and contact"><p>These terms are governed by the laws of the Republic of Ghana, subject to any mandatory legal protections that apply to you.</p><p><strong>Golden-Intels International School</strong><br />New Housing Estate, directly opposite the Voltic Depot, Ho, Volta Region, Ghana<br />Email: <a className="text-blue-700 underline" href="mailto:goldenintelse@gmail.com">goldenintelse@gmail.com</a><br />Telephone: <a className="text-blue-700 underline" href="tel:+233594330816">+233 59 433 0816</a></p></Section>
        <div className="border-t border-slate-200 pt-6 text-sm"><Link className="font-medium text-blue-700 hover:underline" to="/">Return to home</Link></div>
      </article>
    </main>
  )
}
