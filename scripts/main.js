import { world } from "@minecraft/server";

// ----------------------------------------
// 設定
// ----------------------------------------

// 横掘りを制限するブロック
const RESTRICTED_BLOCKS = [
    { id: "minecraft:stone",         name: "石" },
    { id: "minecraft:deepslate",     name: "深層岩" },
    { id: "minecraft:tuff",          name: "凝灰岩" },
    { id: "minecraft:granite",       name: "花崗岩" },
    { id: "minecraft:diorite",       name: "閃緑岩" },
    { id: "minecraft:andesite",      name: "安山岩" },
    { id: "minecraft:blackstone",    name: "ブラックストーン" },
    { id: "minecraft:basalt",        name: "玄武岩" },
    { id: "minecraft:smooth_basalt", name: "滑らかな玄武岩" },
];

// 高速検索用
const RESTRICTED_BLOCK_MAP = new Map(
    RESTRICTED_BLOCKS.map(block => [block.id, block.name])
);

// ----------------------------------------
// 採掘制限
// ----------------------------------------

world.beforeEvents.playerBreakBlock.subscribe((event) => {

    const player = event.player;
    const block = event.block;

    const blockName = RESTRICTED_BLOCK_MAP.get(block.typeId);

    // 制限対象外
    if (!blockName)
        return;

    const dimension = block.dimension;
    const { x, y, z } = block.location;

    const above = dimension.getBlock({ x, y: y + 1, z });
    const above2 = dimension.getBlock({ x, y: y + 2, z });
    const below = dimension.getBlock({ x, y: y - 1, z });

    // 制限対象ブロックかどうか判定
    const currentRestricted = RESTRICTED_BLOCK_MAP.has(block.typeId);
    const aboveRestricted = above && RESTRICTED_BLOCK_MAP.has(above.typeId);
    const above2Restricted = above2 && RESTRICTED_BLOCK_MAP.has(above2.typeId);
    const belowRestricted = below && RESTRICTED_BLOCK_MAP.has(below.typeId);

    // 4ブロック全てが制限対象なら破壊禁止
    if (
        currentRestricted &&
        aboveRestricted &&
        above2Restricted &&
        belowRestricted
    ) {
        event.cancel = true;
        player.sendMessage(`§c${blockName}は上下に制限対象ブロックがあるため破壊できません。`);
    }

});