import { getAdjacentCoords, NumberPair } from "./GameBoard";
import { Player } from "./Player";
import type { GameState, Renderer } from "./GameController";
declare class GameRenderer implements Renderer {
    private container;
    private playerBoards;
    private gameMode;
    constructor(container: HTMLElement);
    renderPlayerTransition(state: GameState): Promise<void>;
    renderBoard({ player, hideShips, callback, editable, isCurPlayer, }: {
        player: Player;
        hideShips: boolean;
        callback?: (...arg: any) => any;
        editable?: boolean;
        isCurPlayer?: boolean;
    }): void;
    renderAttack(state: GameState): Promise<void>;
    displayGameOver(state: GameState): void;
}
declare function placeShipDOM(boardContainer: HTMLDivElement, shipEl: HTMLDivElement, startCoord: NumberPair, orientation: "horizontal" | "vertical"): void;
declare function removeShipDOM(boardContainer: HTMLDivElement, shipEl: HTMLDivElement, orientation: "horizontal" | "vertical"): void;
declare function previewPlacement(startCoord: NumberPair, curCoord: NumberPair, player: Player, shipName: string, length: number, orientation: "horizontal" | "vertical", boardContainer: HTMLDivElement): HTMLDivElement[];
declare function clearPreview(styledCells: HTMLDivElement[]): void;
declare function offsetCoord(startCoord: NumberPair, offset: number, orientation: "horizontal" | "vertical"): NumberPair;
declare function getRow(cellKey: number): void;
declare function coordToKey([x, y]: [number, number]): number | null;
declare function keyToCoord(key: number): NumberPair;
declare function coordsToKeys(coords: NumberPair[]): (number | null)[];
declare function typeContent(el: HTMLDivElement, str: string, duration: number, i?: number, resolve?: () => void): Promise<void>;
export { GameRenderer, previewPlacement, placeShipDOM, removeShipDOM, clearPreview, typeContent, keyToCoord, coordToKey, getAdjacentCoords, coordsToKeys, getRow, offsetCoord, };
//# sourceMappingURL=GameRenderer.d.ts.map