import { GameBoard } from "./GameBoard";
import type { NumberPair, attackResult } from "./GameBoard";
import { dragShip } from "../index";
import { displaySetupPage } from "../setup";

type memory = {
    placementHistory: Set<string>;
    moveHistory: Set<Number>;
    hits: NumberPair[];
    targetQueue: NumberPair[];
    hardModeGuesses?: NumberPair[];
};

class Player {
    public board: GameBoard = new GameBoard();
    private memory?: memory;
    public readonly name: string = "Alvin";
    public readonly isHuman: boolean = false;
    public readonly difficulty?: "easy" | "medium" | "hard";

    public constructor(params: Partial<Player> = {}) {
        if (this.name === "" || typeof this.name !== "string") {
            throw new Error("Player name argument is invalid");
        }

        Object.assign(this, params);

        // The instance is an AI, so we initialize its memory.
        if (!this.isHuman) {
            this.memory = {
                moveHistory: new Set<Number>(),
                placementHistory: new Set<string>(),
                hits: [],
                targetQueue: [],
                ...(this.difficulty === "hard"
                    ? { hardModeGuesses: [] as NumberPair[] }
                    : {}),
            };

            // If we are on hard mode, create initial guess queue.
            if (this.memory?.hardModeGuesses) {
                let checkerboard: NumberPair[] = [];
                for (let x = 0; x < this.board.size; ++x) {
                    for (let y = 0; y < this.board.size; ++y) {
                        if ((x + y) % 2 === 0) checkerboard.push([x, y]);
                    }
                }

                this.memory.hardModeGuesses = shuffleArray(checkerboard);
            }
        }
    }

    /*
    1.) Rebuild ship unit html above the involved cells, position
    2.) Build a wrapper around involved cells, make that wrapper a ship__unit
    and then do some magic shit
    */
    // Attempts to place a ship on the GameBoard. Returns a boolean indicating if it was successful.
    public placeShip(
        shipName: string,
        startCoord: NumberPair,
        orientation: "horizontal" | "vertical"
    ): boolean {
        const ship = this.board.getShip(shipName);

        if (ship) {
            return this.board.placeShip(shipName, startCoord, orientation);
        } else {
            /*console.error(
                `Ship name ${shipName} does not refer to a valid ship.`
            );*/
            return false;
        }
    }

    // Attempts an attack on the specified board at the coordinates.
    // Returns an attack result.
    public attack(board: GameBoard, coords?: NumberPair): attackResult {
        let targetCoords: NumberPair;
        // If the instance is an AI, come up with coordinates to attack.
        if (!this.isHuman && !coords) {
            targetCoords = this.getAttack();
        } else {
            // Instance is a player, so coords will be passed from DOM.
            targetCoords = coords!;
        }
        let attackResult = board.receiveAttack(targetCoords) as attackResult;
        // Interpret the results of the attack and update AI memory.
        if (!this.isHuman && attackResult) {
            this.updateMemory(attackResult);
        }

        return attackResult;
    }

    // Returns a representation of the player's board status. Takes boolean that determines
    // if sensitive information (e.g. ship placements) should be hidden.
    public getBoard(masked: boolean) {
        return masked ? this.board.getMaskedBoard() : this.board.getBoard();
    }

    // INTERNAL FUNCTIONS

    // Returns the next coordinate that the AI will attack.
    private getAttack(): NumberPair {
        /*console.log(
            "getAttack() Current target queue:",
            this.memory?.targetQueue
        );*/
        let targetCoord: NumberPair;

        switch (this.difficulty) {
            case "hard": // Choose checkerboard guess. If ship's hit, begin adjacent search.
                // If we have another move we wanted to try, try it.
                if (this.memory?.targetQueue.length !== 0) {
                    targetCoord = this.memory?.targetQueue.pop()!;
                } else {
                    // No current ship to target. Guess within the checkerboard pattern.
                    do {
                        if (this.memory?.hardModeGuesses?.length !== 0)
                            targetCoord = this.memory?.hardModeGuesses?.pop()!;
                    } while (
                        this.memory?.moveHistory.has(
                            this.coordToKey(targetCoord!)
                        )
                    );
                }
                break;
            case "medium": // Choose an arbitrary position. If a ship's hit, begin adjacent search.
                // If we have another move we wanted to try, try it.
                if (this.memory?.targetQueue.length !== 0) {
                    targetCoord = this.memory?.targetQueue.pop()!;
                } else {
                    // No current ship to target. Guess random coordinate.
                    do {
                        targetCoord = [this.randInt(), this.randInt()];
                    } while (
                        this.memory?.moveHistory.has(
                            this.coordToKey(targetCoord)
                        )
                    );
                }
                break;
            default: // Easy difficulty: Always pick completely arbitrary coordinate.
                do {
                    targetCoord = [this.randInt(), this.randInt()];
                } while (
                    this.memory?.moveHistory.has(this.coordToKey(targetCoord))
                );
        }
        // console.log("getAttack() returning the coord:", targetCoord!);
        return targetCoord!;
    }

    // Manages the memory state of the AI opponent based on the last attack result.
    private updateMemory(result: attackResult): void {
        let orientation: "horizontal" | "vertical";
        let adjacentCoords: NumberPair[] = [];
        const deltas: NumberPair[] = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        // console.log("updateMemory() received attack result:", result);
        // Add the coordinate attacked to the move history.
        this.memory?.moveHistory.add(this.coordToKey(result.coords));

        // We had a valid hit, so add it to hits on target, and rebuild queue of cells to target.
        if (result.hit) {
            // console.log("Recognized as hit");
            this.memory?.hits.push(result.coords);
            this.memory!.targetQueue = [];
        }

        // Target sunk, clear the current hits on target.
        if (result.sunk) {
            // console.log("Recognized as sunk");
            this.memory!.hits = [];
            this.memory!.targetQueue = []; // Just to be safe ;)
        }

        // console.log("updateMemory() has hits memory of:", this.memory?.hits);

        // One hit on the ship, orientation not known, so add plus adjacent cells.
        if (this.memory?.hits.length == 1) {
            let [x, y] = this.memory?.hits[0] as NumberPair;

            adjacentCoords = deltas
                .map(([dx, dy]: NumberPair) => [x + dx, y + dy] as NumberPair)
                .filter((coords) =>
                    coords.every(
                        (coord) => coord >= 0 && coord < this.board.size
                    )
                );
        } else if (this.memory?.hits.length! > 1) {
            // console.log("updateMemory() hits length is greater than 1");
            // Gauge the orientation of the current target ship.
            let [c1, c2] = [this.memory?.hits[0], this.memory?.hits[1]];
            orientation = c1![0] === c2![0] ? "vertical" : "horizontal";

            // If ship is vertical, we want second number in pair [x, y].
            // If ship is horizontal, we want first number in pair [x, y].
            let min: number = this.board.size,
                max: number = 0;
            let axis: number = orientation === "vertical" ? 1 : 0;

            // console.log("We recognize the ship to be", orientation);

            for (const coord of this.memory?.hits!) {
                min = coord[axis]! < min ? coord[axis]! : min;
                max = coord[axis]! > max ? coord[axis]! : max;
            }
            /*console.log(
                `We have a minimum value ${
                    orientation == "vertical" ? "y" : "x"
                } coordinate of ${min} and maximum of ${max}`
            );*/

            /* ISSUE HERE V WE DON'T APPEND ANY NEW ADJACENT COORDS, WE JUST KEEP THE SAME TWO ADJACENT ONES */
            // Filter possible candidate coordinates for ones that can exist on board.
            adjacentCoords = [
                this.memory?.hits.find((coord) => coord[axis] === min)!,
                this.memory?.hits.find((coord) => coord[axis] === max)!,
            ].map((coord) => {
                if (axis == 0) {
                    if (coord[axis] == min) {
                        return [coord[axis] - 1, coord[1]];
                    } else if (coord[axis] == max) {
                        return [coord[axis] + 1, coord[1]];
                    }
                } else {
                    if (coord[axis] == min) {
                        return [coord[0], coord[axis] - 1];
                    } else if (coord[axis] == max) {
                        return [coord[0], coord[axis] + 1];
                    }
                }
            }) as NumberPair[];

            // let newAdjCoords = adjacentCoords.map((coord) => {
            //     if (axis == 0) {
            //         if (coord[axis] == min) {
            //             return [coord[axis] - 1, coord[1]];
            //         } else if (coord[axis] == max) {
            //             return [coord[axis] + 1, coord[1]];
            //         }
            //     } else {
            //         if (coord[axis] == min) {
            //             return [coord[0], coord[axis] - 1];
            //         } else if (coord[axis] == max) {
            //             return [coord[0], coord[axis] + 1];
            //         }
            //     }
            // }) as NumberPair[];

            /*console.log(
                "We have the following adjacentCoords:",
                adjacentCoords
            );*/

            adjacentCoords.filter((coords) =>
                coords.every((coord) => coord >= 0 && coord < this.board.size)
            );

            /*console.log(
                "The filtered adjacent coordinates to add are:",
                adjacentCoords
            );*/
        }
        /*console.log(
            "updateMemory() movehistory before adding adjacent coords:",
            this.memory?.moveHistory
        );*/
        // All valid adjacent coords that haven't been tried yet get added.
        if (adjacentCoords.length > 0) {
            for (const coord of adjacentCoords) {
                if (!this.memory?.moveHistory.has(this.coordToKey(coord))) {
                    this.memory?.targetQueue.push(coord);
                    // console.log("Adding ", coord);
                }
            }
        }
    }

    // Function to for player to place ships onto the board. Automatically places if AI.
    public placeAllShips(): Promise<void> {
        return new Promise((res) => {
            if (this.isHuman) {
                // Display the setup page.
                displaySetupPage(this);
                // Hydrate ship units for placement logic.
                const shipUnits = Array.from(
                    document.querySelectorAll(".ship__unit.--placeable")
                ) as HTMLDivElement[];
                for (const shipUnit of shipUnits) {
                    shipUnit.addEventListener(
                        "pointerdown",
                        (e: PointerEvent) => {
                            dragShip(e, this);
                        }
                    );
                }
                // Hydrate confirm button.
                const confirmBtn = document.getElementById("confirm_btn");
                if (confirmBtn) {
                    confirmBtn.addEventListener("click", () => {
                        if (this.board.allShipsPlaced()) {
                            res(undefined);
                        } else {
                            alert("All ships not placed");
                            console.error(
                                "Confirm error: All ships not placed"
                            );
                        }
                    });
                }
            } else {
                // console.log("AI ship placement");
                // Logic to place all ships automatically for AI.
                let moveHash: string;
                let coord: NumberPair;
                let orientation: "horizontal" | "vertical";
                let shipPlaced: boolean;

                for (const ship of this.board.ships) {
                    shipPlaced = false;
                    do {
                        coord = [this.randInt(), this.randInt()];
                        orientation =
                            this.randInt() >= 4 ? "horizontal" : "vertical";

                        // If we tried the placement, skip. Otherwise, add the move and attempt.
                        moveHash = String(this.coordToKey(coord) + orientation);
                        if (!this.memory?.placementHistory.has(moveHash)) {
                            this.memory?.placementHistory.add(moveHash);
                            shipPlaced = this.placeShip(
                                ship.name,
                                coord,
                                orientation
                            );
                        }
                    } while (!shipPlaced);
                }
                res(undefined);
            }
        });
    }

    // Returns a random integer in [min, max].
    private randInt(
        min: number = 0,
        max: number = this.board.size - 1
    ): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Hash a coordinate to a number for storage.
    private coordToKey([x, y]: NumberPair): number {
        return y * this.board.size + x;
    }

    // Retrieve the coordinate from a number hash.
    private keyToCoord(key: number): NumberPair {
        return [key % this.board.size, Math.floor(key / this.board.size)];
    }
}

// Performs Fisher-Yates shuffle of array.
function shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
}

export { Player, GameBoard };
export type { attackResult };
