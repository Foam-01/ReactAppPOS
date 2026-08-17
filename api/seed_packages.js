const PackageModel = require("./models/PackageModel");
const sequelize = require("./connect");

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    await PackageModel.sync({ alter: true });

    const packages = [
      { name: "Silver", price: 500, bill_amount: 500 },
      { name: "Gold", price: 1500, bill_amount: 2000 },
      { name: "Platinum", price: 3000, bill_amount: 10000 }
    ];

    for (const pkg of packages) {
      const [record, created] = await PackageModel.findOrCreate({
        where: { name: pkg.name },
        defaults: pkg
      });
      console.log(`Package ${pkg.name}: ${created ? "Created" : "Already exists"}`);
    }

    console.log("✅ Packages seed completed successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runSeed();
