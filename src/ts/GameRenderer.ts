import { attackResult, getAdjacentCoords, NumberPair } from "./GameBoard";
import { Player } from "./Player";
import type { GameState, Renderer } from "./GameController";
import missAudio from "../assets/sounds/miss.mp3";
import hitAudio from "../assets/sounds/hit.mp3";
import sunkAudio from "../assets/sounds/sunk.mp3";

const STARTING_CELL_INDEX: number = 12;
const CELLS_PER_ROW: number = 10;
const BOARD_SIZE: number = CELLS_PER_ROW * CELLS_PER_ROW;
const ROW_LABELS: string = "ABCDEFGHIJ";
const COLUMN_LABELS: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
const STATUS_ELEMENT: string = "h5";
const TYPING_DURATION = 0.8; // In seconds
const ATTACKING_BLINK_DURATION = 1.2; // In seconds
const [MISS, HIT, SUNK] = ["missed", "hit a ship!", "sunk a ship!"];

class GameRenderer implements Renderer {
    // Maps each player to their board in the DOM.
    private playerBoards: Map<string, HTMLDivElement[]> = new Map<
        string,
        HTMLDivElement[]
    >();

    // Takes in a DOM element to display the game on.
    public constructor(private container: HTMLElement) {
        // Insert the HTML to comprise the Battleship game // REMOVE?

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

    // Handles the rendering of the board.
    public renderBoard(
        player: Player,
        hideShips: boolean,
        callback?: (...arg: any) => any,
        editable: boolean = false
    ): void {
        const numOfCells: number = player.board.size * player.board.size;
        const boardCellElements = this.playerBoards.get(player.name);
        const boardContainer = boardCellElements![0]?.parentElement;
        let playerBoard = player.getBoard(hideShips);
        // We are not hiding ships. Ships visible.
        if (!hideShips) {
            let allShipPositions: number[][] = player.board.ships.map(
                (ship) => {
                    let shipPosition = player.board.getShipCells(ship);
                    return shipPosition !== undefined ? shipPosition : [];
                }
            );
            if (editable) {
                for (const shipPosition of allShipPositions) {
                    const shipDiv = document.createElement("div");
                }
                // Build ship__units that can be moved around.

            } else {

                // Determine the orientation, and apply appropriate ship display classes.
                for (const shipPositions of allShipPositions) {
                    if (shipPositions.length > 1) {
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
                            boardCellElements![
                                keyToIndex(shipPositions[i]!)!
                            ]?.classList.add(
                                `--ship-${orientation}-${shipPart}`
                            );
                        }
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
                        console.log("cell", cell, "is sunk");
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
            boardCellElements![keyToIndex(cell)!]?.classList.add(
                ...statusClasses
            );
        }
        // Hydrate cells available to be targetted by a player.
        let targetableCells = Array.from(
            boardContainer?.querySelectorAll(".--targetable, .--placeable")!
        ) as HTMLDivElement[];
        for (const cell of targetableCells) {
            if (callback) {
                // We pass callbacks for the cells with that cell's index.
                cell.addEventListener("click", (e) =>
                    callback(keyToCoord(Number(cell?.dataset?.cell)))
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

            let attackerCells = cellIndices.map(
                (i) => this.playerBoards.get(attackerName)![i!]
            );
            for (const cell of attackerCells) {
                cell?.classList.remove("--targetable");

                for (const status of statusClasses) {
                    cell?.classList.add(status);
                    resultAudio.play();
                }
                setTimeout(() => {
                    cell?.classList.replace("--attacking", "--attack");
                }, ATTACKING_BLINK_DURATION * 1000);
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

    public displayGameOver(): void {}
}

// Handles cells in ship placement preview.
function previewPlacement(
    startCoord: NumberPair,
    curCoord: NumberPair,
    player: Player,
    shipName: string,
    length: number,
    orientation: "horizontal" | "vertical",
    cellElements: HTMLDivElement[]
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
            return cellElements[index];
        }
    }) as (HTMLDivElement | null)[];

    let placementValid = player.board.validPlacement(
        shipName,
        coords,
        orientation
    );

    // Style the cells for preview
    for (let i = 0; i < allCells.length; ++i) {
        if (allCells[i] !== null) {
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
    // Add a one-time event listener to remove styles when player moves to new cell.
    cellElements[cellKey]?.addEventListener(
        "pointerleave",
        () => {
            clearPreview(styledCells);
        },
        {
            once: true,
        }
    );
    // Return the currently-styled cell elements.
    return styledCells;
}

// Removes preview stylings from a list of cells if they exist.
function clearPreview(styledCells: HTMLDivElement[]): void {
    for (let i = 0; i < styledCells.length; ++i) {
        if (styledCells[i]) {
            styledCells[i]!.textContent = "";
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

export {
    GameRenderer,
    previewPlacement,
    clearPreview,
    typeContent,
    keyToCoord,
    coordToKey,
    getAdjacentCoords,
    coordsToKeys,
    getRow,
    offsetCoord,
};
