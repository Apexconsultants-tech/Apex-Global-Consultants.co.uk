/**
 * Homepage copy that is not a content collection. Edit text here, not in components.
 */
export const why = {
  title: 'Why businesses choose Apex',
  intro: 'Six things you can hold us to from the first conversation.',
  points: [
    { icon: 'scales', title: 'Big-firm expertise, SME fees', text: 'Technical knowledge of IFRS, UK GAAP and tax, priced for owner-managed businesses.' },
    { icon: 'users', title: 'One dedicated accountant', text: 'The same person handles your work, learns your business and answers your calls.' },
    { icon: 'pound', title: 'Fixed fees agreed upfront', text: 'A written quote before we start, with VAT shown clearly. No surprise bills.' },
    { icon: 'globe', title: 'UK and international', text: 'Support for UK companies and overseas groups running a UK entity.' },
    { icon: 'cloud', title: 'Cloud accounting set up', text: 'We set up, migrate and train you on cloud software, so your numbers stay current.' },
    { icon: 'clock', title: 'Fast, clear responses', text: 'Straight answers in plain English, without waiting weeks for a reply.' },
  ],
} as const;

export const steps = {
  title: 'How we work',
  intro: 'A clear path from first call to ongoing support.',
  items: [
    { title: 'Free consultation', text: 'A 30-minute call about your business, deadlines and what you need.' },
    { title: 'Fixed-fee proposal', text: 'A written proposal with a fixed fee and VAT shown, so you know the cost.' },
    { title: 'Engagement letter & ID checks', text: 'You sign online and complete identity checks securely through our portal.' },
    { title: 'Onboarding & HMRC authorisation', text: 'We get agent access, collect your records and take over the deadlines.' },
    { title: 'Ongoing support', text: 'Your dedicated accountant keeps everything on track all year round.' },
  ],
} as const;

export const switching = {
  title: 'Switching accountant is easier than you think',
  text: 'Once you sign up, we contact your previous accountant, request the handover and pick up your deadlines. You do not need to manage that conversation.',
  cta: { label: 'Talk to us about switching', href: '/contact/' },
} as const;

