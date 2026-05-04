import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const flavors = [
  "麻辣", "清淡", "酸甜", "咸香", "蒜香", "酱香",
  "鲜香", "香辣", "酸辣", "甜辣",
];

const restrictions = [
  "不吃牛肉", "不吃猪肉", "不吃羊肉", "素食",
  "海鲜过敏", "不吃辣", "不吃蒜", "不吃香菜", "不吃葱",
];

const dishes = [
  { name: "番茄炒蛋", category: "素菜", flavors: ["酸甜", "清淡", "鲜香"], avoid: ["不吃辣", "素食"] },
  { name: "麻婆豆腐", category: "素菜", flavors: ["麻辣", "咸香"], avoid: ["不吃辣", "素食"] },
  { name: "宫保鸡丁", category: "荤菜", flavors: ["酸甜", "香辣"], avoid: ["不吃猪肉", "不吃牛肉", "不吃羊肉", "海鲜过敏"] },
  { name: "红烧肉", category: "荤菜", flavors: ["咸香", "酱香"], avoid: ["不吃猪肉", "素食", "不吃辣"] },
  { name: "清蒸鲈鱼", category: "荤菜", flavors: ["清淡", "鲜香"], avoid: ["海鲜过敏", "素食"] },
  { name: "水煮鱼", category: "荤菜", flavors: ["麻辣", "鲜香", "香辣"], avoid: ["海鲜过敏", "素食", "不吃辣"] },
  { name: "回锅肉", category: "荤菜", flavors: ["咸香", "香辣"], avoid: ["不吃猪肉", "素食"] },
  { name: "鱼香肉丝", category: "荤菜", flavors: ["酸甜", "咸香", "酸辣"], avoid: ["不吃猪肉", "素食"] },
  { name: "蒜蓉西兰花", category: "素菜", flavors: ["蒜香", "清淡"], avoid: ["不吃蒜"] },
  { name: "酸辣土豆丝", category: "素菜", flavors: ["酸辣", "咸香"], avoid: ["不吃辣"] },
  { name: "糖醋里脊", category: "荤菜", flavors: ["酸甜", "咸香"], avoid: ["不吃猪肉", "素食"] },
  { name: "地三鲜", category: "素菜", flavors: ["咸香", "鲜香"], avoid: ["不吃蒜"] },
  { name: "兰州拉面", category: "主食", flavors: ["清淡", "咸香", "鲜香"], avoid: ["不吃牛肉", "海鲜过敏"] },
  { name: "蛋炒饭", category: "主食", flavors: ["清淡", "咸香"], avoid: ["海鲜过敏"] },
  { name: "麻辣香锅", category: "荤菜", flavors: ["麻辣", "香辣", "鲜香"], avoid: ["不吃辣"] },
  { name: "皮蛋豆腐", category: "素菜", flavors: ["清淡", "咸香"], avoid: ["素食"] },
  { name: "干煸四季豆", category: "素菜", flavors: ["咸香", "香辣"], avoid: ["不吃辣"] },
  { name: "酸菜鱼", category: "荤菜", flavors: ["酸辣", "鲜香"], avoid: ["海鲜过敏", "素食"] },
  { name: "小炒肉", category: "荤菜", flavors: ["咸香", "香辣", "鲜香"], avoid: ["不吃猪肉", "素食"] },
  { name: "蒸水蛋", category: "素菜", flavors: ["清淡", "鲜香"], avoid: ["素食"] },
  { name: "酸汤肥牛", category: "荤菜", flavors: ["酸辣", "鲜香"], avoid: ["不吃牛肉", "素食"] },
  { name: "葱油拌面", category: "主食", flavors: ["咸香", "清淡"], avoid: ["不吃葱"] },
  { name: "牛肉面", category: "主食", flavors: ["咸香", "鲜香", "香辣"], avoid: ["不吃牛肉", "海鲜过敏"] },
  { name: "螺蛳粉", category: "主食", flavors: ["酸辣", "鲜香", "麻辣"], avoid: ["不吃辣"] },
  { name: "三杯鸡", category: "荤菜", flavors: ["酱香", "咸香"], avoid: ["不吃猪肉", "不吃牛肉", "不吃羊肉", "海鲜过敏"] },
  { name: "拍黄瓜", category: "素菜", flavors: ["清淡", "蒜香", "酸辣"], avoid: ["不吃蒜"] },
  { name: "酸辣粉", category: "小吃", flavors: ["酸辣", "麻辣", "鲜香"], avoid: ["不吃辣"] },
  { name: "汉堡", category: "小吃", flavors: ["咸香", "鲜香"], avoid: ["不吃牛肉", "素食"] },
  { name: "寿司", category: "主食", flavors: ["清淡", "鲜香"], avoid: ["海鲜过敏"] },
  { name: "麻辣烫", category: "小吃", flavors: ["麻辣", "香辣", "鲜香"], avoid: ["不吃辣"] },
];

async function main() {
  console.log("Seeding flavors...");
  for (const name of flavors) {
    await prisma.flavor.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeding restrictions...");
  for (const name of restrictions) {
    await prisma.restriction.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeding dishes...");
  const flavorRecords = await prisma.flavor.findMany();
  const restrictionRecords = await prisma.restriction.findMany();
  const flavorMap = new Map(flavorRecords.map((f) => [f.name, f.id]));
  const restrictionMap = new Map(restrictionRecords.map((r) => [r.name, r.id]));

  for (const dish of dishes) {
    const dishFlavors = dish.flavors
      .map((name) => flavorMap.get(name))
      .filter((id): id is number => id !== undefined);
    const dishAvoid = dish.avoid
      .map((name) => restrictionMap.get(name))
      .filter((id): id is number => id !== undefined);

    await prisma.dish.create({
      data: {
        name: dish.name,
        category: dish.category,
        isPreset: true,
        flavors: { create: dishFlavors.map((flavorId) => ({ flavorId })) },
        avoidRestrictions: { create: dishAvoid.map((restrictionId) => ({ restrictionId })) },
      },
    });
  }

  console.log(`Seeded ${flavors.length} flavors, ${restrictions.length} restrictions, ${dishes.length} dishes.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
