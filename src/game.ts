import "./styles/main.scss";

import {
    GameRenderer,
    keyToCoord,
    getAdjacentCoords,
    coordToKey,
    coordsToKeys,
    previewPlacement,
    clearPreview,
    getRow,
    offsetCoord,
} from "./ts/GameRenderer";
import { Player } from "./ts/Player";
import {
    GameController,
    SHIPS_HIDDEN,
    SHIPS_VISIBLE,
} from "./ts/GameController";
import { NumberPair } from "ts/GameBoard";

// Access to :root CSS variables.
const root = document.documentElement;
const curRootStyling = getComputedStyle(root);
const animTime: number = parseFloat(
    curRootStyling.getPropertyValue("--anim-time")
);
const animDelay: number = parseFloat(
    curRootStyling.getPropertyValue("--anim-delay")
);
const DEFAULT_ORIENTATION: "horizontal" | "vertical" = "horizontal";
const VERTICAL_OFFSET: number = 10;
const HORIZONTAL_OFFSET: number = 1;

// Overlay component and modal elements.
const overlay: HTMLDivElement = document.getElementById(
    "overlay"
) as HTMLDivElement;
const rulesModal = document.getElementById("rules") as HTMLDivElement;
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
    }
}

let player1: Player = new Player("a", true);
let player2: Player = new Player("b", true);
// Hydrate ship units for placement logic.
const shipUnits = Array.from(
    document.querySelectorAll(".ship__unit.--placeable")
) as HTMLDivElement[];
for (const shipUnit of shipUnits) {
    shipUnit.addEventListener("pointerdown", (e: PointerEvent) => {
        dragShip(e, player1);
    });
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

function dragShip(e: PointerEvent, player: Player): void {
    // Only allow dragging with left click.
    if (e.button !== 0) return;
    // Get the ship unit element, and the index of the specific segment of the ship.
    const ship = e.currentTarget as HTMLDivElement;
    const shipSegment = e.target as HTMLDivElement;
    const segmentIndex = Array.from(ship.children).indexOf(shipSegment);

    const boardDiv = document.querySelector(".game__board") as HTMLDivElement;
    const cellElements = Array.from(boardDiv.children).filter(
        (cell) => !cell.classList.contains("cell__label")
    ) as HTMLDivElement[];

    let shipPlaced: boolean = false;
    let styledCells: HTMLDivElement[] = [];
    let data = {
        shipName: ship.dataset.name!,
        length: Number(ship.dataset.length)!,
        orientation: ship.dataset.orientation as "horizontal" | "vertical",
        mouseX: e.clientX,
        mouseY: e.clientY,
    };

    let cellOffset =
        segmentIndex *
        (data.orientation === "horizontal"
            ? HORIZONTAL_OFFSET
            : VERTICAL_OFFSET);
    let [dx, dy] = [0, 0];
    let [startX, startY] = [ship.offsetLeft, ship.offsetTop];
    let [curX, curY] = [e.clientX, e.clientY];
    ship.style.left = startX + dx + "px";
    ship.style.top = startY + dy + "px";
    // Handle stylings of the mouse, ship, and pointer events.
    ship.style.position = "absolute";
    ship.style.pointerEvents = "none";
    ship.classList.add("--dragging");
    document.body.style.setProperty("cursor", "grabbing", "important");
    root.style.setProperty("--cursor-default", "grabbing");

    const move = (e: PointerEvent) => {
        curX = e.clientX;
        curY = e.clientY;

        dx = curX - data.mouseX;
        dy = curY - data.mouseY;

        ship.style.left = startX + dx + "px";
        ship.style.top = startY + dy + "px";
    };

    const release = (e: PointerEvent) => {
        // Release event listeners for the ship.
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", release);
        document.removeEventListener("keydown", changeOrientation);
        // Release the cell event listeners.
        for (const cellEl of cellElements) {
            cellEl.onpointerenter = null;
        }
        ship.style.visibility = "hidden";
        const elements = document.elementsFromPoint(
            curX,
            curY
        ) as HTMLDivElement[];

        let el = elements.find((el) =>
            el.classList.contains("board__cell")
        ) as HTMLDivElement;

        ship.style.visibility = "";

        // Get board cell information.
        const cellKey = Number(el?.dataset.cell);
        const cellCoord = keyToCoord(cellKey) as NumberPair;
        const startKey = cellKey - cellOffset;
        // If we are on an actual board cell, attempt to place.
        if (startKey !== undefined) {
            const startCoord = keyToCoord(startKey) as NumberPair;
            shipPlaced = player.placeShip(
                data.shipName,
                startCoord,
                data.orientation
            );
        }
        // Rerender the board if placed properly. Get rid of the element.
        if (shipPlaced) {
            ship.remove();
            gr.renderBoard(player1, SHIPS_VISIBLE);
        } else {
            console.log(`Placement at cell ${cellKey} failed.`);
            // Put the ship back in its original spot and orientation.
            ship.style.left = 0 + "px";
            ship.style.top = 0 + "px";
            ship.style.position = "relative";
            ship.classList.replace(
                `--${data.orientation}`,
                `--${DEFAULT_ORIENTATION}`
            );
            data.orientation = ship.dataset.orientation = DEFAULT_ORIENTATION;
        }
        // Remove any styling applied to ship/board during the process.
        ship.classList.remove("--dragging");
        clearPreview(styledCells);

        // Set default behavior on ship and board pointer events.
        ship.style.pointerEvents = boardDiv.style.pointerEvents = "";
        ship.classList.remove("--dragging");
        document.body.style.cursor = "";
        root.style.setProperty("--cursor-default", "default");
    };

    const changeOrientation = (e: KeyboardEvent) => {
        if (!e.repeat) {
            switch (e.key) {
                case "r":
                    let newOrientation: "horizontal" | "vertical" =
                        data.orientation === "horizontal"
                            ? "vertical"
                            : "horizontal";
                    // Change the orientation of the ship and re-orient to mouse.
                    data.orientation = ship.dataset.orientation =
                        newOrientation;

                    let oldRect = ship.getBoundingClientRect();
                    const offsetX = curX - oldRect.left;
                    const offsetY = curY - oldRect.top;

                    ship.style.transformOrigin = `${offsetX}px ${offsetY}px`;

                    newOrientation === "horizontal"
                        ? ship.classList.replace("--vertical", "--horizontal")
                        : ship.classList.replace("--horizontal", "--vertical");

                    // Update the placement preview if hovering over valid cell.
                    cellOffset =
                        segmentIndex *
                        (data.orientation === "horizontal"
                            ? HORIZONTAL_OFFSET
                            : VERTICAL_OFFSET);
                    clearPreview(styledCells);
                    const cellDiv = document.elementFromPoint(
                        curX,
                        curY
                    ) as HTMLDivElement;

                    if (cellDiv) {
                        const curCoord = keyToCoord(
                            Number(cellDiv.dataset.cell)
                        );
                        // Get the starting coordinate (may be negative x or y value).
                        const startCoord: NumberPair =
                            data.orientation === "horizontal"
                                ? [curCoord[0] - segmentIndex, curCoord[1]]
                                : [curCoord[0], curCoord[1] - segmentIndex];

                        styledCells = previewPlacement(
                            startCoord,
                            curCoord,
                            player,
                            data.shipName,
                            data.length,
                            data.orientation,
                            cellElements
                        );
                    }
            }
        }
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", release);
    document.addEventListener("keydown", changeOrientation);
    // Hydrate the cell elements
    for (const cellEl of cellElements) {
        cellEl.onpointerenter = () => {
            // Find the starting cell relative to where the ship was grabbed for preview.
            let curCoord = keyToCoord(Number(cellEl.dataset.cell));
            let startCoord = offsetCoord(
                curCoord,
                segmentIndex,
                data.orientation
            );
            styledCells = previewPlacement(
                startCoord,
                curCoord,
                player,
                data.shipName,
                data.length,
                data.orientation,
                cellElements
            );
        };
    }
}

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
//let EB = document.querySelector(".--enemy");
//let gc = new GameController(alvin, mike, gr);
