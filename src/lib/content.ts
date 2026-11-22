export type ItemKind = 'PDF' | 'Video' | 'Folder' | 'Slides' | 'Quiz'

export interface LibraryItem {
  id: string
  title: string
  kind: ItemKind
  meta: string
  description: string
}

export interface LibrarySection {
  id: string
  title: string
  blurb: string
  items: LibraryItem[]
}

export const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: 'foundations',
    title: 'Foundations of Anaesthesia',
    blurb: 'Core reading for daily practice and exam preparation.',
    items: [
      {
        id: 'f-preop',
        title: 'Pre-operative Assessment Checklist',
        kind: 'PDF',
        meta: 'PDF · 12 pages',
        description:
          'Structured pre-anaesthetic evaluation: airway, cardiorespiratory risk, fasting status, medication reconciliation and consent checkpoints.',
      },
      {
        id: 'f-airway',
        title: 'Airway Management Fundamentals',
        kind: 'PDF',
        meta: 'PDF · 28 pages',
        description:
          'Anatomy, assessment scores, basic and advanced airway techniques, and the stepwise approach to the unanticipated difficult airway.',
      },
      {
        id: 'f-pharm',
        title: 'Pharmacology: Induction & Maintenance Agents',
        kind: 'PDF',
        meta: 'PDF · 34 pages',
        description:
          'Mechanisms, dosing, onset and offset profiles of intravenous and volatile agents, opioids, and neuromuscular blockers with reversal.',
      },
      {
        id: 'f-monitoring',
        title: 'Standards of Monitoring',
        kind: 'PDF',
        meta: 'PDF · 9 pages',
        description:
          'Minimum monitoring standards for general, regional and sedation cases, including capnography, neuromuscular and depth-of-anaesthesia monitoring.',
      },
    ],
  },
  {
    id: 'question-bank',
    title: 'Question Bank & Mock Exams',
    blurb: 'Timed practice sets modelled on primary and final exam formats.',
    items: [
      {
        id: 'q-physiology',
        title: 'MCQ Set 1: Physiology',
        kind: 'Quiz',
        meta: 'Quiz · 60 questions · 90 min',
        description:
          'Cardiovascular, respiratory and renal physiology with single-best-answer questions and referenced explanations.',
      },
      {
        id: 'q-pharmacology',
        title: 'MCQ Set 2: Pharmacology',
        kind: 'Quiz',
        meta: 'Quiz · 60 questions · 90 min',
        description:
          'Pharmacokinetics, pharmacodynamics and applied clinical pharmacology of anaesthetic and peri-operative drugs.',
      },
      {
        id: 'q-mock-primary',
        title: 'Mock Exam: Primary Style',
        kind: 'Quiz',
        meta: 'Quiz · 90 questions · 3 hours',
        description:
          'Full-length timed mock covering physiology, pharmacology, physics and clinical measurement under exam conditions.',
      },
    ],
  },
  {
    id: 'guidelines',
    title: 'Guidelines & Protocols',
    blurb: 'Current society guidelines and local theatre protocols.',
    items: [
      {
        id: 'g-das',
        title: 'Difficult Airway Guidelines',
        kind: 'PDF',
        meta: 'PDF · 16 pages',
        description:
          'Unanticipated difficult intubation algorithm, wake-up criteria, front-of-neck access and human-factors considerations.',
      },
      {
        id: 'g-fasting',
        title: 'Peri-operative Fasting Guidelines',
        kind: 'PDF',
        meta: 'PDF · 6 pages',
        description:
          'Fasting intervals for clear fluids, breast milk, light meals and fried food in adults, children and pregnancy.',
      },
      {
        id: 'g-mh',
        title: 'Malignant Hyperthermia Protocol',
        kind: 'PDF',
        meta: 'PDF · 4 pages',
        description:
          'Recognition, immediate management, dantrolene dosing and post-crisis care of malignant hyperthermia.',
      },
      {
        id: 'g-last',
        title: 'Local Anaesthetic Systemic Toxicity (LAST)',
        kind: 'PDF',
        meta: 'PDF · 5 pages',
        description:
          'Maximum dose tables, early signs of toxicity, lipid emulsion therapy protocol and arrest modifications.',
      },
    ],
  },
  {
    id: 'webinars',
    title: 'Recorded Webinars',
    blurb: 'Full recordings of past teaching sessions and guest lectures.',
    items: [
      {
        id: 'w-regional',
        title: 'Regional Blocks: Upper Limb',
        kind: 'Video',
        meta: 'Video · 58 min',
        description:
          'Ultrasound-guided interscalene, supraclavicular and axillary blocks: sonoanatomy, needle approach and complications.',
      },
      {
        id: 'w-obstetric',
        title: 'Obstetric Anaesthesia Update',
        kind: 'Video',
        meta: 'Video · 64 min',
        description:
          'Neuraxial labour analgesia, anaesthesia for caesarean section, and management of obstetric haemorrhage and pre-eclampsia.',
      },
      {
        id: 'w-paeds',
        title: 'Paediatric Anaesthesia Essentials',
        kind: 'Video',
        meta: 'Video · 52 min',
        description:
          'Airway differences, weight-based dosing, fluid management and peri-operative anxiety in children.',
      },
    ],
  },
  {
    id: 'cases',
    title: 'Case Discussions',
    blurb: 'Real cases with structured debriefs and teaching points.',
    items: [
      {
        id: 'c-anaphylaxis',
        title: 'Anaphylaxis on Induction',
        kind: 'Folder',
        meta: 'Case · 12 min read',
        description:
          'Rocuronium-induced anaphylaxis: recognition, adrenaline dosing, tryptase sampling and follow-up allergy testing.',
      },
      {
        id: 'c-cico',
        title: "Can't Intubate, Can't Oxygenate",
        kind: 'Folder',
        meta: 'Case · 10 min read',
        description:
          'Progression through the emergency airway algorithm to front-of-neck access, with timeline and team communication analysis.',
      },
      {
        id: 'c-haemorrhage',
        title: 'Major Haemorrhage in Theatre',
        kind: 'Folder',
        meta: 'Case · 14 min read',
        description:
          'Activation of the major haemorrhage protocol, massive transfusion ratios, viscoelastic testing and damage-control resuscitation.',
      },
    ],
  },
  {
    id: 'quick-reference',
    title: 'Quick Reference Cards',
    blurb: 'Pocket cards for the theatre wall and your phone.',
    items: [
      {
        id: 'r-drugs',
        title: 'Drug Dose Card',
        kind: 'PDF',
        meta: 'PDF · 2 pages',
        description:
          'Single-sheet dosing reference for induction agents, opioids, muscle relaxants, vasopressors and emergency drugs.',
      },
      {
        id: 'r-crisis',
        title: 'Crisis Checklist',
        kind: 'PDF',
        meta: 'PDF · 2 pages',
        description:
          'Cognitive aids for cardiac arrest, anaphylaxis, LAST, malignant hyperthermia and failed intubation.',
      },
    ],
  },
]

export function allItems(): (LibraryItem & { sectionId: string })[] {
  return LIBRARY_SECTIONS.flatMap((s) =>
    s.items.map((i) => ({ ...i, sectionId: s.id })),
  )
}
