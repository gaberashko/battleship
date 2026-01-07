import { GameBoard } from "./GameBoard";
import type { NumberPair, attackResult } from "./GameBoard";
declare class Player {
    board: GameBoard;
    private memory?;
    readonly name: string;
    readonly isHuman: boolean;
    readonly difficulty?: "easy" | "medium" | "hard";
    constructor(params?: Partial<Player>);
    placeShip(shipName: string, startCoord: NumberPair, orientation: "horizontal" | "vertical"): boolean;
    attack(board: GameBoard, coords?: NumberPair): attackResult;
    getBoard(masked: boolean): import("./GameBoard").Cell[][];
    private getAttack;
    private updateMemory;
    placeAllShips(): Promise<void>;
    private randInt;
    private coordToKey;
    private keyToCoord;
}
export { Player, GameBoard };
export type { attackResult };
//# sourceMappingURL=Player.d.ts.map