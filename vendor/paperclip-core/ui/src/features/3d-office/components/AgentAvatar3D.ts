import * as THREE from "three";
import type { Agent } from "@paperclipai/shared";
import type { CharacterAction, AgentVisualStatus, DeskDefinition, OfficeSystemEventType } from "../types/OfficeTypes";

export interface AvatarAnimState {
  action: CharacterAction;
  visualStatus: AgentVisualStatus;
  path: Array<[number, number, number]>;
  currentWaypointIdx: number;
  walkSpeed: number;
  rotation: number;
  targetRotation: number;
  handoffTimer: number;
  currentTaskTitle?: string;
  chatBubbleText?: string | null;
  chatBubbleExpireAt?: number;
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
  private accessoryMesh?: THREE.Object3D;
  private tabletMesh: THREE.Mesh;
  private nameplateSprite: THREE.Sprite;
  private chatBubbleSprite: THREE.Sprite;
  private blockedAlertSprite: THREE.Sprite;
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
      walkSpeed: 4.5,
      rotation: desk.rotation,
      targetRotation: desk.rotation,
      handoffTimer: 0,
      currentTaskTitle: undefined,
      chatBubbleText: null,
      chatBubbleExpireAt: 0,
    };

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Color definitions
    const roleColor = this.getRoleColor(agent.role ?? "", agent.name ?? "");
    const skinMat = new THREE.MeshStandardMaterial({ color: "#fce7d2", roughness: 0.55 });
    const clothesMat = new THREE.MeshStandardMaterial({ color: roleColor, roughness: 0.45 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: this.getHairVariant(agent.id), roughness: 0.8 });

    // 1. Torso (~1.7x scale: 0.7m width, 0.9m height, 0.44m depth)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.44);
    this.torsoMesh = new THREE.Mesh(torsoGeo, clothesMat);
    this.torsoMesh.position.y = 1.05;
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.bodyGroup.add(this.torsoMesh);

    // 2. Head (~1.7x scale: 0.48m box)
    const headGeo = new THREE.BoxGeometry(0.48, 0.5, 0.48);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 1.8;
    this.headMesh.castShadow = true;
    this.bodyGroup.add(this.headMesh);

    // 3. Hair
    const hairGeo = new THREE.BoxGeometry(0.52, 0.2, 0.52);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 2.08;
    this.bodyGroup.add(hairMesh);

    // 4. Role Accessories (Headphones, Tie, Glasses, Vest, Blueprint, etc.)
    this.accessoryMesh = this.createRoleAccessory(agent.role ?? "", agent.name ?? "");
    if (this.accessoryMesh) {
      this.bodyGroup.add(this.accessoryMesh);
    }

    // 5. Left Arm Pivot & Mesh
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.46, 1.38, 0);
    const armGeo = new THREE.BoxGeometry(0.2, 0.72, 0.2);
    const leftArmMesh = new THREE.Mesh(armGeo, clothesMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    this.bodyGroup.add(this.leftArmPivot);

    // 6. Right Arm Pivot & Mesh
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.46, 1.38, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, clothesMat);
    rightArmMesh.position.y = -0.32;
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    this.bodyGroup.add(this.rightArmPivot);

    // 7. Tablet / Document Handheld in Right Hand
    const tabletGeo = new THREE.BoxGeometry(0.38, 0.03, 0.26);
    const tabletMat = new THREE.MeshStandardMaterial({
      color: "#0284c7",
      emissive: "#0284c7",
      emissiveIntensity: 0.6,
    });
    this.tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
    this.tabletMesh.position.set(0, -0.65, 0.16);
    this.tabletMesh.visible = false;
    this.rightArmPivot.add(this.tabletMesh);

    // 8. Left Leg Pivot & Mesh
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.21, 0.68, 0);
    const legGeo = new THREE.BoxGeometry(0.22, 0.75, 0.22);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.36;
    leftLegMesh.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);
    this.bodyGroup.add(this.leftLegPivot);

    // 9. Right Leg Pivot & Mesh
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.21, 0.68, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.36;
    rightLegMesh.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);
    this.bodyGroup.add(this.rightLegPivot);

    // 10. Status Halo Ring (Torus on top of head)
    const beaconGeo = new THREE.TorusGeometry(0.32, 0.05, 8, 24);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: "#94a3b8",
      emissive: "#94a3b8",
      emissiveIntensity: 0.8,
    });
    this.statusBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.statusBeacon.rotation.x = Math.PI / 2;
    this.statusBeacon.position.y = 2.45;
    this.bodyGroup.add(this.statusBeacon);

    // 11. Blocked Warning Badge '!' (hidden by default)
    this.blockedAlertSprite = this.createBlockedAlertSprite();
    this.blockedAlertSprite.position.y = 2.9;
    this.blockedAlertSprite.visible = false;
    this.bodyGroup.add(this.blockedAlertSprite);

    // 12. Nameplate Billboard Sprite (always faces camera)
    this.nameplateSprite = this.createNameplate(agent.name, agent.role ?? "", undefined, "idle");
    this.nameplateSprite.position.y = 3.25;
    this.bodyGroup.add(this.nameplateSprite);

    // 13. Dynamic Chat Bubble Billboard Sprite (hidden by default)
    this.chatBubbleSprite = this.createChatBubbleSprite("");
    this.chatBubbleSprite.position.y = 4.2;
    this.chatBubbleSprite.visible = false;
    this.bodyGroup.add(this.chatBubbleSprite);

    this.group.rotation.y = desk.rotation;
  }

  private getRoleColor(role: string, name: string): string {
    const combined = `${role} ${name}`.toLowerCase();
    if (combined.includes("pm") || combined.includes("project manager")) return "#2563eb"; // Royal Blue
    if (combined.includes("po") || combined.includes("product")) return "#7c3aed"; // Violet
    if (combined.includes("designer") || combined.includes("ui")) return "#db2777"; // Magenta / Coral
    if (combined.includes("architect") || combined.includes("solution")) return "#0891b2"; // Cyan / Teal
    if (combined.includes("backend")) return "#059669"; // Emerald Green
    if (combined.includes("frontend")) return "#d97706"; // Amber / Warm Orange
    if (combined.includes("reviewer") || combined.includes("audit")) return "#4f46e5"; // Indigo
    if (combined.includes("qa") || combined.includes("test")) return "#10b981"; // Mint Green
    if (combined.includes("devops") || combined.includes("infra")) return "#ea580c"; // Hi-vis Orange
    return "#3b82f6";
  }

  private getHairVariant(id: string): string {
    const hairColors = ["#1e1b18", "#382414", "#5c3d2e", "#8b5a2b", "#262626", "#4a4036"];
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hairColors[hash % hairColors.length]!;
  }

  private createRoleAccessory(role: string, name: string): THREE.Object3D | undefined {
    const combined = `${role} ${name}`.toLowerCase();
    const group = new THREE.Group();

    if (combined.includes("backend")) {
      // Chunky DJ-style headphones around neck
      const bandGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16, Math.PI);
      const phoneMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.4 });
      const band = new THREE.Mesh(bandGeo, phoneMat);
      band.rotation.x = Math.PI / 2;
      band.position.set(0, 1.55, 0);
      group.add(band);

      const cupGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12);
      const leftCup = new THREE.Mesh(cupGeo, phoneMat);
      leftCup.position.set(-0.3, 1.55, 0);
      leftCup.rotation.z = Math.PI / 2;
      group.add(leftCup);

      const rightCup = new THREE.Mesh(cupGeo, phoneMat);
      rightCup.position.set(0.3, 1.55, 0);
      rightCup.rotation.z = Math.PI / 2;
      group.add(rightCup);
      return group;
    }

    if (combined.includes("architect")) {
      // Architectural blueprint tube on back
      const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85, 12);
      const tubeMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.5 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.z = 0.5;
      tube.position.set(0.2, 1.1, -0.26);
      group.add(tube);
      return group;
    }

    if (combined.includes("devops")) {
      // Hi-vis reflective stripe across chest
      const stripeGeo = new THREE.BoxGeometry(0.72, 0.1, 0.46);
      const stripeMat = new THREE.MeshStandardMaterial({ color: "#facc15", roughness: 0.2 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, 1.15, 0);
      group.add(stripe);
      return group;
    }

    return undefined;
  }

  private createNameplate(
    name: string,
    role: string,
    taskTitle?: string,
    status: AgentVisualStatus = "idle",
  ): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Clear
      ctx.clearRect(0, 0, 512, 140);

      // Translucent rounded card background
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.beginPath();
      ctx.roundRect(16, 12, 480, 116, 20);
      ctx.fill();

      // Border colored by status
      let borderColor = "rgba(148, 163, 184, 0.4)";
      if (status === "running") borderColor = "#10b981";
      else if (status === "completed") borderColor = "#10b981";
      else if (status === "blocked" || status === "error") borderColor = "#ef4444";
      else if (status === "reviewing") borderColor = "#a855f7";
      else if (status === "waiting") borderColor = "#f59e0b";

      ctx.lineWidth = 4;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Status Dot indicator
      ctx.fillStyle = borderColor;
      ctx.beginPath();
      ctx.arc(42, 44, 8, 0, Math.PI * 2);
      ctx.fill();

      // Agent Name (Bold >= 24px)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(name.slice(0, 18), 62, 52);

      // Role Badge
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(role.slice(0, 24).toUpperCase(), 310, 52);

      // Current Task Subtitle
      ctx.fillStyle = taskTitle ? "#38bdf8" : "#64748b";
      ctx.font = "normal 18px sans-serif";
      const taskDisplay = taskTitle ? `Task: ${taskTitle.slice(0, 36)}` : "Status: Ready for assignment";
      ctx.fillText(taskDisplay, 42, 98);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.65, 1);
    return sprite;
  }

  private createBlockedAlertSprite(): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Red warning octagon / circle
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fill();

      // Exclamation Mark
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", 64, 86);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.8, 0.8, 1);
    return sprite;
  }

  private createChatBubbleSprite(message: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");

    if (ctx && message) {
      // Bubble background
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.beginPath();
      ctx.roundRect(16, 12, 480, 110, 24);
      ctx.fill();

      // Pointer tail
      ctx.beginPath();
      ctx.moveTo(236, 122);
      ctx.lineTo(256, 148);
      ctx.lineTo(276, 122);
      ctx.fill();

      // Accent border
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#38bdf8";
      ctx.stroke();

      // Message text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(message.slice(0, 36), 256, 72);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.8, 0.88, 1);
    return sprite;
  }

  setStatus(status: AgentVisualStatus, currentTaskTitle?: string) {
    this.animState.visualStatus = status;
    this.animState.currentTaskTitle = currentTaskTitle;

    const beaconMat = this.statusBeacon.material as THREE.MeshStandardMaterial;

    let color = "#94a3b8"; // default idle / gray
    if (status === "running") color = "#10b981"; // working/green
    else if (status === "completed") color = "#10b981"; // completed/green
    else if (status === "error" || status === "blocked") color = "#ef4444"; // red
    else if (status === "waiting") color = "#f59e0b"; // yellow
    else if (status === "reviewing") color = "#a855f7"; // purple
    else if (status === "paused") color = "#64748b"; // muted slate
    else if (status === "idle") color = "#94a3b8"; // gray

    beaconMat.color.set(color);
    beaconMat.emissive.set(color);

    // Update nameplate sprite
    this.bodyGroup.remove(this.nameplateSprite);
    this.nameplateSprite.material.dispose();
    this.nameplateSprite = this.createNameplate(this.agent.name, this.agent.role ?? "", currentTaskTitle, status);
    this.nameplateSprite.position.y = 3.25;
    this.bodyGroup.add(this.nameplateSprite);

    // Blocked alert visibility
    const isBlocked = status === "blocked" || status === "error";
    this.blockedAlertSprite.visible = isBlocked;
    if (isBlocked && this.animState.action === "sitting") {
      this.setAction("standing");
    } else if (!isBlocked && this.animState.action === "standing") {
      this.setAction("sitting");
    }
  }

  setChatBubble(message: string, durationMs = 4200) {
    this.animState.chatBubbleText = message;
    this.animState.chatBubbleExpireAt = Date.now() + durationMs;

    this.bodyGroup.remove(this.chatBubbleSprite);
    this.chatBubbleSprite.material.dispose();
    this.chatBubbleSprite = this.createChatBubbleSprite(message);
    this.chatBubbleSprite.position.y = 4.2;
    this.chatBubbleSprite.visible = true;
    this.bodyGroup.add(this.chatBubbleSprite);
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

    // Check Chat Bubble expiration
    if (this.animState.chatBubbleText && Date.now() > (this.animState.chatBubbleExpireAt ?? 0)) {
      this.animState.chatBubbleText = null;
      this.chatBubbleSprite.visible = false;
    }

    // Pulse Status Halo Beacon: calm for idle/paused, dynamic pulse for running/blocked
    if (this.animState.visualStatus === "idle" || this.animState.visualStatus === "paused") {
      this.statusBeacon.rotation.z += delta * 0.4;
      this.statusBeacon.scale.set(1, 1, 1);
    } else {
      this.statusBeacon.rotation.z += delta * 1.8;
      const pulse = 1 + Math.sin(this.animClock * 3.5) * 0.12;
      this.statusBeacon.scale.set(pulse, pulse, pulse);
    }

    // Animate Blocked Warning
    if (this.blockedAlertSprite.visible) {
      const alertBounce = 2.9 + Math.sin(this.animClock * 7) * 0.15;
      this.blockedAlertSprite.position.y = alertBounce;
    }

    // Idle Breathing (Subtle torso sway)
    const breath = Math.sin(this.animClock * 2.5) * 0.025;

    // Character Procedural Actions
    if (this.animState.action === "sitting") {
      this.bodyGroup.position.y = -0.2 + breath;
      this.leftLegPivot.rotation.x = -Math.PI / 2;
      this.rightLegPivot.rotation.x = -Math.PI / 2;
      this.leftArmPivot.rotation.x = -0.35;
      this.rightArmPivot.rotation.x = -0.35;
      this.headMesh.rotation.y = Math.sin(this.animClock * 0.5) * 0.1;
      this.group.rotation.y = this.desk.rotation;
    } else if (this.animState.action === "typing") {
      this.bodyGroup.position.y = -0.2 + breath;
      this.leftLegPivot.rotation.x = -Math.PI / 2;
      this.rightLegPivot.rotation.x = -Math.PI / 2;

      // Realistic alternating keystrokes
      this.leftArmPivot.rotation.x = -0.75 + Math.sin(this.animClock * 16) * 0.15;
      this.rightArmPivot.rotation.x = -0.75 + Math.cos(this.animClock * 16) * 0.15;
      this.headMesh.rotation.y = Math.sin(this.animClock * 1.2) * 0.08;
      this.group.rotation.y = this.desk.rotation;
    } else if (this.animState.action === "standing") {
      this.bodyGroup.position.y = breath;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = Math.sin(this.animClock * 2) * 0.08;
      this.rightArmPivot.rotation.x = -Math.sin(this.animClock * 2) * 0.08;
    } else if (this.animState.action === "walking") {
      // Bobbing walking motion
      this.bodyGroup.position.y = Math.abs(Math.sin(this.animClock * 10)) * 0.1;

      // Leg swing
      const legAngle = Math.sin(this.animClock * 10) * 0.65;
      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;

      // Arm swing
      this.leftArmPivot.rotation.x = -legAngle * 0.5;
      this.rightArmPivot.rotation.x = legAngle * 0.5;

      // Follow path
      if (this.animState.path.length > 0 && this.animState.currentWaypointIdx < this.animState.path.length) {
        const targetPt = this.animState.path[this.animState.currentWaypointIdx]!;
        const dx = targetPt[0] - this.group.position.x;
        const dz = targetPt[2] - this.group.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.08) {
          const targetAngle = Math.atan2(dx, dz);
          this.group.rotation.y = targetAngle;

          const moveDist = Math.min(dist, this.animState.walkSpeed * delta);
          this.group.position.x += (dx / dist) * moveDist;
          this.group.position.z += (dz / dist) * moveDist;
        } else {
          this.animState.currentWaypointIdx++;
          if (this.animState.currentWaypointIdx >= this.animState.path.length) {
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
      this.rightArmPivot.rotation.x = -1.35; // raise tablet
      this.leftArmPivot.rotation.x = -0.2;
    } else if (this.animState.action === "handoff_receive") {
      this.bodyGroup.position.y = -0.2;
      this.rightArmPivot.rotation.x = -1.0;
      this.leftArmPivot.rotation.x = -1.0;
    } else if (this.animState.action === "error" || this.animState.action === "blocked") {
      this.bodyGroup.position.y = 0;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = -1.2;
      this.rightArmPivot.rotation.x = -1.2;
      this.headMesh.rotation.y = Math.sin(this.animClock * 6) * 0.2; // anxious shaking head
    }
  }

  dispose() {
    this.nameplateSprite.material.dispose();
    this.chatBubbleSprite.material.dispose();
    this.blockedAlertSprite.material.dispose();
    this.group.clear();
  }
}
