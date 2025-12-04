import "./styles/main.scss";

import { GameRenderer, typeContent, keyToCoord } from "./ts/GameRenderer";
import { Player } from "./ts/Player";
import { GameController } from "./ts/GameController";

// Access to :root CSS variables.
const root = document.documentElement;
const curRootStylings = getComputedStyle(root);
const animTime: number = parseFloat(
    curRootStylings.getPropertyValue("--anim-time")
);
const animDelay: number = parseFloat(
    curRootStylings.getPropertyValue("--anim-delay")
);

// Overlay component and modal elements.
const overlay: HTMLDivElement = document.getElementById(
    "overlay"
) as HTMLDivElement;
const rulesModal = document.getElementById("rules") as HTMLDivElement;
const startModal = document.getElementById("start") as HTMLDivElement;
const modalConfigs = ["--ai", "--human"];

// Hydrate modal click listeners.
const modals = Array.from(
    document.querySelectorAll(".overlay__modal")
) as HTMLDivElement[];

for (const modal of modals) {
    modal.querySelector("#modal__exit")?.addEventListener("click", () => {
        for (const config of modalConfigs) {
            modal.classList.remove(config);
        }
        toggleOverlay(modal);
    });
}

// Hydrate button click listeners
const buttons = Array.from(
    document.querySelectorAll("button[id$='_btn']")
) as HTMLButtonElement[];
for (const button of buttons) {
    switch (button.id) {
        case "header__help_btn":
            button.addEventListener("click", () => {
                toggleOverlay(rulesModal);
            });
            break;
        case "ai_btn":
            button.addEventListener("click", () => {
                toggleOverlay(startModal, "--ai");
            });
            break;
        case "human_btn":
            button.addEventListener("click", () => {
                toggleOverlay(startModal, "--human");
            });
            break;
    }
}

document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!e.repeat) {
        switch (e.key) {
            case "Escape":
                // If we are in a modal, close it.
                const openModal = modals.find(
                    (modal) => !modal.classList.contains("--hidden")
                );
                if (openModal) toggleOverlay(openModal);
        }
    } else {
        if (e.key === "Escape" || e.key === "Enter") e.preventDefault();
    }
});

// Takes a modal element, and removes its hidden class for the overlay opening animation.
function toggleOverlay(modalEl: HTMLDivElement, config?: string) {
    const hidden = overlay.classList.contains("--hidden");
    // Add or remove the config for the modal.
    if (config && modalConfigs.includes(config)) {
        if (!modalEl.classList.contains(config)) {
            modalEl.classList.add(config);
        } else {
            modalEl.classList.remove(config);
        }
        // No config was specified, so no special configs needed on modal.
    } else if (!config) {
        for (const config of modalConfigs) {
            modalEl.classList.remove(config);
        }
    } else {
        console.error("Specified modal config does not exist.");
    }
    // Animation handler for overlay and modal via dynamic CSS class assignment.
    if (hidden) {
        overlay.classList.add("--opening");
        overlay.classList.remove("--hidden");
        modalEl.classList.remove("--hidden");
        setTimeout(() => {
            overlay.classList.remove("--opening");
        }, animTime + animDelay);
    } else {
        overlay.classList.add("--closing");
        setTimeout(() => {
            overlay.classList.add("--hidden");
            overlay.classList.remove("--closing");
            modalEl.classList.add("--hidden");
        }, animDelay);
    }

    // Clear any input fields.
    const inputs = Array.from(modalEl.querySelectorAll("input"));
    for (const input of inputs) {
        input.value = "";
        input.checked = false;
    }
}

let gameStatus = document.querySelector(".game__status") as HTMLDivElement;
let mg = document.querySelector(".main__game") as HTMLDivElement;
let alvin = new Player();
let mike = new Player("mike");
let gr = new GameRenderer(mg);
let EB = document.querySelector(".--enemy");
let gc = new GameController(alvin, mike, gr);
