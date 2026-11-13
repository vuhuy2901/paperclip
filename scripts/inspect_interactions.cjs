const path = require("path");
const postgres = require(path.resolve(__dirname, "../node_modules/postgres"));

async function main() {
  const sql = postgres("postgres://postgres@127.0.0.1:54329/postgres");
  try {
    const dbs = await sql`SELECT datname FROM pg_database`;
    console.log("Databases:", dbs.map(d => d.datname));

    // Try each db or postgres
    for (const dbName of ["postgres", "paperclip"]) {
      if (dbs.some(d => d.datname === dbName)) {
        console.log(`\n--- Inspecting database: ${dbName} ---`);
        const dbSql = postgres(`postgres://postgres@127.0.0.1:54329/${dbName}`);
        const tables = await dbSql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
        console.log("Tables:", tables.map(t => t.table_name));

        if (tables.some(t => t.table_name === "issue_thread_interactions")) {
          const interactions = await dbSql`
            SELECT id, issue_id, kind, status, title, payload, created_at, updated_at 
            FROM issue_thread_interactions 
            ORDER BY created_at DESC 
            LIMIT 10
          `;
          console.log(`Found ${interactions.length} interactions:`);
          for (const it of interactions) {
            console.log("Interaction:", {
              id: it.id,
              kind: it.kind,
              status: it.status,
              title: it.title,
              payload: JSON.stringify(it.payload, null, 2),
            });
          }
        }
        await dbSql.end();
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

main();
