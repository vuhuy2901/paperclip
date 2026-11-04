import { ROOM_DEFINITIONS } from "../config/RoomDefinitions";

export interface WaypointNode {
  id: string;
  x: number;
  z: number;
  neighbors: string[];
}

export class OfficeWaypointGraph {
  nodes: Map<string, WaypointNode> = new Map();

  constructor() {
    this.buildGraph();
  }

  private addNode(id: string, x: number, z: number, neighbors: string[] = []) {
    this.nodes.set(id, { id, x, z, neighbors });
  }

  private connect(idA: string, idB: string) {
    const nodeA = this.nodes.get(idA);
    const nodeB = this.nodes.get(idB);
    if (nodeA && nodeB) {
      if (!nodeA.neighbors.includes(idB)) nodeA.neighbors.push(idB);
      if (!nodeB.neighbors.includes(idA)) nodeB.neighbors.push(idA);
    }
  }

  private buildGraph() {
    // 1. Central Hallway spine (Z = 0)
    const hallwayXs = [-14, -12, -11, -9, -6, -3, 0, 3, 6, 9, 11, 12, 14];
    for (let i = 0; i < hallwayXs.length; i++) {
      const id = `hallway_${i}`;
      this.addNode(id, hallwayXs[i]!, 0);
      if (i > 0) {
        this.connect(`hallway_${i - 1}`, id);
      }
    }

    // 2. Doorway nodes and links to hallway
    for (const room of ROOM_DEFINITIONS) {
      for (const door of room.doorways) {
        const doorNodeId = `door_${room.id}`;
        this.addNode(doorNodeId, door.position[0], door.position[2]);

        // Find nearest hallway node and connect
        let nearestHallwayId = "hallway_6";
        let minDistance = Infinity;
        for (const [id, node] of this.nodes.entries()) {
          if (id.startsWith("hallway_")) {
            const dist = Math.hypot(node.x - door.position[0], node.z - door.position[2]);
            if (dist < minDistance) {
              minDistance = dist;
              nearestHallwayId = id;
            }
          }
        }
        this.connect(doorNodeId, nearestHallwayId);

        // Room center waypoint
        const roomCenterId = `center_${room.id}`;
        this.addNode(roomCenterId, room.center[0], room.center[2]);
        this.connect(doorNodeId, roomCenterId);

        // Connect desks to room center
        for (const desk of room.desks) {
          const chairId = `chair_${desk.id}`;
          const interactId = `interact_${desk.id}`;

          this.addNode(chairId, desk.chairPosition[0], desk.chairPosition[2]);
          this.addNode(interactId, desk.interactPosition[0], desk.interactPosition[2]);

          this.connect(chairId, roomCenterId);
          this.connect(interactId, roomCenterId);
          this.connect(chairId, interactId);
        }
      }
    }
  }

  /**
   * Find nearest waypoint node to arbitrary coordinates (x, z)
   */
  findNearestNodeId(x: number, z: number): string {
    let nearest = "hallway_6";
    let minDist = Infinity;
    for (const [id, node] of this.nodes.entries()) {
      const d = Math.hypot(node.x - x, node.z - z);
      if (d < minDist) {
        minDist = d;
        nearest = id;
      }
    }
    return nearest;
  }

  /**
   * Compute shortest path between start coordinates and target coordinates using A*
   */
  findPath(
    startX: number,
    startZ: number,
    targetX: number,
    targetZ: number,
  ): Array<[number, number, number]> {
    const startNodeId = this.findNearestNodeId(startX, startZ);
    const targetNodeId = this.findNearestNodeId(targetX, targetZ);

    if (startNodeId === targetNodeId) {
      return [
        [startX, 0, startZ],
        [targetX, 0, targetZ],
      ];
    }

    const openSet = new Set<string>([startNodeId]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    for (const id of this.nodes.keys()) {
      gScore.set(id, Infinity);
      fScore.set(id, Infinity);
    }

    gScore.set(startNodeId, 0);
    const targetNode = this.nodes.get(targetNodeId)!;
    fScore.set(startNodeId, Math.hypot(this.nodes.get(startNodeId)!.x - targetNode.x, this.nodes.get(startNodeId)!.z - targetNode.z));

    while (openSet.size > 0) {
      let currentId = "";
      let lowestF = Infinity;
      for (const id of openSet) {
        const score = fScore.get(id) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          currentId = id;
        }
      }

      if (currentId === targetNodeId) {
        // Reconstruct path
        const path: Array<[number, number, number]> = [[targetX, 0, targetZ]];
        let curr = currentId;
        while (cameFrom.has(curr)) {
          const n = this.nodes.get(curr)!;
          path.unshift([n.x, 0, n.z]);
          curr = cameFrom.get(curr)!;
        }
        const startN = this.nodes.get(startNodeId)!;
        path.unshift([startN.x, 0, startN.z]);
        path.unshift([startX, 0, startZ]);
        return path;
      }

      openSet.delete(currentId);
      const currentNode = this.nodes.get(currentId)!;

      for (const neighborId of currentNode.neighbors) {
        const neighbor = this.nodes.get(neighborId);
        if (!neighbor) continue;

        const distance = Math.hypot(currentNode.x - neighbor.x, currentNode.z - neighbor.z);
        const tentativeG = (gScore.get(currentId) ?? Infinity) + distance;

        if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, currentId);
          gScore.set(neighborId, tentativeG);
          const h = Math.hypot(neighbor.x - targetNode.x, neighbor.z - targetNode.z);
          fScore.set(neighborId, tentativeG + h);
          openSet.add(neighborId);
        }
      }
    }

    // Fallback direct path
    return [
      [startX, 0, startZ],
      [targetX, 0, targetZ],
    ];
  }
}

export const officeWaypointGraph = new OfficeWaypointGraph();
