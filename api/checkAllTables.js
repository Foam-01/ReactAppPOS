const sequelize = require("./connect");

async function checkAllTables() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("Tables found:", tables.map(t => t.table_name));

    for (const t of tables) {
      const [countResult] = await sequelize.query(`SELECT COUNT(*) FROM "${t.table_name}"`);
      console.log(`Table '${t.table_name}': ${countResult[0].count} rows`);
    }

  } catch (err) {
    console.error("Error checking tables:", err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkAllTables();
