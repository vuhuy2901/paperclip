import * as THREE from "three";
import { ROOM_DEFINITIONS, OFFICE_BOUNDS } from "../config/RoomDefinitions";
import { FurnitureBuilder3D } from "./FurnitureBuilder3D";

export class OfficeFloor3D {
  group: THREE.Group;
  private furniture = new FurnitureBuilder3D();
  private roomTrimMeshes: Map<string, THREE.Mesh> = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "office_floor_structure";

    this.buildMainFloor();
    this.buildRoomFloors();
    this.buildWalls();
    this.buildProps();
    this.buildRoomLabels();
  }

  private buildMainFloor() {
    const width = OFFICE_BOUNDS.maxX - OFFICE_BOUNDS.minX;
    const depth = OFFICE_BOUNDS.maxZ - OFFICE_BOUNDS.minZ;

    // 1. Base light warm floor (Clean modern architectural concrete / light wood tone)
    const floorGeo = new THREE.PlaneGeometry(width + 4, depth + 4);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#f1f5f9", // Crisp warm off-white / light slate
      roughness: 0.6,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.group.add(floor);

    // 2. Subtle architectural grid lines
    const grid = new THREE.GridHelper(Math.max(width, depth) + 4, 38, "#cbd5e1", "#e2e8f0");
    grid.position.y = 0.005;
    this.group.add(grid);

    // 3. Central hallway polished runner
    const hallwayGeo = new THREE.PlaneGeometry(width - 2, 5.0);
    const hallwayMat = new THREE.MeshStandardMaterial({
      color: "#e2e8f0", // slightly deeper runner
      roughness: 0.45,
    });
    const hallway = new THREE.Mesh(hallwayGeo, hallwayMat);
    hallway.rotation.x = -Math.PI / 2;
    hallway.position.set(0, 0.01, 0);
    hallway.receiveShadow = true;
    this.group.add(hallway);
  }

  private buildRoomFloors() {
    for (const room of ROOM_DEFINITIONS) {
      const w = room.bounds.maxX - room.bounds.minX - 0.25;
      const d = room.bounds.maxZ - room.bounds.minZ - 0.25;

      // Soft tinted floor rug
      const rugGeo = new THREE.PlaneGeometry(w, d);
      const rugMat = new THREE.MeshStandardMaterial({
        color: room.floorColor,
        roughness: 0.5,
      });
      const rug = new THREE.Mesh(rugGeo, rugMat);
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(room.center[0], 0.02, room.center[2]);
      rug.receiveShadow = true;
      this.group.add(rug);

      // Accent border trim (pulsable if blocked)
      const trimGeo = new THREE.BoxGeometry(w, 0.04, 0.12);
      const trimMat = new THREE.MeshStandardMaterial({
        color: room.accentColor,
        emissive: room.accentColor,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      // Position trim right along doorway/room boundary
      const trimZ = room.center[2] < 0 ? room.bounds.maxZ - 0.1 : room.bounds.minZ + 0.1;
      trim.position.set(room.center[0], 0.03, trimZ);
      this.group.add(trim);
      this.roomTrimMeshes.set(room.id, trim);
    }
  }

  private buildWalls() {
    // Low modern partition walls (height 1.1m) so avatars and actions are fully visible
    const h = 1.1;
    const minX = OFFICE_BOUNDS.minX;
    const maxX = OFFICE_BOUNDS.maxX;
    const minZ = OFFICE_BOUNDS.minZ;
    const maxZ = OFFICE_BOUNDS.maxZ;
    const width = maxX - minX;
    const depth = maxZ - minZ;

    const baseWallMat = new THREE.MeshStandardMaterial({
      color: "#94a3b8", // Light architectural gray
      roughness: 0.5,
      metalness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#bae6fd",
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.75,
      thickness: 0.4,
    });

    // North outer wall (low wall + glass upper)
    this.createLayeredWall(0, minZ, width, h, 0.18, 0, baseWallMat, glassMat);

    // South outer wall
    this.createLayeredWall(0, maxZ, width, h, 0.18, 0, baseWallMat, glassMat);

    // West outer wall
    this.createLayeredWall(minX, 0, depth, h, 0.18, Math.PI / 2, baseWallMat, glassMat);

    // East outer wall
    this.createLayeredWall(maxX, 0, depth, h, 0.18, Math.PI / 2, baseWallMat, glassMat);

    // Interior room dividers (North rooms at X = -6, 6)
    for (const x of [-6, 6]) {
      this.createLayeredWall(x, -7.75, 10.5, h, 0.16, Math.PI / 2, baseWallMat, glassMat);
    }

    // Interior room dividers (South rooms at X = -4, 6)
    for (const x of [-4, 6]) {
      this.createLayeredWall(x, 7.75, 10.5, h, 0.16, Math.PI / 2, baseWallMat, glassMat);
    }

    // Corridor low partition railings with generous open doorways
    this.buildCorridorPartition(-2.5, [-12, 0, 12], h, baseWallMat);
    this.buildCorridorPartition(2.5, [-11, 1, 12], h, baseWallMat);
  }

  private createLayeredWall(
    x: number,
    z: number,
    length: number,
    totalHeight: number,
    thickness: number,
    rotationY: number,
    baseMat: THREE.Material,
    glassMat: THREE.Material,
  ) {
    const wallGroup = new THREE.Group();
    wallGroup.position.set(x, 0, z);
    wallGroup.rotation.y = rotationY;

    // Solid base bottom (0.5m)
    const baseH = 0.5;
    const baseGeo = new THREE.BoxGeometry(length, baseH, thickness);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = baseH / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    wallGroup.add(baseMesh);

    // Translucent glass upper panel (0.6m)
    const glassH = totalHeight - baseH;
    const glassGeo = new THREE.BoxGeometry(length, glassH, thickness * 0.6);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = baseH + glassH / 2;
    wallGroup.add(glassMesh);

    // Sleek aluminum top rail
    const railGeo = new THREE.BoxGeometry(length, 0.04, thickness * 0.8);
    const railMat = new THREE.MeshStandardMaterial({ color: "#64748b", metalness: 0.8, roughness: 0.2 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.y = totalHeight;
    wallGroup.add(rail);

    this.group.add(wallGroup);
  }

  private buildCorridorPartition(z: number, doorXs: number[], h: number, mat: THREE.Material) {
    const doorWidth = 3.0; // wide open archways
    let currentX = OFFICE_BOUNDS.minX;

    for (const doorX of doorXs) {
      const segStart = currentX;
      const segEnd = doorX - doorWidth / 2;
      const segLen = segEnd - segStart;
      if (segLen > 0.2) {
        const segGeo = new THREE.BoxGeometry(segLen, h * 0.7, 0.14);
        const seg = new THREE.Mesh(segGeo, mat);
        seg.position.set(segStart + segLen / 2, (h * 0.7) / 2, z);
        seg.castShadow = true;
        this.group.add(seg);
      }
      currentX = doorX + doorWidth / 2;
    }

    const finalLen = OFFICE_BOUNDS.maxX - currentX;
    if (finalLen > 0.2) {
      const segGeo = new THREE.BoxGeometry(finalLen, h * 0.7, 0.14);
      const seg = new THREE.Mesh(segGeo, mat);
      seg.position.set(currentX + finalLen / 2, (h * 0.7) / 2, z);
      seg.castShadow = true;
      this.group.add(seg);
    }
  }

  private buildProps() {
    // 1. DevOps server racks
    this.group.add(this.furniture.createServerRack(16.5, 4.5, -Math.PI / 2));
    this.group.add(this.furniture.createServerRack(16.5, 6.2, -Math.PI / 2));
    this.group.add(this.furniture.createServerRack(16.5, 7.9, -Math.PI / 2));

    // 2. Product Kanban whiteboard
    this.group.add(this.furniture.createWhiteboard(0, -12.5, 0));

    // 3. QA Automated test whiteboard
    this.group.add(this.furniture.createWhiteboard(1, 12.5, Math.PI));

    // 4. Executive conference table in Management
    this.group.add(this.furniture.createConferenceTable(-12, -11.5));

    // 5. Modern indoor potted plants along corridor & rooms
    this.group.add(this.furniture.createPottedPlant(-16.5, 1.8));
    this.group.add(this.furniture.createPottedPlant(-16.5, -1.8));
    this.group.add(this.furniture.createPottedPlant(-4.8, 1.8));
    this.group.add(this.furniture.createPottedPlant(7.2, 1.8));
    this.group.add(this.furniture.createPottedPlant(16.5, -1.8));
    this.group.add(this.furniture.createPottedPlant(0, 1.8));
    this.group.add(this.furniture.createPottedPlant(12, -12.2)); // Design plant
  }

  private buildRoomLabels() {
    for (const room of ROOM_DEFINITIONS) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 140;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Rounded semi-transparent backdrop
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.beginPath();
        ctx.roundRect(16, 12, 480, 116, 20);
        ctx.fill();

        // Accent border
        ctx.strokeStyle = room.accentColor;
        ctx.lineWidth = 5;
        ctx.stroke();

        // Department Tag
        ctx.fillStyle = room.accentColor;
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(room.departmentKey.toUpperCase(), 256, 42);

        // Room Title (Crisp white >= 24px)
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(room.name, 256, 88);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(3.2, 0.88, 1);
      // Float prominently above doorway
      const labelZ = room.center[2] < 0 ? -3.0 : 3.0;
      sprite.position.set(room.center[0], 2.8, labelZ);
      this.group.add(sprite);
    }
  }

  setRoomAlert(roomId: string, isBlocked: boolean) {
    const trim = this.roomTrimMeshes.get(roomId);
    if (!trim) return;
    const mat = trim.material as THREE.MeshStandardMaterial;
    if (isBlocked) {
      mat.color.set("#ef4444");
      mat.emissive.set("#ef4444");
      mat.emissiveIntensity = 0.9;
    } else {
      const room = ROOM_DEFINITIONS.find((r) => r.id === roomId);
      if (room) {
        mat.color.set(room.accentColor);
        mat.emissive.set(room.accentColor);
        mat.emissiveIntensity = 0.35;
      }
    }
  }
}
