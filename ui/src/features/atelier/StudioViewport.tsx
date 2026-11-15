/**
 * ATELIER AI — Enhanced Pascal 3D BIM & 2D Architectural Studio Viewport
 * Implements Master Prompt Section 6.1 & 6.2 + G3 Viewer Completion:
 * - Persistent WebGL Renderer (no remounting on tab switch)
 * - Licensed CC0 HDRI Environment (/api/v1/assets/hdri/photo_studio_loft_hall_1k.hdr) via RGBELoader
 * - SSAO Post-Processing (EffectComposer + SSAOPass + OutputPass) & Contact AO grounding
 * - Ceiling Slab visibility toggle (data-testid="toggle-ceiling-btn")
 * - Soft directional shadows, warm hemisphere lighting, refined ground grid
 * - Interactive 3D raycasting for furniture selection & hover outline
 * - Floating HUD: Scene Validation badge, HDRI/SSAO/Ceiling controls, XYZ Axis Gizmo, Selected Object Dimensions badge
 * - Synchronized 2D CAD SVG Plan with drag-to-move, door swing clearance arcs, and dimension chains
 */
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { createStudioCameraController, type StudioCameraMode } from './studioCamera'
import { usePlanCamera, type PlanBounds } from './usePlanCamera'
import { buildWallSolidRects } from './openingGeometry'
import {
  resolveFurnitureAsset,
  resolveAssetPackForProject,
  classifyGlbMeshPartName,
  getNamedPartsForFurniture,
  PBR_TEXTURES,
} from './assetCatalog'
import { validateSceneBeforeBuild } from './sceneValidator'
import {
  resolveMaterialOrDefault,
  getPbrMaterialById,
  type PbrSurfaceType,
} from './pbrCatalog'
import {
  applyMaterialOverrideToObject,
  disposeOwnedMaterials,
  type MaterialDefinitionValue,
} from './materialResolver'
import { PlacementTracker } from './scene-animation/placement'
import { createPlacementAnimation } from './scene-animation/actor'
import { Eye, Sparkles, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface StudioViewportProps {
  project: any
  materialsDb: any
  pbrMaterials?: MaterialDefinitionValue[]
  viewMode: 'split' | '2d' | '3d'
  cameraPreset: 'orbit' | 'top' | 'cutaway' | 'walk'
  lightingPreset?: 'day' | 'sunset' | 'night'
  selectedEntityId: string | null
  onSelectEntity: (id: string | null) => void
  onMoveFurniture?: (furnId: string, newX: number, newY: number) => void
  lowSpecMode?: boolean
  theme?: 'light' | 'dark'
  cameraResetTrigger?: number
  cameraCommand?: { id: number; type: 'fit' | 'focus' | 'reset' }
  cutawayEnabled?: boolean
  visibleLayers?: {
    dimensions: boolean
    doorSwings: boolean
    furnitureLabels: boolean
    grid: boolean
  }
}

function createProceduralTileTexture(
  hexColor: string,
  tileWidthMm: number,
  tileLengthMm: number,
  roomWidthMm: number,
  roomDepthMm: number,
  pattern: string,
  groutWidthMm = 3,
  groutColor = '#B8B1A6',
  rotationDeg = 0,
  originMm: number[] = [0, 0]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = groutColor
  ctx.fillRect(0, 0, 256, 256)
  const groutPx = Math.max(0.5, Math.min(24, (groutWidthMm / Math.max(1, tileWidthMm)) * 256))
  ctx.fillStyle = hexColor || '#C8A986'
  ctx.fillRect(groutPx / 2, groutPx / 2, 256 - groutPx, 256 - groutPx)
  ctx.strokeStyle = 'rgba(23, 23, 23, 0.1)'
  ctx.lineWidth = 1
  ctx.strokeRect(groutPx / 2, groutPx / 2, 256 - groutPx, 256 - groutPx)
  if (pattern === 'brick') {
    ctx.beginPath()
    ctx.moveTo(0, 128)
    ctx.lineTo(256, 128)
    ctx.moveTo(128, 128)
    ctx.lineTo(128, 256)
    ctx.strokeStyle = groutColor
    ctx.lineWidth = groutPx
    ctx.stroke()
  }
  if (pattern === 'herringbone') {
    ctx.beginPath()
    ctx.moveTo(0, 128)
    ctx.lineTo(128, 0)
    ctx.moveTo(128, 256)
    ctx.lineTo(256, 128)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  const repX = Math.max(1, roomWidthMm / Math.max(120, tileWidthMm || 600))
  const repY = Math.max(1, roomDepthMm / Math.max(120, tileLengthMm || 600))
  tex.repeat.set(repX, repY)
  tex.center.set(0.5, 0.5)
  tex.rotation = (rotationDeg * Math.PI) / 180
  tex.offset.set(originMm[0] / Math.max(1, tileWidthMm), originMm[1] / Math.max(1, tileLengthMm))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.userData = { tileWidthMm, tileLengthMm, groutWidthMm, groutColor, pattern, worldScaled: true }
  return tex
}

export const StudioViewport: React.FC<StudioViewportProps> = React.memo(
  ({
    project,
    materialsDb,
    pbrMaterials = [],
    viewMode,
    cameraPreset,
    lightingPreset = 'day',
    selectedEntityId,
    onSelectEntity,
    onMoveFurniture,
    lowSpecMode = false,
    theme = 'light',
    cameraResetTrigger = 0,
    cameraCommand,
    cutawayEnabled = false,
    visibleLayers = {
      dimensions: true,
      doorSwings: true,
      furnitureLabels: true,
      grid: true,
    },
  }) => {
    const mountRef = useRef<HTMLDivElement | null>(null)
    const placementTracker = useRef(new PlacementTracker())
    const [animationEnabled, setAnimationEnabled] = useState(true)
    const [placementStatus, setPlacementStatus] = useState('')
    const placementRef = useRef<ReturnType<typeof createPlacementAnimation> | null>(null)
    useEffect(() => {
      const reset = () => { if (document.hidden) placementTracker.current.reset() }
      document.addEventListener('visibilitychange', reset)
      return () => document.removeEventListener('visibilitychange', reset)
    }, [])
    const cameraControllerRef = useRef<ReturnType<typeof createStudioCameraController> | null>(null)
    const cutawayWallsRef = useRef<
      Array<{ mesh: THREE.Mesh; capMesh?: THREE.Mesh; bottom: number; top: number; cutaway: boolean }>
    >([])
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null)
    const [ceilingVisible, setCeilingVisible] = useState<boolean>(false)
    const [ssaoEnabled, setSsaoEnabled] = useState<boolean>(true)
    const [hdriLoaded, setHdriLoaded] = useState<boolean>(false)
    const [splitPercent, setSplitPercent] = useState(50)

    const paintsById: Record<string, any> = {}
    const tilesById: Record<string, any> = {}
    ;(materialsDb?.paints || []).forEach((p: any) => {
      paintsById[p.id] = p
    })
    ;(materialsDb?.tiles_and_flooring || []).forEach((t: any) => {
      tilesById[t.id] = t
    })

    const room = project?.rooms?.[0]
    const walls = project?.walls || []
    const doors = project?.openings || []
    const windows = project?.windows || []
    const furniture = project?.furniture_instances || []

    const poly = room?.polygon_mm || [
      [0, 0],
      [4000, 0],
      [4000, 5000],
      [0, 5000],
    ]
    const geometryPoints = [
      ...poly,
      ...walls.flatMap((wall: any) => [wall.start_mm, wall.end_mm]),
    ].filter((point: any) => Array.isArray(point) && point.length >= 2)
    const geometryMinX = Math.min(...geometryPoints.map((point: number[]) => point[0]))
    const geometryMinY = Math.min(...geometryPoints.map((point: number[]) => point[1]))
    const geometryMaxX = Math.max(...geometryPoints.map((point: number[]) => point[0]))
    const geometryMaxY = Math.max(...geometryPoints.map((point: number[]) => point[1]))
    const roomMinX = Math.min(...poly.map((point: number[]) => point[0]))
    const roomMinY = Math.min(...poly.map((point: number[]) => point[1]))
    const roomMaxX = Math.max(...poly.map((point: number[]) => point[0]))
    const roomMaxY = Math.max(...poly.map((point: number[]) => point[1]))
    const roomW = Math.max(1, roomMaxX - roomMinX) || 4000
    const roomD = Math.max(1, roomMaxY - roomMinY) || 5000
    const planBounds: PlanBounds = {
      minX: geometryMinX - 560,
      minY: geometryMinY - 560,
      maxX: geometryMaxX + 560,
      maxY: geometryMaxY + 560,
    }
    const planCamera = usePlanCamera(planBounds, String(project?.project_id || project?.id || 'project'))
    const roomHeightMm = room?.ceiling_height_mm || walls[0]?.height_mm || 2800

    // Resolve floor material: check surface_material_overrides.floor (G4 PBR Tile) first, then Section 7B tilesById
    const floorOverride = project?.surface_material_overrides?.floor
    const floorPbrDef = floorOverride
      ? pbrMaterials.find((m) => m.material_id === floorOverride.material_id)
      : null

    const floorMatInfo = floorPbrDef
      ? {
          id: floorPbrDef.material_id,
          name: floorPbrDef.name,
          hex_color: floorOverride?.tint || floorPbrDef.tint || floorPbrDef.pbr?.base_color || '#DFD6C7',
          tile_width_mm:
            floorOverride?.texture_scale?.width_mm ||
            floorOverride?.uv_transform?.tile_size_mm?.[0] ||
            floorPbrDef.uv?.tile_size_mm?.[0] ||
            800,
          tile_length_mm:
            floorOverride?.texture_scale?.height_mm ||
            floorOverride?.uv_transform?.tile_size_mm?.[1] ||
            floorPbrDef.uv?.tile_size_mm?.[1] ||
            800,
          grout_width_mm:
            floorOverride?.texture_scale?.grout_width_mm ??
            floorOverride?.uv_transform?.grout_thickness_mm ??
            floorPbrDef.uv?.grout_thickness_mm ??
            3,
          grout_color:
            floorOverride?.texture_scale?.grout_color_hex ||
            floorOverride?.uv_transform?.grout_color ||
            floorPbrDef.uv?.grout_color ||
            '#B8B1A6',
          layout_pattern: floorPbrDef.uv?.pattern || 'straight',
          roughness: floorOverride?.pbr?.roughness ?? floorPbrDef.pbr?.roughness ?? 0.36,
          rotation_deg:
            floorOverride?.texture_scale?.rotation_deg ??
            floorOverride?.uv_transform?.rotation_deg ??
            0,
          texture_origin_mm: floorOverride?.uv_transform?.offset_mm || [0, 0],
        }
      : tilesById[room?.floor_material_id] || {
          hex_color: '#C8A986',
          tile_width_mm: 190,
          tile_length_mm: 1200,
          grout_width_mm: 2,
          grout_color: '#B8B1A6',
          layout_pattern: 'straight',
          name: 'Sàn gỗ sồi',
          roughness: 0.48,
        }

    const selectedEntity =
      selectedEntityId === 'floor_main'
        ? { id: 'floor_main', name: room?.name ? `Sàn ${room.name}` : 'Sàn phòng chính', surfaceType: 'floor' }
        : furniture.find((f: any) => f.id === selectedEntityId) ||
          walls.find((w: any) => w.id === selectedEntityId) ||
          null

    const activeAssetPack = resolveAssetPackForProject(project)
    const unmappedFurnitureIds = new Set<string>()
    furniture.forEach((f: any) => {
      const res = resolveFurnitureAsset(f, activeAssetPack)
      if (res.flaggedUnmapped) {
        unmappedFurnitureIds.add(String(f.id))
      }
    })
    const validationReport = validateSceneBeforeBuild(project, Array.from(unmappedFurnitureIds))
    if (typeof window !== 'undefined') {
      ;(window as any).__ATELIER_VALIDATION_REPORT__ = validationReport
    }

    // ==========================================================================
    // THREE.JS 3D PASCAL SCENE VIEWER (WITH HDRI, SSAO, CEILING & RAYCASTING)
    // ==========================================================================
    useEffect(() => {
      if (lowSpecMode || !mountRef.current) return
      const container = mountRef.current
      const width = container.clientWidth || 720
      const height = container.clientHeight || 520

      const scene = new THREE.Scene()
      const backgroundByPreset = {
        day: theme === 'dark' ? '#15171A' : '#F8FAFC',
        sunset: '#4A332F',
        night: '#0B1020',
      }
      scene.background = new THREE.Color(backgroundByPreset[lightingPreset])

      const camera = new THREE.PerspectiveCamera(22, width / height, 0.1, 150)
      const cx = (roomMinX + roomMaxX) / 2000
      const cz = (roomMinY + roomMaxY) / 2000
      const spanM = Math.max(roomW, roomD) / 1000
      camera.position.set(cx + spanM * 1.65, spanM * 2.06, cz + spanM * 1.65)
      camera.lookAt(cx, 0.55, cz)

      const renderer = new THREE.WebGLRenderer({ antialias: !lowSpecMode, preserveDrawingBuffer: true })
      renderer.localClippingEnabled = true
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowSpecMode ? 1.0 : 2.0))
      renderer.shadowMap.enabled = !lowSpecMode
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = lightingPreset === 'day' ? 1.0 : lightingPreset === 'sunset' ? 0.92 : 0.72
      container.innerHTML = ''
      container.appendChild(renderer.domElement)

      // Post-processing Composer with SSAOPass + OutputPass
      let composer: EffectComposer | null = null
      let ssaoPass: SSAOPass | null = null
      if (!lowSpecMode) {
        try {
          composer = new EffectComposer(renderer)
          const renderPass = new RenderPass(scene, camera)
          composer.addPass(renderPass)
          ssaoPass = new SSAOPass(scene, camera, width, height)
          ssaoPass.kernelRadius = 0.28
          ssaoPass.minDistance = 0.001
          ssaoPass.maxDistance = 0.08
          ssaoPass.enabled = ssaoEnabled
          composer.addPass(ssaoPass)
          const outputPass = new OutputPass()
          composer.addPass(outputPass)
        } catch (err) {
          console.warn('SSAOPass fallback to direct WebGL render:', err)
          composer = null
        }
      }

      const renderScene = () => {
        if (disposed) return
        if (composer && ssaoEnabled) {
          composer.render()
        } else {
          renderer.render(scene, camera)
        }
        const viewerState = ((window as any).__ATELIER_VIEWER_STATE__ ||= {})
        viewerState.lightingPreset = lightingPreset
        viewerState.cameraPreset = cameraPreset
        viewerState.ceilingVisible = ceilingVisible
        viewerState.showCeiling = ceilingVisible
        viewerState.ssaoEnabled = ssaoEnabled
        viewerState.ssaoPassActive = Boolean(composer && ssaoPass && ssaoEnabled)
        viewerState.floorTileSizeMm = [floorMatInfo.tile_width_mm, floorMatInfo.tile_length_mm]
        viewerState.floorGroutMm = floorMatInfo.grout_width_mm ?? 3
        viewerState.floorMaterialId = floorMatInfo.id || room?.floor_material_id
        viewerState.cameraFraming = {
          position: [
            Number(camera.position.x.toFixed(3)),
            Number(camera.position.y.toFixed(3)),
            Number(camera.position.z.toFixed(3)),
          ],
          target: [Number(cx.toFixed(3)), 0.85, Number(cz.toFixed(3))],
          roomExtentM: [roomW / 1000, roomD / 1000, roomHeightMm / 1000],
        }
      }

      // Initialize fallback RoomEnvironment first, then load licensed Poly Haven CC0 1K HDRI
      const pmremGenerator = new THREE.PMREMGenerator(renderer)
      pmremGenerator.compileEquirectangularShader()
      let environmentTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04)
      scene.environment = environmentTarget.texture

      let disposed = false
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      const addedIds = placementTracker.current.observe(project, animationEnabled && !reducedMotion.matches && !document.hidden && viewMode !== '2d')
      const placement = createPlacementAnimation(scene, project, addedIds, renderScene, setPlacementStatus)
      placementRef.current = placement
      const motionChanged = () => { if (reducedMotion.matches) placement.dispose() }
      reducedMotion.addEventListener('change', motionChanged)
      const hdriUrl = '/api/v1/assets/hdri/photo_studio_loft_hall_1k.hdr'
      const rgbeLoader = new RGBELoader()
      rgbeLoader.load(
        hdriUrl,
        (hdrTexture) => {
          if (disposed) {
            hdrTexture.dispose()
            return
          }
          hdrTexture.mapping = THREE.EquirectangularReflectionMapping
          const hdrEnvTarget = pmremGenerator.fromEquirectangular(hdrTexture)
          environmentTarget.dispose()
          environmentTarget = hdrEnvTarget
          scene.environment = hdrEnvTarget.texture
          ;(scene as any).environmentIntensity =
            lightingPreset === 'day' ? 0.95 : lightingPreset === 'sunset' ? 0.62 : 0.22
          hdrTexture.dispose()
          setHdriLoaded(true)
          const viewerState = ((window as any).__ATELIER_VIEWER_STATE__ ||= {})
          viewerState.hdriLoaded = true
          viewerState.hdriUrl = hdriUrl
          viewerState.hdriLicense = 'CC0-1.0 (Poly Haven photo_studio_loft_hall_1k)'
          renderScene()
        },
        undefined,
        (err) => {
          console.warn('HDRI load fallback to RoomEnvironment:', err)
        }
      )

      // Studio Architectural Lighting (Dollhouse Soft Daylight + Warm Indoor Glow)
      const hemiIntensity = lightingPreset === 'day' ? 0.85 : lightingPreset === 'sunset' ? 0.48 : 0.22
      const hemiLight = new THREE.HemisphereLight(
        lightingPreset === 'sunset' ? 0xffd7b0 : 0xffffff,
        lightingPreset === 'night' ? 0x091126 : 0x8c8378,
        hemiIntensity
      )
      hemiLight.position.set(0, 12, 0)
      scene.add(hemiLight)

      const dirLight = new THREE.DirectionalLight(
        lightingPreset === 'sunset' ? 0xff9b63 : 0xfffaf2,
        lightingPreset === 'day' ? 1.32 : lightingPreset === 'sunset' ? 0.85 : 0.18
      )
      dirLight.position.set(cx + spanM * 1.4, spanM * 2.1, cz + spanM * 1.1)
      dirLight.target.position.set(cx, 0.3, cz)
      scene.add(dirLight.target)
      dirLight.castShadow = !lowSpecMode
      dirLight.shadow.mapSize.width = 2048
      dirLight.shadow.mapSize.height = 2048
      dirLight.shadow.radius = 3
      const shadowPad = Math.max(4.5, spanM * 0.95)
      dirLight.shadow.camera.left = -shadowPad
      dirLight.shadow.camera.right = shadowPad
      dirLight.shadow.camera.top = shadowPad
      dirLight.shadow.camera.bottom = -shadowPad
      dirLight.shadow.camera.near = 0.5
      dirLight.shadow.camera.far = spanM * 5 + 10
      dirLight.shadow.bias = -0.0004
      dirLight.shadow.normalBias = 0.02
      scene.add(dirLight)

      const fillLight = new THREE.DirectionalLight(0xeef6ff, 0.32)
      fillLight.position.set(cx - spanM * 1.2, spanM * 1.2, cz - spanM * 1.1)
      scene.add(fillLight)

      // Subtle warm indoor fill light
      const indoorWarmLight = new THREE.PointLight(
        0xffe4b8,
        lightingPreset === 'night' ? 14 : 2.6,
        Math.max(6, spanM * 1.8),
        1.6
      )
      indoorWarmLight.position.set(cx, 1.85, cz)
      scene.add(indoorWarmLight)

      if (lightingPreset === 'night') {
        const warmFixtures = [
          [(roomW * 0.3) / 1000, 2.45, (roomD * 0.3) / 1000],
          [(roomW * 0.7) / 1000, 2.45, (roomD * 0.65) / 1000],
        ]
        warmFixtures.forEach(([x, y, z]) => {
          const light = new THREE.PointLight(0xffd6a0, 16, 5, 2)
          light.position.set(x, y, z)
          light.castShadow = !lowSpecMode
          scene.add(light)
        })
      }

      if (visibleLayers.grid && !cutawayEnabled && ceilingVisible) {
        const grid = new THREE.GridHelper(
          16,
          32,
          theme === 'dark' ? 0x27272a : 0xd4d4d8,
          theme === 'dark' ? 0x18181b : 0xe5e7eb
        )
        grid.position.set(cx, -0.09, cz)
        scene.add(grid)
      }

      // High-resolution PNG export hook for Studio viewport
      ;(window as any).__ATELIER_CAPTURE_PNG__ = (scale = 2) => {
        const prevW = renderer.domElement.width
        const prevH = renderer.domElement.height
        const prevPR = renderer.getPixelRatio()
        const targetW = Math.min(2560, Math.round((container.clientWidth || 1280) * scale))
        const targetH = Math.min(1600, Math.round((container.clientHeight || 800) * scale))
        renderer.setPixelRatio(1)
        renderer.setSize(targetW, targetH, false)
        if (composer) composer.setSize(targetW, targetH)
        if (composer && ssaoEnabled) composer.render()
        else renderer.render(scene, camera)
        const dataUrl = renderer.domElement.toDataURL('image/png')
        renderer.setPixelRatio(prevPR)
        renderer.setSize(container.clientWidth || 720, container.clientHeight || 520, false)
        if (composer) composer.setSize(container.clientWidth || 720, container.clientHeight || 520)
        renderScene()
        void prevW
        void prevH
        return dataUrl
      }

      const pickableMeshes: THREE.Object3D[] = []
      const gltfLoader = new GLTFLoader()
      const texLoader = new THREE.TextureLoader()
      const loadPbrMap = (url: string, repeatX = 2, repeatY = 2, isColor = false) => {
        const tex = texLoader.load(url, () => renderScene())
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(repeatX, repeatY)
        tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace
        return tex
      }
      const objectRoots = new Map<string, THREE.Object3D>()
      const materialDefinitions = new Map(pbrMaterials.map((material) => [material.material_id, material]))
      const initialMetrics = ((window as any).__ATELIER_MATERIAL_METRICS__ ||= {})
      initialMetrics.glbLoadCount = Number.isFinite(initialMetrics.glbLoadCount) ? initialMetrics.glbLoadCount : 0
      initialMetrics.materialApplyCount = Number.isFinite(initialMetrics.materialApplyCount)
        ? initialMetrics.materialApplyCount
        : 0
      initialMetrics.disposedMaterialCount = Number.isFinite(initialMetrics.disposedMaterialCount)
        ? initialMetrics.disposedMaterialCount
        : 0
      initialMetrics.meshUUIDs ||= {}

      // 1. Interior Floor Slab built to exact room polygon (room.polygon_mm) with Poly Haven CC0 Light Oak PBR + tint
      const floorW = roomW / 1000
      const floorD = roomD / 1000
      const floorShape = new THREE.Shape()
      poly.forEach((pt: number[], idx: number) => {
        const px = pt[0] / 1000
        const py = -pt[1] / 1000
        if (idx === 0) floorShape.moveTo(px, py)
        else floorShape.lineTo(px, py)
      })
      floorShape.closePath()
      const floorGeo = new THREE.ExtrudeGeometry(floorShape, {
        depth: 0.08,
        bevelEnabled: false,
      })
      floorGeo.rotateX(-Math.PI / 2)
      const posAttr = floorGeo.getAttribute('position')
      const uvAttr = floorGeo.getAttribute('uv')
      if (posAttr && uvAttr) {
        const minXm = roomMinX / 1000
        const minZm = roomMinY / 1000
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i)
          const vz = posAttr.getZ(i)
          uvAttr.setXY(i, (vx - minXm) / Math.max(0.1, floorW), (vz - minZm) / Math.max(0.1, floorD))
        }
        uvAttr.needsUpdate = true
      }

      const floorPbrEntry = resolveMaterialOrDefault(
        floorOverride?.material_id || room?.floor_material_id,
        'floor'
      )
      const floorRepX = Math.max(1.2, floorW / Math.max(0.4, floorPbrEntry.repeat_scale_m[0]))
      const floorRepY = Math.max(1.2, floorD / Math.max(0.4, floorPbrEntry.repeat_scale_m[1]))
      const floorBaseHex = floorOverride?.tint || floorPbrEntry.base_color || floorMatInfo.hex_color || '#E8D8C3'
      const floorMat = new THREE.MeshStandardMaterial({
        map: loadPbrMap(floorPbrEntry.diffuse_url, floorRepX, floorRepY, true),
        roughnessMap: loadPbrMap(floorPbrEntry.roughness_url, floorRepX, floorRepY, false),
        normalMap: loadPbrMap(floorPbrEntry.normal_url, floorRepX, floorRepY, false),
        normalScale: new THREE.Vector2(0.35, 0.35),
        color: new THREE.Color(floorBaseHex).lerp(new THREE.Color('#FFFFFF'), 0.42),
        roughness: floorPbrEntry.roughness ?? floorMatInfo.roughness ?? 0.52,
        metalness: floorPbrEntry.metalness ?? 0.02,
        emissive: selectedEntityId === 'floor_main' ? new THREE.Color('#0F766E') : new THREE.Color('#000000'),
        emissiveIntensity: selectedEntityId === 'floor_main' ? 0.14 : 0,
      })
      const floorMesh = new THREE.Mesh(floorGeo, floorMat)
      floorMesh.position.set(0, -0.08, 0)
      floorMesh.receiveShadow = true
      floorMesh.name = 'FLOOR_SLAB_MAIN'
      floorMesh.userData = {
        entityId: 'floor_main',
        surfaceType: 'floor',
        materialId: floorPbrEntry.id,
        polygonVertices: poly.length,
      }
      scene.add(floorMesh)
      pickableMeshes.push(floorMesh)
      objectRoots.set('floor_main', floorMesh)

      // 1A. Exterior Architectural Tray (Light Oak Patio Deck + Grass Border + Multi-cluster Shrubs + Soft Studio Ground Shadow)
      const patioDepth = Math.min(2.2, Math.max(1.1, floorD * 0.38))
      const grassPad = 0.58
      const trayW = floorW + grassPad * 2
      const trayD = floorD + patioDepth + grassPad * 2
      const trayCenterX = cx
      const trayCenterZ = cz + patioDepth * 0.5

      const shadowCatcher = new THREE.Mesh(
        new THREE.PlaneGeometry(trayW * 3.5, trayD * 3.5),
        new THREE.ShadowMaterial({ opacity: 0.14 })
      )
      shadowCatcher.rotation.x = -Math.PI / 2
      shadowCatcher.position.set(trayCenterX, -0.095, trayCenterZ)
      shadowCatcher.receiveShadow = true
      scene.add(shadowCatcher)

      const grassMat = new THREE.MeshStandardMaterial({
        map: loadPbrMap(PBR_TEXTURES.grass.diffuse, Math.max(2, trayW / 1.2), Math.max(2, trayD / 1.2), true),
        roughnessMap: loadPbrMap(PBR_TEXTURES.grass.roughness, Math.max(2, trayW / 1.2), Math.max(2, trayD / 1.2), false),
        normalMap: loadPbrMap(PBR_TEXTURES.grass.normal, Math.max(2, trayW / 1.2), Math.max(2, trayD / 1.2), false),
        normalScale: new THREE.Vector2(0.5, 0.5),
        color: '#8CBF4B',
        roughness: 0.9,
      })
      const grassTray = new THREE.Mesh(new THREE.BoxGeometry(trayW, 0.06, trayD), grassMat)
      grassTray.position.set(trayCenterX, -0.06, trayCenterZ)
      grassTray.receiveShadow = true
      grassTray.castShadow = true
      grassTray.name = 'EXTERIOR_GRASS_TRAY'
      scene.add(grassTray)

      const patioDeckMat = new THREE.MeshStandardMaterial({
        map: loadPbrMap(PBR_TEXTURES.wood_oak.diffuse, Math.max(1.5, floorW / 1.3), Math.max(1, patioDepth / 1.3), true),
        roughnessMap: loadPbrMap(PBR_TEXTURES.wood_oak.roughness, Math.max(1.5, floorW / 1.3), Math.max(1, patioDepth / 1.3), false),
        normalMap: loadPbrMap(PBR_TEXTURES.wood_oak.normal, Math.max(1.5, floorW / 1.3), Math.max(1, patioDepth / 1.3), false),
        normalScale: new THREE.Vector2(0.35, 0.35),
        color: '#E5D3BC',
        roughness: 0.6,
      })
      const patioDeck = new THREE.Mesh(new THREE.BoxGeometry(floorW + 0.16, 0.055, patioDepth), patioDeckMat)
      patioDeck.position.set(cx, -0.042, roomMaxY / 1000 + patioDepth / 2)
      patioDeck.receiveShadow = true
      patioDeck.name = 'EXTERIOR_PATIO_DECK'
      scene.add(patioDeck)

      // Perimeter multi-cluster flowering shrubs on the grass tray
      const shrubGreens = [
        new THREE.MeshStandardMaterial({ color: '#4D7C0F', roughness: 0.88 }),
        new THREE.MeshStandardMaterial({ color: '#65A30D', roughness: 0.86 }),
        new THREE.MeshStandardMaterial({ color: '#84CC16', roughness: 0.84 }),
      ]
      const flowerColors = [
        new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.72 }),
        new THREE.MeshStandardMaterial({ color: '#A78BFA', roughness: 0.72 }),
      ]
      const shrubPositions: Array<[number, number, number]> = [
        [roomMinX / 1000 - 0.28, roomMaxY / 1000 - 0.35, 0.22],
        [roomMinX / 1000 - 0.26, roomMaxY / 1000 + 0.18, 0.24],
        [roomMinX / 1000 - 0.28, roomMaxY / 1000 + 0.72, 0.21],
        [roomMaxX / 1000 + 0.26, roomMaxY / 1000 + patioDepth - 0.22, 0.23],
        [roomMaxX / 1000 - 0.15, roomMaxY / 1000 + patioDepth + 0.26, 0.22],
        [roomMaxX / 1000 - 0.65, roomMaxY / 1000 + patioDepth + 0.28, 0.2],
      ]
      shrubPositions.forEach(([sx, sz, rad], idx) => {
        const bush = new THREE.Group()
        for (let k = 0; k < 14; k++) {
          const ang = (k / 14) * Math.PI * 2 + idx
          const rDist = (k % 3) * rad * 0.28
          const leafSize = rad * (0.3 + ((k * 7) % 4) * 0.05)
          const lobe = new THREE.Mesh(
            new THREE.IcosahedronGeometry(leafSize, 0),
            shrubGreens[k % shrubGreens.length]
          )
          lobe.position.set(
            Math.cos(ang) * rDist,
            leafSize * 0.85 + ((k % 3) * 0.05),
            Math.sin(ang) * rDist
          )
          lobe.rotation.set(k * 0.7, k * 1.1, 0)
          lobe.castShadow = true
          lobe.receiveShadow = true
          bush.add(lobe)
        }
        if (idx >= 3) {
          for (let fIdx = 0; fIdx < 6; fIdx++) {
            const ang = (fIdx / 6) * Math.PI * 2
            const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.028, 0), flowerColors[fIdx % flowerColors.length])
            fl.position.set(Math.cos(ang) * rad * 0.45, rad * 0.95 + (fIdx % 2) * 0.04, Math.sin(ang) * rad * 0.45)
            bush.add(fl)
          }
        }
        bush.position.set(sx, -0.025, sz)
        scene.add(bush)
      })

      // 1B. Ceiling Slab with Downlights (G3 Ceiling Visibility Toggle)
      const ceilingGroup = new THREE.Group()
      ceilingGroup.name = 'CEILING_SLAB_GROUP'
      const ceilingH = roomHeightMm / 1000
      const ceilingGeo = new THREE.BoxGeometry(roomW / 1000, 0.06, roomD / 1000)
      const ceilingMat = new THREE.MeshStandardMaterial({
        color: '#FAF8F5',
        roughness: 0.88,
        metalness: 0.02,
      })
      const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat)
      ceilingMesh.position.set(cx, ceilingH + 0.03, cz)
      ceilingMesh.receiveShadow = true
      ceilingGroup.add(ceilingMesh)

      // Recessed LED downlight fixtures on ceiling
      ;[
        [roomW * 0.3 / 1000, ceilingH - 0.005, roomD * 0.32 / 1000],
        [roomW * 0.7 / 1000, ceilingH - 0.005, roomD * 0.32 / 1000],
        [roomW * 0.3 / 1000, ceilingH - 0.005, roomD * 0.68 / 1000],
        [roomW * 0.7 / 1000, ceilingH - 0.005, roomD * 0.68 / 1000],
      ].forEach(([lx, ly, lz], idx) => {
        const downlight = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.065, 0.015, 20),
          new THREE.MeshStandardMaterial({
            color: '#FFFBEB',
            emissive: new THREE.Color('#FDE68A'),
            emissiveIntensity: lightingPreset === 'night' ? 1.8 : 0.65,
          })
        )
        downlight.position.set(lx, ly, lz)
        downlight.name = `CEILING_DOWNLIGHT_${idx}`
        ceilingGroup.add(downlight)
      })
      ceilingGroup.visible = ceilingVisible
      scene.add(ceilingGroup)

      // 2. Walls (Dollhouse 1.12m flat-cut with crisp white top caps + Poly Haven plaster PBR)
      const DOLLHOUSE_CUT_H = 1.12
      const dollhouseCut = cutawayEnabled || !ceilingVisible
      const plasterNorm = loadPbrMap(PBR_TEXTURES.plaster_wall.normal, 2, 1, false)
      const plasterRough = loadPbrMap(PBR_TEXTURES.plaster_wall.roughness, 2, 1, false)
      const whiteCapMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.55,
        metalness: 0.02,
      })

      cutawayWallsRef.current = []
      walls.forEach((w: any, idx: number) => {
        const isCutawayWall = w.id === 'wall_south' || w.id === 'wall_east' || idx === 1 || idx === 2
        const x0 = w.start_mm[0] / 1000
        const z0 = w.start_mm[1] / 1000
        const x1 = w.end_mm[0] / 1000
        const z1 = w.end_mm[1] / 1000
        const len = Math.hypot(x1 - x0, z1 - z0)
        const rawH = (w.height_mm || 2800) / 1000
        const th = Math.max(0.14, (w.thickness_mm || 200) / 1000)
        const directionX = (x1 - x0) / len
        const directionZ = (z1 - z0) / len
        const angle = Math.atan2(z1 - z0, x1 - x0)
        const cuts = [
          ...doors
            .filter((door: any) => door.wall_id === w.id)
            .map((door: any) => {
              const center = len * (door.t ?? 0.5)
              const width = (door.width_mm || 900) / 1000
              return { start: center - width / 2, end: center + width / 2, bottom: 0, top: (door.height_mm || 2100) / 1000 }
            }),
          ...windows
            .filter((win: any) => win.wall_id === w.id)
            .map((win: any) => {
              const center = len * (win.t ?? 0.5)
              const width = (win.width_mm || 1500) / 1000
              const rawSill = (win.sill_height_mm ?? 900) / 1000
              const bottom = dollhouseCut ? Math.min(rawSill, 0.55) : rawSill
              return { start: center - width / 2, end: center + width / 2, bottom, top: bottom + (win.height_mm || 1400) / 1000 }
            }),
        ]
        const solidRects = buildWallSolidRects(len, rawH, cuts)

        const wallPbrA = getPbrMaterialById(w.face_a_material_id)
        const pMat = wallPbrA
          ? { hex_color: wallPbrA.base_color, roughness: wallPbrA.roughness, diffuse_url: wallPbrA.diffuse_url, normal_url: wallPbrA.normal_url, roughness_url: wallPbrA.roughness_url }
          : paintsById[w.face_a_material_id] || { hex_color: '#E5DFD5', roughness: 0.85 }
        const isSelected = w.id === selectedEntityId
        const rawWallCol = new THREE.Color(pMat.hex_color || '#E5DFD5')
        const wallLum = 0.2126 * rawWallCol.r + 0.7152 * rawWallCol.g + 0.0722 * rawWallCol.b
        // Slightly warm/darken pure white paint so the pure white top cut cap contrasts crisply
        const wallColor = wallLum > 0.82 ? rawWallCol.clone().lerp(new THREE.Color('#DDD6CA'), 0.48) : rawWallCol
        const wallMat = new THREE.MeshStandardMaterial({
          map: pMat.diffuse_url ? loadPbrMap(pMat.diffuse_url, Math.max(1, len / 1.8), 1, true) : undefined,
          color: wallColor,
          roughness: pMat.roughness ?? 0.85,
          roughnessMap: pMat.roughness_url ? loadPbrMap(pMat.roughness_url, Math.max(1, len / 1.8), 1, false) : plasterRough,
          normalMap: pMat.normal_url ? loadPbrMap(pMat.normal_url, Math.max(1, len / 1.8), 1, false) : plasterNorm,
          normalScale: new THREE.Vector2(0.22, 0.22),
          emissive: isSelected ? new THREE.Color('#0F766E') : new THREE.Color('#000000'),
          emissiveIntensity: isSelected ? 0.16 : 0,
        })
        solidRects.forEach((rect) => {
          const segmentLength = rect.end - rect.start
          const segmentHeight = rect.top - rect.bottom
          const along = (rect.start + rect.end) / 2
          const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(segmentLength, segmentHeight, th), wallMat)
          wallMesh.position.set(x0 + directionX * along, (rect.bottom + rect.top) / 2, z0 + directionZ * along)
          wallMesh.rotation.y = -angle
          wallMesh.castShadow = true
          wallMesh.receiveShadow = true
          wallMesh.userData = { entityId: w.id }

          let capMesh: THREE.Mesh | undefined
          if (dollhouseCut) {
            const visibleTop = Math.min(rect.top, DOLLHOUSE_CUT_H)
            if (visibleTop <= rect.bottom) {
              wallMesh.visible = false
            } else {
              wallMesh.scale.y = (visibleTop - rect.bottom) / segmentHeight
              wallMesh.position.y = (rect.bottom + visibleTop) / 2
              if (visibleTop >= DOLLHOUSE_CUT_H - 0.01) {
                capMesh = new THREE.Mesh(new THREE.BoxGeometry(segmentLength + 0.002, 0.014, th + 0.002), whiteCapMat)
                capMesh.position.set(x0 + directionX * along, visibleTop + 0.006, z0 + directionZ * along)
                capMesh.rotation.y = -angle
                capMesh.receiveShadow = true
                scene.add(capMesh)
              }
            }
          }
          scene.add(wallMesh)
          cutawayWallsRef.current.push({ mesh: wallMesh, capMesh, bottom: rect.bottom, top: rect.top, cutaway: isCutawayWall })
          pickableMeshes.push(wallMesh)
        })

        if (room?.wall_tile_zone?.enabled && !dollhouseCut) {
          const wtH = (room.wall_tile_zone.tile_height_mm || 1200) / 1000
          const wtInfo = tilesById[room.wall_tile_zone.tile_material_id] || { hex_color: '#D8D4CC' }
          const wtGeo = new THREE.BoxGeometry(len * 0.99, wtH, th + 0.012)
          const wtMat = new THREE.MeshStandardMaterial({
            color: wtInfo.hex_color || '#D8D4CC',
            roughness: 0.32,
          })
          const wtMesh = new THREE.Mesh(wtGeo, wtMat)
          wtMesh.position.set((x0 + x1) / 2, wtH / 2, (z0 + z1) / 2)
          wtMesh.rotation.y = -angle
          scene.add(wtMesh)
        }
      })

      // 3. Parametric Doors & Windows (thin black frames + clear glass, clipped cleanly to dollhouse cut height)
      const blackFrameMat = new THREE.MeshStandardMaterial({ color: '#1E2228', roughness: 0.42, metalness: 0.38 })
      const oakLeafMat = new THREE.MeshStandardMaterial({
        map: loadPbrMap(PBR_TEXTURES.wood_oak.diffuse, 1, 1, true),
        roughness: 0.56,
        color: '#D8C2A6',
      })
      const clearGlassMat = new THREE.MeshStandardMaterial({
        color: '#DCEEF8',
        transparent: true,
        opacity: 0.24,
        roughness: 0.06,
        metalness: 0.08,
      })

      doors.forEach((door: any) => {
        const w = walls.find((item: any) => item.id === door.wall_id)
        if (!w) return
        const x0 = w.start_mm[0] / 1000
        const z0 = w.start_mm[1] / 1000
        const x1 = w.end_mm[0] / 1000
        const z1 = w.end_mm[1] / 1000
        const angle = Math.atan2(z1 - z0, x1 - x0)
        const centerX = x0 + (x1 - x0) * (door.t ?? 0.5)
        const centerZ = z0 + (z1 - z0) * (door.t ?? 0.5)
        const width = (door.width_mm || 900) / 1000
        const rawDoorH = (door.height_mm || 2100) / 1000
        const height = dollhouseCut ? Math.min(rawDoorH, DOLLHOUSE_CUT_H) : rawDoorH
        const frameSize = 0.036
        const wallDepth = ((w.thickness_mm || 200) / 1000) + 0.008
        const doorGroup = new THREE.Group()
        doorGroup.position.set(centerX, 0, centerZ)
        doorGroup.rotation.y = -angle

        const addDoorPart = (partWidth: number, partHeight: number, partDepth: number, x: number, y: number) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(partWidth, partHeight, partDepth), blackFrameMat)
          mesh.position.set(x, y, 0)
          mesh.castShadow = true
          mesh.userData = { entityId: door.id }
          doorGroup.add(mesh)
          pickableMeshes.push(mesh)
        }
        addDoorPart(frameSize, height, wallDepth, -width / 2 + frameSize / 2, height / 2)
        addDoorPart(frameSize, height, wallDepth, width / 2 - frameSize / 2, height / 2)
        if (!dollhouseCut) {
          addDoorPart(width + frameSize * 2, frameSize, wallDepth, 0, height + frameSize / 2)
        }

        const isGlassDoor = /glass|patio|sliding|balcony/i.test(String(door.type || door.name || ''))
        if (isGlassDoor) {
          const glass = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, height - 0.04, 0.018), clearGlassMat)
          glass.position.set(0, height / 2, 0)
          glass.userData = { entityId: door.id }
          doorGroup.add(glass)
          pickableMeshes.push(glass)
          addDoorPart(0.032, height, 0.04, 0, height / 2)
        } else {
          const hingesLeft = door.hinges_side !== 'right'
          const pivot = new THREE.Group()
          pivot.position.x = hingesLeft ? -width / 2 : width / 2
          const swing = Math.PI * 0.36 * (hingesLeft ? -1 : 1) * (door.swing_direction === 'outward' ? -1 : 1)
          pivot.rotation.y = swing
          const leafWidth = width - 0.035
          const leaf = new THREE.Mesh(new THREE.BoxGeometry(leafWidth, height - 0.02, 0.042), oakLeafMat)
          leaf.position.set(hingesLeft ? leafWidth / 2 : -leafWidth / 2, height / 2, 0)
          leaf.castShadow = true
          leaf.userData = { entityId: door.id }
          pivot.add(leaf)
          doorGroup.add(pivot)
          pickableMeshes.push(leaf)
        }
        scene.add(doorGroup)
      })

      windows.forEach((win: any) => {
        const w = walls.find((item: any) => item.id === win.wall_id) || walls[0]
        if (!w) return
        const wx = (w.start_mm[0] + (w.end_mm[0] - w.start_mm[0]) * (win.t ?? 0.5)) / 1000
        const wz = (w.start_mm[1] + (w.end_mm[1] - w.start_mm[1]) * (win.t ?? 0.5)) / 1000
        const wallAngle = Math.atan2(w.end_mm[1] - w.start_mm[1], w.end_mm[0] - w.start_mm[0])
        const width = (win.width_mm || 1500) / 1000
        const rawWinH = (win.height_mm || 1400) / 1000
        const rawSill = (win.sill_height_mm ?? 900) / 1000
        const sill = dollhouseCut ? Math.min(rawSill, 0.55) : rawSill
        const topY = dollhouseCut ? DOLLHOUSE_CUT_H : rawSill + rawWinH
        const height = Math.max(0.25, topY - sill)
        const frameSize = 0.034
        const wallDepth = Math.max(0.07, ((w.thickness_mm || 200) / 1000) - 0.018)
        const windowGroup = new THREE.Group()
        windowGroup.position.set(wx, 0, wz)
        windowGroup.rotation.y = -wallAngle

        const glass = new THREE.Mesh(new THREE.BoxGeometry(width - frameSize * 2, height - frameSize * 2, 0.016), clearGlassMat)
        glass.position.y = sill + height / 2
        glass.userData = { entityId: win.id }
        windowGroup.add(glass)
        pickableMeshes.push(glass)
        const addWindowFrame = (partWidth: number, partHeight: number, x: number, y: number) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(partWidth, partHeight, wallDepth), blackFrameMat)
          mesh.position.set(x, y, 0)
          mesh.castShadow = true
          mesh.userData = { entityId: win.id }
          windowGroup.add(mesh)
          pickableMeshes.push(mesh)
        }
        addWindowFrame(frameSize, height, -width / 2 + frameSize / 2, sill + height / 2)
        addWindowFrame(frameSize, height, width / 2 - frameSize / 2, sill + height / 2)
        addWindowFrame(width, frameSize, 0, sill + frameSize / 2)
        addWindowFrame(width, frameSize, 0, sill + height - frameSize / 2)
        addWindowFrame(frameSize, height - frameSize * 2, 0, sill + height / 2)
        scene.add(windowGroup)
      })

      // 4. Furniture 3D Models + Contact AO Grounding + Selection Outline Box
      furniture.forEach((f: any) => {
        const isSelected = f.id === selectedEntityId
        const isHovered = f.id === hoveredEntityId
        const group = new THREE.Group()
        const fw = (f.width_mm || 1000) / 1000
        const fd = (f.depth_mm || 800) / 1000
        const fh = (f.height_mm || 750) / 1000

        const mainMat = new THREE.MeshStandardMaterial({
          color: f.color_hex || '#E4DDD3',
          roughness: 0.62,
          emissive: isSelected
            ? new THREE.Color('#0F766E')
            : isHovered
            ? new THREE.Color('#14B8A6')
            : new THREE.Color('#000000'),
          emissiveIntensity: isSelected ? 0.22 : isHovered ? 0.1 : 0,
        })

        const addBoxPart = (
          width: number,
          height: number,
          depth: number,
          x: number,
          y: number,
          z: number,
          name: string,
        ) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mainMat)
          mesh.position.set(x, y, z)
          mesh.name = name
          mesh.castShadow = !lowSpecMode
          mesh.receiveShadow = true
          mesh.userData = { entityId: f.id }
          group.add(mesh)
          pickableMeshes.push(mesh)
          return mesh
        }

        const resolvedAsset = resolveFurnitureAsset(f, activeAssetPack)
        if (resolvedAsset.flaggedUnmapped) {
          const viewerState = ((window as any).__ATELIER_VIEWER_STATE__ ||= {})
          viewerState.unmappedCategories = Array.from(
            new Set([...(viewerState.unmappedCategories || []), String(f.category || f.name || 'unknown')])
          )
          console.warn('[StudioAssetCatalog]', resolvedAsset.reason)
        }

        if (resolvedAsset.kind === 'glb') {
          gltfLoader.load(
            resolvedAsset.url,
            (gltf) => {
              if (disposed) return
              const model = gltf.scene
              const sourceBounds = new THREE.Box3().setFromObject(model)
              const sourceSize = sourceBounds.getSize(new THREE.Vector3())
              if (sourceSize.x <= 0 || sourceSize.y <= 0 || sourceSize.z <= 0) return

              model.scale.set(fw / sourceSize.x, fh / sourceSize.y, fd / sourceSize.z)
              model.updateMatrixWorld(true)
              const normalizedBounds = new THREE.Box3().setFromObject(model)
              const normalizedCenter = normalizedBounds.getCenter(new THREE.Vector3())
              model.position.set(-normalizedCenter.x, -normalizedBounds.min.y, -normalizedCenter.z)
              model.updateMatrixWorld(true)
              const finalBounds = new THREE.Box3().setFromObject(model)
              const finalSize = finalBounds.getSize(new THREE.Vector3())
              const foundParts = new Set<string>()

              model.traverse((node) => {
                if ((node as THREE.Mesh).isMesh) {
                  const mesh = node as THREE.Mesh
                  mesh.castShadow = !lowSpecMode
                  mesh.receiveShadow = true
                  const mBox = new THREE.Box3().setFromObject(mesh)
                  const mSize = mBox.getSize(new THREE.Vector3())
                  const mCenter = mBox.getCenter(new THREE.Vector3())
                  const relMinY = (mBox.min.y - finalBounds.min.y) / Math.max(0.01, finalSize.y)
                  const relMaxY = (mBox.max.y - finalBounds.min.y) / Math.max(0.01, finalSize.y)
                  const relCenterZ = (mCenter.z - finalBounds.min.z) / Math.max(0.01, finalSize.z) - 0.5
                  const relW = mSize.x / Math.max(0.01, finalSize.x)
                  const relH = mSize.y / Math.max(0.01, finalSize.y)
                  const relD = mSize.z / Math.max(0.01, finalSize.z)
                  const firstMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
                  const partName = classifyGlbMeshPartName(
                    mesh.name,
                    firstMat?.name || '',
                    relMinY,
                    relMaxY,
                    relCenterZ,
                    relW,
                    relH,
                    relD,
                    f
                  )
                  foundParts.add(partName)
                  if (dollhouseCut && fh > 1.5) {
                    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), DOLLHOUSE_CUT_H + 0.06)
                    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
                    mats.forEach((m) => {
                      if (m) {
                        m.clippingPlanes = [clipPlane]
                        m.clipShadows = true
                        m.side = THREE.DoubleSide
                      }
                    })
                  }
                  mesh.userData = {
                    ...mesh.userData,
                    entityId: f.id,
                    assetId: f.asset_id,
                    partName,
                  }
                  pickableMeshes.push(mesh)
                }
              })

              // Synthesize missing architectural sub-parts onto unscaled `group` only for single-mesh cabinet/table GLBs
              const expectedParts = getNamedPartsForFurniture(f)
              if (foundParts.size <= 1) {
                expectedParts.forEach((spec) => {
                  if (foundParts.has(spec.partId)) return
                  if (spec.partId === 'countertop') {
                    const topMat = new THREE.MeshStandardMaterial({
                      map: loadPbrMap(PBR_TEXTURES.marble.diffuse, 1, 1, true),
                      roughnessMap: loadPbrMap(PBR_TEXTURES.marble.roughness, 1, 1, false),
                      color: '#F3EFEA',
                      roughness: 0.28,
                    })
                    const topSlab = new THREE.Mesh(
                      new THREE.BoxGeometry(fw * 0.99, Math.min(0.024, fh * 0.05), fd * 0.99),
                      topMat
                    )
                    topSlab.position.set(0, fh + 0.008, 0)
                    topSlab.castShadow = !lowSpecMode
                    topSlab.receiveShadow = true
                    topSlab.name = `${f.id}:countertop`
                    topSlab.userData = { entityId: f.id, partName: 'countertop' }
                    group.add(topSlab)
                    pickableMeshes.push(topSlab)
                  } else if (spec.partId === 'doors') {
                    const doorMat = new THREE.MeshStandardMaterial({
                      map: loadPbrMap(PBR_TEXTURES.wood_oak.diffuse, 1, 1, true),
                      color: '#D8C2A6',
                      roughness: 0.52,
                    })
                    const doorPanel = new THREE.Mesh(
                      new THREE.BoxGeometry(fw * 0.88, fh * 0.64, 0.012),
                      doorMat
                    )
                    doorPanel.position.set(0, fh * 0.5, fd * 0.49)
                    doorPanel.castShadow = !lowSpecMode
                    doorPanel.name = `${f.id}:doors`
                    doorPanel.userData = { entityId: f.id, partName: 'doors' }
                    group.add(doorPanel)
                    pickableMeshes.push(doorPanel)
                  } else if (spec.partId === 'legs') {
                    const legMat = new THREE.MeshStandardMaterial({
                      color: '#3F3A34',
                      roughness: 0.42,
                      metalness: 0.5,
                    })
                    const legR = Math.min(0.022, fw * 0.04)
                    const legH = Math.min(0.08, fh * 0.14)
                    for (const lx of [-fw * 0.42, fw * 0.42]) {
                      for (const lz of [-fd * 0.42, fd * 0.42]) {
                        const legMesh = new THREE.Mesh(
                          new THREE.CylinderGeometry(legR, legR * 0.85, legH, 10),
                          legMat
                        )
                        legMesh.position.set(lx, legH / 2, lz)
                        legMesh.name = `${f.id}:legs`
                        legMesh.userData = { entityId: f.id, partName: 'legs' }
                        group.add(legMesh)
                        pickableMeshes.push(legMesh)
                      }
                    }
                  }
                })
              }

              group.add(model)
              objectRoots.set(f.id, group)
              placement.register(f.id, group)
              Object.entries(f.material_overrides || {}).forEach(([slotId, override]: [string, any]) => {
                const slot = (f.material_slots || []).find((item: any) => item.slot_id === slotId)
                const definition = materialDefinitions.get(override.material_id)
                if (slot && definition) {
                  applyMaterialOverrideToObject(model, slot.source_material_name, definition, override)
                }
              })
              // Apply assigned PBR material per named part (or default PBR material for unassigned parts if part_materials is present)
              const partMaterialMap: Record<string, string> = { ...(f.part_materials || {}) }
              expectedParts.forEach((spec) => {
                if (!partMaterialMap[spec.partId]) {
                  const defaultEntry = resolveMaterialOrDefault(null, spec.surfaceType)
                  if (defaultEntry) partMaterialMap[spec.partId] = defaultEntry.id
                }
              })
              Object.entries(partMaterialMap).forEach(([partId, matId]: [string, any]) => {
                const pbrEntry = getPbrMaterialById(String(matId))
                if (!pbrEntry) return
                group.traverse((node) => {
                  const m = node as THREE.Mesh
                  if (m.isMesh && (m.userData?.partName === partId || partId === 'all')) {
                    const prevMats = Array.isArray(m.material) ? m.material : [m.material]
                    const clipPlanes = prevMats[0]?.clippingPlanes || null
                    const nextMat = new THREE.MeshStandardMaterial({
                      map: loadPbrMap(pbrEntry.diffuse_url, 1 / pbrEntry.repeat_scale_m[0], 1 / pbrEntry.repeat_scale_m[1], true),
                      roughnessMap: loadPbrMap(pbrEntry.roughness_url, 1 / pbrEntry.repeat_scale_m[0], 1 / pbrEntry.repeat_scale_m[1], false),
                      normalMap: loadPbrMap(pbrEntry.normal_url, 1 / pbrEntry.repeat_scale_m[0], 1 / pbrEntry.repeat_scale_m[1], false),
                      normalScale: new THREE.Vector2(0.3, 0.3),
                      color: new THREE.Color(pbrEntry.base_color),
                      roughness: pbrEntry.roughness,
                      metalness: pbrEntry.metalness,
                      transparent: Boolean(pbrEntry.transmission && pbrEntry.transmission > 0),
                      opacity: pbrEntry.transmission ? 1 - pbrEntry.transmission * 0.65 : 1,
                    })
                    if (clipPlanes) {
                      nextMat.clippingPlanes = clipPlanes
                      nextMat.clipShadows = true
                      nextMat.side = THREE.DoubleSide
                    }
                    m.material = nextMat
                    m.userData.assignedMaterialId = pbrEntry.id
                  }
                })
              })
              const metrics = ((window as any).__ATELIER_MATERIAL_METRICS__ ||= {})
              metrics.glbLoadCount = Number.isFinite(metrics.glbLoadCount) ? metrics.glbLoadCount + 1 : 1
              const viewerState = ((window as any).__ATELIER_VIEWER_STATE__ ||= {})
              viewerState.loadedGlbCount = metrics.glbLoadCount
              viewerState.namedPartsByEntity ||= {}
              viewerState.namedPartsByEntity[f.id] = expectedParts.map((p) => p.partId)
              metrics.meshUUIDs ||= {}
              metrics.meshUUIDs[f.id] = []
              model.traverse((node) => {
                if ((node as THREE.Mesh).isMesh) metrics.meshUUIDs[f.id].push(node.uuid)
              })
              renderScene()
            },
            undefined,
            () => {
              placement.failed(f.id)
              const fallbackMesh = addBoxPart(fw, fh, fd, 0, fh / 2, 0, f.name || f.id)
              fallbackMesh.userData.partName = 'body'
              placement.register(f.id, group)
              renderScene()
            }
          )
        } else if (resolvedAsset.kind === 'parametric') {
          const fabricNorm = loadPbrMap(PBR_TEXTURES.fabric_linen.normal, 2, 2, false)
          const fabricRough = loadPbrMap(PBR_TEXTURES.fabric_linen.roughness, 2, 2, false)
          if (resolvedAsset.parametricType === 'rug') {
            const rugMat = new THREE.MeshStandardMaterial({
              color: f.color_hex || '#D8CFC2',
              roughness: 0.92,
              roughnessMap: fabricRough,
              normalMap: fabricNorm,
              normalScale: new THREE.Vector2(0.35, 0.35),
            })
            const rugMesh = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.014, fd), rugMat)
            rugMesh.position.set(0, 0.007, 0)
            rugMesh.receiveShadow = true
            rugMesh.userData = { entityId: f.id, partName: 'body' }
            group.add(rugMesh)
            pickableMeshes.push(rugMesh)
          } else if (resolvedAsset.parametricType === 'mirror') {
            const frameMat = new THREE.MeshStandardMaterial({ color: '#27272A', roughness: 0.45, metalness: 0.3 })
            const mirrorMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.08, metalness: 0.92 })
            const frame = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, Math.max(0.03, fd)), frameMat)
            frame.position.set(0, fh / 2, 0)
            frame.castShadow = true
            frame.userData = { entityId: f.id, partName: 'frame' }
            const glass = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.88, fh * 0.88, 0.01), mirrorMat)
            glass.position.set(0, fh / 2, Math.max(0.03, fd) * 0.5 + 0.002)
            glass.userData = { entityId: f.id, partName: 'body' }
            group.add(frame, glass)
            pickableMeshes.push(frame, glass)
          } else if (resolvedAsset.parametricType === 'painting') {
            const frameMat = new THREE.MeshStandardMaterial({
              map: loadPbrMap(PBR_TEXTURES.wood_oak.diffuse, 1, 1, true),
              color: '#8C6239',
              roughness: 0.55,
            })
            const artMat = new THREE.MeshStandardMaterial({ color: f.color_hex || '#C8A986', roughness: 0.78 })
            const frame = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, Math.max(0.03, fd)), frameMat)
            frame.position.set(0, fh / 2, 0)
            frame.castShadow = true
            frame.userData = { entityId: f.id, partName: 'frame' }
            const canvasMesh = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.86, fh * 0.86, 0.01), artMat)
            canvasMesh.position.set(0, fh / 2, Math.max(0.03, fd) * 0.5 + 0.002)
            canvasMesh.userData = { entityId: f.id, partName: 'body' }
            group.add(frame, canvasMesh)
            pickableMeshes.push(frame, canvasMesh)
          } else if (resolvedAsset.parametricType === 'stair') {
            const treadMat = new THREE.MeshStandardMaterial({
              map: loadPbrMap(PBR_TEXTURES.wood_oak.diffuse, 1, 1, true),
              color: '#D5BC9B',
              roughness: 0.52,
            })
            const riserMat = new THREE.MeshStandardMaterial({
              color: '#EAE3D9',
              roughness: 0.72,
            })
            const railMat = new THREE.MeshStandardMaterial({
              color: '#27272A',
              roughness: 0.35,
              metalness: 0.75,
            })
            const steps = Math.max(4, Math.round(fh / 0.2))
            const stepW = fw / steps
            const stepH = fh / steps
            const treadThickness = Math.min(0.038, stepH * 0.22)
            for (let si = 0; si < steps; si++) {
              const hCur = (si + 1) * stepH
              const riser = new THREE.Mesh(new THREE.BoxGeometry(stepW, hCur - treadThickness, fd * 0.94), riserMat)
              riser.position.set(-fw / 2 + (si + 0.5) * stepW, (hCur - treadThickness) / 2, 0)
              riser.castShadow = true
              riser.receiveShadow = true
              riser.name = `${f.id}:body:${si}`
              riser.userData = { entityId: f.id, partName: 'body' }
              group.add(riser)
              pickableMeshes.push(riser)

              const tread = new THREE.Mesh(new THREE.BoxGeometry(stepW * 1.06, treadThickness, fd), treadMat)
              tread.position.set(-fw / 2 + (si + 0.5) * stepW, hCur - treadThickness / 2, 0)
              tread.castShadow = true
              tread.receiveShadow = true
              tread.name = `${f.id}:steps:${si}`
              tread.userData = { entityId: f.id, partName: 'steps' }
              group.add(tread)
              pickableMeshes.push(tread)
            }
            const railLen = Math.hypot(fw, fh)
            const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, railLen, 10), railMat)
            railBar.rotation.z = -Math.atan2(fw, fh)
            railBar.position.set(0, fh * 0.5 + 0.42, fd * 0.46)
            railBar.name = `${f.id}:legs:rail`
            railBar.userData = { entityId: f.id, partName: 'legs' }
            group.add(railBar)
            pickableMeshes.push(railBar)
          } else if (resolvedAsset.parametricType === 'console_table') {
            const topMat = new THREE.MeshStandardMaterial({
              map: loadPbrMap(PBR_TEXTURES.marble.diffuse, 1, 1, true),
              roughnessMap: loadPbrMap(PBR_TEXTURES.marble.roughness, 1, 1, false),
              color: '#F3EFEA',
              roughness: 0.25,
            })
            const topT = Math.min(0.028, fh * 0.05)
            const topSlab = new THREE.Mesh(new THREE.BoxGeometry(fw, topT, fd), topMat)
            topSlab.position.set(0, fh - topT / 2, 0)
            topSlab.castShadow = true
            topSlab.receiveShadow = true
            topSlab.userData = { entityId: f.id, partName: 'countertop' }
            group.add(topSlab)
            pickableMeshes.push(topSlab)

            const barH = 0.024
            const railFront = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.04, barH, 0.022), blackFrameMat)
            railFront.position.set(0, fh - topT - barH / 2, fd / 2 - 0.02)
            railFront.userData = { entityId: f.id, partName: 'frame' }
            const railBack = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.04, barH, 0.022), blackFrameMat)
            railBack.position.set(0, fh - topT - barH / 2, -fd / 2 + 0.02)
            railBack.userData = { entityId: f.id, partName: 'frame' }
            const shelfBar = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.06, 0.016, fd - 0.06), blackFrameMat)
            shelfBar.position.set(0, fh * 0.22, 0)
            shelfBar.userData = { entityId: f.id, partName: 'frame' }
            group.add(railFront, railBack, shelfBar)
            pickableMeshes.push(railFront, railBack, shelfBar)

            const legR = 0.014
            const legH = fh - topT
            for (const lx of [-fw / 2 + 0.022, fw / 2 - 0.022]) {
              for (const lz of [-fd / 2 + 0.022, fd / 2 - 0.022]) {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(legR * 2, legH, legR * 2), blackFrameMat)
                leg.position.set(lx, legH / 2, lz)
                leg.castShadow = true
                leg.userData = { entityId: f.id, partName: 'legs' }
                group.add(leg)
                pickableMeshes.push(leg)
              }
            }
          } else {
            // Curtain: pleated fabric folds + black rod
            const curtainMat = new THREE.MeshStandardMaterial({
              color: f.color_hex || '#EDE8DF',
              roughness: 0.9,
              roughnessMap: fabricRough,
              normalMap: fabricNorm,
            })
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, fw, 10), blackFrameMat)
            rod.rotation.z = Math.PI / 2
            rod.position.set(0, fh - 0.02, 0)
            rod.userData = { entityId: f.id, partName: 'legs' }
            group.add(rod)
            pickableMeshes.push(rod)
            const folds = Math.max(4, Math.round(fw / 0.14))
            for (let fi = 0; fi < folds; fi++) {
              const pleat = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, fh - 0.04, 8), curtainMat)
              pleat.position.set(-fw / 2 + (fi + 0.5) * (fw / folds), (fh - 0.04) / 2, 0)
              pleat.castShadow = true
              pleat.userData = { entityId: f.id, partName: 'body' }
              group.add(pleat)
              pickableMeshes.push(pleat)
            }
          }
          objectRoots.set(f.id, group)
        } else {
          // Flagged approximate non-sofa geometry for unmapped categories (never falls back to sofa or anonymous box)
          if (resolvedAsset.shape === 'cylinder') {
            const cyl = new THREE.Mesh(
              new THREE.CylinderGeometry(Math.min(fw, fd) * 0.45, Math.min(fw, fd) * 0.48, fh * 0.85, 20),
              mainMat
            )
            cyl.position.set(0, fh * 0.525, 0)
            cyl.castShadow = !lowSpecMode
            cyl.receiveShadow = true
            cyl.userData = { entityId: f.id, partName: 'body', flaggedUnmapped: true }
            const base = new THREE.Mesh(
              new THREE.CylinderGeometry(Math.min(fw, fd) * 0.38, Math.min(fw, fd) * 0.42, fh * 0.1, 20),
              blackFrameMat
            )
            base.position.set(0, fh * 0.05, 0)
            base.userData = { entityId: f.id, partName: 'legs', flaggedUnmapped: true }
            group.add(cyl, base)
            pickableMeshes.push(cyl, base)
          } else {
            const topH = Math.min(0.04, fh * 0.08)
            const legH = Math.min(0.12, fh * 0.16)
            const bodyH = Math.max(0.1, fh - topH - legH)
            const bodyMesh = addBoxPart(fw, bodyH, fd, 0, legH + bodyH / 2, 0, `${f.id}:body`)
            bodyMesh.userData.partName = 'body'
            const topMesh = addBoxPart(fw * 1.02, topH, fd * 1.02, 0, fh - topH / 2, 0, `${f.id}:countertop`)
            topMesh.userData.partName = 'countertop'
            const legMesh = addBoxPart(fw * 0.9, legH, fd * 0.9, 0, legH / 2, 0, `${f.id}:legs`)
            legMesh.userData.partName = 'legs'
          }
          objectRoots.set(f.id, group)
        }

        if (isSelected || isHovered) {
          const outlineGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(fw + 0.04, fh + 0.04, fd + 0.04))
          const outlineMat = new THREE.LineBasicMaterial({
            color: isSelected ? 0x0f766e : 0x14b8a6,
          })
          const outline = new THREE.LineSegments(outlineGeo, outlineMat)
          outline.position.y = fh / 2
          group.add(outline)
        }

        if (resolvedAsset.kind !== 'glb' && f.part_materials) {
          Object.entries(f.part_materials || {}).forEach(([partId, matId]: [string, any]) => {
            const pbrEntry = getPbrMaterialById(String(matId))
            if (!pbrEntry) return
            group.traverse((node) => {
              const m = node as THREE.Mesh
              if (m.isMesh && (m.userData?.partName === partId || partId === 'all')) {
                m.material = new THREE.MeshStandardMaterial({
                  map: loadPbrMap(pbrEntry.diffuse_url, 1 / pbrEntry.repeat_scale_m[0], 1 / pbrEntry.repeat_scale_m[1], true),
                  roughnessMap: loadPbrMap(pbrEntry.roughness_url, 1 / pbrEntry.repeat_scale_m[0], 1 / pbrEntry.repeat_scale_m[1], false),
                  normalMap: loadPbrMap(pbrEntry.normal_url, 1 / pbrEntry.repeat_scale_m[0], 1 / pbrEntry.repeat_scale_m[1], false),
                  normalScale: new THREE.Vector2(0.3, 0.3),
                  color: new THREE.Color(pbrEntry.base_color),
                  roughness: pbrEntry.roughness,
                  metalness: pbrEntry.metalness,
                })
                m.userData.assignedMaterialId = pbrEntry.id
              }
            })
          })
        }

        if (resolvedAsset.kind !== 'glb') {
          placement.register(f.id, group)
        }

        group.position.set((f.x_mm ?? 2000) / 1000, (f.z_mm ?? 0) / 1000, (f.y_mm ?? 2500) / 1000)
        group.rotation.y = -((f.rotation_deg ?? 0) * Math.PI) / 180
        scene.add(group)
      })

      const onMaterialPreview = (event: Event) => {
        const detail = (event as CustomEvent).detail || {}
        const root = objectRoots.get(detail.objectId)
        const definition = materialDefinitions.get(detail.override?.material_id)
        if (!root || !definition || !detail.sourceMaterialName) return
        const result = applyMaterialOverrideToObject(
          root,
          detail.sourceMaterialName,
          definition,
          detail.override
        )
        const metrics = ((window as any).__ATELIER_MATERIAL_METRICS__ ||= {})
        metrics.materialApplyCount = (metrics.materialApplyCount || 0) + 1
        metrics.lastChangedMeshCount = result.changedMeshCount
        metrics.disposedMaterialCount =
          (metrics.disposedMaterialCount || 0) + result.disposedMaterialCount
        renderScene()
      }
      window.addEventListener('atelier:material-preview', onMaterialPreview)

      renderScene()

      // Real orbit/top/walk controller + raycasting selection + pane-local resize.
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      const pickAtPointer = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(pickableMeshes, false).filter((hit) => {
          for (let node: THREE.Object3D | null = hit.object; node; node = node.parent) {
            if (!node.visible) return false
          }
          return true
        })
        if (hits.length > 0 && hits[0].object.userData?.entityId) {
          const hitData = hits[0].object.userData
          onSelectEntity(hitData.entityId)
          if (hitData.partName) {
            window.dispatchEvent(
              new CustomEvent('atelier:select-part', {
                detail: { entityId: hitData.entityId, partName: hitData.partName },
              })
            )
          }
        }
      }
      const sceneBounds = new THREE.Box3(
        new THREE.Vector3(roomMinX / 1000 - grassPad, -0.09, roomMinY / 1000 - grassPad),
        new THREE.Vector3(
          roomMaxX / 1000 + grassPad,
          dollhouseCut ? DOLLHOUSE_CUT_H + 0.15 : roomHeightMm / 1000,
          roomMaxY / 1000 + patioDepth + grassPad
        ),
      )
      const cameraController = createStudioCameraController(
        camera,
        renderer.domElement,
        sceneBounds,
        renderScene,
        pickAtPointer,
      )
      cameraControllerRef.current = cameraController
      cameraController.setMode(cameraPreset === 'top' || cameraPreset === 'walk' ? cameraPreset : 'orbit', true)
      cameraController.setVisible(viewMode !== '2d')

      const resizeObs = new ResizeObserver(() => {
        if (!container) return
        const nw = container.clientWidth
        const nh = container.clientHeight
        if (nw > 0 && nh > 0) {
          renderer.setSize(nw, nh)
          if (composer) composer.setSize(nw, nh)
          cameraController.resize(nw / nh)
        }
      })
      resizeObs.observe(container)

      return () => {
        disposed = true
        placement.dispose()
        placementRef.current = null
        reducedMotion.removeEventListener('change', motionChanged)
        cameraControllerRef.current = null
        cutawayWallsRef.current = []
        resizeObs.disconnect()
        cameraController.dispose()
        window.removeEventListener('atelier:material-preview', onMaterialPreview)
        let disposedMaterialCount = 0
        objectRoots.forEach((root) => {
          disposedMaterialCount += disposeOwnedMaterials(root)
        })
        const metrics = ((window as any).__ATELIER_MATERIAL_METRICS__ ||= {})
        metrics.disposedMaterialCount = (metrics.disposedMaterialCount || 0) + disposedMaterialCount
        environmentTarget.dispose()
        pmremGenerator.dispose()
        if (composer) composer.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }, [
      project,
      materialsDb,
      lightingPreset,
      lowSpecMode,
      theme,
      visibleLayers.grid,
      pbrMaterials,
      ceilingVisible,
      ssaoEnabled,
      animationEnabled,
    ])

    useEffect(() => {
      if (viewMode === '2d' || lowSpecMode) placementRef.current?.dispose()
    }, [viewMode, lowSpecMode])

    useEffect(() => {
      const controller = cameraControllerRef.current
      if (!controller) return
      const mode: StudioCameraMode = cameraPreset === 'top' || cameraPreset === 'walk' ? cameraPreset : 'orbit'
      controller.setMode(mode)
      controller.setVisible(viewMode !== '2d')
    }, [cameraPreset, viewMode])

    useEffect(() => {
      const active = cutawayEnabled || !ceilingVisible
      cutawayWallsRef.current.forEach(({ mesh, capMesh, bottom, top }) => {
        const fullHeight = top - bottom
        const visibleTop = active ? Math.min(top, 1.12) : top
        mesh.visible = visibleTop > bottom
        mesh.scale.y = mesh.visible ? (visibleTop - bottom) / fullHeight : 1
        mesh.position.y = mesh.visible ? (bottom + visibleTop) / 2 : (bottom + top) / 2
        if (capMesh) {
          capMesh.visible = active && mesh.visible && visibleTop >= 1.11
        }
      })
      cameraControllerRef.current?.render()
    }, [cutawayEnabled, ceilingVisible])

    useEffect(() => {
      const commandType = cameraCommand?.type
      if (!commandType) return
      const controller = cameraControllerRef.current
      if (commandType === 'fit') {
        planCamera.fit()
        controller?.fit()
        return
      }
      if (commandType === 'reset') {
        planCamera.fit()
        const mode: StudioCameraMode = cameraPreset === 'top' || cameraPreset === 'walk' ? cameraPreset : 'orbit'
        controller?.setMode(mode, true)
        return
      }
      if (!selectedEntity) return
      if ('x_mm' in selectedEntity) {
        const width = selectedEntity.width_mm || 800
        const depth = selectedEntity.depth_mm || 800
        const focusBounds = {
          minX: selectedEntity.x_mm - width / 2,
          minY: selectedEntity.y_mm - depth / 2,
          maxX: selectedEntity.x_mm + width / 2,
          maxY: selectedEntity.y_mm + depth / 2,
        }
        planCamera.fit(focusBounds)
        controller?.fit(new THREE.Box3(
          new THREE.Vector3(focusBounds.minX / 1000, 0, focusBounds.minY / 1000),
          new THREE.Vector3(focusBounds.maxX / 1000, (selectedEntity.height_mm || 750) / 1000, focusBounds.maxY / 1000),
        ))
      } else if (selectedEntity.start_mm && selectedEntity.end_mm) {
        const padding = Math.max(selectedEntity.thickness_mm || 200, 300)
        const focusBounds = {
          minX: Math.min(selectedEntity.start_mm[0], selectedEntity.end_mm[0]) - padding,
          minY: Math.min(selectedEntity.start_mm[1], selectedEntity.end_mm[1]) - padding,
          maxX: Math.max(selectedEntity.start_mm[0], selectedEntity.end_mm[0]) + padding,
          maxY: Math.max(selectedEntity.start_mm[1], selectedEntity.end_mm[1]) + padding,
        }
        planCamera.fit(focusBounds)
        controller?.fit(new THREE.Box3(
          new THREE.Vector3(focusBounds.minX / 1000, 0, focusBounds.minY / 1000),
          new THREE.Vector3(focusBounds.maxX / 1000, (selectedEntity.height_mm || roomHeightMm) / 1000, focusBounds.maxY / 1000),
        ))
      }
    }, [cameraCommand?.id])

    // ==========================================================================
    // 2D INTERACTIVE SVG ARCHITECTURAL PLAN OVERLAY
    // ==========================================================================
    const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggingId || !onMoveFurniture) return
      const svg = e.currentTarget
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse())
      const clampedX = Math.max(roomMinX + 400, Math.min(roomMaxX - 400, Math.round(cursor.x / 50) * 50))
      const clampedY = Math.max(roomMinY + 400, Math.min(roomMaxY - 400, Math.round(cursor.y / 50) * 50))
      onMoveFurniture(draggingId, clampedX, clampedY)
    }

    return (
      <div
        className="viewport-stage-wrapper"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: viewMode === 'split' && !lowSpecMode ? `${splitPercent}% ${100 - splitPercent}%` : '1fr',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 2D CAD Architectural Plan Canvas */}
        {(viewMode === '2d' || viewMode === 'split' || lowSpecMode) && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: theme === 'dark' ? '#111113' : '#FFFFFF',
              borderRight: viewMode === 'split' && !lowSpecMode ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '52px 16px 46px',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <svg
                ref={planCamera.svgRef}
                viewBox={`${planCamera.viewBox.x} ${planCamera.viewBox.y} ${planCamera.viewBox.width} ${planCamera.viewBox.height}`}
                style={{ width: '100%', height: '100%', maxHeight: '100%', userSelect: 'none' }}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={() => setDraggingId(null)}
                onPointerDown={planCamera.onPointerDown}
                onPointerMove={planCamera.onPointerMove}
                onPointerUp={planCamera.onPointerEnd}
                onPointerCancel={planCamera.onPointerEnd}
                tabIndex={0}
                role="img"
                aria-label="Bản vẽ mặt bằng kỹ thuật 2D tỷ lệ 1:1"
              >
                <defs>
                  <pattern
                    id="floorTileGrid2D"
                    width={Math.max(180, floorMatInfo.tile_width_mm || 600)}
                    height={Math.max(180, floorMatInfo.tile_length_mm || 600)}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      width={Math.max(180, floorMatInfo.tile_width_mm || 600)}
                      height={Math.max(180, floorMatInfo.tile_length_mm || 600)}
                      fill={floorMatInfo.hex_color || '#EFECE6'}
                      fillOpacity={theme === 'dark' ? 0.16 : 0.25}
                      stroke={theme === 'dark' ? '#27272A' : '#E5E7EB'}
                      strokeWidth={14}
                    />
                  </pattern>
                </defs>

                {/* Room Floor Polygon */}
                <polygon
                  points={poly.map((p: number[]) => `${p[0]},${p[1]}`).join(' ')}
                  fill="url(#floorTileGrid2D)"
                  stroke={selectedEntityId === 'floor_main' ? '#0F766E' : theme === 'dark' ? '#52525B' : '#171717'}
                  strokeWidth={selectedEntityId === 'floor_main' ? 32 : 20}
                  onClick={() => onSelectEntity('floor_main')}
                  style={{ cursor: 'pointer' }}
                />

                {/* Dimension Chains (Top & Left) */}
                {visibleLayers.dimensions && (
                  <g stroke="#0F766E" strokeWidth={15} fill="#0F766E">
                    <line x1={0} y1={-250} x2={roomW} y2={-250} />
                    <line x1={0} y1={-330} x2={0} y2={-170} />
                    <line x1={roomW} y1={-330} x2={roomW} y2={-170} />
                    <text x={roomW / 2} y={-310} textAnchor="middle" fontSize={135} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
                      {roomW} mm ({(roomW / 1000).toFixed(2)}m)
                    </text>

                    <line x1={-250} y1={0} x2={-250} y2={roomD} />
                    <line x1={-330} y1={0} x2={-170} y2={0} />
                    <line x1={-330} y1={roomD} x2={-170} y2={roomD} />
                    <text
                      x={-320}
                      y={roomD / 2}
                      textAnchor="middle"
                      fontSize={135}
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight={600}
                      transform={`rotate(-90, -320, ${roomD / 2})`}
                    >
                      {roomD} mm ({(roomD / 1000).toFixed(2)}m)
                    </text>
                  </g>
                )}

                {/* Walls with Face A / Accent Wall highlight */}
                {walls.map((w: any) => {
                  const pMat = paintsById[w.face_a_material_id]
                  const isSel = selectedEntityId === w.id
                  const strokeCol = isSel
                    ? '#0F766E'
                    : w.is_accent_wall
                    ? pMat?.hex_color || '#0F766E'
                    : theme === 'dark'
                    ? '#E4E4E7'
                    : '#171717'
                  return (
                    <g key={w.id} onClick={() => onSelectEntity(w.id)} style={{ cursor: 'pointer' }}>
                      <line
                        x1={w.start_mm[0]}
                        y1={w.start_mm[1]}
                        x2={w.end_mm[0]}
                        y2={w.end_mm[1]}
                        stroke={strokeCol}
                        strokeWidth={w.thickness_mm || 200}
                        strokeLinecap="square"
                      />
                      {w.is_accent_wall && (
                        <text
                          x={(w.start_mm[0] + w.end_mm[0]) / 2 + 190}
                          y={(w.start_mm[1] + w.end_mm[1]) / 2}
                          fontSize={112}
                          fontFamily="'Inter', -apple-system, sans-serif"
                          fill="#0F766E"
                          fontWeight={600}
                          transform={`rotate(90, ${(w.start_mm[0] + w.end_mm[0]) / 2 + 190}, ${(w.start_mm[1] + w.end_mm[1]) / 2})`}
                        >
                          TƯỜNG NHẤN ({pMat?.name || w.face_a_material_id})
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Doors & Swing Arcs */}
                {doors.map((d: any) => {
                  const w = walls.find((item: any) => item.id === d.wall_id) || walls[2]
                  if (!w) return null
                  const cx = w.start_mm[0] + (w.end_mm[0] - w.start_mm[0]) * (d.t ?? 0.3)
                  const cy = w.start_mm[1] + (w.end_mm[1] - w.start_mm[1]) * (d.t ?? 0.3)
                  const angleDeg = (Math.atan2(w.end_mm[1] - w.start_mm[1], w.end_mm[0] - w.start_mm[0]) * 180) / Math.PI
                  const dw = d.width_mm || 900
                  const hingesLeft = d.hinges_side !== 'right'
                  const hingeX = hingesLeft ? cx - dw / 2 : cx + dw / 2
                  const closedX = hingesLeft ? cx + dw / 2 : cx - dw / 2
                  const direction = hingesLeft ? 1 : -1
                  const inwardSign = d.swing_direction === 'outward' ? -1 : 1
                  const swingAngle = (65 * Math.PI) / 180
                  const openX = hingeX + direction * dw * Math.cos(swingAngle)
                  const openY = cy + inwardSign * dw * Math.sin(swingAngle)
                  const gapColor = theme === 'dark' ? '#18181B' : '#FFFFFF'
                  return (
                    <g key={d.id} transform={`rotate(${angleDeg}, ${cx}, ${cy})`}>
                      <line x1={cx - dw / 2} y1={cy} x2={cx + dw / 2} y2={cy} stroke={gapColor} strokeWidth={(w.thickness_mm || 200) + 36} />
                      <line x1={cx - dw / 2} y1={cy - 105} x2={cx - dw / 2} y2={cy + 105} stroke="#B45309" strokeWidth={22} />
                      <line x1={cx + dw / 2} y1={cy - 105} x2={cx + dw / 2} y2={cy + 105} stroke="#B45309" strokeWidth={22} />
                      <line x1={hingeX} y1={cy} x2={openX} y2={openY} stroke="#B45309" strokeWidth={32} strokeLinecap="round" />
                      {visibleLayers.doorSwings && (
                        <path
                          d={`M ${closedX} ${cy} A ${dw} ${dw} 0 0 ${hingesLeft ? 1 : 0} ${openX} ${openY}`}
                          fill="rgba(180, 83, 9, 0.08)"
                          stroke="#B45309"
                          strokeWidth={14}
                          strokeDasharray="40,30"
                        />
                      )}
                      {visibleLayers.dimensions && (
                        <text x={cx} y={cy + 240} textAnchor="middle" fontSize={110} fill="#B45309" fontFamily="'JetBrains Mono', monospace">
                          Cửa {dw}mm
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Windows */}
                {windows.map((win: any) => {
                  const w = walls.find((item: any) => item.id === win.wall_id) || walls[0]
                  if (!w) return null
                  const cx = w.start_mm[0] + (w.end_mm[0] - w.start_mm[0]) * (win.t ?? 0.5)
                  const cy = w.start_mm[1] + (w.end_mm[1] - w.start_mm[1]) * (win.t ?? 0.5)
                  const angleDeg = (Math.atan2(w.end_mm[1] - w.start_mm[1], w.end_mm[0] - w.start_mm[0]) * 180) / Math.PI
                  const ww = win.width_mm || 1500
                  const gapColor = theme === 'dark' ? '#18181B' : '#FFFFFF'
                  return (
                    <g key={win.id} transform={`rotate(${angleDeg}, ${cx}, ${cy})`}>
                      <line x1={cx - ww / 2} y1={cy} x2={cx + ww / 2} y2={cy} stroke={gapColor} strokeWidth={(w.thickness_mm || 200) + 36} />
                      <line x1={cx - ww / 2} y1={cy - 42} x2={cx + ww / 2} y2={cy - 42} stroke="#0284C7" strokeWidth={20} />
                      <line x1={cx - ww / 2} y1={cy + 42} x2={cx + ww / 2} y2={cy + 42} stroke="#0284C7" strokeWidth={20} />
                      <line x1={cx - ww / 2} y1={cy - 82} x2={cx - ww / 2} y2={cy + 82} stroke="#0284C7" strokeWidth={24} />
                      <line x1={cx} y1={cy - 82} x2={cx} y2={cy + 82} stroke="#0284C7" strokeWidth={18} />
                      <line x1={cx + ww / 2} y1={cy - 82} x2={cx + ww / 2} y2={cy + 82} stroke="#0284C7" strokeWidth={24} />
                      {visibleLayers.dimensions && (
                        <text x={cx} y={cy - 140} textAnchor="middle" fontSize={105} fill="#0284C7" fontFamily="'JetBrains Mono', monospace">
                          Cửa sổ {ww}mm
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Furniture Footprints (Draggable & Selectable) */}
                {furniture.map((f: any) => {
                  const rot = Math.round(f.rotation_deg || 0) % 360
                  const fw = rot === 90 || rot === 270 ? f.depth_mm : f.width_mm
                  const fd = rot === 90 || rot === 270 ? f.width_mm : f.depth_mm
                  const x0 = f.x_mm - fw / 2
                  const y0 = f.y_mm - fd / 2
                  const isSel = selectedEntityId === f.id
                  const isHov = hoveredEntityId === f.id
                  return (
                    <g
                      key={f.id}
                      onMouseEnter={() => setHoveredEntityId(f.id)}
                      onMouseLeave={() => setHoveredEntityId(null)}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        onSelectEntity(f.id)
                        setDraggingId(f.id)
                      }}
                      style={{ cursor: 'grab' }}
                    >
                      <rect
                        x={x0}
                        y={y0}
                        width={fw}
                        height={fd}
                        rx={42}
                        fill={f.color_hex || '#E4DDD3'}
                        stroke={isSel ? '#0F766E' : isHov ? '#14B8A6' : '#171717'}
                        strokeWidth={isSel ? 34 : isHov ? 24 : 15}
                      />
                      {visibleLayers.furnitureLabels && (
                        <>
                          <text
                            x={f.x_mm}
                            y={f.y_mm - 26}
                            textAnchor="middle"
                            fontSize={110}
                            fontFamily="'Inter', -apple-system, sans-serif"
                            fontWeight={600}
                            fill="#171717"
                          >
                            {f.name}
                          </text>
                          <text
                            x={f.x_mm}
                            y={f.y_mm + 110}
                            textAnchor="middle"
                            fontSize={96}
                            fontFamily="'JetBrains Mono', monospace"
                            fill="#52525B"
                          >
                            {Math.round(f.width_mm)}×{Math.round(f.depth_mm)}mm
                          </text>
                        </>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        )}

        {viewMode === 'split' && !lowSpecMode && (
          <button
            type="button"
            className="viewport-split-handle"
            style={{ left: `${splitPercent}%` }}
            aria-label="Thay đổi tỷ lệ pane 2D và 3D"
            onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
              const rect = event.currentTarget.parentElement?.getBoundingClientRect()
              if (!rect) return
              setSplitPercent(Math.max(25, Math.min(75, ((event.clientX - rect.left) / rect.width) * 100)))
            }}
            onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
          />
        )}

        {/* 3D WebGL Pascal Viewer */}
        {!lowSpecMode && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: viewMode === '2d' ? 'none' : 'flex', flexDirection: 'column' }}>
            <div
              ref={mountRef}
              data-testid="viewport-3d-canvas"
              style={{ flex: '1 1 0', width: '100%', height: '100%', minWidth: 0, minHeight: 320, overflow: 'hidden' }}
            />
          </div>
        )}

        {!lowSpecMode && viewMode !== '2d' && (
          <div style={{ position: 'absolute', right: 12, bottom: 48, zIndex: 20, maxWidth: 'calc(100% - 24px)', padding: '6px 10px', borderRadius: 8, background: 'var(--card, #ffffff)', color: 'var(--foreground, #18181b)', fontSize: 12, border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={animationEnabled} onChange={(event) => setAnimationEnabled(event.target.checked)} />
              <span>Minh hoạ bố trí đồ</span>
            </label>
            {placementStatus && <div role="status" aria-live="polite" style={{ fontSize: 11, color: 'var(--muted-foreground, #71717a)', marginTop: 2 }}>{placementStatus}</div>}
          </div>
        )}

        {/* Bottom-Left HUD: Scene Validation, HDRI/SSAO/Ceiling Toggles, XYZ Gizmo & Active Selection Dimensions */}
        <div className="viewport-hud-bottom-left">
          <div
            className="viewport-hud-pill"
            data-testid="hud-scene-valid"
            style={{
              borderColor: validationReport.valid
                ? validationReport.issues.length > 0
                  ? '#F59E0B'
                  : 'var(--border-subtle)'
                : '#EF4444',
            }}
            title={
              validationReport.issues.length > 0
                ? validationReport.issues.map((i) => `[${i.code}] ${i.message}`).join('\n')
                : 'Tất cả vật thể hợp lệ trong đa giác phòng, không chồng lấn, chiều cao chuẩn, cửa khớp tường.'
            }
          >
            {validationReport.valid ? (
              <CheckCircle2 size={12} style={{ color: validationReport.issues.length > 0 ? '#F59E0B' : '#10B981' }} />
            ) : (
              <AlertTriangle size={12} style={{ color: '#EF4444' }} />
            )}
            <span className="mono" style={{ fontWeight: 600 }}>
              {validationReport.valid
                ? validationReport.issues.length > 0
                  ? `Validator: VALID (${validationReport.issues.length} lưu ý)`
                  : 'Validator: VALID'
                : `Validator: ${validationReport.issues.filter((i) => i.severity === 'error').length} LỖI`}
            </span>
            <span>• {roomW / 1000}×{roomD / 1000}m ({poly.length} đỉnh)</span>
          </div>

          {!validationReport.valid && (
            <div
              data-testid="hud-validation-errors"
              style={{
                background: 'rgba(254, 242, 242, 0.96)',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 11,
                maxWidth: 420,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              {validationReport.issues.slice(0, 3).map((issue, idx) => (
                <div key={idx} style={{ lineHeight: 1.35 }}>
                  <strong>[{issue.code}]</strong> {issue.message}
                </div>
              ))}
            </div>
          )}

          <div className="viewport-hud-pill" data-testid="hud-hdri-status" title="Poly Haven CC0-1.0 Equirectangular HDRI">
            <Sparkles size={12} style={{ color: hdriLoaded ? '#10B981' : '#F59E0B' }} />
            <span className="mono" style={{ fontSize: 11 }}>
              {hdriLoaded ? 'HDRI CC0: Loft Hall 1K' : 'IBL Studio'}
            </span>
          </div>

          <button
            type="button"
            data-testid="toggle-ssao-btn"
            className="viewport-hud-pill"
            onClick={() => setSsaoEnabled((v) => !v)}
            style={{
              cursor: 'pointer',
              borderColor: ssaoEnabled ? 'var(--accent-border)' : 'var(--border-subtle)',
              background: ssaoEnabled ? 'var(--accent-soft)' : 'var(--surface-primary)',
            }}
            title="Bật/tắt Screen-Space Ambient Occlusion (SSAO)"
          >
            <Eye size={12} style={{ color: ssaoEnabled ? 'var(--accent)' : 'var(--text-secondary)' }} />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>
              SSAO: {ssaoEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            data-testid="toggle-ceiling-btn"
            className="viewport-hud-pill"
            onClick={() => setCeilingVisible((v) => !v)}
            style={{
              cursor: 'pointer',
              borderColor: ceilingVisible ? 'var(--accent-border)' : 'var(--border-subtle)',
              background: ceilingVisible ? 'var(--accent-soft)' : 'var(--surface-primary)',
            }}
            title="Ẩn/hiện hệ trần thạch cao & đèn âm trần"
          >
            <Layers size={12} style={{ color: ceilingVisible ? 'var(--accent)' : 'var(--text-secondary)' }} />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>
              Trần: {ceilingVisible ? 'HIỆN' : 'ẨN'}
            </span>
          </button>

          <div className="xyz-gizmo-badge" title="Hệ tọa độ chuẩn BIM (mm -> m)">
            <span style={{ color: '#EF4444' }}>X</span>
            <span style={{ color: '#10B981' }}>Y</span>
            <span style={{ color: '#3B82F6' }}>Z</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>1:1 mm</span>
          </div>

          {selectedEntity && (
            <div className="viewport-hud-pill" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-soft)' }}>
              <strong style={{ color: 'var(--accent)' }}>{selectedEntity.name || selectedEntity.id}</strong>
              {selectedEntity.width_mm && (
                <span className="mono" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(selectedEntity.width_mm)}×{Math.round(selectedEntity.depth_mm)}×{Math.round(selectedEntity.height_mm)} mm
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)
