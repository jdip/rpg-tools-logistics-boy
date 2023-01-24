const PACKS = [
  'pathfinder-core-rulebook',
  'pathfinder-gamemastery-guide',
  'pathfinder-bestiary',
  'pathfinder-bestiary-2',
  'pathfinder-bestiary-3',
  'pathfinder-secrets-of-magic',
  'pathfinder-advanced-players-guide',
  'pathfinder-dark-archive',
  'pathfinder-book-of-the-dead',
  'Pathfinder Core Rulebook'
]

const RARITIES = {
  common: 100,
  uncommon: 5,
  rare: 1,
  unique: 0
}

const logisticsFolder = game.folders.getName('LogisticsBoy') ?? await Folder.create({ name: 'LogisticsBoy', type: 'RollTable' })

const buildTable = async (name, items, superCommon) => {
  let tbl = game.collections.get('RollTable').find(t => t.name === `LogisticsBoy - ${name}` && t.folder === logisticsFolder)
  if (!tbl) tbl = await RollTable.create({ name: `LogisticsBoy - ${name}`, folder: logisticsFolder })
  await tbl.deleteEmbeddedDocuments('TableResult', tbl.results.map(item => item.id))
  await Promise.all(items.map(async (item) => {
    const rarity = item.system.rarity ? item.system.rarity : 'common'
    if (rarity === 'unique') return
    const level = item.system.level.value ? parseInt(item.system.level.value) : 0
    const levelFactor = (21 - level) * (21 - level)
    const weight = levelFactor * RARITIES[rarity] * (superCommon?.hasOwnProperty(item.name) ? superCommon[item.name] : 1)
    await tbl.createEmbeddedDocuments('TableResult', data = [{
      type: 2,
      text: item.name,
      img: item.img,
      range: [1, 1],
      weight,
      documentCollection: 'pf2e.equipment-srd',
      documentId: item._id
    }])
  }))
  await tbl.normalize()
}

new Dialog({
  title: 'Logistics Boy',
  content: `
        <BR>
        <h2>Generate Loot Tables?</h2>
        <p>LogisticsBoy will create a standard set of roll tables full of loot for use with StockBoy/LootBoy.</p>
        <p></p>
        <p>This will <b>RESET</b> the existing LogisticsBoy roll tables!</p>
        <p></p>
        <p><b><i>This can take a while ... </i></b></p>
        <BR>`,
  buttons: {
    no: {
      icon: "<i class='fas fa-cancel'></i>",
      label: 'Nope'
    },
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: 'Do it!',
      callback: async () => {
        const originalPauseState = game.paused
        if (!game.paused) game.togglePause()
        const inProgressDialog = new Dialog({
          title: 'Stock Boy Logistics Setup',
          content: `
                            <BR>
                            <h2>Working on it ...</h2>
                            <p>Hang tight.</p>
                            <BR>`,
          buttons: {
            yes: {
              icon: "<i class='fas fa-check'></i>",
              label: 'Great!'
            }
          }
        }).render(true)

        const equipmentPack = game.packs.get('pf2e.equipment-srd')
        const items = new Set()
        equipmentPack.index.forEach(item => {
          if (PACKS.find(p => p === item.system?.source.value)) {
            items.add(item)
          }
        })

        const shields = items.filter((item) => {
          return (item.type === 'armor' && item.system.category === 'shield') ||
              item.system.group === 'shield' && item.name !== 'Shield Bash'
        }
        )

        const hardArmor = items.filter((item) =>
          (item.type === 'armor' &&
            item.system.category !== 'shield' &&
            item.system.group !== 'leather' &&
            item.system.category !== 'unarmored' &&
            item.name !== 'Padded Armor') ||
          item.name.match(/[Gg]auntlet/g)

        )

        const softArmor = items.filter((item) =>
          (item.type === 'armor' &&
            item.system.category !== 'shield' &&
            item.system.group === 'leather' &&
            item.system.category !== 'unarmored') ||
          item.name === 'Padded Armor'
        )

        const clothing = items.filter((item) => item.name.startsWith('Clothing'))

        const generalStore = items.filter((item) =>
          (
            item.type === 'equipment' ||
            item.type === 'backpack'
          ) &&
          item.system.rarity === 'common' &&
          !item.name.startsWith("Alchemist's") &&
          !item.system.traits?.value?.includes('magical') &&
          !item.system.traits?.value?.includes('abjuration') &&
          !item.system.traits?.value?.includes('conjuration') &&
          !item.system.traits?.value?.includes('divination') &&
          !item.system.traits?.value?.includes('enchantment') &&
          !item.system.traits?.value?.includes('evocation') &&
          !item.system.traits?.value?.includes('illusion') &&
          !item.system.traits?.value?.includes('necromancy') &&
          !item.system.traits?.value?.includes('transmutation') &&
          !item.system.traits?.value?.includes('divine') &&
          !item.system.traits?.value?.includes('primal') &&
          !item.system.traits?.value?.includes('apex') &&
          !item.system.traits?.value?.includes('invested') &&
          !item.system.traits?.value?.includes('precious')
        )

        const alchemist = items.filter((item) =>
          (item.type === 'consumable' && (
            item.system.consumableType?.value === 'potion' ||
            item.system.consumableType?.value === 'oil' ||
            item.system.consumableType?.value === 'potion' ||
            item.system.consumableType?.value === 'mutagen' ||
            item.system.consumableType?.value === 'elixir' ||
            item.system.consumableType?.value === 'poison'
          )) ||
          item.system.group === 'bomb' ||
          item.name.startsWith("Alchemist's")
        )

        const meleeWeapons = items.filter((item) =>
          item.type === 'weapon' &&
          item.system.group !== 'bomb' &&
          item.system.group !== 'dart' &&
          item.system.group !== 'bow' &&
          item.system.group !== 'sling' &&
          item.system.group !== 'shield' &&
          !item.system.traits?.value?.includes('staff') &&
          !item.name.match(/[Gg]auntlet/g) &&
          item.name !== 'Fist' &&
          item.name !== 'Shield Bash'

        )

        const rangedWeapons = items.filter((item) =>
          (item.type === 'weapon' &&
            item.system.group !== 'bomb' &&
            (item.system.group === 'dart' ||
              item.system.group === 'bow' ||
              item.system.group === 'sling') &&
            item.system.group !== 'shield' &&
            !item.system.traits?.value?.includes('staff') &&
            !item.name.match(/[Gg]auntlet/g) &&
            item.name !== 'Fist' &&
            item.name !== 'Shield Bash') ||
          item.system.stackGroup === 'arrows' ||
          item.system.stackGroup === 'bolts' ||
          item.system.stackGroup === 'slingBullets' ||
          item.system.stackGroup === 'blowgunDarts'
        )

        const oddities = items.filter((item) =>
          item.type === 'equipment' &&
            (
              item.system.traits?.value?.includes('magical') ||
              item.system.traits?.value?.includes('invested') ||
              item.system.traits?.value?.includes('abjuration') ||
              item.system.traits?.value?.includes('conjuration') ||
              item.system.traits?.value?.includes('divination') ||
              item.system.traits?.value?.includes('enchantment') ||
              item.system.traits?.value?.includes('evocation') ||
              item.system.traits?.value?.includes('illusion') ||
              item.system.traits?.value?.includes('necromancy') ||
              item.system.traits?.value?.includes('transmutation') ||
              item.system.traits?.value?.includes('divine') ||
              item.system.traits?.value?.includes('primal') ||
              item.system.traits?.value?.includes('apex')
            ) &&
            !item.system.traits?.value?.includes('precious')
        )

        const arcana = items.filter((item) =>
          item.system.traits?.value?.includes('staff') ||
          item.name.startsWith('Scroll ') ||
          item.name.match(/Scroll Case/) ||
          item.name.match(/Wand /) ||
          item.name.match(/Robe/)
        )

        const spellScrollsWands = items.filter((item) =>
          item.name.startsWith('Magic Wand ') ||
          item.name.match(/Scroll of \d+..-level Spell/g)
        )

        const preciousTreasures = items.filter((item) =>
          (item.type === 'treasure' ||
            item.system.traits?.value?.includes('precious')) &&
          item.system.stackGroup !== 'coins'
        )

        await buildTable('Shields', shields)
        await buildTable('Armor - Hard', hardArmor)
        await buildTable('Armor - Soft', softArmor)
        await buildTable('Armor', [...softArmor, ...hardArmor, ...shields])
        await buildTable('Clothing', clothing)
        await buildTable('General Store', generalStore)
        await buildTable('Alchemist', alchemist, { 'Healing Potion (Minor)': 4 })
        await buildTable('Weapons - Melee', meleeWeapons)
        await buildTable('Weapons - Ranged', rangedWeapons, { Arrows: 2, Bolts: 2, 'Sling Bullets': 2 })
        await buildTable('Weapons', [...meleeWeapons, ...rangedWeapons], { Arrows: 2, Bolts: 2, 'Sling Bullets': 2 })
        await buildTable('Magical Oddities', oddities)
        await buildTable('Arcana', arcana, { 'Scroll Case': 3 })
        await buildTable('Precious Treasures', preciousTreasures)
        // await buildTable('Spell Scrolls & Wands', spellScrollsWands);

        console.log(items.filter((item) => item.name === 'Healing Potion (Minor)'))
        if (game.paused !== originalPauseState) game.togglePause()
        await inProgressDialog.close()
        new Dialog({
          title: 'Stock Boy Logistics Setup',
          content: `
                            <BR>
                            <h2>All done chief!</h2>
                            <BR>`,
          buttons: {
            yes: {
              icon: "<i class='fas fa-check'></i>",
              label: 'Great!'
            }
          }
        }).render(true)
      }
    }
  },
  default: 'yes'
}).render(true)
