import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  FileText,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { itemUrl, LIBRARY_SECTIONS } from '@/lib/content'
import { useAuth } from '@/lib/store'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const ZOOM_STEPS = [1, 1.4, 1.8, 2.4]
const MAX_DPR = 2

interface PageSlotProps {
  doc: PDFDocumentProxy
  pageNumber: number
  aspect: number
  zoom: number
  scrollRoot: HTMLElement | null
  onCurrent: (page: number) => void
}

const PageSlot = memo(function PageSlot({
  doc,
  pageNumber,
  aspect,
  zoom,
  scrollRoot,
  onCurrent,
}: PageSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const [state, setState] = useState<'idle' | 'rendering' | 'done' | 'error'>('idle')

  useEffect(() => {
    const el = slotRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    let cancelled = false

    const render = async () => {
      if (cancelled) return
      setState('rendering')
      try {
        const page = await doc.getPage(pageNumber)
        if (cancelled) return
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
        const cssWidth = el.clientWidth
        const base = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: (cssWidth * dpr) / base.width })
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const task = page.render({ canvas, viewport })
        renderTaskRef.current = task
        await task.promise
        if (!cancelled) setState('done')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!cancelled && !msg.includes('Rendering cancelled')) setState('error')
      }
    }

    const renderIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void render()
          renderIo.disconnect()
        }
      },
      { root: scrollRoot, rootMargin: '1200px 0px' },
    )
    renderIo.observe(el)

    const currentIo = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].intersectionRatio >= 0.5) onCurrent(pageNumber)
      },
      { root: scrollRoot, threshold: [0.5] },
    )
    currentIo.observe(el)

    return () => {
      cancelled = true
      renderIo.disconnect()
      currentIo.disconnect()
      renderTaskRef.current?.cancel()
    }
  }, [doc, pageNumber, zoom, scrollRoot, onCurrent])

  return (
    <div
      ref={slotRef}
      className="relative w-full overflow-hidden rounded-[3px] bg-white shadow-[0_1px_4px_rgba(10,53,94,0.18)]"
      style={{ aspectRatio: `1 / ${aspect}` }}
    >
      <canvas
        ref={canvasRef}
        className={`h-auto w-full transition-opacity duration-300 ${state === 'done' ? 'opacity-100' : 'opacity-0'}`}
      />
      {state !== 'done' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {state === 'error' ? (
            <p className="px-6 text-center text-[13px] font-semibold text-muted-foreground">
              Page {pageNumber} could not be rendered
            </p>
          ) : (
            <span className="size-6 animate-spin rounded-full border-2 border-[#005eb8]/20 border-t-[#005eb8]" />
          )}
        </div>
      )}
    </div>
  )
})

export default function Reader() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { links } = useAuth()

  const item = LIBRARY_SECTIONS.flatMap((s) => s.items).find((i) => i.id === itemId)
  const url = item ? itemUrl(item, links) : undefined

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [aspect, setAspect] = useState(1.414)
  const [current, setCurrent] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRatioRef = useRef<number | null>(null)

  useEffect(() => {
    if (scrollRef.current) setScrollRoot(scrollRef.current)
  }, [])

  useEffect(() => {
    if (!url) return
    let cancelled = false
    setDoc(null)
    setLoadError(false)
    setCurrent(1)
    const task = pdfjs.getDocument({ url })
    task.promise
      .then(async (d) => {
        if (cancelled) return
        const first = await d.getPage(1)
        const v = first.getViewport({ scale: 1 })
        if (!cancelled) {
          setAspect(v.height / v.width)
          setDoc(d)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
      void task.destroy()
    }
  }, [url])

  // Keep the same reading position when zoom changes
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && scrollRatioRef.current !== null) {
      el.scrollTop = scrollRatioRef.current * el.scrollHeight
      scrollRatioRef.current = null
    }
  }, [zoom])

  const changeZoom = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (el && el.scrollHeight > 0) {
      scrollRatioRef.current = el.scrollTop / el.scrollHeight
    }
    setZoom((z) => {
      const idx = ZOOM_STEPS.findIndex((s) => Math.abs(s - z) < 0.01)
      const next = Math.min(Math.max((idx === -1 ? 0 : idx) + dir, 0), ZOOM_STEPS.length - 1)
      return ZOOM_STEPS[next]
    })
  }

  const onCurrent = useCallback((page: number) => setCurrent(page), [])

  const title = item?.title ?? 'Document'
  const numPages = doc?.numPages ?? 0
  const zoomedIn = zoom > 1

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#eef3f8] dark:bg-[#0a1522]">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-black/[0.06] bg-white/80 px-2 pb-2 pt-safe backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#101c2a]/80">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back to library"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#005eb8] transition-colors active:bg-black/[0.06] dark:text-[#5eb3f6] dark:active:bg-white/[0.10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-tight text-foreground">{title}</p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {doc ? `Page ${current} of ${numPages}` : loadError ? 'Could not open' : 'Loading…'}
          </p>
        </div>
        {doc && (
          <>
            <button
              type="button"
              onClick={() => changeZoom(-1)}
              disabled={!zoomedIn}
              aria-label="Zoom out"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#005eb8] transition-colors active:bg-black/[0.06] disabled:opacity-30 dark:text-[#5eb3f6] dark:active:bg-white/[0.10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ZoomOut className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => changeZoom(1)}
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              aria-label="Zoom in"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#005eb8] transition-colors active:bg-black/[0.06] disabled:opacity-30 dark:text-[#5eb3f6] dark:active:bg-white/[0.10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ZoomIn className="size-5" aria-hidden />
            </button>
          </>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open PDF in new tab"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#005eb8] transition-colors active:bg-black/[0.06] dark:text-[#5eb3f6] dark:active:bg-white/[0.10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ExternalLink className="size-[18px]" aria-hidden />
          </a>
        )}
      </header>

      {/* Pages */}
      {loadError || !item || !url ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="ios-card w-full max-w-sm px-6 py-10 text-center">
            <AlertTriangle className="mx-auto size-8 text-warning" aria-hidden />
            <p className="mt-4 text-[17px] font-bold text-foreground">
              {!item ? 'Document not found' : 'This PDF could not be opened in the reader'}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted-foreground">
              You can try opening it directly in a new tab instead.
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full bg-[#0a355e] text-sm font-bold text-[#f2f7fc] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ExternalLink className="size-4" aria-hidden />
                Open in new tab
              </a>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-3 h-11 w-full cursor-pointer rounded-full bg-black/[0.05] text-sm font-bold text-foreground transition-colors active:bg-black/[0.09] dark:bg-white/[0.09] dark:active:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Back
            </button>
          </div>
        </div>
      ) : !doc ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <span className="size-9 animate-spin rounded-full border-[3px] border-[#005eb8]/20 border-t-[#005eb8]" />
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <FileText className="size-4" aria-hidden />
            Preparing {title}…
          </p>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
          <div
            key={zoom}
            className="mx-auto flex max-w-3xl flex-col gap-2.5 px-2.5 py-3 pb-safe"
            style={zoomedIn ? { width: `${zoom * 100}%`, maxWidth: 'none' } : undefined}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <PageSlot
                key={i + 1}
                doc={doc}
                pageNumber={i + 1}
                aspect={aspect}
                zoom={zoom}
                scrollRoot={scrollRoot}
                onCurrent={onCurrent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
