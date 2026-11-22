import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  ChevronRight,
  ExternalLink,
  FileText,
  FolderOpen,
  Link2,
  ListChecks,
  Presentation,
  Search,
  Video,
  type LucideIcon,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { LIBRARY_SECTIONS, type ItemKind, type LibraryItem } from '@/lib/content'
import { useAuth } from '@/lib/store'

const KIND_ICON: Record<ItemKind, LucideIcon> = {
  PDF: FileText,
  Video: Video,
  Folder: FolderOpen,
  Slides: Presentation,
  Quiz: ListChecks,
}

function KindBadge({ kind }: { kind: ItemKind }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">
      {kind}
    </span>
  )
}

export default function Library() {
  const { links, user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<LibraryItem | null>(null)
  const sectionFilter = params.get('section')

  useEffect(() => {
    if (sectionFilter) {
      const el = document.getElementById(`section-${sectionFilter}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [sectionFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return LIBRARY_SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter(
        (i) =>
          (!sectionFilter || s.id === sectionFilter) &&
          (!q ||
            i.title.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q)),
      ),
    })).filter((s) => s.items.length > 0)
  }, [query, sectionFilter])

  const selectedSection = sectionFilter
    ? LIBRARY_SECTIONS.find((s) => s.id === sectionFilter)
    : null

  const selectedUrl = selected ? links[selected.id] : undefined

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3.5">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-[34px] font-bold leading-tight tracking-tight text-foreground">
            Library
          </h1>
          {selectedSection && (
            <button
              type="button"
              onClick={() => setParams({})}
              className="h-9 shrink-0 cursor-pointer rounded-full bg-[#0a355e]/[0.08] px-3.5 text-[13px] font-bold text-[#005eb8] transition-colors hover:bg-[#0a355e]/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Show all
            </button>
          )}
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and topics"
            aria-label="Search the library"
            className="h-10 w-full rounded-full border-0 bg-black/[0.06] pl-10 pr-4 text-[15px] font-medium text-foreground outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {selectedSection && (
          <p className="text-sm font-medium text-muted-foreground">
            Showing “{selectedSection.title}”
          </p>
        )}
      </header>

      {filtered.length === 0 ? (
        <div className="ios-card px-6 py-16 text-center">
          <p className="text-[17px] font-bold text-foreground">No matches for “{query}”</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Try a different keyword, or clear the search.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 h-11 cursor-pointer rounded-full bg-[#0a355e] px-5 text-sm font-bold text-[#f2f7fc] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Clear search
          </button>
        </div>
      ) : (
        filtered.map((section) => (
          <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
            <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h2>
            <div className="ios-card mt-2 overflow-hidden">
              <ul className="divide-y divide-black/[0.06]">
                {section.items.map((item) => {
                  const Icon = KIND_ICON[item.kind]
                  const url = links[item.id]
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="group flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-black/[0.04] md:hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                      >
                        <Icon
                          className="size-[18px] shrink-0 text-[#005eb8]"
                          strokeWidth={1.8}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-foreground">
                            {item.title}
                          </span>
                          <span className="mt-px block truncate text-[13px] font-medium text-muted-foreground">
                            {item.meta}
                            {!url && <span className="text-warning"> · link pending</span>}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground/70"
                          aria-hidden
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        ))
      )}

      {/* Item detail sheet */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="right"
          className="flex w-full flex-col border-l-0 bg-white p-6 pt-safe sm:max-w-md"
        >
          {selected && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2">
                  <KindBadge kind={selected.kind} />
                  <span className="text-xs font-medium text-muted-foreground">{selected.meta}</span>
                </div>
                <SheetTitle className="mt-3 text-2xl font-bold leading-tight tracking-tight text-foreground">
                  {selected.title}
                </SheetTitle>
                <SheetDescription className="mt-2 text-[15px] font-medium leading-relaxed text-muted-foreground">
                  {selected.description}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-auto flex flex-col gap-3 pt-8">
                {selectedUrl ? (
                  <a
                    href={selectedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#0a355e] text-[15px] font-bold text-[#f2f7fc] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    Open in Google Drive
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed border-warning/50 bg-warning/10 px-4 py-3.5">
                    <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Link2 className="size-4 text-warning" aria-hidden />
                      Drive link not connected yet
                    </p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                      {user?.role === 'admin'
                        ? 'Paste this item’s Google Drive link in Admin → Library links to activate it for all members.'
                        : 'The administrator will connect this item to Google Drive shortly.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
