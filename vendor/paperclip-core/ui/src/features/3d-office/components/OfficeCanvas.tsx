import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { AgentOfficeState, CameraPreset } from "../types/OfficeTypes";
import { CAMERA_PRESETS } from "../config/RoomDefinitions";
import { OfficeFloor3D } from "./OfficeFloor3D";
import { FurnitureBuilder3D } from "./FurnitureBuilder3D";
import { AgentAvatar3D } from "./AgentAvatar3D";
import { officeAnimationQueue } from "../animation/AnimationQueue";
import { officeWaypointGraph } from "../animation/WaypointGraph";

interface OfficeCanvasProps {
  officeAgents: AgentOfficeState[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  followActiveAgent: boolean;
  activePresetKey: string;
  onHandoffBanner?: (message: string) => void;
}

export function OfficeCanvas({
  officeAgents,
  selectedAgentId,
  onSelectAgent,
  followActiveAgent,
  activePresetKey,
  onHandoffBanner,
}: OfficeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References for mutable animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarsMapRef = useRef<Map<string, AgentAvatar3D>>(new Map());
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 26, 24));
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const isUserInteractingRef = useRef(false);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  // Update camera preset when prop changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[activePresetKey] ?? CAMERA_PRESETS.overview!;
    cameraPosRef.current.set(...preset.position);
    cameraTargetRef.current.set(...preset.target);
    isUserInteractingRef.current = false;
  }, [activePresetKey]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webGlSupported) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090d16");
    scene.fog = new THREE.FogExp2("#090d16", 0.012);
    sceneRef.current = scene;

    // 2. Camera (Isometric-style Perspective)
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.5, 150);
    camera.position.set(0, 26, 24);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight("#94a3b8", 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#f8fafc", 1.4);
    sunLight.position.set(16, 28, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 70;
    sunLight.shadow.camera.left = -24;
    sunLight.shadow.camera.right = 24;
    sunLight.shadow.camera.top = 24;
    sunLight.shadow.camera.bottom = -24;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight("#38bdf8", 0.5);
    fillLight.position.set(-18, 15, -16);
    scene.add(fillLight);

    // Warm ceiling spot over management
    const mgmtSpot = new THREE.PointLight("#60a5fa", 1.2, 18);
    mgmtSpot.position.set(-12, 6, -7.75);
    scene.add(mgmtSpot);

    // Cyan ceiling spot over devops
    const devopsSpot = new THREE.PointLight("#22d3ee", 1.2, 18);
    devopsSpot.position.set(12, 6, 7.75);
    scene.add(devopsSpot);

    // 5. Build Architectural Structure & Desks
    const floorStructure = new OfficeFloor3D();
    scene.add(floorStructure.group);

    const furniture = new FurnitureBuilder3D();
    for (const officeAgent of officeAgents) {
      const isRunning = officeAgent.visualStatus === "running";
      const workstationGroup = furniture.createWorkstation(officeAgent.assignedDesk, isRunning);
      scene.add(workstationGroup);
    }

    // 6. Spawn Avatars for each real Paperclip Agent
    const avatars = new Map<string, AgentAvatar3D>();
    for (const officeAgent of officeAgents) {
      const avatar = new AgentAvatar3D(officeAgent.agent, officeAgent.assignedDesk);
      avatar.setStatus(officeAgent.visualStatus);
      avatar.setAction(officeAgent.currentAction);
      scene.add(avatar.group);
      avatars.set(officeAgent.agentId, avatar);
    }
    avatarsMapRef.current = avatars;

    // 7. Raycasting for avatar selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isUserInteractingRef.current = true;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      // Orbit camera around target
      const offset = camera.position.clone().sub(cameraTargetRef.current);
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(0.1, Math.min(1.5, offset.y / radius)));

      theta -= deltaX * 0.005;
      phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, phi + deltaY * 0.005));

      cameraPosRef.current.x = cameraTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      cameraPosRef.current.y = cameraTargetRef.current.y + radius * Math.cos(phi);
      cameraPosRef.current.z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        // If mouse didn't move much, treat as click
        const dist = Math.hypot(
          e.clientX - previousMousePositionRef.current.x,
          e.clientY - previousMousePositionRef.current.y,
        );
        if (dist < 4) {
          const rect = container.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);

          for (const hit of intersects) {
            let curr: THREE.Object3D | null = hit.object;
            while (curr && curr !== scene) {
              if (curr.name && curr.name.startsWith("agent_")) {
                const agentId = curr.name.replace("agent_", "");
                onSelectAgent(agentId);
                return;
              }
              curr = curr.parent;
            }
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      isUserInteractingRef.current = true;
      const zoomFactor = e.deltaY * 0.02;
      const dir = camera.position.clone().sub(cameraTargetRef.current).normalize();
      const currentDist = camera.position.distanceTo(cameraTargetRef.current);
      const newDist = Math.max(8, Math.min(60, currentDist + zoomFactor));

      cameraPosRef.current.copy(cameraTargetRef.current).add(dir.multiplyScalar(newDist));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    domElement.addEventListener("wheel", handleWheel, { passive: false });

    // 8. Animation & Render Loop
    let animFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update character procedural animations
      for (const avatar of avatars.values()) {
        avatar.update(delta);
      }

      // Smooth camera interpolation
      camera.position.lerp(cameraPosRef.current, 0.06);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      camera.lookAt(cameraTargetRef.current);

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      domElement.removeEventListener("wheel", handleWheel);

      for (const avatar of avatars.values()) {
        avatar.dispose();
      }
      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, [webGlSupported]);

  // Synchronize dynamic Paperclip status updates to avatars
  useEffect(() => {
    const avatars = avatarsMapRef.current;
    for (const officeAgent of officeAgents) {
      const avatar = avatars.get(officeAgent.agentId);
      if (avatar) {
        avatar.setStatus(officeAgent.visualStatus);
        // If not walking in a handoff, keep action synced
        if (avatar.animState.action !== "walking" && avatar.animState.action !== "handoff_give") {
          avatar.setAction(officeAgent.currentAction);
        }
      }
    }
  }, [officeAgents]);

  // Listen to handoff delegation queue and animate walking movements
  useEffect(() => {
    const unsubscribe = officeAnimationQueue.subscribe((latestEvent, activeHandoffs) => {
      if (!latestEvent) return;

      const avatars = avatarsMapRef.current;
      const sourceAvatar = avatars.get(latestEvent.sourceAgentId);
      const targetAvatar = avatars.get(latestEvent.targetAgentId);

      if (!sourceAvatar || !targetAvatar) return;

      if (latestEvent.phase === "enroute") {
        onHandoffBanner?.(
          `${latestEvent.sourceAgentName} is delivering "${latestEvent.taskTitle.slice(0, 32)}" to ${latestEvent.targetAgentName}`,
        );

        // Compute shortest path along waypoints from source chair to target interaction point
        const startX = sourceAvatar.desk.chairPosition[0];
        const startZ = sourceAvatar.desk.chairPosition[2];
        const targetX = targetAvatar.desk.interactPosition[0];
        const targetZ = targetAvatar.desk.interactPosition[2];

        const path = officeWaypointGraph.findPath(startX, startZ, targetX, targetZ);

        sourceAvatar.startWalkingAlongPath(path, () => {
          // Reached recipient!
          officeAnimationQueue.updatePhase(latestEvent.id, "handing_over");
          sourceAvatar.setAction("handoff_give");
          targetAvatar.setAction("handoff_receive");

          // 2.2 seconds handoff pause
          setTimeout(() => {
            // Retrace path back to source desk
            const returnPath = officeWaypointGraph.findPath(targetX, targetZ, startX, startZ);
            officeAnimationQueue.updatePhase(latestEvent.id, "returning");
            targetAvatar.setAction("typing");

            sourceAvatar.returnToDesk(returnPath, () => {
              sourceAvatar.setAction("sitting");
              officeAnimationQueue.updatePhase(latestEvent.id, "completed");
            });
          }, 2200);
        });
      }
    });

    return () => unsubscribe();
  }, [onHandoffBanner]);

  // Handle selected agent camera focus / follow
  useEffect(() => {
    if (!selectedAgentId) return;
    const avatars = avatarsMapRef.current;
    const targetAvatar = avatars.get(selectedAgentId);
    if (!targetAvatar) return;

    const deskPos = targetAvatar.desk.position;
    cameraTargetRef.current.set(deskPos[0], 0.8, deskPos[2]);
    cameraPosRef.current.set(deskPos[0] + 4, 8, deskPos[2] + 6);
  }, [selectedAgentId]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
