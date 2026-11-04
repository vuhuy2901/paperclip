import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { AgentOfficeState, CameraPreset } from "../types/OfficeTypes";
import { CAMERA_PRESETS, ROOM_DEFINITIONS } from "../config/RoomDefinitions";
import { OfficeFloor3D } from "./OfficeFloor3D";
import { FurnitureBuilder3D } from "./FurnitureBuilder3D";
import { AgentAvatar3D } from "./AgentAvatar3D";
import { officeAnimationQueue } from "../animation/AnimationQueue";
import { officeWaypointGraph } from "../animation/WaypointGraph";
import { officeEventBus } from "../services/OfficeEventBus";
import { useOfficeStore } from "../store/useOfficeStore";

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

  // Hover tooltip state
  const [hoveredAgent, setHoveredAgent] = useState<{
    name: string;
    role: string;
    status: string;
    taskTitle?: string;
    screenX: number;
    screenY: number;
  } | null>(null);

  // References for mutable animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const floorRef = useRef<OfficeFloor3D | null>(null);
  const avatarsMapRef = useRef<Map<string, AgentAvatar3D>>(new Map());
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentCameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 24, 22));
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const isUserInteractingRef = useRef(false);

  // Subscribe to Zustand store for dynamic chat bubbles
  const chatBubbles = useOfficeStore((state) => state.chatBubbles);

  // Helper to reliably find an avatar by ID, mock ID, role, or name
  const resolveAvatar = useCallback((key?: string | null): AgentAvatar3D | undefined => {
    if (!key) return undefined;
    const avatars = avatarsMapRef.current;
    if (!avatars || avatars.size === 0) return undefined;

    // 1. Direct ID in Map keys
    if (avatars.has(key)) return avatars.get(key);

    // 2. Direct match on avatar.agent.id
    for (const av of avatars.values()) {
      if (av.agent.id === key) return av;
    }

    // 3. Known role/keyword mappings
    const normalized = key.toLowerCase().replace(/^agent_/, "");

    const roleMap: Record<string, string[]> = {
      pm: ["project manager", "pm", "marcus"],
      po: ["product owner", "po", "sarah", "product"],
      frontend: ["frontend", "front-end", "web", "kenji"],
      backend: ["backend", "back-end", "api", "elena"],
      reviewer: ["reviewer", "review", "security", "liam"],
      tester: ["tester", "qa", "test", "quality", "priya"],
      devops: ["devops", "infra", "sre", "cloud", "lucas"],
      architect: ["architect", "architecture", "cto", "solution", "david"],
    };

    for (const [category, keywords] of Object.entries(roleMap)) {
      if (category === normalized || normalized.includes(category)) {
        for (const av of avatars.values()) {
          const a = av.agent;
          const combined = `${a.name} ${a.role} ${a.title} ${av.desk.roomId} ${av.desk.roleHint}`.toLowerCase();
          if (keywords.some((kw) => combined.includes(kw))) {
            return av;
          }
        }
      }
    }

    // 4. Fuzzy text match on name/role/title/room
    for (const av of avatars.values()) {
      const a = av.agent;
      const combined = `${a.name} ${a.role} ${a.title} ${av.desk.roomId} ${av.desk.roleHint}`.toLowerCase();
      if (combined.includes(normalized) || normalized.includes(a.name.toLowerCase())) {
        return av;
      }
    }

    return undefined;
  }, []);

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

    // 1. Scene: Warm architectural studio atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eef2f6"); // warm light gray
    scene.fog = new THREE.FogExp2("#eef2f6", 0.007);
    sceneRef.current = scene;

    // 2. Camera: Isometric Perspective
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 180);
    camera.position.set(0, 24, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with soft shadows & ACES tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting: Bright, warm daylight with soft sky fill
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.95);
    scene.add(ambientLight);

    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight("#fffbeb", 1.5);
    sunLight.position.set(18, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -26;
    sunLight.shadow.camera.right = 26;
    sunLight.shadow.camera.top = 26;
    sunLight.shadow.camera.bottom = -26;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Soft sky fill light from opposite corner
    const skyFill = new THREE.DirectionalLight("#bae6fd", 0.65);
    skyFill.position.set(-20, 18, -18);
    scene.add(skyFill);

    // Warm ceiling spot over Management
    const mgmtSpot = new THREE.PointLight("#60a5fa", 1.0, 20);
    mgmtSpot.position.set(-12, 7, -7.75);
    scene.add(mgmtSpot);

    // Cyan ceiling spot over Engineering
    const engSpot = new THREE.PointLight("#06b6d4", 1.0, 20);
    engSpot.position.set(-11, 7, 7.75);
    scene.add(engSpot);

    // Amber ceiling spot over DevOps
    const devopsSpot = new THREE.PointLight("#f59e0b", 1.0, 20);
    devopsSpot.position.set(12, 7, 7.75);
    scene.add(devopsSpot);

    // 5. Build Architectural Structure & Floor
    const floorStructure = new OfficeFloor3D();
    scene.add(floorStructure.group);
    floorRef.current = floorStructure;

    // 6. Build Workstations with status screens for all desks in all rooms
    const furniture = new FurnitureBuilder3D();
    for (const room of ROOM_DEFINITIONS) {
      for (const desk of room.desks) {
        const assignedAgent = officeAgents.find((oa) => oa.assignedDesk?.id === desk.id);
        const status = assignedAgent?.visualStatus ?? "idle";
        const workstationGroup = furniture.createWorkstation(desk, status);
        scene.add(workstationGroup);
      }
    }

    // 7. Spawn Initial Avatars
    const avatars = new Map<string, AgentAvatar3D>();
    for (const officeAgent of officeAgents) {
      const avatar = new AgentAvatar3D(officeAgent.agent, officeAgent.assignedDesk);
      avatar.setStatus(officeAgent.visualStatus, officeAgent.activeTask?.title);
      avatar.setAction(officeAgent.currentAction);
      scene.add(avatar.group);
      avatars.set(officeAgent.agentId, avatar);
    }
    avatarsMapRef.current = avatars;

    // 8. Raycasting for hover tooltip & selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      // Hover detection when not dragging
      if (!isDraggingRef.current) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        let foundAgentId: string | null = null;
        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== scene) {
            if (curr.name && curr.name.startsWith("agent_")) {
              foundAgentId = curr.name.replace("agent_", "");
              break;
            }
            curr = curr.parent;
          }
          if (foundAgentId) break;
        }

        if (foundAgentId) {
          const targetAv = resolveAvatar(foundAgentId);
          if (targetAv) {
            container.style.cursor = "pointer";
            setHoveredAgent({
              name: targetAv.agent.name,
              role: targetAv.agent.title ?? targetAv.agent.role ?? "Agent",
              status: targetAv.animState.visualStatus,
              taskTitle: targetAv.animState.currentTaskTitle,
              screenX: e.clientX,
              screenY: e.clientY,
            });
            return;
          }
        }

        container.style.cursor = "grab";
        setHoveredAgent(null);
        return;
      }

      // Orbit camera rotation
      isUserInteractingRef.current = true;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

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
        const dist = Math.hypot(
          e.clientX - previousMousePositionRef.current.x,
          e.clientY - previousMousePositionRef.current.y,
        );

        // Click selection
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
      const newDist = Math.max(8, Math.min(65, currentDist + zoomFactor));

      cameraPosRef.current.copy(cameraTargetRef.current).add(dir.multiplyScalar(newDist));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    domElement.addEventListener("wheel", handleWheel, { passive: false });

    // 9. Animation & Render Loop
    let animFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update procedural avatar animations (breathing, typing, walking)
      const currentAvatars = avatarsMapRef.current;
      for (const avatar of currentAvatars.values()) {
        avatar.update(delta);
      }

      // Follow active agent if enabled: prioritize walking/handoff avatars, then typing/running
      if (followActiveAgent && !isUserInteractingRef.current) {
        let activeAv: AgentAvatar3D | undefined;
        for (const av of currentAvatars.values()) {
          if (av.animState.action === "walking" || av.animState.action === "handoff_give") {
            activeAv = av;
            break;
          }
        }
        if (!activeAv) {
          for (const av of currentAvatars.values()) {
            if (av.animState.action === "typing" || av.animState.visualStatus === "running") {
              activeAv = av;
              break;
            }
          }
        }

        if (activeAv) {
          const pos = activeAv.group.position;
          cameraTargetRef.current.lerp(new THREE.Vector3(pos.x, 1.2, pos.z), 0.04);
          cameraPosRef.current.lerp(new THREE.Vector3(pos.x + 6, 12, pos.z + 8), 0.04);
        }
      }

      // Smooth camera interpolation
      camera.position.lerp(cameraPosRef.current, 0.07);
      currentCameraLookAtRef.current.lerp(cameraTargetRef.current, 0.07);
      camera.lookAt(currentCameraLookAtRef.current);

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

      for (const avatar of avatarsMapRef.current.values()) {
        avatar.dispose();
      }
      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, [webGlSupported]);

  // Synchronize dynamic Paperclip status updates to avatars & dynamically add/remove avatars
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const avatars = avatarsMapRef.current;
    const floor = floorRef.current;

    for (const officeAgent of officeAgents) {
      if (!avatars.has(officeAgent.agentId)) {
        const avatar = new AgentAvatar3D(officeAgent.agent, officeAgent.assignedDesk);
        avatar.setStatus(officeAgent.visualStatus, officeAgent.activeTask?.title);
        avatar.setAction(officeAgent.currentAction);
        scene.add(avatar.group);
        avatars.set(officeAgent.agentId, avatar);
      } else {
        const avatar = avatars.get(officeAgent.agentId)!;
        avatar.setStatus(officeAgent.visualStatus, officeAgent.activeTask?.title);
        if (avatar.animState.action !== "walking" && avatar.animState.action !== "handoff_give") {
          avatar.setAction(officeAgent.currentAction);
        }
      }
    }

    // Cleanly update room alert if any agent in the room is blocked
    if (floor) {
      const blockedRooms = new Set<string>();
      for (const oa of officeAgents) {
        if ((oa.visualStatus === "blocked" || oa.visualStatus === "error") && oa.assignedDesk?.roomId) {
          blockedRooms.add(oa.assignedDesk.roomId);
        }
      }
      for (const room of ROOM_DEFINITIONS) {
        floor.setRoomAlert(room.id, blockedRooms.has(room.id));
      }
    }

    // Clean up removed agents
    const activeIds = new Set(officeAgents.map((oa) => oa.agentId));
    for (const [id, avatar] of Array.from(avatars.entries())) {
      if (!activeIds.has(id)) {
        scene.remove(avatar.group);
        avatar.dispose();
        avatars.delete(id);
      }
    }
  }, [officeAgents]);

  // Synchronize dynamic chat bubbles from Zustand store to 3D avatars
  useEffect(() => {
    for (const [agentId, bubble] of Object.entries(chatBubbles)) {
      const avatar = resolveAvatar(agentId);
      if (avatar && bubble.message) {
        avatar.setChatBubble(bubble.message);
      }
    }
  }, [chatBubbles, resolveAvatar]);

  // Listen to live office events for real-time 3D state updates
  useEffect(() => {
    const unsubscribe = officeEventBus.subscribe((event) => {
      const avatar = resolveAvatar(event.agentId);
      if (!avatar) return;

      if (event.type === "task_started") {
        avatar.setStatus("running", event.taskTitle);
        avatar.setAction("typing");
      } else if (event.type === "task_completed") {
        avatar.setStatus("idle", event.taskTitle);
        avatar.setAction("sitting");
        if (floorRef.current) {
          floorRef.current.setRoomAlert(avatar.desk.roomId, false);
        }
      } else if (event.type === "task_blocked") {
        avatar.setStatus("blocked", event.taskTitle);
        avatar.setAction("standing");
        if (floorRef.current) {
          floorRef.current.setRoomAlert(avatar.desk.roomId, true);
        }
      } else if (event.type === "comment") {
        if (avatar.animState.action === "sitting") {
          avatar.setAction("typing");
        }
      }
    });

    return () => unsubscribe();
  }, [resolveAvatar]);

  // Listen to handoff delegation queue and animate walking movements
  useEffect(() => {
    const unsubscribe = officeAnimationQueue.subscribe((latestEvent) => {
      if (!latestEvent) return;

      const sourceAvatar = resolveAvatar(latestEvent.sourceAgentId);
      const targetAvatar = resolveAvatar(latestEvent.targetAgentId);

      if (!sourceAvatar || !targetAvatar) {
        console.warn("Could not find avatars for handoff:", latestEvent.sourceAgentId, latestEvent.targetAgentId);
        return;
      }

      if (latestEvent.phase === "enroute") {
        onHandoffBanner?.(
          `${latestEvent.sourceAgentName} is delivering "${latestEvent.taskTitle.slice(0, 32)}" to ${latestEvent.targetAgentName}`,
        );

        const startX = sourceAvatar.group.position.x;
        const startZ = sourceAvatar.group.position.z;
        const targetX = targetAvatar.desk.interactPosition[0];
        const targetZ = targetAvatar.desk.interactPosition[2];

        const path = officeWaypointGraph.findPath(startX, startZ, targetX, targetZ);

        sourceAvatar.startWalkingAlongPath(path, () => {
          officeAnimationQueue.updatePhase(latestEvent.id, "handing_over");
          sourceAvatar.setAction("handoff_give");
          targetAvatar.setAction("handoff_receive");

          setTimeout(() => {
            const returnPath = officeWaypointGraph.findPath(
              targetX,
              targetZ,
              sourceAvatar.desk.chairPosition[0],
              sourceAvatar.desk.chairPosition[2],
            );
            officeAnimationQueue.updatePhase(latestEvent.id, "returning");
            targetAvatar.setAction("typing");

            sourceAvatar.returnToDesk(returnPath, () => {
              sourceAvatar.setAction("sitting");
              sourceAvatar.group.position.set(...sourceAvatar.desk.chairPosition);
              sourceAvatar.group.rotation.y = sourceAvatar.desk.rotation;
              officeAnimationQueue.updatePhase(latestEvent.id, "completed");
            });
          }, 2000);
        });
      }
    });

    return () => unsubscribe();
  }, [onHandoffBanner, resolveAvatar]);

  // Handle selected agent camera focus / zoom
  useEffect(() => {
    if (!selectedAgentId) return;
    isUserInteractingRef.current = false;
    const targetAvatar = resolveAvatar(selectedAgentId);
    if (!targetAvatar) return;

    const deskPos = targetAvatar.desk.position;
    cameraTargetRef.current.set(deskPos[0], 1.2, deskPos[2]);
    cameraPosRef.current.set(deskPos[0] + 4, 8, deskPos[2] + 6);
  }, [selectedAgentId, resolveAvatar]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-100">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Tooltip */}
      {hoveredAgent && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 rounded-xl bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur text-xs flex flex-col gap-1 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredAgent.screenX, top: hoveredAgent.screenY - 12 }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{hoveredAgent.name}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">({hoveredAgent.role})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className={`h-2 w-2 rounded-full ${
                hoveredAgent.status === "running"
                  ? "bg-sky-400 animate-pulse"
                  : hoveredAgent.status === "completed"
                    ? "bg-emerald-400"
                    : hoveredAgent.status === "blocked"
                      ? "bg-rose-400 animate-ping"
                      : "bg-slate-400"
              }`}
            />
            <span className="capitalize text-slate-300">{hoveredAgent.status}</span>
          </div>
          {hoveredAgent.taskTitle && (
            <div className="text-[10px] text-sky-300 font-mono max-w-[200px] truncate">
              {hoveredAgent.taskTitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
