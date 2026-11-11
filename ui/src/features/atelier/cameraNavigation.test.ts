import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { fitPerspectiveCamera } from './studioCamera'
import { getPlanViewBox } from './usePlanCamera'

describe('ATELIER camera framing', () => {
  it('fits a plan whose coordinates do not start at zero', () => {
    const bounds = { minX: 4200, minY: -1800, maxX: 9800, maxY: 5200 }
    const frame = getPlanViewBox(bounds, 1200, 600)

    expect(frame.x).toBeLessThanOrEqual(bounds.minX)
    expect(frame.y).toBeLessThanOrEqual(bounds.minY)
    expect(frame.x + frame.width).toBeGreaterThanOrEqual(bounds.maxX)
    expect(frame.y + frame.height).toBeGreaterThanOrEqual(bounds.maxY)
    expect(frame.x + frame.width / 2).toBeCloseTo(7000)
    expect(frame.y + frame.height / 2).toBeCloseTo(1700)
  })

  it('keeps a zoomed plan centered on the persisted camera pose', () => {
    const frame = getPlanViewBox(
      { minX: -2000, minY: 3000, maxX: 6000, maxY: 9000 },
      800,
      600,
      { centerX: 1250, centerY: 6400, zoom: 4 },
    )

    expect(frame.x + frame.width / 2).toBeCloseTo(1250)
    expect(frame.y + frame.height / 2).toBeCloseTo(6400)
  })

  it('fits an offset 3D box inside a perspective camera', () => {
    const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 100)
    const bounds = new THREE.Box3(
      new THREE.Vector3(4.2, 0, -1.8),
      new THREE.Vector3(9.8, 2.8, 5.2),
    )
    const target = fitPerspectiveCamera(camera, bounds)

    expect(target.x).toBeCloseTo(7)
    expect(target.y).toBeCloseTo(1.4)
    expect(target.z).toBeCloseTo(1.7)
    expect(camera.position.distanceTo(target)).toBeGreaterThan(5)
    expect(camera.far).toBeGreaterThan(camera.near)
  })
})
