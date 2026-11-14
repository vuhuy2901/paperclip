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
  applyMaterialOverrideToObject,
  disposeOwnedMaterials,
  type MaterialDefinitionValue,
} from './materialResolver'
import { Eye, Sparkles, Layers } from 'lucide-react'

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
    const cameraControllerRef = useRef<ReturnType<typeof createStudioCameraController> | null>(null)
    const cutawayWallsRef = useRef<Array<{ mesh: THREE.Mesh; bottom: number; top: number; cutaway: boolean }>>([])
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
      furniture.find((f: any) => f.id === selectedEntityId) ||
      walls.find((w: any) => w.id === selectedEntityId) ||
      null

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
        day: theme === 'dark' ? '#15171A' : '#E9EEF1',
        sunset: '#4A332F',
        night: '#0B1020',
      }
      scene.background = new THREE.Color(backgroundByPreset[lightingPreset])

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
      const cx = (roomMinX + roomMaxX) / 2000
      const cz = (roomMinY + roomMaxY) / 2000
      camera.position.set(cx + Math.max(4.2, roomW / 1050), 4.3, cz + Math.max(4.8, roomD / 1050))
      camera.lookAt(cx, 0.8, cz)

      const renderer = new THREE.WebGLRenderer({ antialias: !lowSpecMode, preserveDrawingBuffer: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowSpecMode ? 1.0 : 1.75))
      renderer.shadowMap.enabled = !lowSpecMode
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = lightingPreset === 'day' ? 1.08 : lightingPreset === 'sunset' ? 0.92 : 0.65
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

      // Studio Architectural Lighting (Section 6.2)
      const hemiIntensity = lightingPreset === 'day' ? 0.72 : lightingPreset === 'sunset' ? 0.42 : 0.18
      const hemiLight = new THREE.HemisphereLight(
        lightingPreset === 'sunset' ? 0xffd7b0 : 0xffffff,
        lightingPreset === 'night' ? 0x091126 : 0x6b625b,
        hemiIntensity
      )
      hemiLight.position.set(0, 12, 0)
      scene.add(hemiLight)

      const dirLight = new THREE.DirectionalLight(
        lightingPreset === 'sunset' ? 0xff9b63 : 0xfffdf8,
        lightingPreset === 'day' ? 1.05 : lightingPreset === 'sunset' ? 0.72 : 0.12
      )
      dirLight.position.set(6.5, 11, 7.5)
      dirLight.castShadow = !lowSpecMode
      dirLight.shadow.mapSize.width = 1024
      dirLight.shadow.mapSize.height = 1024
      dirLight.shadow.bias = -0.0005
      scene.add(dirLight)

      const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.28)
      fillLight.position.set(-5, 6, -4)
      scene.add(fillLight)

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

      if (visibleLayers.grid) {
        const grid = new THREE.GridHelper(
          16,
          32,
          theme === 'dark' ? 0x27272a : 0xd4d4d8,
          theme === 'dark' ? 0x18181b : 0xe5e7eb
        )
        grid.position.set(cx, -0.01, cz)
        scene.add(grid)
      }

      const pickableMeshes: THREE.Object3D[] = []
      const gltfLoader = new GLTFLoader()
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

      // 1. Floor Slab with Section 7B / G4 Tile & Grout UV Scale
      const floorTex = createProceduralTileTexture(
        floorMatInfo.hex_color || '#C8A986',
        floorMatInfo.tile_width_mm || 600,
        floorMatInfo.tile_length_mm || 600,
        roomW,
        roomD,
        floorMatInfo.layout_pattern || 'straight',
        floorMatInfo.grout_width_mm ?? 3,
        floorMatInfo.grout_color || '#B8B1A6',
        floorMatInfo.rotation_deg || 0,
        floorMatInfo.texture_origin_mm || [0, 0]
      )
      const floorGeo = new THREE.BoxGeometry(roomW / 1000, 0.08, roomD / 1000)
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: floorMatInfo.roughness ?? 0.48,
        metalness: 0.04,
      })
      const floorMesh = new THREE.Mesh(floorGeo, floorMat)
      floorMesh.position.set(cx, -0.04, cz)
      floorMesh.receiveShadow = true
      floorMesh.name = 'FLOOR_SLAB_MAIN'
      scene.add(floorMesh)

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

      // 2. Walls (with Face A / Accent Wall color & Cutaway support)
      cutawayWallsRef.current = []
      walls.forEach((w: any, idx: number) => {
        const isCutawayWall = w.id === 'wall_south' || w.id === 'wall_east' || idx === 1 || idx === 2
        const isFrontCutaway = cutawayEnabled && isCutawayWall

        const x0 = w.start_mm[0] / 1000
        const z0 = w.start_mm[1] / 1000
        const x1 = w.end_mm[0] / 1000
        const z1 = w.end_mm[1] / 1000
        const len = Math.hypot(x1 - x0, z1 - z0)
        const rawH = (w.height_mm || 2800) / 1000
        const th = (w.thickness_mm || 200) / 1000
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
              const bottom = (win.sill_height_mm ?? 900) / 1000
              return { start: center - width / 2, end: center + width / 2, bottom, top: bottom + (win.height_mm || 1400) / 1000 }
            }),
        ]
        const solidRects = buildWallSolidRects(len, rawH, cuts)

        const pMat = paintsById[w.face_a_material_id] || { hex_color: '#F5F2EB', roughness: 0.82 }
        const isSelected = w.id === selectedEntityId
        const wallMat = new THREE.MeshStandardMaterial({
          color: pMat.hex_color || '#F5F2EB',
          roughness: pMat.roughness ?? 0.82,
          transparent: isFrontCutaway,
          opacity: isFrontCutaway ? 0.45 : 1.0,
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
          wallMesh.castShadow = !isFrontCutaway
          wallMesh.receiveShadow = true
          wallMesh.userData = { entityId: w.id }
          if (isFrontCutaway) {
            const visibleTop = Math.min(rect.top, 0.32)
            if (visibleTop <= rect.bottom) {
              wallMesh.visible = false
            } else {
              wallMesh.scale.y = (visibleTop - rect.bottom) / segmentHeight
              wallMesh.position.y = (rect.bottom + visibleTop) / 2
            }
          }
          scene.add(wallMesh)
          cutawayWallsRef.current.push({ mesh: wallMesh, bottom: rect.bottom, top: rect.top, cutaway: isCutawayWall })
          if (!isFrontCutaway) pickableMeshes.push(wallMesh)
        })

        if (room?.wall_tile_zone?.enabled && !isFrontCutaway) {
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

      // 3. Embedded door leaves and window frames
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
        const height = (door.height_mm || 2100) / 1000
        const frameSize = 0.06
        const wallDepth = ((w.thickness_mm || 200) / 1000) + 0.035
        const doorGroup = new THREE.Group()
        doorGroup.position.set(centerX, 0, centerZ)
        doorGroup.rotation.y = -angle

        const frameMat = new THREE.MeshStandardMaterial({ color: '#E7E2D8', roughness: 0.58 })
        const leafMat = new THREE.MeshStandardMaterial({ color: '#C6905B', roughness: 0.62 })
        const addDoorPart = (partWidth: number, partHeight: number, partDepth: number, x: number, y: number) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(partWidth, partHeight, partDepth), frameMat)
          mesh.position.set(x, y, 0)
          mesh.castShadow = true
          mesh.userData = { entityId: door.id }
          doorGroup.add(mesh)
          pickableMeshes.push(mesh)
        }
        addDoorPart(frameSize, height + frameSize, wallDepth, -width / 2 - frameSize / 2, (height + frameSize) / 2)
        addDoorPart(frameSize, height + frameSize, wallDepth, width / 2 + frameSize / 2, (height + frameSize) / 2)
        addDoorPart(width + frameSize * 2, frameSize, wallDepth, 0, height + frameSize / 2)

        const hingesLeft = door.hinges_side !== 'right'
        const pivot = new THREE.Group()
        pivot.position.x = hingesLeft ? -width / 2 : width / 2
        const swing = Math.PI * 0.36 * (hingesLeft ? -1 : 1) * (door.swing_direction === 'outward' ? -1 : 1)
        pivot.rotation.y = swing
        const leafWidth = width - 0.035
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(leafWidth, height - 0.035, 0.045), leafMat)
        leaf.position.set(hingesLeft ? leafWidth / 2 : -leafWidth / 2, height / 2, 0)
        leaf.castShadow = true
        leaf.userData = { entityId: door.id }
        pivot.add(leaf)
        doorGroup.add(pivot)
        pickableMeshes.push(leaf)
        scene.add(doorGroup)
      })

      windows.forEach((win: any) => {
        const w = walls.find((item: any) => item.id === win.wall_id) || walls[0]
        if (!w) return
        const wx = (w.start_mm[0] + (w.end_mm[0] - w.start_mm[0]) * (win.t ?? 0.5)) / 1000
        const wz = (w.start_mm[1] + (w.end_mm[1] - w.start_mm[1]) * (win.t ?? 0.5)) / 1000
        const wallAngle = Math.atan2(w.end_mm[1] - w.start_mm[1], w.end_mm[0] - w.start_mm[0])
        const width = (win.width_mm || 1500) / 1000
        const height = (win.height_mm || 1400) / 1000
        const sill = (win.sill_height_mm ?? 900) / 1000
        const frameSize = 0.055
        const wallDepth = ((w.thickness_mm || 200) / 1000) + 0.025
        const windowGroup = new THREE.Group()
        windowGroup.position.set(wx, 0, wz)
        windowGroup.rotation.y = -wallAngle
        const glassMat = new THREE.MeshStandardMaterial({
          color: '#BAE6FD',
          transparent: true,
          opacity: 0.3,
          roughness: 0.1,
          metalness: 0.05,
        })
        const frameMat = new THREE.MeshStandardMaterial({ color: '#E7E2D8', roughness: 0.48 })
        const glass = new THREE.Mesh(new THREE.BoxGeometry(width - frameSize * 2, height - frameSize * 2, 0.02), glassMat)
        glass.position.y = sill + height / 2
        glass.userData = { entityId: win.id }
        windowGroup.add(glass)
        pickableMeshes.push(glass)
        const addWindowFrame = (partWidth: number, partHeight: number, x: number, y: number) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(partWidth, partHeight, wallDepth), frameMat)
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

        // Contact AO shadow plane under each furniture piece when SSAO/AO is enabled
        if (ssaoEnabled) {
          const aoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(fw * 1.04, fd * 1.04),
            new THREE.MeshBasicMaterial({
              color: 0x09090b,
              transparent: true,
              opacity: 0.2,
              depthWrite: false,
            })
          )
          aoPlane.rotation.x = -Math.PI / 2
          aoPlane.position.y = 0.002
          group.add(aoPlane)
        }

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

        if (f.normalized_glb) {
          gltfLoader.load(
            f.normalized_glb,
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
              model.traverse((node) => {
                if ((node as THREE.Mesh).isMesh) {
                  const mesh = node as THREE.Mesh
                  mesh.castShadow = !lowSpecMode
                  mesh.receiveShadow = true
                  mesh.userData = { ...mesh.userData, entityId: f.id, assetId: f.asset_id }
                  pickableMeshes.push(mesh)
                }
              })
              group.add(model)
              objectRoots.set(f.id, model)
              Object.entries(f.material_overrides || {}).forEach(([slotId, override]: [string, any]) => {
                const slot = (f.material_slots || []).find((item: any) => item.slot_id === slotId)
                const definition = materialDefinitions.get(override.material_id)
                if (slot && definition) {
                  applyMaterialOverrideToObject(model, slot.source_material_name, definition, override)
                }
              })
              const metrics = ((window as any).__ATELIER_MATERIAL_METRICS__ ||= {})
              metrics.glbLoadCount = Number.isFinite(metrics.glbLoadCount) ? metrics.glbLoadCount + 1 : 1
              const viewerState = ((window as any).__ATELIER_VIEWER_STATE__ ||= {})
              viewerState.loadedGlbCount = metrics.glbLoadCount
              metrics.meshUUIDs ||= {}
              metrics.meshUUIDs[f.id] = []
              model.traverse((node) => {
                if ((node as THREE.Mesh).isMesh) metrics.meshUUIDs[f.id].push(node.uuid)
              })
              renderScene()
            },
            undefined,
            (error) => {
              console.error(`Không thể tải GLB ${f.asset_id || f.id}`, error)
            }
          )
        } else if (f.category === 'bed' || f.category === 'double_bed') {
          const frameHeight = Math.min(0.28, fh * 0.3)
          const mattressHeight = Math.min(0.24, fh * 0.26)
          const headboardDepth = Math.min(0.14, fd * 0.09)
          addBoxPart(fw, frameHeight, fd * 0.94, 0, frameHeight / 2, fd * 0.02, 'bed-frame')
          addBoxPart(fw * 0.96, mattressHeight, fd * 0.86, 0, frameHeight + mattressHeight / 2, fd * 0.06, 'bed-mattress')
          addBoxPart(fw, fh, headboardDepth, 0, fh / 2, -fd / 2 + headboardDepth / 2, 'bed-headboard')
          addBoxPart(fw * 0.38, mattressHeight * 0.55, fd * 0.2, -fw * 0.23, frameHeight + mattressHeight * 1.12, -fd * 0.27, 'bed-pillow')
          addBoxPart(fw * 0.38, mattressHeight * 0.55, fd * 0.2, fw * 0.23, frameHeight + mattressHeight * 1.12, -fd * 0.27, 'bed-pillow')
          addBoxPart(fw * 0.88, 0.035, fd * 0.42, 0, frameHeight + mattressHeight + 0.035, fd * 0.18, 'bed-blanket')
        } else if (f.category === 'nightstand' || f.category === 'bedside_table') {
          const leg = Math.min(0.045, fw * 0.12, fd * 0.12)
          const bodyHeight = fh * 0.66
          const bodyBottom = fh * 0.25
          addBoxPart(fw, bodyHeight, fd, 0, bodyBottom + bodyHeight / 2, 0, 'nightstand-cabinet')
          addBoxPart(fw * 0.88, bodyHeight * 0.42, Math.min(0.025, fd * 0.08), 0, bodyBottom + bodyHeight * 0.68, fd / 2 + 0.012, 'nightstand-drawer')
          for (const x of [-fw / 2 + leg, fw / 2 - leg]) {
            for (const z of [-fd / 2 + leg, fd / 2 - leg]) addBoxPart(leg, bodyBottom, leg, x, bodyBottom / 2, z, 'nightstand-leg')
          }
        } else if (f.category === 'rug' || f.category === 'round_rug' || f.category === 'rug_round') {
          const rug = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, fh, 64), mainMat)
          rug.scale.set(fw, 1, fd)
          rug.position.y = fh / 2
          rug.castShadow = false
          rug.receiveShadow = true
          rug.userData = { entityId: f.id }
          group.add(rug)
          pickableMeshes.push(rug)
        } else if (f.category === 'tv_cabinet' || f.category === 'tv_console') {
          const shell = Math.min(0.035, fh * 0.16)
          addBoxPart(fw, shell, fd, 0, shell / 2, 0, 'tv-console-base')
          addBoxPart(fw, shell, fd, 0, fh - shell / 2, 0, 'tv-console-top')
          addBoxPart(shell, fh, fd, -fw / 2 + shell / 2, fh / 2, 0, 'tv-console-side')
          addBoxPart(shell, fh, fd, fw / 2 - shell / 2, fh / 2, 0, 'tv-console-side')
          addBoxPart(shell, fh, fd, 0, fh / 2, 0, 'tv-console-divider')
          addBoxPart(fw / 2 - shell * 2, fh - shell * 2, shell, -fw / 4, fh / 2, fd / 2 - shell / 2, 'tv-console-door')
          addBoxPart(fw / 2 - shell * 2, fh - shell * 2, shell, fw / 4, fh / 2, fd / 2 - shell / 2, 'tv-console-door')
        } else if (f.category === 'chair' || f.category === 'armchair' || f.category === 'desk_chair') {
          const leg = Math.min(0.055, fw * 0.12, fd * 0.12)
          const seatY = Math.min(fh * 0.55, 0.46)
          const seatH = Math.min(0.1, fh * 0.14)
          addBoxPart(fw * 0.86, seatH, fd * 0.82, 0, seatY, 0, 'chair-seat')
          addBoxPart(fw * 0.86, fh - seatY, Math.min(0.11, fd * 0.2), 0, seatY + (fh - seatY) / 2, -fd * 0.36, 'chair-back')
          for (const x of [-fw * 0.34, fw * 0.34]) {
            for (const z of [-fd * 0.32, fd * 0.32]) addBoxPart(leg, seatY, leg, x, seatY / 2, z, 'chair-leg')
          }
        } else if (f.category === 'bunk_bed' || f.category === 'bunkbed') {
          const post = Math.min(0.08, fw * 0.08, fd * 0.08)
          const frame = Math.min(0.1, fh * 0.08)
          const lowerY = Math.min(fh - frame / 2, 0.4 + frame / 2)
          const upperY = Math.min(fh - frame / 2, 1.4 + frame / 2)
          for (const x of [-fw / 2 + post / 2, fw / 2 - post / 2]) {
            for (const z of [-fd / 2 + post / 2, fd / 2 - post / 2]) {
              addBoxPart(post, fh, post, x, fh / 2, z, 'bunk-post')
            }
          }
          for (const y of [lowerY, upperY]) {
            addBoxPart(fw - post * 2, frame, fd - post * 2, 0, y, 0, 'bunk-frame')
            addBoxPart(fw - post * 2.5, frame * 0.7, fd - post * 2.5, 0, y + frame * 0.72, 0, 'mattress')
          }
          const guardY = Math.min(fh - post / 2, upperY + 0.18)
          addBoxPart(fw - post * 2, post, post, 0, guardY, -fd / 2 + post, 'guard-rail')
          const ladderX = fw / 2 - post * 1.4
          addBoxPart(post, upperY, post, ladderX, upperY / 2, fd / 2 + post, 'ladder-side')
          addBoxPart(post, upperY, post, ladderX - 0.42, upperY / 2, fd / 2 + post, 'ladder-side')
          for (let i = 1; i <= 5; i += 1) {
            addBoxPart(0.42, post, post, ladderX - 0.21, (upperY * i) / 6, fd / 2 + post, 'ladder-rung')
          }
        } else if (f.category === 'desk' || f.category === 'study_desk') {
          const topThickness = Math.min(0.06, fh * 0.12)
          const legWidth = Math.min(0.08, fw * 0.12)
          const legDepth = Math.min(0.08, fd * 0.18)
          addBoxPart(fw, topThickness, fd, 0, fh - topThickness / 2, 0, 'desk-top')
          for (const x of [-fw / 2 + legWidth, fw / 2 - legWidth]) {
            for (const z of [-fd / 2 + legDepth, fd / 2 - legDepth]) {
              addBoxPart(legWidth, fh - topThickness, legDepth, x, (fh - topThickness) / 2, z, 'desk-leg')
            }
          }
          addBoxPart(fw * 0.46, fh * 0.62, fd * 0.42, fw * 0.25, (fh * 0.62) / 2, fd * 0.25, 'desk-drawer')
        } else if (f.category === 'wardrobe') {
          const panel = Math.min(0.05, fw * 0.08, fd * 0.12)
          addBoxPart(fw, panel, fd, 0, panel / 2, 0, 'wardrobe-base')
          addBoxPart(fw, panel, fd, 0, fh - panel / 2, 0, 'wardrobe-top')
          addBoxPart(panel, fh, fd, -fw / 2 + panel / 2, fh / 2, 0, 'wardrobe-side')
          addBoxPart(panel, fh, fd, fw / 2 - panel / 2, fh / 2, 0, 'wardrobe-side')
          addBoxPart(fw / 2 - panel, fh - panel * 2, panel, -fw / 4, fh / 2, fd / 2 - panel / 2, 'wardrobe-door')
          addBoxPart(fw / 2 - panel, fh - panel * 2, panel, fw / 4, fh / 2, fd / 2 - panel / 2, 'wardrobe-door')
        } else if (f.category === 'bookshelf' || f.category === 'bookcase') {
          const panel = Math.min(0.045, fw * 0.12, fd * 0.12)
          addBoxPart(panel, fh, fd, -fw / 2 + panel / 2, fh / 2, 0, 'bookshelf-side')
          addBoxPart(panel, fh, fd, fw / 2 - panel / 2, fh / 2, 0, 'bookshelf-side')
          for (let i = 0; i <= 5; i += 1) {
            const y = panel / 2 + ((fh - panel) * i) / 5
            addBoxPart(fw, panel, fd, 0, y, 0, 'bookshelf-shelf')
          }
        } else if (f.category === 'stair' || f.category === 'staircase' || f.category === 'bunk_stair') {
          const count = 8
          const stepWidth = fw / count
          for (let i = 0; i < count; i += 1) {
            const stepHeight = (fh * (i + 1)) / count
            addBoxPart(stepWidth, stepHeight, fd, -fw / 2 + stepWidth * (i + 0.5), stepHeight / 2, 0, 'bunk-step')
          }
        } else if (f.category === 'sofa') {
          const base = new THREE.Mesh(new THREE.BoxGeometry(fw, fh * 0.46, fd), mainMat)
          base.position.y = fh * 0.23
          base.castShadow = true
          base.receiveShadow = true
          base.userData = { entityId: f.id }
          group.add(base)
          pickableMeshes.push(base)

          const back = new THREE.Mesh(new THREE.BoxGeometry(fw, fh * 0.54, fd * 0.22), mainMat)
          back.position.set(0, fh * 0.68, -fd * 0.39)
          back.castShadow = true
          back.userData = { entityId: f.id }
          group.add(back)
          pickableMeshes.push(back)

          const armL = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.08, fh * 0.62, fd), mainMat)
          armL.position.set(-fw * 0.46, fh * 0.31, 0)
          armL.castShadow = true
          group.add(armL)

          const armR = armL.clone()
          armR.position.set(fw * 0.46, fh * 0.31, 0)
          group.add(armR)
        } else if (f.category === 'coffee_table') {
          const top = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.05, fd), mainMat)
          top.position.y = fh - 0.025
          top.castShadow = true
          top.userData = { entityId: f.id }
          group.add(top)
          pickableMeshes.push(top)

          const legBase = new THREE.Mesh(new THREE.BoxGeometry(fw * 0.72, fh - 0.05, fd * 0.72), mainMat)
          legBase.position.y = (fh - 0.05) / 2
          legBase.castShadow = true
          legBase.userData = { entityId: f.id }
          group.add(legBase)
          pickableMeshes.push(legBase)
        } else {
          const box = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), mainMat)
          box.position.y = fh / 2
          box.castShadow = true
          box.receiveShadow = true
          box.userData = { entityId: f.id }
          group.add(box)
          pickableMeshes.push(box)
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
        const hits = raycaster.intersectObjects(pickableMeshes, false)
        if (hits.length > 0 && hits[0].object.userData?.entityId) {
          onSelectEntity(hits[0].object.userData.entityId)
        }
      }
      const sceneBounds = new THREE.Box3(
        new THREE.Vector3(geometryMinX / 1000, -0.05, geometryMinY / 1000),
        new THREE.Vector3(geometryMaxX / 1000, roomHeightMm / 1000, geometryMaxY / 1000),
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
    ])

    useEffect(() => {
      const controller = cameraControllerRef.current
      if (!controller) return
      const mode: StudioCameraMode = cameraPreset === 'top' || cameraPreset === 'walk' ? cameraPreset : 'orbit'
      controller.setMode(mode)
      controller.setVisible(viewMode !== '2d')
    }, [cameraPreset, viewMode])

    useEffect(() => {
      cutawayWallsRef.current.forEach(({ mesh, bottom, top, cutaway }) => {
        const active = cutawayEnabled && cutaway
        const fullHeight = top - bottom
        const visibleTop = active ? Math.min(top, 0.32) : top
        mesh.visible = visibleTop > bottom
        mesh.scale.y = mesh.visible ? (visibleTop - bottom) / fullHeight : 1
        mesh.position.y = mesh.visible ? (bottom + visibleTop) / 2 : (bottom + top) / 2
        const material = mesh.material as THREE.MeshStandardMaterial
        material.transparent = active
        material.opacity = active ? 0.45 : 1
        material.needsUpdate = true
      })
      cameraControllerRef.current?.render()
    }, [cutawayEnabled])

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
                  stroke={theme === 'dark' ? '#52525B' : '#171717'}
                  strokeWidth={20}
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

        {/* Bottom-Left HUD: Scene Validation, HDRI/SSAO/Ceiling Toggles, XYZ Gizmo & Active Selection Dimensions */}
        <div className="viewport-hud-bottom-left">
          <div className="viewport-hud-pill" data-testid="hud-scene-valid">
            <span className="status-dot" />
            <span className="mono" style={{ fontWeight: 600 }}>
              Pascal SceneGraph: VALID
            </span>
            <span>• {roomW / 1000}×{roomD / 1000}m</span>
          </div>

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
