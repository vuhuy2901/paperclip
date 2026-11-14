/**
 * ATELIER AI — Dedicated Object and Furniture Inspector (Sections 6.3 & 11)
 * Synchronizes selection between Furniture List, Object Properties (X/Y/Z, Rotation, Dimensions, Price),
 * 3D Asset Switcher and 2D/3D Pascal Viewport. Color and material choices are
 * delegated to the AI Copilot proposal flow instead of manual preset pickers.
 */
import React, { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  RotateCw,
  Save,
  Layers,
  Palette,
  Box,
  Sliders,
  X,
  RefreshCw,
  Check,
  Sparkles,
} from 'lucide-react'
import { getNamedPartsForFurniture } from './assetCatalog'
import {
  PBR_STYLE_PRESETS,
  getPbrMaterialsForSurface,
  resolveMaterialOrDefault,
  type PbrSurfaceType,
} from './pbrCatalog'

interface ObjectInspectorProps {
  project: any
  assetLibrary?: any[]
  selectedEntityId: string | null
  onSelectEntity: (id: string | null) => void
  onUpdateFurnitureField: (furnId: string, field: string, value: any) => void
  onAssignElementMaterial?: (
    target: {
      kind: 'floor' | 'wall' | 'furniture_part'
      entityId: string
      partId?: string
      wallFace?: 'face_a' | 'face_b'
      category?: string
    },
    materialId: string,
    applyToAllSameType?: boolean
  ) => void
  onApplyStylePreset?: (presetId: string) => void
  onCommitCanvasPosition: () => void
  onAssignAsset?: (objectId: string, assetId: string) => Promise<any>
  onOpenAICopilot?: () => void
  onRequestSmartFit?: (objectId: string) => Promise<any>
  onRequestPlacementOptions?: (objectId: string) => Promise<any>
  onCreatePlacementProposal?: (objectId: string, option: any) => Promise<any>
  onClose?: () => void
  savingScene?: boolean
}

const formatVnd = (v?: number) => `${Math.round(v || 0).toLocaleString('vi-VN')} ₫`
const formatFurniturePrice = (v?: number) => (v == null || v <= 0 ? 'Chưa có giá' : formatVnd(v))

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  project,
  assetLibrary = [],
  selectedEntityId,
  onSelectEntity,
  onUpdateFurnitureField,
  onAssignElementMaterial,
  onApplyStylePreset,
  onCommitCanvasPosition,
  onAssignAsset,
  onOpenAICopilot,
  onRequestSmartFit,
  onRequestPlacementOptions,
  onCreatePlacementProposal,
  onClose,
  savingScene = false,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    selected: true,
    materials: true,
    furnitureList: true,
    smartFit: true,
  })
  const [assigningAsset, setAssigningAsset] = useState(false)
  const [targetAssetId, setTargetAssetId] = useState<string>('')
  const [fitReport, setFitReport] = useState<any>(null)
  const [placementOptions, setPlacementOptions] = useState<any[]>([])
  const [fitLoading, setFitLoading] = useState(false)
  const [selectedPartId, setSelectedPartId] = useState<string>('')
  const [selectedWallFace, setSelectedWallFace] = useState<'face_a' | 'face_b'>('face_a')

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const furniture = project?.furniture_instances || []
  const walls = project?.walls || []
  const room = project?.rooms?.[0]

  const selectedFurn = furniture.find((f: any) => f.id === selectedEntityId)
  const selectedWall = walls.find((w: any) => w.id === selectedEntityId)
  const isFloorSelected = selectedEntityId === 'floor_main'

  const namedParts = selectedFurn ? getNamedPartsForFurniture(selectedFurn) : []
  const activePart =
    namedParts.find((p) => p.partId === selectedPartId) || namedParts[0] || null

  useEffect(() => {
    if (namedParts.length > 0 && !namedParts.some((p) => p.partId === selectedPartId)) {
      setSelectedPartId(namedParts[0].partId)
    }
  }, [selectedFurn?.id])

  useEffect(() => {
    const onSelectPart = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.partName) {
        setSelectedPartId(detail.partName)
      }
    }
    window.addEventListener('atelier:select-part', onSelectPart)
    return () => window.removeEventListener('atelier:select-part', onSelectPart)
  }, [])

  useEffect(() => {
    if (selectedFurn?.asset_id) {
      setTargetAssetId(selectedFurn.asset_id)
    } else if (assetLibrary.length > 0 && !targetAssetId) {
      setTargetAssetId(assetLibrary[0].asset_id)
    }
  }, [selectedFurn?.id, selectedFurn?.asset_id, assetLibrary])


  const handleAssignAssetClick = async () => {
    const assetToAssign = targetAssetId || assetLibrary[0]?.asset_id
    if (!selectedFurn || !assetToAssign || !onAssignAsset) return
    setAssigningAsset(true)
    try {
      await onAssignAsset(selectedFurn.id, assetToAssign)
    } finally {
      setAssigningAsset(false)
    }
  }

  return (
    <aside id="inspector-dock" className="inspector-dock" aria-label="Thuộc tính đối tượng">
      {/* Inspector Header */}
      <div
        style={{
          height: 46,
          padding: '0 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}>
          <Sliders size={14} style={{ color: 'var(--accent)' }} />
          <span>Thuộc Tính Đối Tượng</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="btn btn-sm btn-soft"
            onClick={onCommitCanvasPosition}
            disabled={savingScene}
            title="Lưu vị trí & góc xoay hiện tại vào Scene Revision"
          >
            <Save size={12} /> {savingScene ? 'Đang lưu...' : 'Lưu Scene'}
          </button>
          {onClose && (
            <button
              className="btn btn-icon btn-sm"
              onClick={onClose}
              aria-label="Đóng bảng thuộc tính và vật liệu"
              title="Đóng Inspector"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Accordion Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 1. SELECTED OBJECT INSPECTOR (Section 6.3) */}
        <div className="inspector-section">
          <button className="inspector-section-header" onClick={() => toggleSection('selected')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box size={13} style={{ color: 'var(--accent)' }} />
              Đối Tượng Đang Chọn
            </span>
            {openSections.selected ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {openSections.selected && (
            <div className="inspector-section-body">
              {selectedFurn ? (
                <>
                  <div className="surface-subtle">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{selectedFurn.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          SKU: {selectedFurn.sku} • {selectedFurn.category}
                        </div>
                        {selectedFurn.asset_id && (
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent)', marginTop: 2 }}>
                            3D Asset: {selectedFurn.asset_id}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 5,
                          background: selectedFurn.color_hex || '#E4DDD3',
                          border: '1px solid var(--border-strong)',
                          flexShrink: 0,
                        }}
                        title={`Màu vật liệu: ${selectedFurn.color_hex}`}
                      />
                    </div>
                    <div
                      className="mono"
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Đơn giá:</span>
                      <strong style={{ color: selectedFurn.price_vnd > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {formatFurniturePrice(selectedFurn.price_vnd)}
                      </strong>
                    </div>
                  </div>

                  {/* 3D GLB Asset Switcher (G4/G8: Switch between single-slot Sofa_01 and multi-slot GlamVelvetSofa / ArmChair / CoffeeTable) */}
                  {assetLibrary.length > 0 && (
                    <div className="surface-subtle" style={{ padding: '8px 10px' }}>
                      <div className="text-caption" style={{ fontWeight: 600, marginBottom: 4 }}>
                        Mô hình 3D GLB thực tế (Thư viện CC0 / CC-BY)
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select
                          data-testid="assign-asset-select"
                          className="field-select"
                          style={{ fontSize: 11.5, flex: 1 }}
                          value={targetAssetId}
                          onChange={(e) => setTargetAssetId(e.target.value)}
                        >
                          {assetLibrary.map((asset: any) => (
                            <option key={asset.asset_id} value={asset.asset_id}>
                              {asset.source_id || asset.asset_id} ({asset.material_slots?.length || 1} slots · {Math.round(asset.dimensions_mm?.[0] || 0)}×{Math.round(asset.dimensions_mm?.[1] || 0)}mm)
                            </option>
                          ))}
                        </select>
                        <button
                          data-testid="assign-asset-btn"
                          className="btn btn-sm btn-primary"
                          disabled={assigningAsset || !targetAssetId}
                          onClick={handleAssignAssetClick}
                        >
                          <RefreshCw size={11} /> {assigningAsset ? '...' : 'Gán GLB'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dimensions (W x D x H mm) */}
                  <div>
                    <div className="text-caption" style={{ marginBottom: 4, fontWeight: 500 }}>
                      Kích thước bao (Rộng × Sâu × Cao — mm)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {([
                        ['W (mm)', 'width_mm'],
                        ['D (mm)', 'depth_mm'],
                        ['H (mm)', 'height_mm'],
                      ] as const).map(([label, field]) => (
                        <label key={field} className="field-group" style={{ gap: 3 }}>
                          <span className="field-label">{label}</span>
                          <input
                            className="field-input mono"
                            type="number"
                            min={100}
                            max={20000}
                            step={10}
                            value={Math.round(selectedFurn[field] || 0)}
                            onChange={(event) =>
                              onUpdateFurnitureField(selectedFurn.id, field, Number(event.target.value))
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Position X / Y / Z & Rotation */}
                  <div>
                    <div className="text-caption" style={{ marginBottom: 4, fontWeight: 500 }}>
                      Tọa độ mặt bằng X / Y (mm) & Góc xoay
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <div>
                        <label style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Tọa độ X</label>
                        <input
                          type="number"
                          className="field-input mono"
                          style={{ padding: '5px 7px', fontSize: 12 }}
                          value={Math.round(selectedFurn.x_mm)}
                          onChange={(e) =>
                            onUpdateFurnitureField(selectedFurn.id, 'x_mm', Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Tọa độ Y</label>
                        <input
                          type="number"
                          className="field-input mono"
                          style={{ padding: '5px 7px', fontSize: 12 }}
                          value={Math.round(selectedFurn.y_mm)}
                          onChange={(e) =>
                            onUpdateFurnitureField(selectedFurn.id, 'y_mm', Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Góc (°)</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input
                            type="number"
                            className="field-input mono"
                            style={{ padding: '5px 7px', fontSize: 12 }}
                            value={Math.round(selectedFurn.rotation_deg || 0)}
                            onChange={(e) =>
                              onUpdateFurnitureField(selectedFurn.id, 'rotation_deg', Number(e.target.value))
                            }
                          />
                          <button
                            className="btn btn-sm btn-icon"
                            title="Xoay 90°"
                            onClick={() =>
                              onUpdateFurnitureField(
                                selectedFurn.id,
                                'rotation_deg',
                                ((selectedFurn.rotation_deg || 0) + 90) % 360
                              )
                            }
                          >
                            <RotateCw size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedWall ? (
                <div className="surface-subtle">
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Đoạn tường: {selectedWall.id}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Cao: {selectedWall.height_mm}mm • Dày: {selectedWall.thickness_mm}mm
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Mặt trong (Face A): <strong>{selectedWall.face_a_material_id}</strong>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    Mặt ngoài (Face B): <strong>{selectedWall.face_b_material_id || selectedWall.face_a_material_id}</strong>
                  </div>
                  {selectedWall.is_accent_wall && (
                    <span className="status-badge teal" style={{ marginTop: 6 }}>
                      ★ Tường điểm nhấn (Accent Wall)
                    </span>
                  )}
                </div>
              ) : isFloorSelected ? (
                <div className="surface-subtle">
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Sàn đa giác: {room?.name || 'Phòng chính'}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Số đỉnh đa giác: {room?.polygon_mm?.length || 4} • Vật liệu: {project?.surface_material_overrides?.floor?.material_id || room?.floor_material_id}
                  </div>
                </div>
              ) : (
                <div className="text-caption">
                  Nhấp vào sàn nhà, đoạn tường hoặc món nội thất trên mặt bằng 2D / không gian 3D để xem thông số và chọn vật liệu.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1B. PBR MATERIAL SELECTOR BY ELEMENT & NAMED PART + STYLE PRESETS (PHẦN 2) */}
        <div className="inspector-section" data-testid="pbr-material-picker-section">
          <button className="inspector-section-header" onClick={() => toggleSection('materials')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette size={13} style={{ color: 'var(--accent)' }} />
              Chọn Vật Liệu PBR (CC0)
            </span>
            {openSections.materials ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {openSections.materials && (
            <div className="inspector-section-body" style={{ gap: 10 }}>
              {/* Full-house Style Presets */}
              <div className="surface-subtle" style={{ padding: '8px 10px' }}>
                <div className="text-caption" style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                  Bộ vật liệu sẵn theo phong cách (Cả nhà)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
                  {PBR_STYLE_PRESETS.map((preset) => {
                    const isActive = project?.active_style_preset === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        data-testid={`style-preset-${preset.id}`}
                        className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-soft'}`}
                        style={{ fontSize: 11, padding: '5px 6px', justifyContent: 'center' }}
                        title={preset.description}
                        onClick={() => onApplyStylePreset?.(preset.id)}
                      >
                        {preset.name.split(' ')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Target Switcher: Floor / Wall / Selected Furniture */}
              <div>
                <div className="text-caption" style={{ marginBottom: 5, fontWeight: 500 }}>
                  Phần tử đang gán vật liệu:
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    data-testid="select-surface-floor-btn"
                    className={`btn btn-sm ${isFloorSelected ? 'btn-primary' : 'btn-soft'}`}
                    style={{ fontSize: 11 }}
                    onClick={() => onSelectEntity('floor_main')}
                  >
                    Sàn nhà
                  </button>
                  <button
                    type="button"
                    data-testid="select-surface-wall-btn"
                    className={`btn btn-sm ${selectedWall ? 'btn-primary' : 'btn-soft'}`}
                    style={{ fontSize: 11 }}
                    onClick={() => onSelectEntity(walls[0]?.id || 'wall_north')}
                  >
                    Tường ({selectedWall ? selectedWall.id : walls[0]?.id || 'wall'})
                  </button>
                  {selectedFurn && (
                    <button
                      type="button"
                      data-testid="select-surface-furn-btn"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: 11 }}
                    >
                      {selectedFurn.name}
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-part selector for Wall (Face A / Face B) or Multi-part Furniture */}
              {selectedWall && (
                <div>
                  <div className="text-caption" style={{ marginBottom: 4 }}>Mặt tường:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    <button
                      type="button"
                      data-testid="wall-face-a-btn"
                      className={`btn btn-sm ${selectedWallFace === 'face_a' ? 'btn-primary' : ''}`}
                      style={{ fontSize: 11 }}
                      onClick={() => setSelectedWallFace('face_a')}
                    >
                      Mặt trong (Face A)
                    </button>
                    <button
                      type="button"
                      data-testid="wall-face-b-btn"
                      className={`btn btn-sm ${selectedWallFace === 'face_b' ? 'btn-primary' : ''}`}
                      style={{ fontSize: 11 }}
                      onClick={() => setSelectedWallFace('face_b')}
                    >
                      Mặt ngoài (Face B)
                    </button>
                  </div>
                </div>
              )}

              {selectedFurn && namedParts.length > 0 && (
                <div>
                  <div className="text-caption" style={{ marginBottom: 4 }}>
                    Bộ phận của <strong>{selectedFurn.name}</strong>:
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {namedParts.map((part) => {
                      const isPartSel = activePart?.partId === part.partId
                      return (
                        <button
                          key={part.partId}
                          type="button"
                          data-testid={`furn-part-${part.partId}`}
                          className={`btn btn-sm ${isPartSel ? 'btn-primary' : ''}`}
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => setSelectedPartId(part.partId)}
                        >
                          {part.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Filtered PBR Material Swatch List */}
              {(() => {
                const activeSurfaceType: PbrSurfaceType = isFloorSelected
                  ? 'floor'
                  : selectedWall
                  ? 'wall'
                  : activePart?.surfaceType || 'wood'

                const rawCurrentId = isFloorSelected
                  ? project?.surface_material_overrides?.floor?.material_id || room?.floor_material_id
                  : selectedWall
                  ? selectedWallFace === 'face_b'
                    ? selectedWall.face_b_material_id
                    : selectedWall.face_a_material_id
                  : selectedFurn?.part_materials?.[activePart?.partId || 'body']

                const resolvedCurrent = resolveMaterialOrDefault(rawCurrentId, activeSurfaceType)
                const matchingMaterials = getPbrMaterialsForSurface(activeSurfaceType)

                const handlePickMaterial = (matId: string, applyAll = false) => {
                  if (!onAssignElementMaterial) return
                  if (isFloorSelected) {
                    onAssignElementMaterial({ kind: 'floor', entityId: 'floor_main' }, matId, applyAll)
                  } else if (selectedWall) {
                    onAssignElementMaterial(
                      { kind: 'wall', entityId: selectedWall.id, wallFace: selectedWallFace },
                      matId,
                      applyAll
                    )
                  } else if (selectedFurn) {
                    onAssignElementMaterial(
                      {
                        kind: 'furniture_part',
                        entityId: selectedFurn.id,
                        partId: activePart?.partId || 'body',
                        category: selectedFurn.category,
                      },
                      matId,
                      applyAll
                    )
                  }
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bề mặt: {activeSurfaceType.toUpperCase()}</span>
                      <span>Đang dùng: {resolvedCurrent.id}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 230, overflowY: 'auto' }}>
                      {matchingMaterials.map((mat) => {
                        const isCurrent = resolvedCurrent.id === mat.id
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            data-testid={`pbr-mat-option-${mat.id}`}
                            onClick={() => handlePickMaterial(mat.id, false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: isCurrent ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                              background: isCurrent ? 'var(--accent-soft)' : 'var(--surface-primary)',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 5,
                                backgroundColor: mat.base_color,
                                backgroundImage: `url(${mat.diffuse_url})`,
                                backgroundSize: 'cover',
                                border: '1px solid rgba(0,0,0,0.18)',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11.5, fontWeight: isCurrent ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {mat.name}
                              </div>
                              <div className="mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                                {mat.license} • {mat.source} • Lặp {mat.repeat_scale_m[0]}m
                              </div>
                            </div>
                            {isCurrent && <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      data-testid="apply-material-all-same-type-btn"
                      className="btn btn-sm btn-soft"
                      style={{ width: '100%', justifyContent: 'center', marginTop: 2 }}
                      onClick={() => handlePickMaterial(resolvedCurrent.id, true)}
                    >
                      Áp dụng cho tất cả phần tử cùng loại
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        <div className="inspector-section" data-testid="ai-material-guidance">
          <div className="inspector-section-body" style={{ gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Palette size={13} style={{ color: 'var(--accent)' }} />
              Màu và vật liệu do AI đề xuất
            </div>
            <div className="text-caption">
              Mô tả phong cách hoặc màu mong muốn. AI sẽ tìm phương án phù hợp và gửi đề xuất để bạn duyệt trước khi áp dụng.
            </div>
            <button type="button" className="btn btn-sm btn-primary" onClick={onOpenAICopilot}>
              Mở AI Copilot
            </button>
          </div>
        </div>

        {selectedFurn && (
          <div className="inspector-section" data-testid="smart-fit-editor">
            <button className="inspector-section-header" onClick={() => toggleSection('smartFit')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Box size={13} style={{ color: 'var(--accent)' }} /> Smart Furniture Fit
              </span>
              {openSections.smartFit ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {openSections.smartFit && (
              <div className="inspector-section-body" style={{ gap: 8 }}>
                <div className="surface-subtle" style={{ fontSize: 11.5 }}>
                  <div>Policy: <strong>{selectedFurn.sizing_policy || 'FIXED_SIZE'}</strong></div>
                  <div className="mono">Measured: {selectedFurn.width_mm}×{selectedFurn.depth_mm}×{selectedFurn.height_mm} mm</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    data-testid="smart-fit-assess"
                    className="btn btn-sm btn-soft"
                    disabled={fitLoading}
                    onClick={async () => {
                      if (!onRequestSmartFit) return
                      setFitLoading(true)
                      try { setFitReport(await onRequestSmartFit(selectedFurn.id)) } finally { setFitLoading(false) }
                    }}
                  >Kiểm tra vừa phòng</button>
                  <button
                    data-testid="smart-fit-options"
                    className="btn btn-sm"
                    disabled={fitLoading}
                    onClick={async () => {
                      if (!onRequestPlacementOptions) return
                      setFitLoading(true)
                      try {
                        const result = await onRequestPlacementOptions(selectedFurn.id)
                        setPlacementOptions(result?.options || [])
                      } finally { setFitLoading(false) }
                    }}
                  >Tìm 2 bố cục</button>
                </div>
                {fitReport && (
                  <div className="surface-subtle" data-testid="smart-fit-result" style={{ fontSize: 11.5 }}>
                    <strong>{fitReport.assessment?.fits ? 'PASS — Vừa phòng' : 'FAIL — Cần xử lý'}</strong>
                    {(fitReport.assessment?.issues || []).map((issue: string) => <div key={issue}>• {issue}</div>)}
                  </div>
                )}
                {placementOptions.map((option: any, index: number) => (
                  <button
                    key={`${option.x_mm}-${option.y_mm}-${option.rotation_deg}`}
                    className="btn btn-sm btn-soft"
                    data-testid={`placement-option-${index}`}
                    onClick={() => onCreatePlacementProposal?.(selectedFurn.id, option)}
                  >
                    PA {index + 1}: X {option.x_mm}, Y {option.y_mm}, {option.rotation_deg}° · score {option.score}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. FURNITURE LIST IN SCENE (Section 11) */}
        <div className="inspector-section">
          <button className="inspector-section-header" onClick={() => toggleSection('furnitureList')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={13} style={{ color: 'var(--accent)' }} />
              Danh Sách Nội Thất ({furniture.length})
            </span>
            {openSections.furnitureList ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {openSections.furnitureList && (
            <div className="inspector-section-body" style={{ gap: 6 }}>
              {furniture.map((f: any) => {
                const isSel = selectedEntityId === f.id
                return (
                  <div
                    key={f.id}
                    data-testid={`furniture-item-${f.id}`}
                    onClick={() => onSelectEntity(f.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-btn)',
                      border: isSel ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: isSel ? 'var(--accent-soft)' : 'var(--surface-primary)',
                      cursor: 'pointer',
                      transition: 'all 140ms ease',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: f.color_hex || '#E4DDD3',
                        border: '1px solid rgba(0,0,0,0.12)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: '#171717',
                      }}
                    >
                      {f.category.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: isSel ? 600 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={f.name}
                      >
                        {f.name}
                      </div>
                      <div
                        className="mono"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          marginTop: 2,
                        }}
                      >
                        <span>
                          {Math.round(f.width_mm)}×{Math.round(f.depth_mm)}mm
                        </span>
                        <span>{formatFurniturePrice(f.price_vnd)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </aside>
  )
}
