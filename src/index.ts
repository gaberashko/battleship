import "./styles/main.scss";

import { displayGamePage } from "./game";
import {
    GameRenderer,
    typeContent,
    keyToCoord,
    getAdjacentCoords,
    coordToKey,
    coordsToKeys,
    previewPlacement,
    placeShipDOM,
    removeShipDOM,
    clearPreview,
    getRow,
    offsetCoord,
} from "./ts/GameRenderer";
import { Player } from "./ts/Player";
import { GameController } from "./ts/GameController";
import { NumberPair } from "ts/GameBoard";

// Important constants
const AI_MODE: string = "ai";
const HUMAN_MODE: string = "human";
const AI_NAME = "Alvin";
const VERTICAL_OFFSET: number = 10;
const HORIZONTAL_OFFSET: number = 1;
const BUTTON_ELEMENT: string = "button";
const CONFIRMATION_TEXT: string = "Confirm";
const DEFAULT_ORIENTATION: "horizontal" | "vertical" = "horizontal";

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
const turnModal = document.getElementById("turn") as HTMLDivElement;
const winModal = document.getElementById("win") as HTMLDivElement;
const modalConfigs = ["--ai", "--human"];
const overlayConfigs = ["--obscure"];

// Hydrate modal click listeners.
const modals = Array.from(
    document.querySelectorAll(".overlay__modal")
) as HTMLDivElement[];

for (const modal of modals) {
    modal.querySelector("#modal__exit")?.addEventListener("click", () => {
        for (const config of modalConfigs) {
            modal.classList.remove(config);
        }
        toggleOverlay({ modalEl: modal });
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
                toggleOverlay({ modalEl: rulesModal });
            });
            break;
        case "ai_btn":
            button.addEventListener("click", () => {
                toggleOverlay({ modalEl: startModal, modalConfig: "--ai" });
                sessionStorage.setItem("mode", AI_MODE);
            });
            break;
        case "human_btn":
            button.addEventListener("click", () => {
                toggleOverlay({ modalEl: startModal, modalConfig: "--human" });
                sessionStorage.setItem("mode", HUMAN_MODE);
            });
            break;
        case "modal__start_btn":
            button.addEventListener("click", async (e) => {
                e.preventDefault();
                // If the form is valid, create players with the information.
                if (validateForm(startForm)) {
                    const modal = button.closest(
                        ".overlay__modal"
                    ) as HTMLDivElement;

                    console.log("Form validated, setting up game details.");
                    const gameMode = sessionStorage.getItem("mode");
                    if (!gameMode) {
                        console.error("No game-mode found");
                        return;
                    }

                    const formData = new FormData(startForm);
                    console.log("Form Data:", formData);

                    const [playerName1, playerName2] = [
                        formData.get("name1"),
                        formData.get("name2"),
                    ];

                    const difficulty = formData.get("difficulty") as
                        | "easy"
                        | "medium"
                        | "hard";
                    console.log(
                        "Player names:",
                        playerName1,
                        `${playerName2 ?? AI_NAME}`
                    );
                    console.log("Difficulty:", difficulty);

                    const players = [
                        new Player({
                            name: <string>playerName1,
                            isHuman: true,
                            difficulty: difficulty,
                        }),
                        new Player({
                            name:
                                playerName2 == ""
                                    ? AI_NAME
                                    : <string>playerName2,
                            isHuman: gameMode == HUMAN_MODE ? true : false,
                            difficulty: difficulty,
                        }),
                    ];
                    // Now that the players have been created properly we can close the overlay.
                    toggleOverlay({
                        modalEl: modal,
                    });

                    for (const player of players) {
                        console.log(`Player information:`);
                        console.dir(player);

                        // Perform placement procedure for all players before starting.
                        await player.placeAllShips();
                        player.board.print();
                    }
                    // Set up the page for the game.
                    displayGamePage(players);
                    const mainContainer = document.querySelector(
                        "main"
                    ) as HTMLDivElement;
                    if (mainContainer) {
                        const renderer = new GameRenderer(mainContainer);
                        const gameController = new GameController(
                            players[0]!,
                            players[1]!,
                            renderer
                        );
                    }
                }
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
                if (openModal) toggleOverlay({ modalEl: openModal });
        }
    } else {
        if (e.key === "Escape" || e.key === "Enter") e.preventDefault();
    }
});

// Hydrate form elements.
const startForm = document.querySelector(".modal__form") as HTMLFormElement;
const inputs: HTMLInputElement[] = Array.from(
    startForm?.querySelectorAll("input[type='text']")
);

for (const input of inputs) {
    input.addEventListener("input", () => {
        validateNames(input);
    });
}

// Takes a modal element, and removes its hidden class for the overlay opening animation.
function toggleOverlay({
    modalEl,
    overlayConfig,
    modalConfig,
}: {
    modalEl: HTMLDivElement;
    overlayConfig?: string;
    modalConfig?: string;
}) {
    const hidden = overlay.classList.contains("--hidden");
    // Add or remove the config for the modal.
    if (modalConfig && modalConfigs.includes(modalConfig)) {
        if (!modalEl.classList.contains(modalConfig)) {
            modalEl.classList.add(modalConfig);
        } else {
            modalEl.classList.remove(modalConfig);
        }
        // No config was specified, so no special configs needed on modal.
    } else if (!modalConfig) {
        for (const config of modalConfigs) {
            modalEl.classList.remove(config);
        }
    } else {
        console.error("Specified modal config does not exist.");
    }

    // Add or remove the config for the overlay.
    if (overlayConfig && overlayConfigs.includes(overlayConfig)) {
        if (!overlay.classList.contains(overlayConfig)) {
            overlay.classList.add(overlayConfig);
        } else {
            overlay.classList.remove(overlayConfig);
        }
        // No config was specified, so no special configs needed on overlay.
    } else if (!overlayConfig) {
        for (const config of overlayConfigs) {
            overlay.classList.remove(config);
        }
    } else {
        console.error("Specified modal config does not exist.");
    }
    // Animation handler for overlay and modal via dynamic CSS class assignment.
    if (hidden) {
        overlay.classList.add("--opening");
        overlay.classList.remove("--hidden");
        setTimeout(() => {
            overlay.classList.remove("--opening");
            modalEl.classList.remove("--hidden");
        }, animDelay);
    } else {
        overlay.classList.add("--closing");
        setTimeout(() => {
            overlay.classList.add("--hidden");
            overlay.classList.remove("--closing");
            modalEl.classList.add("--hidden");
        }, animDelay);
    }

    // Clear any input fields and previous validity checks
    const inputs = Array.from(modalEl.querySelectorAll("input"));
    for (const input of inputs) {
        if (input.type == "text") {
            input.value = "";
        }
        input.checked = false;
        input.setCustomValidity("");
    }
}

// Iterate through the inputs of a form and return if all inputs are valid values.
function validateForm(form: HTMLFormElement): boolean {
    let formValid: boolean = true;
    let gameMode = sessionStorage.getItem("mode");

    if (!gameMode) {
        console.error("validateForm(): Game mode not found.");
        return false;
    }

    // Verify all relevant names.
    const playerNameInputs = Array.from(
        form.querySelectorAll("input[type='text'")
    ) as HTMLInputElement[];
    for (const playerName of playerNameInputs) {
        if (!validateNames(playerName)) {
            formValid = false;
        }
    }

    // If we are in AI_MODE, make sure a difficulty was selected.
    if (gameMode == AI_MODE) {
        let difficultySelected = false;
        const options = Array.from(
            form.querySelectorAll("input[type='radio']")
        ) as HTMLInputElement[];
        for (const option of options) {
            if (option.checked) difficultySelected = true;
        }

        if (!difficultySelected) formValid = false;
    }

    console.log("Form validity:", formValid);
    return formValid;
}

// Iterate through the input of a form and return if it's valid.
function validateNames(input: HTMLInputElement): boolean {
    let gameMode = sessionStorage.getItem("mode");
    let inputValid: boolean = true;
    input.setCustomValidity("");

    // If we are in HUMAN_MODE, we need to validate all text fields.
    if (gameMode == HUMAN_MODE) {
        if (input.type === "text") {
            // Check length.
            if (
                input.validity.tooLong ||
                input.validity.tooShort ||
                input.value.length == 0
            ) {
                input.setCustomValidity(
                    "Name must be between 2 and 16 characters in length"
                );
                inputValid = false;
                console.error(`Input ${input.id} is empty, or too short.`);
            }
            // Check if player1 name is same as player2
            let player1Name = document.getElementById(
                "input_name1"
            ) as HTMLInputElement;
            let player2Name = document.getElementById(
                "input_name2"
            ) as HTMLInputElement;
            if (
                player1Name &&
                player2Name &&
                player1Name.value == player2Name.value &&
                player1Name.value != ""
            ) {
                console.error(`Input ${input} invalid: Name match player1: ${player1Name.value}
                            with player2Name: ${player2Name.value}`);
                input.setCustomValidity("Player names must be different.");
                inputValid = false;
            }
        }
    }

    // If we are in AI mode, we only want to check the player1 name and difficulties.
    if (gameMode == AI_MODE) {
        if (input.id == "input_name1") {
            // Check length.
            if (
                input.validity.tooLong ||
                input.validity.tooShort ||
                input.value.length == 0
            ) {
                input.setCustomValidity(
                    "Name must be between 2 and 16 characters in length"
                );
                inputValid = false;
                console.error(`Input ${input.id} is empty, or too short.`);
            }
        }
    }

    // Report the current validity of input.
    input.reportValidity();
    return inputValid;
}

function dragShip(e: PointerEvent, player: Player): void {
    // Only allow dragging with left click.
    if (e.button !== 0) return;

    // Remove the confirmation button if it exists.
    const confirmBtn = document.getElementById("confirm_btn");
    if (confirmBtn) {
        confirmBtn.style.visibility = "hidden";
    }

    // Get the ship unit element, and the index of the specific segment of the ship.
    const ship = e.currentTarget as HTMLDivElement;
    const shipSegment = e.target as HTMLDivElement;
    const segmentIndex = Array.from(ship.children).indexOf(shipSegment);
    const boardDiv = document.querySelector(".game__board") as HTMLDivElement;
    const cellElements = Array.from(
        boardDiv.querySelectorAll("[data-cell]")
    ) as HTMLDivElement[];
    const shipContainer = document.querySelector(
        ".ship__container"
    ) as HTMLDivElement;

    let shipPlaced: boolean = false;
    let styledCells: HTMLDivElement[] = [];
    let data = {
        shipName: ship.dataset.name!,
        length: Number(ship.dataset.length)!,
        startOrientation: ship.dataset.orientation as "horizontal" | "vertical",
        curOrientation: ship.dataset.orientation as "horizontal" | "vertical",
        clickMouseX: e.clientX,
        clickMouseY: e.clientY,
        previouslyPlaced: ship.dataset.placed as string,
        startCoord: undefined as undefined | NumberPair, // The starting coordinate of a placed ship.
        curCoord: undefined as undefined | NumberPair, // The coord at which a placed ship was grabbed.
    };

    let cellOffset =
        segmentIndex *
        (data.curOrientation === "horizontal"
            ? HORIZONTAL_OFFSET
            : VERTICAL_OFFSET);

    // Store the cell at which the ship is currently grabbed, and the coordinate it is placed at.
    let curKey = Number(shipSegment.dataset.cell);
    if (curKey !== undefined && !Number.isNaN(curKey)) {
        data.curCoord = keyToCoord(curKey);
        const startKey = curKey - cellOffset;
        data.startCoord = keyToCoord(startKey) as NumberPair;
    }

    const rectBefore = ship.getBoundingClientRect();

    let [dx, dy] = [0, 0];
    let [startX, startY] = [ship.offsetLeft, ship.offsetTop];
    let [curX, curY] = [e.clientX, e.clientY];
    // Position relative to the offset parent, not the viewport
    ship.style.position = "fixed";
    // Handle stylings of the mouse, ship, and pointer events.
    ship.style.pointerEvents = "none";
    ship.classList.add("--dragging");
    document.body.style.setProperty("cursor", "grabbing", "important");
    root.style.setProperty("--cursor-default", "grabbing");

    // console.log("offset X:", e.offsetX, "offset Y:", e.offsetY);

    const offsetParent = ship.offsetParent as HTMLElement;
    const parentRect = offsetParent
        ? offsetParent.getBoundingClientRect()
        : { left: 0, top: 0 };

    // Calculate where mouse was relative to ship's top-left
    const mouseOffsetX = data.clickMouseX - rectBefore.left;
    const mouseOffsetY = data.clickMouseY - rectBefore.top;

    // Position ship so mouse stays at that same offset
    startX = data.clickMouseX - parentRect.left - mouseOffsetX;
    startY = data.clickMouseY - parentRect.top - mouseOffsetY;

    ship.style.left = startX + "px";
    ship.style.top = startY + "px";

    // If the ship was already placed, remove it from the board DOM, and show placement preview.
    if (data.previouslyPlaced === "true") {
        player.board.removeShip(data.shipName);
        removeShipDOM(boardDiv, ship, data.curOrientation);

        let oldRect = ship.getBoundingClientRect();
        const offsetX = curX - oldRect.left;
        const offsetY = curY - oldRect.top;

        // console.log("ship coordinates", ship.getBoundingClientRect());

        ship.style.transform =
            data.curOrientation === "horizontal"
                ? "rotate(0deg)"
                : "rotate(90deg)";

        ship.style.transformOrigin = `${offsetY}px ${offsetX}px`;

        // Now check position again
        const rectCheck = ship.getBoundingClientRect();

        // If still wrong, adjust
        if (Math.abs(rectCheck.left - (startX + parentRect.left)) > 1) {
            const adjustX = startX + parentRect.left - rectCheck.left;
            const adjustY = startY + parentRect.top - rectCheck.top;
            startX += adjustX;
            startY += adjustY;
            ship.style.left = startX + "px";
            ship.style.top = startY + "px";
        }

        // Show the placement preview over the current spot.
        const cellDiv = document.elementFromPoint(curX, curY) as HTMLDivElement;

        if (cellDiv) {
            const curCoord = keyToCoord(Number(cellDiv.dataset.cell));
            // Get the starting coordinate (may be negative x or y value).
            const startCoord: NumberPair =
                data.curOrientation === "horizontal"
                    ? [curCoord[0] - segmentIndex, curCoord[1]]
                    : [curCoord[0], curCoord[1] - segmentIndex];

            styledCells.push(
                ...previewPlacement(
                    startCoord,
                    curCoord,
                    player,
                    data.shipName,
                    data.length,
                    data.curOrientation,
                    boardDiv
                )
            );
        }
    }

    const move = (e: PointerEvent) => {
        curX = e.clientX;
        curY = e.clientY;

        dx = curX - data.clickMouseX;
        dy = curY - data.clickMouseY;

        ship.style.left = startX + dx + "px";
        ship.style.top = startY + dy + "px";
    };

    const release = (e: PointerEvent) => {
        // Release event listeners for the ship.
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", release);
        document.removeEventListener("keydown", changeOrientation);
        window.removeEventListener("scroll", onScroll);
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
        const startCoord = keyToCoord(startKey) as NumberPair;
        // If we are on an actual board cell, attempt to place.
        shipPlaced =
            startKey !== undefined &&
            player.placeShip(data.shipName, startCoord, data.curOrientation);

        // Rerender the board if placed properly. Store this data on the ship.
        if (shipPlaced) {
            // Not entered if released on non-cell.
            placeShipDOM(boardDiv, ship, startCoord, data.curOrientation);
            data.startCoord = startCoord;
        } else if (data.previouslyPlaced === "true") {
            console.log(`Placement at cell ${cellKey} failed.`);
            // Put the ship back in its original spot and orientation.
            // console.log("We logged orientation as", data.startOrientation);
            player.placeShip(
                data.shipName,
                data.startCoord!,
                data.startOrientation
            );
            placeShipDOM(
                boardDiv,
                ship,
                data.startCoord!,
                data.startOrientation
            );
        } else {
            ship.classList.replace("ship__unit--vertical", "ship__unit");
            ship.style.transform = "rotate(0deg)";
            data.curOrientation = ship.dataset.orientation =
                DEFAULT_ORIENTATION;
        }

        ship.style.left = 0 + "px";
        ship.style.top = 0 + "px";
        ship.style.position = "relative";

        // Remove any styling applied to ship/board during the process.
        ship.classList.remove("--dragging");
        clearPreview(styledCells);

        // Set default behavior on ship and board pointer events.
        ship.style.pointerEvents = boardDiv.style.pointerEvents = "";
        ship.classList.remove("--dragging");
        document.body.style.cursor = "";
        root.style.setProperty("--cursor-default", "default");

        // If all ships are placed then show the confirm button.
        if (player.board.allShipsPlaced()) {
            const confirmBtn = document.getElementById("confirm_btn");
            if (confirmBtn) {
                confirmBtn.style.visibility = "visible";
            }
        }
    };

    const changeOrientation = (e: KeyboardEvent) => {
        if (!e.repeat) {
            switch (e.key) {
                case "r":
                    let newOrientation: "horizontal" | "vertical" =
                        data.curOrientation === "horizontal"
                            ? "vertical"
                            : "horizontal";
                    // Change the orientation of the ship and re-orient to mouse.
                    data.curOrientation = ship.dataset.orientation =
                        newOrientation;

                    let oldRect = ship.getBoundingClientRect();
                    const offsetX = curX - oldRect.left;
                    const offsetY = curY - oldRect.top;

                    ship.style.transformOrigin = `${offsetX}px ${offsetY}px`;

                    newOrientation === "horizontal"
                        ? ship.classList.replace(
                              "ship__unit--vertical",
                              "ship__unit"
                          )
                        : ship.classList.replace(
                              "ship__unit",
                              "ship__unit--vertical"
                          );

                    ship.style.transform =
                        data.curOrientation === "vertical"
                            ? "rotate(90deg)"
                            : "rotate(0deg)";

                    // Update the placement preview if hovering over valid cell.
                    cellOffset =
                        segmentIndex *
                        (data.curOrientation === "horizontal"
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
                            data.curOrientation === "horizontal"
                                ? [curCoord[0] - segmentIndex, curCoord[1]]
                                : [curCoord[0], curCoord[1] - segmentIndex];

                        styledCells.push(
                            ...previewPlacement(
                                startCoord,
                                curCoord,
                                player,
                                data.shipName,
                                data.length,
                                data.curOrientation,
                                boardDiv
                            )
                        );
                    }
            }
        }
    };

    const onScroll = () => {
        const offsetParent = ship.offsetParent as HTMLElement;
        const parentRect = offsetParent
            ? offsetParent.getBoundingClientRect()
            : { left: 0, top: 0 };

        ship.style.left = curX - parentRect.left - mouseOffsetX + "px";
        ship.style.top = curY - parentRect.top - mouseOffsetY + "px";
    };

    // Add this when drag starts:
    window.addEventListener("scroll", onScroll);
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
                data.curOrientation
            );
            styledCells.push(
                ...previewPlacement(
                    startCoord,
                    curCoord,
                    player,
                    data.shipName,
                    data.length,
                    data.curOrientation,
                    boardDiv
                )
            );
        };
        cellEl.onpointerleave = () => {
            clearPreview(styledCells);
        };
    }
}

export {
    dragShip,
    modalConfigs,
    overlayConfigs,
    animDelay,
    HUMAN_MODE,
    AI_MODE,
};
