import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-xl font-semibold text-slate-800">{title}</h2>
    <div className="space-y-3 leading-7 text-slate-600">{children}</div>
  </section>
)

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 text-slate-900">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Golden-Intels International School</p>
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-500">Effective date: 20 November 2026</p>
        <p className="mb-8 leading-7 text-slate-600">Golden-Intels International School ("Golden-Intels", "we", "us" or "our") respects the privacy of learners, parents and guardians, staff, applicants and visitors. This policy explains how information is collected, used, stored and shared when you visit our website or use our school portal.</p>
        <Section title="1. Information we collect">
          <p>Depending on how you interact with the school, we may process:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Contact and account details, such as names, email addresses, telephone numbers and login credentials.</li>
            <li>Admissions and learner information, including dates of birth, class information, parent or guardian details, emergency contacts and documents submitted with an application.</li>
            <li>Education and school administration records, such as attendance, assessments, results, remarks, classwork, fee records and communications.</li>
            <li>Information voluntarily provided through contact forms, enquiries and correspondence.</li>
            <li>Staff and applicant information needed for school administration and recruitment.</li>
            <li>Basic technical and session information needed to operate, protect and troubleshoot the website and portal.</li>
          </ul>
          <p>Some learner or admissions forms may contain sensitive information, including health, allergy, identity-document or other family details. Please provide such information only where relevant to the school purpose for which it is requested.</p>
        </Section>
        <Section title="2. How we use information">
          <p>We use information to process admissions and enquiries; create and manage school accounts; provide teaching, learning and school administration services; maintain attendance, assessment and fee records; communicate with parents, guardians, learners and staff; protect accounts and systems; and meet applicable legal or regulatory obligations.</p>
        </Section>
        <Section title="3. Password-reset email and Google Gmail API">
          <p>When an authorised user requests a password reset, our school portal may use the Gmail API to send a password-reset message from the school's mailbox, goldenintelse@gmail.com. The permission used is limited to sending email (gmail.send).</p>
          <p>For this purpose, the application uses the authorised Google account only to send the requested email. It does not use the Gmail API to read, search, download, analyse or modify mailbox messages, contacts or other Gmail content. Google data obtained for this function is not sold, used for advertising, or used for unrelated purposes. The application does not retain the contents of the school's mailbox. OAuth credentials needed for sending are held as restricted server-side configuration.</p>
        </Section>
        <Section title="4. Service providers and sharing">
          <p>We do not sell personal information. We may use service providers that support the operation of the website and school portal, including hosting and deployment providers, database and file-storage providers, and email delivery services. These providers process information only as needed to provide their services to us and subject to their applicable terms and safeguards.</p>
          <p>When a teacher chooses AI writing help in an early-years portfolio, the teacher's entered notes, class level, selected progress level, learning area and requested field are sent to OpenAI to produce a draft. The portal does not send the learner's name, date of birth, learner ID, or portfolio photos to that AI service. Teachers should not include identifying details in notes, must review every suggestion, and remain responsible for the final portfolio. AI suggestions are optional and are not an assessment or decision about a learner.</p>
          <p>We may also disclose information where required by law, to protect learners or other individuals, to protect the school's rights and systems, or with the appropriate parent, guardian or individual's authorisation. We do not permit service providers to use school personal information for their own advertising.</p>
        </Section>
        <Section title="5. Storage and security">
          <p>School portal records are stored in managed database infrastructure. Website and portal files may be stored with managed file-storage providers. We use access controls and reasonable technical and organisational safeguards designed to protect information against unauthorised access, loss, alteration or disclosure. No internet transmission or storage system can be guaranteed to be completely secure.</p>
        </Section>
        <Section title="6. Retention">
          <p>We retain information for as long as reasonably necessary for the school, educational, administrative, safety, legal and record-keeping purposes for which it was collected. Retention periods may vary by record type and applicable legal requirements. When information is no longer required, we take reasonable steps to securely delete it or remove identifying details, subject to lawful retention obligations and system backups.</p>
        </Section>
        <Section title="7. Children and learner information">
          <p>Our services relate to a school community and may involve information about children. Parents or legal guardians should provide information about a child and make requests concerning that information where appropriate. We take particular care with learner information and limit access to authorised school personnel and service providers who need it for legitimate school purposes.</p>
        </Section>
        <Section title="8. Your choices and requests">
          <p>You may contact the school to ask about personal information we hold, request correction of inaccurate information, or raise a privacy concern. We may need to verify your identity and, for a learner's information, your authority to act for that learner. Some records may need to be retained where the school has a lawful or legitimate record-keeping obligation.</p>
        </Section>
        <Section title="9. External websites">
          <p>Our website may link to third-party websites or services. Their privacy practices are governed by their own policies, and we encourage you to review those policies before providing information to them.</p>
        </Section>
        <Section title="10. Changes to this policy">
          <p>We may update this policy when our services, practices or legal obligations change. The latest version will be published on this page with its effective date.</p>
        </Section>
        <Section title="11. Contact us">
          <p>For privacy questions or requests, contact:</p>
          <p><strong>Golden-Intels International School</strong><br />New Housing Estate, directly opposite the Voltic Depot, Ho, Volta Region, Ghana<br />Email: <a className="text-blue-700 underline" href="mailto:goldenintelse@gmail.com">goldenintelse@gmail.com</a><br />Telephone: <a className="text-blue-700 underline" href="tel:+233594330816">+233 59 433 0816</a></p>
        </Section>
        <div className="border-t border-slate-200 pt-6 text-sm"><Link className="font-medium text-blue-700 hover:underline" to="/">Return to home</Link></div>
      </article>
    </main>
  )
}
