export type ItemKind = 'PDF' | 'Video' | 'Folder' | 'Slides' | 'Quiz'

export interface LibraryItem {
  id: string
  title: string
  kind: ItemKind
  meta: string
  description: string
  /** Built-in content URL (PDF bundled with the app). Admin links override this. */
  url?: string
  /** Cover image path (bundled). */
  cover?: string
}

export interface LibrarySection {
  id: string
  title: string
  blurb: string
  items: LibraryItem[]
}

const PDF_DIR = '/library/pdfs'
const COVER_DIR = '/library/covers'

function book(
  slug: string,
  title: string,
  pages: number,
  description: string,
): LibraryItem {
  return {
    id: slug,
    title,
    kind: 'PDF',
    meta: `PDF · ${pages} pages`,
    description,
    url: `${PDF_DIR}/${slug}.pdf`,
    cover: `${COVER_DIR}/${slug}.jpg`,
  }
}

export const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: 'core-volumes',
    title: 'Core Volumes',
    blurb: 'The Complete Anesthesia & Perioperative Care Library — Volumes 1–8.',
    items: [
      book(
        'volume-1-foundations',
        'Volume 1 · Foundations of Anesthesia & Applied Physiology',
        20,
        'Essential principles for understanding anesthesia and perioperative care.',
      ),
      book(
        'volume-2-pre-anesthesia-assessment',
        'Volume 2 · Pre-Anesthesia Assessment & Perioperative Planning',
        20,
        'Structured pre-anesthesia evaluation and perioperative planning.',
      ),
      book(
        'volume-3-pharmacology',
        'Volume 3 · Pharmacology & Anesthetic Drugs',
        20,
        'Anesthetic drug pharmacology and perioperative medication management.',
      ),
      book(
        'volume-4-airway-management',
        'Volume 4 · Airway Management, Oxygenation & Ventilation',
        20,
        'Airway assessment, management techniques, oxygenation and ventilation.',
      ),
      book(
        'volume-5-general-anesthesia',
        'Volume 5 · General Anesthesia & Anesthesia Equipment',
        20,
        'General anesthesia techniques and the anesthesia workstation.',
      ),
      book(
        'volume-6-regional-anesthesia',
        'Volume 6 · Regional Anesthesia & Pain Management',
        20,
        'Neuraxial and peripheral nerve blocks, and acute pain management.',
      ),
      book(
        'volume-7-monitoring-safety',
        'Volume 7 · Monitoring, Patient Safety & Intraoperative Care',
        20,
        'Intraoperative monitoring standards and patient safety practice.',
      ),
      book(
        'volume-8-emergencies-recovery',
        'Volume 8 · Anesthetic Emergencies, Recovery & Post-Anesthesia Care',
        20,
        'Crisis management, emergence, recovery and post-anesthesia care.',
      ),
    ],
  },
  {
    id: 'advanced-companions',
    title: 'Advanced Companions',
    blurb: 'In-depth companions for regional, subspecialty and case-based practice.',
    items: [
      book(
        'advanced-regional-anesthesia',
        'Advanced Regional Anesthesia & Ultrasound Anatomy',
        67,
        'Ten chapters: regional anesthesia foundations, ultrasound fundamentals, recognizing anatomy on ultrasound, and upper extremity blocks.',
      ),
      book(
        'clinical-reasoning-casebook',
        'Anesthesia Clinical Reasoning Casebook',
        159,
        'Twenty-two chapters of case-based reasoning — from the basic anesthesia plan to the difficult airway and the cardiac patient.',
      ),
      book(
        'specialty-anesthesia-library',
        'Specialty Anesthesia Library',
        82,
        'Ten chapters covering pediatric, obstetric and geriatric anesthesia and other subspecialty situations.',
      ),
    ],
  },
  {
    id: 'quick-reference-tools',
    title: 'Quick Reference Tools',
    blurb: 'Bonus practical tools — at-a-glance references for the theatre.',
    items: [
      book(
        'bonus-1',
        'Anesthesia Drug Quick Reference',
        10,
        'Essential drug classes, mechanisms and perioperative effects at a glance. Practical Reference Tool #1.',
      ),
      book(
        'bonus-2',
        'Airway Management Visual Guide',
        10,
        'Anatomy, devices, oxygenation and ventilation at a glance. Practical Reference Tool #2.',
      ),
      book(
        'bonus-3',
        'Anesthesia Emergencies Quick Reference',
        10,
        'Recognition patterns, cause categories and crisis awareness at a glance. Practical Reference Tool #3.',
      ),
      book(
        'bonus-4',
        'Monitoring & Vital Parameters Quick Guide',
        10,
        'Waveforms, physiologic signals and intraoperative monitoring at a glance. Practical Reference Tool #4.',
      ),
      book(
        'bonus-5',
        'Perioperative Checklists & Reference Sheets',
        10,
        'Structured review tools from pre-anesthesia assessment to PACU handoff. Practical Reference Tool #5.',
      ),
    ],
  },
]

export function itemUrl(item: LibraryItem, links: Record<string, string>): string | undefined {
  return links[item.id] ?? item.url
}

export function allItems(): (LibraryItem & { sectionId: string })[] {
  return LIBRARY_SECTIONS.flatMap((s) =>
    s.items.map((i) => ({ ...i, sectionId: s.id })),
  )
}
