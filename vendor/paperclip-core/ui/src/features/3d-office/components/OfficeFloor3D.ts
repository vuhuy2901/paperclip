import * as THREE from "three";
import { ROOM_DEFINITIONS, OFFICE_BOUNDS } from "../config/RoomDefinitions";
import { FurnitureBuilder3D } from "./FurnitureBuilder3D";

export class OfficeFloor3D {
  group: THREE.Group;
  private furniture = new FurnitureBuilder3D();

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

    // Base concrete floor
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#0f172a",
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Subtle hallway floor runner
    const hallwayGeo = new THREE.PlaneGeometry(width - 2, 5.0);
    const hallwayMat = new THREE.MeshStandardMaterial({
      color: "#1e293b",
      roughness: 0.7,
    });
    const hallway = new THREE.Mesh(hallwayGeo, hallwayMat);
    hallway.rotation.x = -Math.PI / 2;
    hallway.position.set(0, 0.01, 0);
    hallway.receiveShadow = true;
    this.group.add(hallway);
  }

  private buildRoomFloors() {
    for (const room of ROOM_DEFINITIONS) {
      const w = room.bounds.maxX - room.bounds.minX - 0.2;
      const d = room.bounds.maxZ - room.bounds.minZ - 0.2;
      const rugGeo = new THREE.PlaneGeometry(w, d);
      const rugMat = new THREE.MeshStandardMaterial({
        color: room.floorColor,
        roughness: 0.6,
      });
      const rug = new THREE.Mesh(rugGeo, rugMat);
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(room.center[0], 0.02, room.center[2]);
      rug.receiveShadow = true;
      this.group.add(rug);

      // Accent border rim
      const borderGeo = new THREE.RingGeometry(0.1, 0.15, 4);
      // Room perimeter trim line
      const trimGeo = new THREE.BoxGeometry(w, 0.02, 0.06);
      const trimMat = new THREE.MeshStandardMaterial({ color: room.accentColor, roughness: 0.3 });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(room.center[0], 0.025, room.bounds.maxZ - 0.1);
      this.group.add(trim);
    }
  }

  private buildWalls() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: "#334155",
      roughness: 0.7,
      metalness: 0.2,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#93c5fd",
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
    });

    const h = OFFICE_BOUNDS.wallHeight;
    const minX = OFFICE_BOUNDS.minX;
    const maxX = OFFICE_BOUNDS.maxX;
    const minZ = OFFICE_BOUNDS.minZ;
    const maxZ = OFFICE_BOUNDS.maxZ;
    const width = maxX - minX;
    const depth = maxZ - minZ;

    // North outer wall (cutaway with glass windows)
    const northWallGeo = new THREE.BoxGeometry(width, h, 0.2);
    const northWall = new THREE.Mesh(northWallGeo, wallMat);
    northWall.position.set(0, h / 2, minZ);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    this.group.add(northWall);

    // South outer wall
    const southWallGeo = new THREE.BoxGeometry(width, h, 0.2);
    const southWall = new THREE.Mesh(southWallGeo, wallMat);
    southWall.position.set(0, h / 2, maxZ);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    this.group.add(southWall);

    // West outer wall
    const westWallGeo = new THREE.BoxGeometry(0.2, h, depth);
    const westWall = new THREE.Mesh(westWallGeo, wallMat);
    westWall.position.set(minX, h / 2, 0);
    westWall.castShadow = true;
    this.group.add(westWall);

    // East outer wall
    const eastWallGeo = new THREE.BoxGeometry(0.2, h, depth);
    const eastWall = new THREE.Mesh(eastWallGeo, wallMat);
    eastWall.position.set(maxX, h / 2, 0);
    eastWall.castShadow = true;
    this.group.add(eastWall);

    // Interior partitions dividing North rooms (X = -6, X = 6, between Z = -13 and -2.5)
    for (const x of [-6, 6]) {
      const partGeo = new THREE.BoxGeometry(0.18, h, 10.5);
      const part = new THREE.Mesh(partGeo, wallMat);
      part.position.set(x, h / 2, -7.75);
      part.castShadow = true;
      this.group.add(part);
    }

    // Interior partitions dividing South rooms (X = -4, X = 6, between Z = 2.5 and 13)
    for (const x of [-4, 6]) {
      const partGeo = new THREE.BoxGeometry(0.18, h, 10.5);
      const part = new THREE.Mesh(partGeo, wallMat);
      part.position.set(x, h / 2, 7.75);
      part.castShadow = true;
      this.group.add(part);
    }

    // Corridor interior walls with open doorways
    // North corridor wall: Z = -2.5 (spans except at doorways X = -12, 0, 12)
    this.buildCorridorWallWithDoorways(-2.5, [-12, 0, 12], wallMat);
    // South corridor wall: Z = 2.5 (spans except at doorways X = -11, 1, 12)
    this.buildCorridorWallWithDoorways(2.5, [-11, 1, 12], wallMat);
  }

  private buildCorridorWallWithDoorways(z: number, doorXs: number[], mat: THREE.Material) {
    const doorWidth = 2.4;
    const h = OFFICE_BOUNDS.wallHeight;

    let currentX = OFFICE_BOUNDS.minX;
    for (const doorX of doorXs) {
      const segStart = currentX;
      const segEnd = doorX - doorWidth / 2;
      const segLen = segEnd - segStart;
      if (segLen > 0.1) {
        const segGeo = new THREE.BoxGeometry(segLen, h, 0.18);
        const seg = new THREE.Mesh(segGeo, mat);
        seg.position.set(segStart + segLen / 2, h / 2, z);
        seg.castShadow = true;
        this.group.add(seg);
      }
      currentX = doorX + doorWidth / 2;
    }

    // Final segment
    const finalLen = OFFICE_BOUNDS.maxX - currentX;
    if (finalLen > 0.1) {
      const segGeo = new THREE.BoxGeometry(finalLen, h, 0.18);
      const seg = new THREE.Mesh(segGeo, mat);
      seg.position.set(currentX + finalLen / 2, h / 2, z);
      seg.castShadow = true;
      this.group.add(seg);
    }
  }

  private buildProps() {
    // 1. DevOps server racks
    this.group.add(this.furniture.createServerRack(16.5, 4.5, -Math.PI / 2));
    this.group.add(this.furniture.createServerRack(16.5, 6.0, -Math.PI / 2));
    this.group.add(this.furniture.createServerRack(16.5, 7.5, -Math.PI / 2));

    // 2. Product whiteboard
    this.group.add(this.furniture.createWhiteboard(0, -12.5, 0));

    // 3. QA whiteboard
    this.group.add(this.furniture.createWhiteboard(1, 12.5, Math.PI));

    // 4. Conference table in Management
    this.group.add(this.furniture.createConferenceTable(-12, -11.5));

    // 5. Potted plants along the hallway & entrances
    this.group.add(this.furniture.createPottedPlant(-16.5, 1.8));
    this.group.add(this.furniture.createPottedPlant(-16.5, -1.8));
    this.group.add(this.furniture.createPottedPlant(-5.0, 1.8));
    this.group.add(this.furniture.createPottedPlant(7.0, 1.8));
    this.group.add(this.furniture.createPottedPlant(16.5, -1.8));
    this.group.add(this.furniture.createPottedPlant(0, 1.8));
  }

  private buildRoomLabels() {
    for (const room of ROOM_DEFINITIONS) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(16, 16, 480, 96, 20);
        ctx.fill();

        ctx.strokeStyle = room.accentColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(room.shortName.toUpperCase(), 256, 75);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2.4, 0.6, 1);
      sprite.position.set(room.center[0], 2.4, room.center[2]);
      this.group.add(sprite);
    }
  }
}
