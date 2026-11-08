console.log("Step 1: Testing @paperclipai/db...");
const dbMod = await import("@paperclipai/db");
console.log("Step 1 OK: db keys:", Object.keys(dbMod).length);

console.log("Step 2: Testing express...");
const express = (await import("express")).default;
console.log("Step 2 OK: express:", typeof express);

console.log("Step 3: Testing ./src/config.ts...");
const configMod = await import("./src/config.ts");
console.log("Step 3 OK: config loaded");

console.log("Step 4: Testing ./src/routes/atelier-bridge.ts...");
const bridgeMod = await import("./src/routes/atelier-bridge.ts");
console.log("Step 4 OK: atelier-bridge loaded");

console.log("Step 5: Testing ./src/app.ts...");
const appMod = await import("./src/app.ts");
console.log("Step 5 OK: app loaded:", typeof appMod.createApp);

console.log("ALL STEPS OK!");
