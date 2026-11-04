import * as THREE from "three";
import type { DeskDefinition } from "../types/OfficeTypes";

export class FurnitureBuilder3D {
  private deskTopGeo = new THREE.BoxGeometry(1.6, 0.06, 0.85);
  private deskLegGeo = new THREE.BoxGeometry(0.06, 0.72, 0.8);
  private monitorScreenGeo = new THREE.BoxGeometry(0.55, 0.35, 0.03);
  private monitorStandGeo = new THREE.BoxGeometry(0.12, 0.22, 0.08);
  private chairSeatGeo = new THREE.BoxGeometry(0.48, 0.08, 0.48);
  private chairBackGeo = new THREE.BoxGeometry(0.48, 0.48, 0.06);
  private chairStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
  private chairBaseGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 8);

  private woodMat = new THREE.MeshStandardMaterial({ color: "#d97706", roughness: 0.4 });
  private steelMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.3, metalness: 0.8 });
  private monitorFrameMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.2 });
  private chairMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.7 });

  /**
   * Builds an individual employee workstation with desk, dual monitors, keyboard, and ergonomic chair
   */
  createWorkstation(desk: DeskDefinition, isRunning = false): THREE.Group {
    const group = new THREE.Group();
    group.name = `workstation_${desk.id}`;
    group.position.set(...desk.position);
    group.rotation.y = desk.rotation;

    // Desk top
    const deskTop = new THREE.Mesh(this.deskTopGeo, this.woodMat);
    deskTop.position.y = 0.72;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);

    // Desk steel legs
    const leftLeg = new THREE.Mesh(this.deskLegGeo, this.steelMat);
    leftLeg.position.set(-0.72, 0.36, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(this.deskLegGeo, this.steelMat);
    rightLeg.position.set(0.72, 0.36, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Dual Monitors with emissive screen
    const screenColor = isRunning ? "#38bdf8" : "#0284c7";
    const screenMat = new THREE.MeshStandardMaterial({
      color: screenColor,
      emissive: screenColor,
      emissiveIntensity: isRunning ? 0.65 : 0.3,
      roughness: 0.2,
    });

    // Monitor 1 (Main)
    const m1 = new THREE.Mesh(this.monitorScreenGeo, screenMat);
    m1.position.set(-0.3, 1.02, 0.15);
    m1.rotation.y = 0.12;
    group.add(m1);

    const s1 = new THREE.Mesh(this.monitorStandGeo, this.monitorFrameMat);
    s1.position.set(-0.3, 0.85, 0.17);
    group.add(s1);

    // Monitor 2 (Side)
    const m2 = new THREE.Mesh(this.monitorScreenGeo, screenMat);
    m2.position.set(0.3, 1.02, 0.15);
    m2.rotation.y = -0.16;
    group.add(m2);

    const s2 = new THREE.Mesh(this.monitorStandGeo, this.monitorFrameMat);
    s2.position.set(0.3, 0.85, 0.17);
    group.add(s2);

    // Keyboard & Mouse
    const kbGeo = new THREE.BoxGeometry(0.38, 0.015, 0.14);
    const kbMesh = new THREE.Mesh(kbGeo, this.steelMat);
    kbMesh.position.set(-0.05, 0.76, -0.12);
    group.add(kbMesh);

    // Ergonomic Chair positioned at chairPosition relative to desk
    const chairGroup = new THREE.Group();
    // Offset chair backwards
    chairGroup.position.set(0, 0, -0.75);

    const seat = new THREE.Mesh(this.chairSeatGeo, this.chairMat);
    seat.position.y = 0.46;
    seat.castShadow = true;
    chairGroup.add(seat);

    const back = new THREE.Mesh(this.chairBackGeo, this.chairMat);
    back.position.set(0, 0.74, -0.22);
    back.castShadow = true;
    chairGroup.add(back);

    const stem = new THREE.Mesh(this.chairStemGeo, this.steelMat);
    stem.position.y = 0.22;
    chairGroup.add(stem);

    const base = new THREE.Mesh(this.chairBaseGeo, this.steelMat);
    base.position.y = 0.04;
    chairGroup.add(base);

    group.add(chairGroup);

    return group;
  }

  /**
   * Builds blinking enterprise server rack for DevOps
   */
  createServerRack(x: number, z: number, rotation = 0): THREE.Group {
    const rack = new THREE.Group();
    rack.position.set(x, 0, z);
    rack.rotation.y = rotation;

    const frameGeo = new THREE.BoxGeometry(0.85, 2.1, 0.8);
    const frame = new THREE.Mesh(frameGeo, this.steelMat);
    frame.position.y = 1.05;
    frame.castShadow = true;
    rack.add(frame);

    // Glowing server LEDs
    for (let i = 0; i < 7; i++) {
      const ledColor = i % 2 === 0 ? "#10b981" : "#06b6d4";
      const ledMat = new THREE.MeshStandardMaterial({
        color: ledColor,
        emissive: ledColor,
        emissiveIntensity: 0.9,
      });
      const ledGeo = new THREE.BoxGeometry(0.72, 0.08, 0.02);
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(0, 0.4 + i * 0.22, 0.41);
      rack.add(ledMesh);
    }

    return rack;
  }

  /**
   * Builds Kanban / Planning whiteboard for Product Owner
   */
  createWhiteboard(x: number, z: number, rotation = 0): THREE.Group {
    const board = new THREE.Group();
    board.position.set(x, 0, z);
    board.rotation.y = rotation;

    const boardFrameGeo = new THREE.BoxGeometry(2.4, 1.4, 0.06);
    const boardFrameMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.3 });
    const boardFrame = new THREE.Mesh(boardFrameGeo, boardFrameMat);
    boardFrame.position.y = 1.4;
    boardFrame.castShadow = true;
    board.add(boardFrame);

    // Colorful post-it note indicators
    const colors = ["#fef08a", "#bae6fd", "#bbf7d0", "#fbcfe8"];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const noteGeo = new THREE.BoxGeometry(0.18, 0.18, 0.02);
        const noteMat = new THREE.MeshStandardMaterial({ color: colors[(row + col) % colors.length] });
        const note = new THREE.Mesh(noteGeo, noteMat);
        note.position.set(-0.8 + col * 0.4, 1.7 - row * 0.3, 0.04);
        board.add(note);
      }
    }

    return board;
  }

  /**
   * Builds executive meeting table for management / conference
   */
  createConferenceTable(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const topGeo = new THREE.BoxGeometry(3.2, 0.08, 1.4);
    const top = new THREE.Mesh(topGeo, this.woodMat);
    top.position.y = 0.72;
    top.castShadow = true;
    group.add(top);

    const leg1 = new THREE.Mesh(this.deskLegGeo, this.steelMat);
    leg1.position.set(-1.2, 0.36, 0);
    group.add(leg1);

    const leg2 = new THREE.Mesh(this.deskLegGeo, this.steelMat);
    leg2.position.set(1.2, 0.36, 0);
    group.add(leg2);

    return group;
  }

  /**
   * Builds architectural potted plant (fiddle-leaf fig)
   */
  createPottedPlant(x: number, z: number): THREE.Group {
    const plant = new THREE.Group();
    plant.position.set(x, 0, z);

    const potGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.45, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.8 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.225;
    pot.castShadow = true;
    plant.add(pot);

    const stemGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.9, 6);
    const stemMat = new THREE.MeshStandardMaterial({ color: "#15803d", roughness: 0.9 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.7;
    plant.add(stem);

    // Leaves
    const leafGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const leafMat = new THREE.MeshStandardMaterial({ color: "#16a34a", roughness: 0.6 });
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.scale.set(1.2, 0.3, 0.8);
      leaf.position.set(
        Math.sin((i * Math.PI * 2) / 5) * 0.22,
        0.8 + i * 0.12,
        Math.cos((i * Math.PI * 2) / 5) * 0.22,
      );
      leaf.castShadow = true;
      plant.add(leaf);
    }

    return plant;
  }
}
