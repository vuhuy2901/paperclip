import { useCallback, useEffect, useRef, useState, type PointerEventHandler } from 'react'

export interface PlanBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

type PlanPose = { centerX: number; centerY: number; zoom: number }

export function getPlanViewBox(bounds: PlanBounds, width: number, height: number, pose?: PlanPose) {
  const safeWidth = Math.max(width, 1)
  const safeHeight = Math.max(height, 1)
  const fittedUnitsPerPixel = Math.max(
    (bounds.maxX - bounds.minX) / safeWidth,
    (bounds.maxY - bounds.minY) / safeHeight,
  ) * 1.14
  const unitsPerPixel = fittedUnitsPerPixel / (pose?.zoom ?? 1)
  const centerX = pose?.centerX ?? (bounds.minX + bounds.maxX) / 2
  const centerY = pose?.centerY ?? (bounds.minY + bounds.maxY) / 2
  return {
    x: centerX - safeWidth * unitsPerPixel / 2,
    y: centerY - safeHeight * unitsPerPixel / 2,
    width: safeWidth * unitsPerPixel,
    height: safeHeight * unitsPerPixel,
    unitsPerPixel,
  }
}

export function usePlanCamera(bounds: PlanBounds, projectId: string) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })
  const [storedPose, setStoredPose] = useState<(PlanPose & { projectId: string }) | null>(null)
  const pose = storedPose?.projectId === projectId ? storedPose : undefined
  const viewBox = getPlanViewBox(bounds, size.width, size.height, pose)
  const live = useRef({ viewBox, zoom: pose?.zoom ?? 1, projectId })
  const spacePressed = useRef(false)
  const pan = useRef<{ pointerId: number; clientX: number; clientY: number } | null>(null)

  useEffect(() => {
    live.current = { viewBox, zoom: pose?.zoom ?? 1, projectId }
  }, [pose, projectId, viewBox])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = svg.getBoundingClientRect()
      const current = live.current
      const normalizedDelta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1)
      const nextZoom = Math.max(0.08, Math.min(64, current.zoom * Math.exp(-normalizedDelta * 0.002)))
      const pointerX = event.clientX - rect.left
      const pointerY = event.clientY - rect.top
      const worldX = current.viewBox.x + pointerX * current.viewBox.unitsPerPixel
      const worldY = current.viewBox.y + pointerY * current.viewBox.unitsPerPixel
      const nextUnits = current.viewBox.unitsPerPixel * current.zoom / nextZoom
      const centerX = worldX + (rect.width / 2 - pointerX) * nextUnits
      const centerY = worldY + (rect.height / 2 - pointerY) * nextUnits
      setStoredPose({ centerX, centerY, zoom: nextZoom, projectId: current.projectId })
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || (document.activeElement !== svg && !svg.matches(':hover'))) return
      event.preventDefault()
      spacePressed.current = true
    }
    const clearSpace = () => { spacePressed.current = false }
    const onKeyUp = (event: KeyboardEvent) => { if (event.code === 'Space') clearSpace() }
    resizeObserver.observe(svg)
    svg.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    svg.addEventListener('blur', clearSpace)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearSpace)
    return () => {
      resizeObserver.disconnect()
      svg.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      svg.removeEventListener('blur', clearSpace)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearSpace)
    }
  }, [])

  const fit = useCallback((target = bounds) => {
    if (target === bounds) {
      setStoredPose(null)
      return
    }
    const roomFrame = getPlanViewBox(bounds, size.width, size.height)
    const targetFrame = getPlanViewBox(target, size.width, size.height)
    setStoredPose({
      centerX: (target.minX + target.maxX) / 2,
      centerY: (target.minY + target.maxY) / 2,
      zoom: Math.min(64, roomFrame.unitsPerPixel / targetFrame.unitsPerPixel),
      projectId,
    })
  }, [bounds, projectId, size])

  const onPointerDown: PointerEventHandler<SVGSVGElement> = (event) => {
    if (event.button !== 1 && !(event.button === 0 && spacePressed.current)) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    pan.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY }
  }
  const onPointerMove: PointerEventHandler<SVGSVGElement> = (event) => {
    const active = pan.current
    if (active?.pointerId !== event.pointerId) return
    const current = live.current
    const dx = (active.clientX - event.clientX) * current.viewBox.unitsPerPixel
    const dy = (active.clientY - event.clientY) * current.viewBox.unitsPerPixel
    active.clientX = event.clientX
    active.clientY = event.clientY
    setStoredPose({
      centerX: current.viewBox.x + current.viewBox.width / 2 + dx,
      centerY: current.viewBox.y + current.viewBox.height / 2 + dy,
      zoom: current.zoom,
      projectId: current.projectId,
    })
  }
  const onPointerEnd: PointerEventHandler<SVGSVGElement> = (event) => {
    if (pan.current?.pointerId === event.pointerId) pan.current = null
  }

  return { svgRef, viewBox, fit, onPointerDown, onPointerMove, onPointerEnd }
}
