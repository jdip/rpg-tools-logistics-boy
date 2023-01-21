
import { name as moduleId } from "./module.json";
export default class DogBrowser extends Application {
    static override get defaultOptions(): ApplicationOptions {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "dog-browser",
            title: "Dog Browser",
            template: `modules/${moduleId}/templates/dogs.hbs`,
            width: 720,
            height: 720,
        }) as ApplicationOptions;
    }

    private imageUrl?: String;

    // Unmodified code excluded for brevity

    override getData() {
        return {
            imageUrl: this.imageUrl,
        };
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        console.log("activating listeners");
        super.activateListeners(html);
        html
            .find("button.module-control")
            .on("click", this._onClickControlButton.bind(this));
    }

    async _onClickControlButton(event: JQuery.TriggeredEvent): Promise<void> {
        event.preventDefault();
        const button = (event.target.parentElement.tagName === "BUTTON"
            ? event.target.parentElement
            : event.target) as HTMLElement;

        const action = button.dataset.action;
        switch (action) {
            case "randomize-dog":
                this._randomizeDog();
                break;
        }
    }

    async _randomizeDog() {
        const response = await fetch("https://dog.ceo/api/breeds/image/random");
        if (response.status != 200) {
            ui.notifications?.error(
                `Unexpected response fetching new dog image: ${response.status}: ${response.statusText}`
            );
            return;
        } else {
            console.log("HAHA")

        }
        this.imageUrl = (await response.json()).message;
        this.render();
        console.log("HAHA3")
    }
}