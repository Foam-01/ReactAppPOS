const ProductModel = require("../models/ProductModel");
const ProductImageModel = require("../models/ProductImageModel");
const sequelize = require("../connect");

async function checkKaprao() {
  try {
    await sequelize.authenticate();

    const products = await ProductModel.findAll();
    console.log("Products list:");
    products.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}`));

    const kaprao = products.find(p => p.name.includes("กะเพรา"));
    if (kaprao) {
      console.log("\nFound Kaprao product:", kaprao.id, kaprao.name);
      const images = await ProductImageModel.findAll({
        where: { productId: kaprao.id }
      });
      console.log("Kaprao images in DB:", images.map(img => ({
        id: img.id,
        imageName: img.imageName,
        isMain: img.isMain
      })));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkKaprao();
