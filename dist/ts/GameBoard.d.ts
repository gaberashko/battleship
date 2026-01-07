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
declare class GameBoard {
    readonly size: number;
    readonly ships: Ship[];
    private board;
    private shipPositions;
    constructor(params?: Partial<GameBoard>);
    allShipsSunk(): boolean;
    allShipsPlaced(): boolean;
    placeShip(shipName: string, startCoord: NumberPair, orientation: "horizontal" | "vertical"): boolean;
    removeShip(shipName: string): boolean;
    receiveAttack(coords: NumberPair): attackResult | null;
    getBoard(): Cell[][];
    getMaskedBoard(): Cell[][];
    print(): void;
    getShip(name: string): Ship | undefined;
    getShipCells(ship: Ship): number[];
    validPlacement(shipName: string, coords: NumberPair[], orientation: "horizontal" | "vertical"): boolean;
    private coordsValid;
    private getCell;
    private hasShip;
    private wasAttacked;
    private coordToKey;
    private keyToCoord;
}
declare function getAdjacentCoords(startCoord: NumberPair, orientation: "horizontal" | "vertical", length: number): NumberPair[];
export { GameBoard, getAdjacentCoords };
export type { NumberPair, attackResult, Cell };
//# sourceMappingURL=GameBoard.d.ts.map