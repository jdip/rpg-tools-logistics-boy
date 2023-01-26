
const createTablesDialog = new Dialog({
  title: 'RPG.Tools: Logistics Boy - Create Rollable Tables',
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
      callback: async (): Promise<void> => {
        console.log('gogog')
      }
    }
  },
  default: 'yes'
})

export { createTablesDialog }
