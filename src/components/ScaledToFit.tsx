import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScaledToFitProps {
  children: ReactNode
  /** Layout width the children are designed for */
  designWidth: number
  /** Transform origin when anchored at a screen corner */
  origin?: 'bottom-left' | 'bottom-right' | 'top-left'
}

export default function ScaledToFit({
  children,
  designWidth,
  origin = 'bottom-left',
}: ScaledToFitProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ scale: 1, height: 0 })

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const width = outer.clientWidth
      const scale = width > 0 ? Math.min(1, width / designWidth) : 1
      setLayout({ scale, height: inner.offsetHeight * scale })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(outer)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [designWidth])

  const originClass =
    origin === 'bottom-right'
      ? 'origin-bottom-right'
      : origin === 'top-left'
        ? 'origin-top-left'
        : 'origin-bottom-left'

  return (
    <div
      ref={outerRef}
      className="relative w-full"
      style={{ height: layout.height > 0 ? layout.height : undefined }}
    >
      <div
        ref={innerRef}
        className={`absolute bottom-0 left-0 ${originClass}`}
        style={{
          width: designWidth,
          transform: `scale(${layout.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
