const sequelize = require("./connect");

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connection OK");

    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("📊 Existing tables in Neon DB:");
    console.log(results.map(r => r.table_name));

  } catch (error) {
    console.error("❌ DB Check Error:", error.message);
  } finally {
    process.exit(0);
  }
}

checkTables();
