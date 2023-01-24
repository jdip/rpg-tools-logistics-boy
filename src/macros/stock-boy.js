const defaultItemPrices = {
  0: [0.1, 0.1],
  1: [10, 20],
  2: [25, 35],
  3: [45, 60],
  4: [75, 100],
  5: [125, 160],
  6: [200, 250],
  7: [300, 360],
  8: [415, 500],
  9: [575, 700],
  10: [820, 1000],
  11: [1160, 1400],
  12: [1640, 2000],
  13: [2400, 3000],
  14: [3600, 4500],
  15: [5300, 6500],
  16: [7900, 10000],
  17: [12000, 15000],
  18: [18600, 24000],
  19: [30400, 40000],
  20: [52000, 70000]
}

const scrollCompendiumIds = {
  1: 'RjuupS9xyXDLgyIr',
  2: 'Y7UD64foDbDMV9sx',
  3: 'ZmefGBXGJF3CFDbn',
  4: 'QSQZJ5BC3DeHv153',
  5: 'tjLvRWklAylFhBHQ',
  6: '4sGIy77COooxhQuC',
  7: 'fomEZZ4MxVVK3uVu',
  8: 'iPki3yuoucnj7bIt',
  9: 'cFHomF3tty8Wi1e5',
  10: 'o1XIHJ4MJyroAHfF'
}

const wandCompendiumIds = {
  1: 'UJWiN0K3jqVjxvKk',
  2: 'vJZ49cgi8szuQXAD',
  3: 'wrDmWkGxmwzYtfiA',
  4: 'Sn7v9SsbEDMUIwrO',
  5: '5BF7zMnrPYzyigCs',
  6: 'kiXh4SUWKr166ZeM',
  7: 'nmXPj9zuMRQBNT60',
  8: 'Qs8RgNH6thRPv2jt',
  9: 'Fgv722039TVM5JTc'
}

const logisticsFolder = game.folders.getName('LogisticsBoy') ?? await Folder.create({ name: 'LogisticsBoy', type: 'RollTable' })

const getIdForSpellConsumable = (type, heightenedLevel) => {
  return type === 'scroll'
    ? scrollCompendiumIds[heightenedLevel] ?? null
    : wandCompendiumIds[heightenedLevel] ?? null
}

const getNameForSpellConsumable = (type, spellName, heightenedLevel) => {
  if (type === 'scroll') {
    return game.i18n.format('PF2E.ScrollFromSpell', { name: spellName, level: heightenedLevel })
  } else {
    return game.i18n.format('PF2E.WandFromSpell', { name: spellName, level: heightenedLevel })
  }
}
const createConsumableFromSpell = async (
  type, // "scroll" | "wand"
  spell, // SpellPF2e,
  heightenedLevel = spell.baseLevel
) => {
  const pack = game.packs.find((p) => p.collection === 'pf2e.equipment-srd')
  const itemId = getIdForSpellConsumable(type, heightenedLevel)
  const consumable = await pack?.getDocument(itemId ?? '')

  const consumableSource = consumable.toObject()
  consumableSource.system.traits.value.push(...spell.system.traditions.value)
  consumableSource.name = getNameForSpellConsumable(type, spell.name, heightenedLevel)
  const description = consumableSource.system.description.value
  consumableSource.system.description.value =
    (spell.sourceId ? '@' + spell.sourceId.replace('.', '[') + ']' : spell.description) + `\n<hr />${description}`
  consumableSource.system.spell = spell.clone({ 'system.location.heightenedLevel': heightenedLevel }).toObject()

  return consumableSource
}

const getRandomKey = (collection) => {
  const keys = [...collection.keys()]
  return keys[Math.floor(Math.random() * keys.length)]
}

const getRandomSpell = async (maxLevel = 10, numCandidates = 3) => {
  const spellPack = game.packs.find((p) => p.collection === 'pf2e.spells-srd')
  const spellIndex = [...spellPack.index.values()]
  const spells = spellIndex.filter(spell => spell.system?.level.value <= maxLevel)
  const candidates = []
  const specificHeighten = new RegExp(`Heightened \\(${maxLevel}.\\)`, 'g')
  const incrementalHeighten = new RegExp('Heightened \\(\\+(\\d)+\\)')
  for (let i = 0; i < numCandidates; i = i + 1) {
    const candidateId = spells[Math.floor(Math.random() * spells.length)]._id
    const candidate = await spellPack?.getDocument(candidateId ?? '')
    const ih = candidate.system.description.value.match(incrementalHeighten)
    if (ih && (maxLevel - parseInt(candidate.system.level.value)) % parseInt(ih[1]) === 0) {
      console.log('Allowing', candidate.name, maxLevel, candidate.system.level.value, ih[1])
      candidates.push(candidate)
    } else if (ih) {
      console.log('Not Allowing', ih, candidate.name, maxLevel, candidate.system.level.value, ih[1], (maxLevel - parseInt(candidate.system.level.value)) % parseInt(ih[1]))
    } else if (candidate.system.level.value === maxLevel || candidate.system.description.value.match(specificHeighten)
    ) {
      candidates.push(candidate)
    }
  }
  if (candidates.length === 0) {
    console.log('No candidates')
    const backupSpells = spellIndex.filter(spell => spell.system.level.value === maxLevel)
    const backupId = backupSpells[Math.floor(Math.random() * backupSpells.length)]._id
    const candidate = await spellPack?.getDocument(backupId ?? '')
    candidates.push(candidate)
  }
  const picked = candidates.sort((a, b) => parseInt(a.system.level.value) - parseInt(b.system.level.value))[0]
  if (parseInt(picked.system.level.value) < maxLevel) {
    console.log('Picked below level:', maxLevel, picked)
  }
  return picked
}

const MAX_ITERATIONS = 9999
const spellPack = game.packs.find((p) => p.collection === 'pf2e.spells-srd')
const spells = [...spellPack.index.values()].filter(spell => spell.name === 'Dread Ambience')
console.log(spells)
const goldValue = (asset) => {
  return asset.pp * 10 + asset.gp + asset.sp / 10 + asset.cp / 100
}

const roundCoins = (coins) => {
  const result = { cp: coins.cp, sp: coins.sp, gp: coins.gp, pp: coins.pp }
  result.gp = result.gp + (result.pp - Math.floor(result.pp)) * 10
  result.pp = Math.floor(result.pp)
  result.sp = result.sp + (result.gp - Math.floor(result.gp)) * 10
  result.gp = Math.floor(result.gp)
  result.cp = result.cp + (result.sp - Math.floor(result.sp)) * 10
  result.sp = Math.floor(result.sp)
  result.cp = Math.ceil(result.cp)
  return result
}
const goldValueToCoins = (value) => {
  const coins = { cp: 0, sp: 0, gp: 0, pp: 0 }
  coins.pp = value / 10
  return roundCoins(coins)
}

const tokens = canvas.tokens.controlled

if (tokens.length !== 1 || tokens[0].actor.system.lootSheetType !== 'Merchant') {
  ui.notifications.error('StockBoy needs you to have a single <i><b>Merchant</b></i> token selected.')
} else {
  const token = tokens[0]
  const merchantWealth = () => Math.round((token.actor.inventory.contents.reduce((acc, curr) => acc + goldValue(curr.assetValue), 0) + Number.EPSILON) * 100) / 100

  const itemWealth = () => Math.round((token.actor.inventory.contents.reduce((acc, curr) => curr.isCoinage ? acc : acc + goldValue(curr.assetValue), 0) + Number.EPSILON) * 100) / 100

  const numberOfItems = () => token.actor.inventory.contents.reduce((acc, curr) => curr.isCoinage ? acc : acc + 1, 0)

  const getItemValue = (item) => {
    const value = parseFloat(goldValue(item.price?.value ?? item.system?.price.value))
    if (value >= 0.01) return value
    const level = item.level?.value ?? item.system?.level.value
    if (level === 0) return defaultItemPrices[level][1]
    return Math.round((defaultItemPrices[level][0] + defaultItemPrices[level][1]) / 2)
  }

  const removeCurrency = async (actor) => {
    await Promise.all(actor.inventory.contents.map(async (item) => {
      if (item.isCoinage) {
        await item.delete()
      }
    }))
  }

  const removeRandomItem = async (actor) => {
    if (actor.inventory.contents.length > 0) {
      await actor.inventory.contents[Math.floor(Math.random() * actor.inventory.contents.length)].delete()
    }
  }

  const removeRandomItems = async (actor, amount, targetItemWealth) => {
    for (let i = 0; i < amount; i = i + 1) {
      await removeRandomItem(actor)
      let iter = 0
      while (iter < MAX_ITERATIONS && merchantWealth() > targetItemWealth) {
        iter = iter + 1
        await removeRandomItem(actor)
      }
    }
  }

  const addRandomItems = async (actor, tables, tableDistribution, wealth, markup, itemMaxValue) => {
    let iter = 0
    let weightedTables = []
    if (tableDistribution === 'weighted' && tables.length === 2) {
      weightedTables = [tables[0], tables[0], tables[1]]
    } else if (tableDistribution === 'weighted' && tables.length === 3) {
      weightedTables = [tables[0], tables[0], tables[0], tables[0], tables[0], tables[0], tables[1], tables[1], tables[1], tables[2]]
    } else {
      weightedTables = [...tables]
    }
    while (iter < MAX_ITERATIONS && merchantWealth() < wealth) {
      iter = iter + 1
      const roll = await weightedTables[Math.floor(Math.random() * weightedTables.length)].roll()
      await Promise.all(roll.results.map(async (item) => {
        const doc = await game.packs.get(item.documentCollection).getDocument(item.documentId)
        const value = getItemValue(doc)
        const markedUpValue = (value * markup) + value
        if (markedUpValue > wealth * itemMaxValue) return
        if (merchantWealth() + markedUpValue > wealth) {
          iter = MAX_ITERATIONS
        } else {
          let itemToAdd = doc
          const scrollMatch = doc.system.slug.match(/^scroll-of-(\d+)..-level-spell$/)
          if (scrollMatch) {
            const spellLevel = parseInt(scrollMatch[1])
            const spell = await getRandomSpell(spellLevel)
            itemToAdd = await createConsumableFromSpell('scroll', spell, spellLevel)
          }
          const wandMatch = doc.system.slug.match(/^magic-wand-(\d+)..-level-spell$/)
          if (wandMatch) {
            const spellLevel = parseInt(wandMatch[1])
            const spell = await getRandomSpell(spellLevel)
            itemToAdd = await createConsumableFromSpell('wand', spell, spellLevel)
          }
          // getRandomSpell(10)
          await actor.addToInventory(itemToAdd)
        }
      }))
    }
  }

  const resetPrices = async (actor) => {
    await Promise.all(actor.items.map(async (item) => {
      const [, system, module, documentId] = item.sourceId.split('.')
      const documentCollection = `${system}.${module}`
      const doc = await game.packs.get(documentCollection).getDocument(documentId)
      const value = getItemValue(doc)
      const coins = goldValueToCoins(value)
      await item.update({
        'system.price.value.pp': 0,
        'system.price.value.gp': coins.gp + coins.pp * 10,
        'system.price.value.sp': coins.sp,
        'system.price.value.cp': coins.cp
      })
    }))
  }

  const markupInventory = async (actor, markup, priceFluctuation) => {
    await Promise.all(actor.items.map(async (item) => {
      const originalValue = getItemValue(item)
      const markedUp = (originalValue * parseFloat(markup)) + originalValue
      const fluctuation = (Math.random() * parseFloat(priceFluctuation)) * (Math.round(Math.random()) ? 1 : -1)
      const newValue = (markedUp * fluctuation) + markedUp
      if (newValue > 10) {
        await item.update({
          'system.price.value.gp': Math.round(newValue)
        })
      } else {
        const newCoins = goldValueToCoins(newValue)
        await item.update({
          'system.price.value.pp': 0,
          'system.price.value.gp': newCoins.gp + newCoins.pp * 10,
          'system.price.value.sp': newCoins.sp,
          'system.price.value.cp': newCoins.cp
        })
      }
    }))
  }

  const tableOptions = () => {
    return [...logisticsFolder.contents].sort((a, b) => {
      if (a.name < b.name) { return -1 }
      if (a.name > b.name) { return 1 }
      return 0
    }).map((table) => {
      return '<option value="' + table.id + '">' + table.name + '</option>'
    })
  }

  new Dialog({
    title: 'StockBoy',
    content: `
            <BR><h2>Restock: ${token.actor.name}</h2><BR>
            <form>
              <div class="form-group">
                <label>Current Wealth (gp):</label>
                <input name='startingWealth' value='${merchantWealth()}' disabled>
              </div>
              <div class="form-group">
                <label>Target Wealth (gp):</label>
                <input name='targetWealth' value='${merchantWealth()}'>
              </div>
              <div class="form-group">
                <label>Markup:</label>
                <select name='markup'>
                    <option value='-0.75'>-75%</option>
                    <option value='-0.50'>-50%</option>
                    <option value='-0.25'>-25%</option>
                    <option value='-0.20'>-20%</option>
                    <option value='-0.15'>-15%</option>
                    <option value='-0.10'>-10%</option>
                    <option value='-0.05'>-5%</option>
                    <option value='0' selected>0%</option>
                    <option value='0.05'>5%</option>
                    <option value='0.10'>10%</option>
                    <option value='0.15'>15%</option>
                    <option value='0.20'>20%</option>
                    <option value='0.25'>25%</option>
                    <option value='0.50'>50%</option>
                    <option value='0.75'>75%</option>
                    <option value='1'>100%</option>
                    <option value='1.5'>150%</option>
                    <option value='2'>200%</option>
                </select>
              </div>
              <div class="form-group">
                <label>Price Fluctuation:</label>
                <select name='priceFluctuation'>
                    <option value='0' selected>0%</option>
                    <option value='0.05'>5%</option>
                    <option value='0.1'>10%</option>
                    <option value='0.2'>20%</option>
                </select>
              </div>
              <div class="form-group">
                <label>Inventory Churn:</label>
                <select name='churn'>
                    <option value='0'>0%</option>
                    <option value='0.25'>25%</option>
                    <option value='0.5'>50%</option>
                    <option value='0.75'>75%</option>
                    <option value='1' selected>100%</option>
                </select>
              </div>
              <div class="form-group">
                <label>Item Max Value:</label>
                <select name='itemMaxValue'>
                    <option value='0.02'>2%</option>
                    <option value='0.05'>5%</option>
                    <option value='0.1'>10%</option>
                    <option value='0.25'>25%</option>
                    <option value='0.5'selected>50%</option>
                </select>
              </div>
              <div class="form-group">
                <label>Cash on Hand:</label>
                <select name='cashOnHand'>
                    <option value='0.1'>10%</option>
                    <option value='0.2'>20%</option>
                    <option value='0.3' selected>30%</option>
                    <option value='0.4'>40%</option>
                    <option value='0.5'>50%</option>
                </select>
              </div>
              <div class="form-group">
                <label>Store Table 1:</label>
                <select name='storeTable1'>
                  ${tableOptions()}
                </select>
              </div>
              <div class="form-group">
                <label>Store Table 2:</label>
                <select name='storeTable2'>
                    <option value="" selected>--</option>
                    ${tableOptions()}
                </select>
              </div>
              <div class="form-group">
                <label>Store Table 3:</label>
                <select name='storeTable3'>
                    <option value="" selected>--</option>
                    ${tableOptions()}
                </select>
              </div>
              <div class="form-group">
                <label>Table Distribution:</label>
                <select name='tableDistribution'>
                    <option value="even" selected>Even</option>
                    <option value="weighted">Weighted</option>
                </select>
              </div>
            </form><BR>
        `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: 'Stock Store',
        callback: async (html) => {
          const originalPauseState = game.paused
          if (!game.paused) await game.togglePause()

          const targetWealth = parseFloat(html.find('input[name=\'targetWealth\']').val())
          const churn = parseFloat(html.find('select[name=\'churn\']').val())
          const cashOnHand = parseFloat(html.find('select[name=\'cashOnHand\']').val())
          const itemMaxValue = parseFloat(html.find('select[name=\'itemMaxValue\']').val())
          const tableId1 = html.find('select[name=\'storeTable1\']').val()
          const tableId2 = html.find('select[name=\'storeTable2\']').val()
          const tableId3 = html.find('select[name=\'storeTable3\']').val()
          const tableDistribution = html.find('select[name=\'tableDistribution\']').val()
          const markup = html.find('select[name=\'markup\']').val()
          const priceFluctuation = html.find('select[name=\'priceFluctuation\']').val()

          const numberOfItemsToRemove = Math.floor(numberOfItems() * churn)
          const itemValueToAchieve = Math.round((targetWealth - targetWealth * cashOnHand + Number.EPSILON) * 100) / 100

          const inProgress = new Dialog({
            title: 'StockBoy',
            content: `
                            <BR>
                            <h2>Stocking up <b><i>${token.actor.name}</i></b>, hang tight!</h2>
                            <BR>`,
            buttons: {
              yes: {
                icon: "<i class='fas fa-check'></i>",
                label: 'Ok'
              }
            }
          }).render(true)

          const tables = [game.tables.contents.find((t) => t.id === tableId1)]
          if (tableId2 !== '') tables.push(game.tables.contents.find((t) => t.id === tableId2))
          if (tableId3 !== '') tables.push(game.tables.contents.find((t) => t.id === tableId3))

          await token.actor.update({ permission: { default: 0 } })
          await removeCurrency(token.actor)
          await removeRandomItems(token.actor, numberOfItemsToRemove, itemValueToAchieve)
          await resetPrices(token.actor)
          await addRandomItems(token.actor, tables, tableDistribution, itemValueToAchieve, markup, itemMaxValue)
          await markupInventory(token.actor, markup, priceFluctuation)
          const targetCash = targetWealth - merchantWealth()
          const cash = roundCoins({
            cp: (targetCash * 0.05) * 100,
            sp: (targetCash * 0.2) * 10,
            gp: targetCash * 0.5,
            pp: (targetCash * 0.25) / 10
          })
          while (cash.cp > 1000) {
            const exchange = (Math.floor(Math.random() * 10 + 1) * 10)
            cash.cp = cash.cp - exchange
            cash.sp = Math.floor(cash.sp + (exchange / 10))
          }
          while (cash.sp > 500) {
            const exchange = (Math.floor(Math.random() * 10 + 1) * 10)
            cash.sp = cash.sp - exchange
            cash.gp = Math.floor(cash.gp + (exchange / 10))
          }
          await token.actor.inventory.addCoins(cash)
          await token.actor.update({ permission: { default: 2 } })
          await inProgress.close()
          if (game.paused !== originalPauseState) await game.togglePause()
          new Dialog({
            title: 'StockBoy',
            content: `
                            <BR>
                            <h2>Merchant <b><i>${token.actor.name}</i></b> is all Stocked up!</h2>
                            <table>
                                <tr><td>Wealth</td><td>${merchantWealth()}</td></tr>
                                <tr><td>Markup</td><td>${markup}</td></tr>
                                <tr><td>Price Fluctuation</td><td>${priceFluctuation * 100}%</td></tr>
                                <tr><td>Inventory Churn</td><td>${churn * 100}%</td></tr>
                                <tr><td>Item Max Value</td><td>${itemMaxValue * 100}%</td></tr>
                                <tr><td>Cash on Hand</td><td>${cashOnHand * 100}%</td></tr>
                                <tr><td>Store Table 1</td><td>${tables[0].name}</td></tr>
                                <tr><td>Store Table 2</td><td>${tables.length >= 2 ? tables[1].name : '--'}</td></tr>
                                <tr><td>Store Table 3</td><td>${tables.length >= 3 ? tables[2].name : '--'}</td></tr>
                                <tr><td>Table Distribution</td><td>${tableDistribution}</td></tr>
                            </table>
                            <BR>`,
            buttons: {
              yes: {
                icon: "<i class='fas fa-check'></i>",
                label: 'Ok'
              }
            }
          }).render(true)
        }
      }
    },
    default: 'yes'
  }).render(true)
}
