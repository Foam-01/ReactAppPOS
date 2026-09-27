// ประกาศความสัมพันธ์ของ model ครั้งเดียวตอนเริ่ม server
// (เดิมประกาศซ้ำในทุก request ของแต่ละ controller)
// constraints: false = ไม่ให้ sync สร้าง FOREIGN KEY เพิ่ม (คงโครงสร้างตารางเดิม)
const BillSaleModel = require("./BillSaleModel");
const BillSaleDetailModel = require("./BillSaleDetailModel");
const ProductModel = require("./ProductModel");
const ProductImageModel = require("./ProductImageModel");
const StockModel = require("./StockModel");
const MemberModel = require("./MemberModel");
const PackageModel = require("./PackageModel");
const ChangePackageModel = require("./ChangePackageModel");

const noFk = { constraints: false };

BillSaleModel.hasMany(BillSaleDetailModel, noFk);
BillSaleDetailModel.belongsTo(ProductModel, noFk);
BillSaleDetailModel.belongsTo(BillSaleModel, noFk);

ProductModel.hasMany(ProductImageModel, noFk);
ProductModel.hasMany(StockModel, noFk);
ProductModel.hasMany(BillSaleDetailModel, noFk);
StockModel.belongsTo(ProductModel, noFk);

MemberModel.belongsTo(PackageModel, noFk);

ChangePackageModel.belongsTo(PackageModel, noFk);
ChangePackageModel.belongsTo(MemberModel, { foreignKey: "userId", ...noFk });
