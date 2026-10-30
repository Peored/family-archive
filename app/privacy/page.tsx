import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy & Terms · Family Archive',
  description: 'What Family Archive stores, who can see it, and how to have it removed.',
}

// Change these two lines to your own details.
const CONTACT_EMAIL = 'adewole404@gmail.com'
const LAST_UPDATED = '30 October 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[#C9A84C] text-xs tracking-widest mb-3 border-b border-[#2A2218] pb-2 uppercase">{title}</h2>
      <div className="text-[#9A8A6A] text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#0A0804] text-[#F0E6D0]">
      <header className="border-b border-[#3A3020] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest">FAMILY ARCHIVE</p>
          <p className="text-[#5A4E38] text-xs tracking-widest">PRIVACY &amp; TERMS</p>
        </div>
        <Link href="/" className="text-[#5A4E38] text-xs tracking-widest border border-[#2A2218] px-3 py-1 hover:text-[#9A8A6A]">
          BACK
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'Georgia,serif' }}>
          Privacy <em className="text-[#C9A84C]">&amp; Terms</em>
        </h1>
        <p className="text-[#5A4E38] text-xs tracking-widest mb-10">LAST UPDATED {LAST_UPDATED.toUpperCase()}</p>

        <Section title="What this is">
          <p>
            Family Archive is a private place where a family keeps its tree, photographs, stories,
            voice recordings, birthdays and places. Each family has its own separate archive.
            Nothing is public, and there is no way to browse other families&apos; archives.
          </p>
        </Section>

        <Section title="What we store">
          <p>For every account: your email address and your password. The password is stored in scrambled (hashed) form, so nobody, including us, can read it.</p>
          <p>
            For every archive: whatever the family adds. That is family members and their details
            (names, years, hometown, biography and similar), photographs, written stories,
            voice recordings, and which people have access and with what role.
          </p>
          <p>If you use the contact form: the name, email, WhatsApp number and message you send.</p>
        </Section>

        <Section title="Who can see it">
          <p>
            Only people who have been invited to an archive can see it. Inside an archive, an
            <strong className="text-[#F0E6D0]"> admin</strong> can add, edit and delete content and
            manage who has access. A <strong className="text-[#F0E6D0]">viewer</strong> can only look.
          </p>
          <p>
            Photos and recordings are kept in private storage and are opened through temporary
            links that expire after a few hours, and only for signed-in members of that archive.
          </p>
          <p>
            The person who runs Family Archive can technically reach stored data, because they
            administer the database and the hosting. We use that access only to keep the service
            running, to fix problems, and when you ask us to help you. We do not read your
            family&apos;s content for any other purpose, and we do not sell it or show it to anyone else.
          </p>
        </Section>

        <Section title="Services that help us run it">
          <p>
            Your data is held by <strong className="text-[#F0E6D0]">Supabase</strong> (database,
            file storage and sign-in) and the site is served by <strong className="text-[#F0E6D0]">Vercel</strong>.
            These providers process data on our behalf and their servers may be in other countries.
            If we later add an email-sending service for sign-in and password-reset messages, it
            will see your email address for that purpose only.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc pl-5 space-y-2">
            <li>Admins can remove any content, and can remove people from the archive.</li>
            <li>You can leave an archive yourself at any time from the People screen.</li>
            <li>
              To have your account, or a whole archive, deleted, or to get a copy of what is stored,
              email <a className="text-[#C9A84C] underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              Archive deletion is done on the request of an archive admin.
            </li>
          </ul>
        </Section>

        <Section title="Using the service">
          <ul className="list-disc pl-5 space-y-2">
            <li>Only add material you have the right to share, and be thoughtful about relatives who are no longer able to give permission, or who are private.</li>
            <li>Keep your password to yourself and only invite people you trust.</li>
            <li>Do not use the service to harass, to break the law, or to store anything that harms others.</li>
            <li>We may remove an archive or account that is used this way.</li>
            <li>
              The service is provided as it is. We take care to keep it safe and working, but we cannot
              promise it will never have errors or downtime, so please keep your own copies of
              anything you cannot afford to lose.
            </li>
          </ul>
        </Section>

        <Section title="Changes and contact">
          <p>
            If this page changes in a way that matters, we will update the date above and let
            archive admins know. Questions or requests:{' '}
            <a className="text-[#C9A84C] underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </Section>
      </div>
    </main>
  )
}
