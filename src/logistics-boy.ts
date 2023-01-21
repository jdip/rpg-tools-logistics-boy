

import type { ModuleData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs";
import { name as moduleId } from "./module.json";
import DogBrowser from "./dogBrowser";
import "./styles/dogs.css";

interface MyModule extends Game.ModuleData<ModuleData> {
    dogBrowser: DogBrowser;
}

let module: MyModule;

Hooks.once("init", () => {
    console.log(`Initializing ${moduleId}`);

    module = (game as Game).modules.get(moduleId) as MyModule;
    module.dogBrowser = new DogBrowser();
});

Hooks.on("renderRollTableDirectory", (_: Application, html: JQuery) => {
    const button = $(
        `<button class="cc-sidebar-button" type="button">
            <i class="fas fa-random fa-fw"></i>
            Build LogisticsBoy Loot Tables
            </button>`
    );
    button.on("click", () => {
        module.dogBrowser.render(true);
    });
    html.find(".directory-header .action-buttons").append(button);
});

