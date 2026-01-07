import { attackResult, getAdjacentCoords, NumberPair } from "./GameBoard";
import { Player } from "./Player";
import type { GameState, Renderer } from "./GameController";
import { modalConfigs, overlayConfigs, animDelay } from "../index";
import missAudio from "../assets/sounds/miss.mp3";
import hitAudio from "../assets/sounds/hit.mp3";
import sunkAudio from "../assets/sounds/sunk.mp3";
import { HUMAN_MODE, AI_MODE } from "../index";

const STARTING_CELL_INDEX: number = 12;
const CELLS_PER_ROW: number = 10;
const BOARD_SIZE: number = CELLS_PER_ROW * CELLS_PER_ROW;
const ROW_LABELS: string = "ABCDEFGHIJ";
const COLUMN_LABELS: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
const STATUS_ELEMENT: string = "h5";
const TYPING_DURATION = 0.8; // In seconds
const ATTACKING_BLINK_DURATION: number = 1.2; // In seconds
const [MISS, HIT, SUNK] = ["missed", "hit a ship!", "sunk a ship!"];
const cellConfigClasses: string[] = [
    "--targetable",
    "--attack",
    "--attacking",
    "--hit",
    "--miss",
    "--sunk",
    "--ship-y-head",
    "--ship-y-body",
    "--ship-y-tail",
    "--ship-x-head",
    "--ship-x-body",
    "--ship-x-tail",
];

class GameRenderer implements Renderer {
    // Maps each player to their board in the DOM.
    private playerBoards: Map<string, HTMLDivElement[]> = new Map<
        string,
        HTMLDivElement[]
    >();

    private gameMode = sessionStorage.getItem("mode");

    // Takes in a DOM element to display the game on.
    public constructor(private container: HTMLElement) {
        // It would be efficient to store the cells of both players once and access throughout.
        let boards = Array.from(
            document.querySelectorAll(".game__board")
        ) as HTMLDivElement[];
        for (const board of boards) {
            this.playerBoards.set(
                board.dataset.name!,
                Array.from(board.children) as HTMLDivElement[]
            );
        }
    }

    // Handles the transitions that occurs between rounds.
    public async renderPlayerTransition(state: GameState): Promise<void> {
        return new Promise((res) => {
            if (this.gameMode == HUMAN_MODE) {
                const turnModal = document.getElementById(
                    "turn"
                ) as HTMLDivElement;

                turnModal.innerHTML = `<div class="modal__header">
                    <h4>${state.curPlayer.name}'s turn</h4>
                </div>
                <br />> <br />>
                <div class="modal__body --center">
                    <h5>Pass the device to ${state.curPlayer.name}</h5>
                    <br />
                    <p class="--console">...make this shot count!</p>
                    <br />
                    <button
                        class="modal__button"
                        id="modal__turn_btn"
                        type="button"
                    >
                        Ready
                    </button>
                </div>`;

                // Hydrate the button with a one-time click listener to resolve promise
                const turnModalBtn = document.getElementById("modal__turn_btn");
                turnModalBtn?.addEventListener(
                    "click",
                    () => {
                        toggleOverlay({
                            modalEl: turnModal,
                            overlayConfig: "--obscure",
                        });
                        res();
                    },
                    { once: true }
                );

                toggleOverlay({
                    modalEl: turnModal,
                    overlayConfig: "--obscure",
                });
            } else {
                res();
            }
        });
    }

    // Handles the rendering of the board.
    public renderBoard({
        player,
        hideShips,
        callback,
        editable,
        isCurPlayer,
    }: {
        player: Player;
        hideShips: boolean;
        callback?: (...arg: any) => any;
        editable?: boolean;
        isCurPlayer?: boolean;
    }): void {
        const numOfCells: number = player.board.size * player.board.size;
        const boardElements = this.playerBoards.get(player.name);
        const boardContainer = boardElements![0]
            ?.parentElement as HTMLDivElement;
        const boardCells = Array.from(
            boardContainer.querySelectorAll("[data-cell]")
        ) as HTMLDivElement[];

        // First clear any classes applied to the cells.
        boardCells.forEach((cell) => {
            cell.classList.remove(...cellConfigClasses);
            cell.style.pointerEvents = !isCurPlayer
                ? "auto"
                : this.gameMode == AI_MODE && player.isHuman
                ? "auto"
                : "none";
        });

        let playerBoard = player.getBoard(hideShips);
        // We are not hiding ships. Ships visible.
        if (!hideShips) {
            let allShipPositions: number[][] = player.board.ships.map(
                (ship) => {
                    let shipPosition = player.board.getShipCells(ship);
                    return shipPosition !== undefined ? shipPosition : [];
                }
            );

            // Determine the orientation, and apply appropriate ship display classes.
            for (const shipPositions of allShipPositions) {
                // console.log(shipPositions);
                if (shipPositions.length !== 0) {
                    // (e.g. cell 19 vs. cell 20)
                    let orientation =
                        Math.floor(shipPositions[0]! / CELLS_PER_ROW) ==
                        Math.floor(shipPositions[1]! / CELLS_PER_ROW)
                            ? "x"
                            : "y";
                    let shipPart = "";
                    for (let i = 0; i < shipPositions.length; ++i) {
                        if (i == 0) {
                            shipPart = "head";
                        } else if (i != shipPositions.length - 1) {
                            shipPart = "body";
                        } else {
                            shipPart = "tail";
                        }
                        // Assign the cell the ship class with proper orientation and part.
                        boardCells![shipPositions[i]!]?.classList.add(
                            `--ship-${orientation}-${shipPart}`
                        );
                    }
                }
            }
        }
        // Regular logic for displaying previous attacks results.
        for (let cell = 0; cell < numOfCells; ++cell) {
            let [col, row] = keyToCoord(cell) as [number, number];
            let statusClasses: string[] = [];
            let boardCell = playerBoard[row]![col];
            if (boardCell!.hit) {
                // If there was a ship, determine if it was sunk, or hit.
                if (boardCell!.ship) {
                    if (boardCell!.ship.isSunk()) {
                        statusClasses.push("--sunk");
                        // console.log("cell", cell, "is sunk");
                    } else {
                        statusClasses.push("--hit");
                    }
                    if (hideShips) statusClasses.push("--attack");
                } else {
                    // No ship, so it was a missed attack either way.
                    statusClasses.push("--miss", "--attack");
                }
            } else if (hideShips && statusClasses.length == 0) {
                // Cell is targetable if we are hiding ships and it has not been attacked.
                statusClasses.push("--targetable");
            }

            // Add all status classes to that cell element.
            boardCells[cell]!.classList.add(...statusClasses);
        }
        // Hydrate cells available to be targetted by a player.
        let targetableCells = Array.from(
            boardContainer?.querySelectorAll(".--targetable, .--placeable")!
        ) as HTMLDivElement[];
        for (const cell of targetableCells) {
            if (callback) {
                // We pass callbacks for the cells with that cell's index.
                cell.addEventListener(
                    "click",
                    (e) => callback(keyToCoord(Number(cell?.dataset?.cell))),
                    { once: true }
                );
            }
        }
    }

    // Handles the display of the result of an attack.
    async renderAttack(state: GameState): Promise<void> {
        // We can't render a null state.
        if (!state.attackResult) {
            console.error("Attack result was null");
            return;
        }

        const attackStatusContainer = this.container.querySelector(
            ".game__status"
        ) as HTMLDivElement;
        const attackerName: string = state.curPlayer.name;
        const opponentName: string = state.oppPlayer.name;
        const { hit, sunk, coords, ship } = state.attackResult!;
        console.log(state.attackResult);
        const coordLabel: string = `${ROW_LABELS[coords[1]]}${
            COLUMN_LABELS[coords[0]]
        }`;
        const outcome: string = hit ? (sunk ? SUNK : HIT) : MISS;
        const oppBoard = this.playerBoards.get(
            opponentName
        ) as HTMLDivElement[];
        // Prevent multiple attacks in one round.
        for (const cell of oppBoard) {
            cell.style.pointerEvents = "none";
        }

        let resultClass: string = "";
        let resultAudio: HTMLAudioElement = new Audio();
        let statusClasses: string[] = ["--attacking"];
        switch (outcome) {
            case MISS:
                resultClass = "--miss";
                resultAudio.src = missAudio;
                break;
            case HIT:
                resultClass = "--hit";
                resultAudio.src = hitAudio;
                break;
            case SUNK:
                resultClass = "--sunk";
                resultAudio.src = sunkAudio;
                break;
        }
        statusClasses.push(resultClass);

        // Find the cell element that was attacked, and animate the relevant attacked cells.
        let cellIndices = Array.from(
            outcome == SUNK
                ? state.oppPlayer.board
                      .getShipCells(ship!)
                      .map((cell) => keyToIndex(cell))
                : [keyToIndex(coordToKey(coords)!)]
        );
        cellIndices.forEach((index) => {
            // Rerender the sunk ship on enemy board (remove hit class);
            this.playerBoards
                .get(opponentName)!
                [index!]?.classList.remove("--hit");

            let attackerCells = cellIndices.map((i) => oppBoard![i!]);
            for (const cell of attackerCells) {
                cell?.classList.remove("--targetable");

                for (const status of statusClasses) {
                    cell?.classList.add(status);
                    resultAudio.play();
                }

                // setTimeout(() => {
                //     cell?.classList.replace("--attacking", "--attack");
                // }, ATTACKING_BLINK_DURATION * 1000);
            }
        });

        // Clear the previous attack text-summary, and display the new one.
        attackStatusContainer.replaceChildren();
        let attackTexts: string[] = [
            `${attackerName} attacked ${coordLabel}`,
            `...and ${outcome}`,
            "",
            `${opponentName}'s turn to attack.`,
        ];

        for (const text of attackTexts) {
            let statusLine = document.createElement(
                STATUS_ELEMENT
            ) as HTMLDivElement;
            attackStatusContainer.appendChild(statusLine);

            await typeContent(statusLine, `>${text}`, TYPING_DURATION);
            // Add console effect for final text.
            if (text == attackTexts[attackTexts.length - 1])
                statusLine.classList.add("--console");
        }
    }

    public displayGameOver(state: GameState): void {
        const winModal = document.getElementById("win") as HTMLDivElement;
        winModal.innerHTML = `<div class="modal__header">
                    <h4>${state.curPlayer.name} has won!</h4>
                </div>
                <div class="modal__body --center">
                    <pre>
                  _,                         .,
                jW#                          !#W,
              .W##|        ._                 M##L
             .W###  ._jmmm#@'     jmW#####WL_ !###;
         .W| W###!j#######P        ~~*#######W,M###, #L
        .W#| ###@d######@~            \`Y#######!###| ##;
        W##| ##f/*****~'                 ~*****t/M#| ###;
       :###!.Km8mW###mL,                 _mm###WWG#| ###W
    .; |### Z~*#########W,             :W########@fY,####,.L
    dW |##P.!  .XX7~~~'                   ~~~~XXL   \/###'|#;
   .##;\`##/\m#######+                       4######WL\`##@ ##b
   |##b #KW#####@f'                          \`YM######K(|:###
   |### @~~**M~'                                 ~V**~~Y|d###
   |### |.jm###@f                              \`M###Wm, tV###
 W;\`##|/:#####f                                  \`M####L\`Z##f d|
 ##,!#\G####*'                                     Y####W\#P d#|
 ###,|W@**5Wm#f                                   MWm#**M#| j##|
 ###W\`| .m###!                                     M##WL  |j###|
 |###;|.####!                                       M###W |####
_ M##W'W###f_r                                     m/M###;|###! _
#W/*#@d##*G##!                                     M#WZ###|#@'jWP
###L\`|P~ d##@                                      !##W,\`Y#f.W##'
|###W/| d###|                                       ####  @j###@
 M###bt ###@.W!                                   |L!###;|:####!
  M###d:##@\##                                    |#WV##|/W###'
 _ ~*#b#@f ###                                    |##;\`MWN#@f'_,
 M#m_ ~M, |### d|                               W,|##W  8/ .j##
 \`M###m_5 |###:#b                              .#W|### :\jW###!
  \`M####L\|##@W##,                             d##!###:\#####!
    Y####b|#@ ###|:W                        d|.###|!#bN####*'
     \`~**MW#! ####|#W                      j##|###! !P#**f'
     mmL__/~~\d###|##W,|L              .W!j###|##@_/~~___mmr
     \`M#####W,\##||###b|##L          .W##:###P!##P.j######f
       YM#####W/#  ####/###W,       j###P####! M5m######*'
         \`~**f~~Y+L\`M##|!####;     W###@ ##@'_rf~~~**f'
          ._mmmmmmmX=8#| \`M##W    |###*' #5/(Gmmmmmm__
           YM########mXb,  ~*#,   #@f'  _WWW########*'
             \`Y***#*f'_d####K8b  .W8#####_ ~*M@***~
                  _jm#######@\/f~+(########Wm_
                  ~**###@**~:'     \/Y*M###@*f'
</pre
                    >
                    <br />
                    <h5>Nice work, man.</h5>
                    <button
                        class="modal__button"
                        id="modal__main_menu_btn"
                        type="button"
                    >
                        Menu
                    </button>
                </div>`;

        // Hydrate the menu button with a one-time click listener.
        const menuBtn = document.getElementById(
            "modal__main_menu_btn"
        ) as HTMLButtonElement;
        menuBtn.addEventListener(
            "click",
            () => {
                toggleOverlay({
                    modalEl: winModal,
                });
                window.location.href = "index.html";
            },
            { once: true }
        );

        toggleOverlay({ modalEl: winModal });
    }
}

// Visually places ship on board (modifies DOM).
function placeShipDOM(
    boardContainer: HTMLDivElement,
    shipEl: HTMLDivElement,
    startCoord: NumberPair,
    orientation: "horizontal" | "vertical"
) {
    // console.log("We enter placeShipDOM with orientation", orientation);
    const shipSegments = Array.from(shipEl.children) as HTMLDivElement[];
    // console.log(shipSegments);
    const shipLength: number = shipEl.children.length;
    let cells = coordsToKeys(
        getAdjacentCoords(startCoord, orientation, shipLength)
    );

    // Create, style, and class shipDiv based on orientation.
    shipEl.dataset.orientation = orientation;
    if (orientation === "vertical") {
        shipEl.style.gridRow = `span ${cells.length}`;
        shipEl.style.gridColumn = `span ${1}`;
        shipEl.classList.replace("ship__unit", "ship__unit--vertical");
    } else if (orientation === "horizontal") {
        shipEl.style.gridRow = `span ${1}`;
        shipEl.style.gridColumn = `span ${cells.length}`;
        shipEl.classList.replace("ship__unit--vertical", "ship__unit");
    } else {
        console.error(
            `Unexpected orientation value in placeShipDOM: ${orientation}`
        );
    }

    let headCell = boardContainer?.querySelector(`[data-cell="${cells[0]}"]`);

    // Put the ship div into board, and append relevant child cells.
    let newChildren: HTMLDivElement[] = [];
    boardContainer.insertBefore(shipEl, headCell);
    for (let i = 0; i < cells.length; ++i) {
        // Get the cell.
        let cellEl = boardContainer?.querySelector(
            `[data-cell="${cells[i]}"]`
        ) as HTMLDivElement;
        // Assign it corresponding ship classes depending on the ship unit's orientation.
        let newShipSegmentClasses = shipSegments[i]!.className.replace(
            /(?<=[a-z])-(?=[a-z])/g,
            orientation === "horizontal" ? "-x-" : "-y-"
        );
        cellEl.className = cellEl.className + " " + newShipSegmentClasses;

        newChildren.push(cellEl);
    }

    // Style the ship__unit div with its relevant classes.
    shipEl.classList.add("board__cell");

    // Clear the old children with the board cells, and reset position of ship.
    shipEl.replaceChildren(...newChildren);
    shipEl.dataset.placed = "true";
    shipEl.style.position = "relative";
    shipEl.style.inset = "0";
    shipEl.style.left = "";
    shipEl.style.top = "";
    shipEl.style.transform = "";
    shipEl.style.transformOrigin = "";
}

// Visually removes a ship from the board (modifies DOM).
function removeShipDOM(
    boardContainer: HTMLDivElement,
    shipEl: HTMLDivElement,
    orientation: "horizontal" | "vertical"
) {
    // Remove the board__cell class from the ship.
    shipEl.classList.remove("board__cell", "--bottom");

    // Move the board cells back to the board.
    let shipChildren = [] as HTMLDivElement[];
    while (shipEl.firstChild) {
        // Create a ship segment and give it equivalent ship classes
        let shipSegment = document.createElement("div");
        shipSegment.className = Array.from(shipEl.firstElementChild!.classList)
            .filter((c) => c.startsWith("--ship"))
            .join(" ")
            .replace(/(?<!-)-[a-z]+-/, "-");
        // ^ Filters for ship classes, and removes any "-x-" or "-y-" details.
        shipChildren.push(shipSegment);
        let newClassName = shipEl.firstElementChild!.className.replace(
            /--ship+[a-z-]*/g,
            ""
        );
        shipEl.firstElementChild!.className = newClassName;
        // Find the proper place to insert the cell.
        let curCell = shipEl.firstChild as HTMLDivElement;
        const curKey = Number(curCell.dataset.cell);
        if (!Number.isNaN(curKey)) {
            let referenceCell: HTMLDivElement;
            let referenceCellOffset: number = 1;
            if (curKey === 0) {
                // Edge case, insert after previous sibling.
                referenceCell = shipEl.previousElementSibling as HTMLDivElement;
                referenceCell.after(shipEl.firstChild);
            } else if (
                curKey % CELLS_PER_ROW === 0 &&
                orientation !== "horizontal"
            ) {
                // Left side of board + vertical, get closest row label.
                let rowLabels = Array.from(
                    boardContainer.querySelectorAll(
                        ".cell__label.--left:not(.--top)"
                    )
                ) as HTMLDivElement[];
                let rowIndex = Math.floor(Number(curKey) / 10);
                referenceCell = rowLabels[rowIndex]!;

                referenceCell.after(shipEl.firstChild);
            } else if (orientation === "horizontal") {
                boardContainer.insertBefore(shipEl.firstChild, shipEl);
            } else {
                referenceCell = boardContainer.querySelector(
                    `[data-cell="${curKey}"]`
                ) as HTMLDivElement;
                // ENTER HERE AT RIGHT SIDE C8 HORIZONTAL (cell 27)
                do {
                    referenceCell = boardContainer.querySelector(
                        `[data-cell="${curKey - referenceCellOffset}"]`
                    ) as HTMLDivElement;
                    ++referenceCellOffset;
                    // If the cell to left is horizontal, or start of vertical ship we should just place it after that ship wrapper.
                    if (
                        referenceCell.parentElement?.classList.contains(
                            "ship__unit"
                        ) ||
                        referenceCell.matches(":first-child")
                    ) {
                        referenceCell =
                            referenceCell.parentElement as HTMLDivElement;
                    } else if (
                        Number(referenceCell.dataset.cell) % 10 === 0 &&
                        referenceCell.parentElement?.classList.contains(
                            "ship__unit--vertical"
                        )
                    ) {
                        // If the current cell is on the left side of the board, look at row label.
                        let rowLabels = Array.from(
                            boardContainer.querySelectorAll(
                                ".cell__label.--left:not(.--top)"
                            )
                        ) as HTMLDivElement[];
                        let rowIndex = Math.floor(
                            Number(referenceCell.dataset.cell) / 10
                        );
                        referenceCell = rowLabels[rowIndex]!;
                    }
                } while (
                    referenceCell.parentElement?.classList.contains(
                        "ship__unit--vertical"
                    )
                );
                // console.log(
                // `Placing cell ${curKey} after ${referenceCell.outerHTML}`
                // );
                referenceCell.after(shipEl.firstChild);
            }
        }
    }

    // Rehydrate the ship with its own segments.
    shipEl.replaceChildren(...shipChildren);
}

// Handles cells in ship placement preview.
function previewPlacement(
    startCoord: NumberPair,
    curCoord: NumberPair,
    player: Player,
    shipName: string,
    length: number,
    orientation: "horizontal" | "vertical",
    boardContainer: HTMLDivElement
): HTMLDivElement[] {
    let cellKey = coordToKey(curCoord) as number;
    let coords: NumberPair[] = getAdjacentCoords(
        startCoord,
        orientation,
        Number(length)
    );
    // Indices of involved cells (prevents wrapping to next row for horizontal placement).
    const indices = coordsToKeys(coords);
    const allCells = indices.map((index) => {
        if (index === null) {
            return null;
        } else {
            return boardContainer.querySelector(`[data-cell="${index}"]`);
        }
    }) as (HTMLDivElement | null)[];
    let placementValid = player.board.validPlacement(
        shipName,
        coords,
        orientation
    );

    // Style the cells for preview
    for (let i = 0; i < allCells.length; ++i) {
        if (
            allCells[i] !== null &&
            !Array.from(allCells[i]!.classList).some((c) =>
                c.startsWith("--ship")
            )
        ) {
            if (i == 0) {
                allCells[i]?.classList.add("--head");
            } else if (i == length - 1) {
                allCells[i]?.classList.add("--tail");
            } else {
                allCells[i]?.classList.add("--body");
            }
            allCells[i]?.classList.add(
                `--placement-${placementValid ? "valid" : "invalid"}`,
                `--${orientation}`
            );
        }
    }

    let styledCells = allCells.filter((cell) => cell !== null);

    // Return the currently-styled cell elements.
    return styledCells;
}

// Removes preview stylings from a list of cells if they exist.
function clearPreview(styledCells: HTMLDivElement[]): void {
    for (let i = 0; i < styledCells.length; ++i) {
        if (styledCells[i]) {
            styledCells[i]?.classList.remove(
                "--placement-valid",
                "--placement-invalid",
                "--horizontal",
                "--vertical",
                "--head",
                "--body",
                "--tail"
            );
        }
    }
}

// Returns a new coordinate offset for an orientation.
function offsetCoord(
    startCoord: NumberPair,
    offset: number,
    orientation: "horizontal" | "vertical"
): NumberPair {
    const offsetCoord: NumberPair =
        orientation === "horizontal"
            ? [startCoord[0] - offset, startCoord[1]]
            : [startCoord[0], startCoord[1] - offset];
    return offsetCoord;
}

// Returns the row a cell resides at given the cell's key.
function getRow(cellKey: number) {
    Math.floor(cellKey / 10);
}

// Returns proper modulo answer for n(mod(m)). Handles negatives properly.
function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

// Hash a coordinate to a number for storage. If invalid coordinate, return null.
function coordToKey([x, y]: [number, number]): number | null {
    if ([x, y].some((n) => n < 0 || n >= CELLS_PER_ROW)) {
        return null;
    }
    return y * CELLS_PER_ROW + x;
}

// Retrieve the coordinate from a number hash.
function keyToCoord(key: number): NumberPair {
    return [mod(key, CELLS_PER_ROW), Math.floor(key / CELLS_PER_ROW)];
}

// Retrieve the index of a cell child of board.
function keyToIndex(key: number): number | undefined {
    if (key < 0 || key >= BOARD_SIZE) {
        return undefined;
    }
    return key + STARTING_CELL_INDEX + Math.floor(key / CELLS_PER_ROW);
}

// Retrieve the indices associated with cells from coordinate pairs.
function coordsToKeys(coords: NumberPair[]): (number | null)[] {
    return coords.map((coord) => coordToKey(coord));
}

// Fill out the text content of an element over duration (specified in seconds).
async function typeContent(
    el: HTMLDivElement,
    str: string,
    duration: number,
    i: number = 0,
    resolve?: () => void
): Promise<void> {
    const len: number = str.length;
    const delay: number = (duration * 1000) / len;

    if (!resolve) {
        el.classList.add("--typing");
        el.textContent = "";
        return new Promise<void>((res) => {
            typeContent(el, str, duration, 0, res);
        });
    }

    el.textContent += str[i];

    if (i == str.length - 1) {
        resolve();
        return;
    }

    setTimeout(() => typeContent(el, str, duration, i + 1, resolve), delay);
}

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    const overlay = document.getElementById("overlay") as HTMLDivElement;

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

export {
    GameRenderer,
    previewPlacement,
    placeShipDOM,
    removeShipDOM,
    clearPreview,
    typeContent,
    keyToCoord,
    coordToKey,
    getAdjacentCoords,
    coordsToKeys,
    getRow,
    offsetCoord,
};
