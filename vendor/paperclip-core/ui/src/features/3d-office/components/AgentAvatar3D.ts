import * as THREE from "three";
import type { Agent } from "@paperclipai/shared";
import type { CharacterAction, AgentVisualStatus, DeskDefinition } from "../types/OfficeTypes";

export interface AvatarAnimState {
  action: CharacterAction;
  visualStatus: AgentVisualStatus;
  path: Array<[number, number, number]>;
  currentWaypointIdx: number;
  walkSpeed: number;
  rotation: number;
  targetRotation: number;
  handoffTimer: number;
  onHandoffComplete?: () => void;
  onReturnComplete?: () => void;
}

export class AgentAvatar3D {
  group: THREE.Group;
  agent: Agent;
  desk: DeskDefinition;
  animState: AvatarAnimState;

  private bodyGroup: THREE.Group;
  private headMesh: THREE.Mesh;
  private torsoMesh: THREE.Mesh;
  private leftArmPivot: THREE.Group;
  private rightArmPivot: THREE.Group;
  private leftLegPivot: THREE.Group;
  private rightLegPivot: THREE.Group;
  private statusBeacon: THREE.Mesh;
  private tabletMesh: THREE.Mesh;
  private nameplateSprite: THREE.Sprite;
  private animClock = 0;

  constructor(agent: Agent, desk: DeskDefinition) {
    this.agent = agent;
    this.desk = desk;

    this.group = new THREE.Group();
    this.group.name = `agent_${agent.id}`;
    this.group.position.set(...desk.chairPosition);

    this.animState = {
      action: "sitting",
      visualStatus: "idle",
      path: [],
      currentWaypointIdx: 0,
      walkSpeed: 3.2,
      rotation: desk.rotation,
      targetRotation: desk.rotation,
      handoffTimer: 0,
    };

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Build character geometry & materials
    const roleColor = this.getRoleColor(agent.role ?? "", agent.name ?? "");
    const skinMat = new THREE.MeshStandardMaterial({ color: "#f8d7b8", roughness: 0.6 });
    const clothesMat = new THREE.MeshStandardMaterial({ color: roleColor, roughness: 0.5 });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.4 });
    const hairMat = new THREE.MeshStandardMaterial({ color: this.getHairVariant(agent.id), roughness: 0.8 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.55, 0.26);
    this.torsoMesh = new THREE.Mesh(torsoGeo, clothesMat);
    this.torsoMesh.position.y = 0.68;
    this.torsoMesh.castShadow = true;
    this.bodyGroup.add(this.torsoMesh);

    // Head
    const headGeo = new THREE.BoxGeometry(0.28, 0.3, 0.28);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 1.15;
    this.headMesh.castShadow = true;
    this.bodyGroup.add(this.headMesh);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.3, 0.12, 0.3);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 1.32;
    this.bodyGroup.add(hairMesh);

    // Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.28, 0.9, 0);
    const armGeo = new THREE.BoxGeometry(0.12, 0.44, 0.12);
    const leftArmMesh = new THREE.Mesh(armGeo, clothesMat);
    leftArmMesh.position.y = -0.2;
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    this.bodyGroup.add(this.leftArmPivot);

    // Right Arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.28, 0.9, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, clothesMat);
    rightArmMesh.position.y = -0.2;
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    this.bodyGroup.add(this.rightArmPivot);

    // Tablet (in right hand)
    const tabletGeo = new THREE.BoxGeometry(0.24, 0.02, 0.16);
    const tabletMat = new THREE.MeshStandardMaterial({
      color: "#0284c7",
      emissive: "#0284c7",
      emissiveIntensity: 0.4,
    });
    this.tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
    this.tabletMesh.position.set(0, -0.42, 0.1);
    this.tabletMesh.visible = false;
    this.rightArmPivot.add(this.tabletMesh);

    // Left Leg
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.13, 0.45, 0);
    const legGeo = new THREE.BoxGeometry(0.14, 0.46, 0.14);
    const leftLegMesh = new THREE.Mesh(legGeo, darkMat);
    leftLegMesh.position.y = -0.23;
    leftLegMesh.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);
    this.bodyGroup.add(this.leftLegPivot);

    // Right Leg
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.13, 0.45, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, darkMat);
    rightLegMesh.position.y = -0.23;
    rightLegMesh.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);
    this.bodyGroup.add(this.rightLegPivot);

    // Floating Status Beacon
    const beaconGeo = new THREE.TorusGeometry(0.16, 0.035, 8, 24);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: "#10b981",
      emissive: "#10b981",
      emissiveIntensity: 0.8,
    });
    this.statusBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.statusBeacon.rotation.x = Math.PI / 2;
    this.statusBeacon.position.y = 1.62;
    this.bodyGroup.add(this.statusBeacon);

    // Nameplate sprite
    this.nameplateSprite = this.createNameplate(agent.name, agent.role ?? "");
    this.nameplateSprite.position.y = 1.88;
    this.bodyGroup.add(this.nameplateSprite);

    this.group.rotation.y = desk.rotation;
  }

  private getRoleColor(role: string, name: string): string {
    const combined = `${role} ${name}`.toLowerCase();
    if (combined.includes("ceo")) return "#475569";
    if (combined.includes("pm") || combined.includes("project manager")) return "#2563eb";
    if (combined.includes("po") || combined.includes("product")) return "#7c3aed";
    if (combined.includes("designer")) return "#db2777";
    if (combined.includes("architect")) return "#0891b2";
    if (combined.includes("backend")) return "#059669";
    if (combined.includes("frontend")) return "#d97706";
    if (combined.includes("review")) return "#16a34a";
    if (combined.includes("qa") || combined.includes("test")) return "#10b981";
    if (combined.includes("devops")) return "#ea580c";
    return "#3b82f6";
  }

  private getHairVariant(id: string): string {
    const hairColors = ["#1e1b18", "#382414", "#664229", "#9a6c4b", "#222222", "#4a4036"];
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hairColors[hash % hairColors.length]!;
  }

  private createNameplate(name: string, role: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Rounded pill background
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.beginPath();
      ctx.roundRect(12, 12, 360, 72, 16);
      ctx.fill();

      // Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      ctx.stroke();

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name.slice(0, 20), 192, 45);

      // Role
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(role.slice(0, 26).toUpperCase(), 192, 70);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  }

  setStatus(status: AgentVisualStatus) {
    this.animState.visualStatus = status;
    const beaconMat = this.statusBeacon.material as THREE.MeshStandardMaterial;

    let color = "#10b981";
    if (status === "running") color = "#3b82f6";
    else if (status === "error") color = "#ef4444";
    else if (status === "paused") color = "#f59e0b";
    else if (status === "waiting") color = "#64748b";

    beaconMat.color.set(color);
    beaconMat.emissive.set(color);
  }

  setAction(action: CharacterAction) {
    this.animState.action = action;
    this.tabletMesh.visible = action === "handoff_give" || action === "handoff_receive";
  }

  startWalkingAlongPath(path: Array<[number, number, number]>, onArrival?: () => void) {
    if (path.length === 0) return;
    this.animState.action = "walking";
    this.animState.path = path;
    this.animState.currentWaypointIdx = 0;
    this.animState.onHandoffComplete = onArrival;
    this.tabletMesh.visible = true;
  }

  returnToDesk(returnPath: Array<[number, number, number]>, onFinished?: () => void) {
    this.animState.action = "walking";
    this.animState.path = returnPath;
    this.animState.currentWaypointIdx = 0;
    this.animState.onReturnComplete = onFinished;
    this.tabletMesh.visible = false;
  }

  update(delta: number) {
    this.animClock += delta;

    // Pulse status beacon
    this.statusBeacon.rotation.z += delta * 1.5;
    const pulse = 1 + Math.sin(this.animClock * 3) * 0.12;
    this.statusBeacon.scale.set(pulse, pulse, pulse);

    // Action animation states
    if (this.animState.action === "sitting") {
      this.bodyGroup.position.y = -0.15;
      this.leftLegPivot.rotation.x = -Math.PI / 2;
      this.rightLegPivot.rotation.x = -Math.PI / 2;
      this.leftArmPivot.rotation.x = -0.4;
      this.rightArmPivot.rotation.x = -0.4;
      this.group.rotation.y = this.desk.rotation;
    } else if (this.animState.action === "typing") {
      this.bodyGroup.position.y = -0.15;
      this.leftLegPivot.rotation.x = -Math.PI / 2;
      this.rightLegPivot.rotation.x = -Math.PI / 2;
      // Alternate fast keystrokes
      this.leftArmPivot.rotation.x = -0.7 + Math.sin(this.animClock * 14) * 0.12;
      this.rightArmPivot.rotation.x = -0.7 + Math.cos(this.animClock * 14) * 0.12;
      this.group.rotation.y = this.desk.rotation;
    } else if (this.animState.action === "standing") {
      this.bodyGroup.position.y = 0;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = 0;
      this.rightArmPivot.rotation.x = 0;
    } else if (this.animState.action === "walking") {
      this.bodyGroup.position.y = Math.abs(Math.sin(this.animClock * 10)) * 0.06;

      // Leg swing
      const legAngle = Math.sin(this.animClock * 10) * 0.65;
      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;

      // Arm swing
      this.leftArmPivot.rotation.x = -legAngle * 0.6;
      this.rightArmPivot.rotation.x = legAngle * 0.6;

      // Follow path
      if (this.animState.path.length > 0 && this.animState.currentWaypointIdx < this.animState.path.length) {
        const targetPt = this.animState.path[this.animState.currentWaypointIdx]!;
        const dx = targetPt[0] - this.group.position.x;
        const dz = targetPt[2] - this.group.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.05) {
          // Smooth rotation towards travel direction
          const targetAngle = Math.atan2(dx, dz);
          this.group.rotation.y = targetAngle;

          // Step forward
          const moveDist = Math.min(dist, this.animState.walkSpeed * delta);
          this.group.position.x += (dx / dist) * moveDist;
          this.group.position.z += (dz / dist) * moveDist;
        } else {
          // Reached waypoint
          this.animState.currentWaypointIdx++;
          if (this.animState.currentWaypointIdx >= this.animState.path.length) {
            // Reached destination!
            this.animState.path = [];
            if (this.animState.onHandoffComplete) {
              const cb = this.animState.onHandoffComplete;
              this.animState.onHandoffComplete = undefined;
              cb();
            } else if (this.animState.onReturnComplete) {
              const cb = this.animState.onReturnComplete;
              this.animState.onReturnComplete = undefined;
              cb();
            }
          }
        }
      }
    } else if (this.animState.action === "handoff_give") {
      this.bodyGroup.position.y = 0;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.rightArmPivot.rotation.x = -1.2; // raise tablet forward
      this.leftArmPivot.rotation.x = -0.2;
    } else if (this.animState.action === "handoff_receive") {
      this.bodyGroup.position.y = -0.15;
      this.rightArmPivot.rotation.x = -0.9;
      this.leftArmPivot.rotation.x = -0.9;
    } else if (this.animState.action === "error") {
      this.bodyGroup.position.y = -0.15;
      this.headMesh.rotation.x = 0.35; // head hung low
      this.headMesh.rotation.z = Math.sin(this.animClock * 3) * 0.1;
      this.leftArmPivot.rotation.x = -0.2;
      this.rightArmPivot.rotation.x = -0.2;
    }
  }

  dispose() {
    this.group.clear();
  }
}
