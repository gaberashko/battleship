import { AI_MODE } from "../index";
import { Ship } from "./Ship";

type NumberPair = [number, number];

type Cell = {
    hit: boolean;
    sunk: boolean;
    ship: Ship | null;
};

type attackResult = {
    hit: boolean;
    sunk: boolean;
    coords: NumberPair;
    ship?: Ship | null;
};

const defaultCell: Cell = { hit: false, sunk: false, ship: null };

class GameBoard {
    public readonly size: number = 10; // GameBoard grid size.
    public readonly ships: Ship[] = [
        new Ship("carrier", 5),
        new Ship("battleship", 4),
        new Ship("cruiser", 3),
        new Ship("submarine", 3),
        new Ship("destroyer", 2),
    ]; // The ships that exist for the GameBoard.

    private board: Cell[][]; // Grid data
    private shipPositions: Map<Ship, NumberPair[]> = new Map(); // Ship position data.

    // Default constructor; creates an empty board of cells.
    public constructor(params: Partial<GameBoard> = {}) {
        this.board = Array.from({ length: this.size }, () =>
            Array.from({ length: this.size }, () => ({ ...defaultCell }))
        );

        Object.assign(this, params);
    }

    // Returns whether all ships on the board have been sunk.
    public allShipsSunk(): boolean {
        return Array.from(this.shipPositions.keys()).every((ship: Ship) =>
            ship.isSunk()
        );
    }

    // Returns whether all ships on the board have been placed.
    public allShipsPlaced(): boolean {
        const shipKeys = Array.from(this.shipPositions.keys());
        // console.log("shipKeys:", shipKeys);
        // console.log(this.ships.every((ship) => shipKeys.includes(ship)));
        return this.ships.every((ship) => shipKeys.includes(ship));
    }

    // Places a ship on the board, if valid, at a specified starting position and orientation.
    // Returns a boolean indicating if the ship was successfully placed.
    public placeShip(
        shipName: string,
        startCoord: NumberPair,
        orientation: "horizontal" | "vertical"
    ): boolean {
        const ship: Ship = this.getShip(shipName)!;
        // Verify that the ship exists, has not been placed yet, and has valid orientation arg.
        if (
            ship &&
            !Array.from(this.shipPositions.keys()).includes(ship) &&
            (orientation === "horizontal" || orientation === "vertical")
        ) {
            let coords: NumberPair[] = getAdjacentCoords(
                startCoord,
                orientation,
                ship.length
            );

            if (this.validPlacement(shipName, coords, orientation)) {
                for (let coordPair of coords) {
                    // The coordinates are valid, so associate them with the ship.
                    let cell: Cell = this.getCell(coordPair) as Cell;
                    cell.ship = ship;
                }
                // Associate the ship with the array of coordinates it was placed at.
                this.shipPositions.set(ship, coords);
                // console.log(this.shipPositions);
                return true;
            } else {
                // Potentially throw an error
                return false;
            }
        } else {
            // Potentially throw an error
            return false;
        }
    }

    // Removes a ship from the board. Returns boolean indicating if ship was successfully removed.
    public removeShip(shipName: string): boolean {
        const ship: Ship = this.getShip(shipName)!;
        let shipCoords: NumberPair[] | undefined = this.shipPositions.get(ship);

        if (shipCoords) {
            // Remove the ship from every cell it current occupies, and remove its map entry.
            for (const coord of shipCoords) {
                let cell: Cell = this.getCell(coord)!;
                cell.ship = null;
            }
            this.shipPositions.delete(ship);
            return true;
        } else {
            /*console.error(
                `Could not find coordinates associated with ship ${ship}`
            );*/
            return false;
        }
    }

    // Takes a pair of coordinates, and if a ship exists, calls hit on the ship.
    // Returns results of attack if successful, and null if unsuccessful.
    public receiveAttack(coords: NumberPair): attackResult | null {
        if (this.coordsValid(coords)) {
            let targetCell: Cell = this.getCell(coords) as Cell;
            if (targetCell) {
                // If the cell was already attacked, we can't allow this.
                if (this.wasAttacked(targetCell)) {
                    /*console.log(
                        "receiveAttack sent to a cell that has already been attacked."
                    );*/
                    return null;
                }
                targetCell.hit = true;
                // If a ship exists, call hit() on it.
                if (this.hasShip(targetCell)) {
                    targetCell.ship.hit();
                    // If the ship was sunk, set all of its cells to sunk.
                    if (targetCell.ship.isSunk()) {
                        let shipCells = this.shipPositions
                            .get(targetCell.ship)
                            ?.map((coords) => this.getCell(coords));
                        for (let cell of shipCells!) {
                            cell!.sunk = true;
                        }
                    }
                }
                // console.log("at the end of receiveAttack, coords is", coords);
                return {
                    hit: this.hasShip(targetCell),
                    sunk: targetCell.ship?.isSunk()!,
                    coords: coords,
                    ship: targetCell.ship,
                };
            } else {
                throw new Error(`targetCell of receiveAttack() undefined.`);
            }
        } else {
            throw new Error(
                `receiveAttack invalid coordinates argument: ${coords}`
            );
        }
    }

    // Returns a snapshot of the board information (ship positions, hits, misses, etc.).
    public getBoard(): Cell[][] {
        return this.board;
    }

    // Returns a masked snapshot of the board information (hits, misses).
    public getMaskedBoard(): Cell[][] {
        return this.board.map((row) =>
            row.map((cell) => ({
                hit: cell.hit,
                sunk: cell.sunk,
                ship: cell.hit ? cell.ship : null,
            }))
        );
    }

    // Prints out a current representation of the GameBoard.
    public print(): void {
        let output: string = "";
        for (let row = 0; row <= this.size - 1; ++row) {
            for (let col = 0; col <= this.size - 1; ++col) {
                const cell: Cell = this.getCell([col, row]) as Cell;
                if (cell.ship) {
                    output += cell.hit ? "💥" : "⚓";
                } else {
                    output += cell.hit ? "❌" : "🌊";
                }
            }
            output += "\n";
        }

        // console.log(output);
    }

    // Returns the specific ship object specified by the name, or undefined if doesn't exist.
    public getShip(name: string): Ship | undefined {
        return this.ships.find((ship) => ship.name === name);
    }

    // Returns the logical cells (as they'd be stored in hash) at which a ship resides.
    public getShipCells(ship: Ship): number[] {
        let shipCells = this.shipPositions.get(ship);
        if (shipCells) {
            return shipCells.map((coord) => this.coordToKey(coord));
        } else {
            return [];
        }
    }

    // Returns whether or not a ship placement is valid without modifying the board.
    public validPlacement(
        shipName: string,
        coords: NumberPair[],
        orientation: "horizontal" | "vertical"
    ): boolean {
        const ship: Ship = this.getShip(shipName)!;
        // Verify that the ship exists, has not been placed yet, and has valid orientation arg.
        if (
            ship &&
            !Array.from(this.shipPositions.keys()).includes(ship) &&
            (orientation === "horizontal" || orientation === "vertical")
        ) {
            return coords.every((coordPair) => {
                if (this.coordsValid(coordPair)) {
                    let cell: Cell = this.getCell(coordPair) as Cell;

                    return !this.hasShip(cell);
                } else {
                    return false;
                }
            });
        } else {
            return false;
        }
    }

    // INTERNAL FUNCTIONS

    // Returns a boolean that indicates if the following coordinates exist on the board.
    private coordsValid(coords: NumberPair): boolean {
        return coords.every((coord) => coord >= 0 && coord < this.size);
    }

    // Returns the cell at a given coordinate.
    private getCell(coords: NumberPair): Cell | null {
        const [col, row] = coords;
        return this.board[row]?.[col]!;
    }

    // Returns if a ship exists in the current position.
    private hasShip(cell: Cell): cell is Cell & { ship: Ship } {
        return cell.ship !== null;
    }

    // Returns if the current position has been attacked yet.
    private wasAttacked(cell: Cell): boolean {
        return cell.hit;
    }

    // Hash a coordinate to a number for storage.
    private coordToKey([x, y]: NumberPair): number {
        return y * this.size + x;
    }

    // Retrieve the coordinate from a number hash.
    private keyToCoord(key: number): NumberPair {
        return [key % this.size, Math.floor(key / this.size)];
    }
}

function getAdjacentCoords(
    startCoord: NumberPair,
    orientation: "horizontal" | "vertical",
    length: number
): NumberPair[] {
    let coords: NumberPair[] = Array.from({ length: length }, (_, i) =>
        orientation === "horizontal"
            ? [startCoord[0] + i, startCoord[1]]
            : [startCoord[0], startCoord[1] + i]
    );

    return coords;
}

export { GameBoard, getAdjacentCoords };
export type { NumberPair, attackResult, Cell };
