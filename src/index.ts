import "./styles/main.scss";

// Access to :root CSS variables.
const root = getComputedStyle(document.documentElement);
const animTime: number = parseFloat(root.getPropertyValue("--anim-time"));
const animDelay: number = parseFloat(root.getPropertyValue("--anim-delay"));

document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!e.repeat) {
        switch (e.key) {
            case "Escape":
                // If we are in a modal, close it.
                const openModal = modals.find(
                    (modal) => !modal.classList.contains("--hidden")
                ) as HTMLDivElement;

                toggleOverlay(openModal);
        }
    } else {
        e.preventDefault();
    }
});

// Overlay component element.
const overlay: HTMLDivElement = document.getElementById(
    "overlay"
) as HTMLDivElement;

// Hydrate modal click listeners.
const modals = Array.from(
    document.querySelectorAll(".overlay__modal")
) as HTMLDivElement[];

for (const modal of modals) {
    modal.querySelector("#modal__exit")?.addEventListener("click", () => {
        toggleOverlay(modal);
    });
}

const rulesModal = document.getElementById("rules") as HTMLDivElement;
const startModal = document.getElementById("start") as HTMLDivElement;

// Help button
const helpBtn: HTMLButtonElement = document.getElementById(
    "header__help"
) as HTMLButtonElement;
helpBtn.addEventListener("click", () => toggleOverlay(rulesModal));

// Takes a modal element, and removes its hidden class for the overlay opening animation.
function toggleOverlay(modalEl: HTMLDivElement) {
    const hidden = overlay.classList.contains("--hidden");

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
}
