import { Player, GameBoard } from "./Player";
import type { attackResult } from "./Player";
type GameState = {
    curPlayer: Player;
    oppPlayer: Player;
    gameOver: boolean;
    attackResult: attackResult | null;
};
interface Renderer {
    renderBoard({ player, hideShips, callback, editable, isCurPlayer, }: {
        player: Player;
        hideShips: boolean;
        callback?: (...arg: any) => any;
        editable?: boolean;
        isCurPlayer?: boolean;
    }): void;
    renderAttack(state: GameState): void;
    renderPlayerTransition(state: GameState): void;
    displayGameOver(state: GameState): void;
}
declare const SHIPS_HIDDEN: boolean, SHIPS_VISIBLE: boolean;
declare class GameController {
    private player1;
    private player2;
    private renderer?;
    private state;
    constructor(player1: Player, player2: Player, renderer?: Renderer | undefined);
    getState(): Readonly<GameState>;
    attack(board?: GameBoard, coords?: [number, number]): Promise<void>;
    private initializeGameState;
    private start;
    private handleTurn;
    private swapPlayers;
}
export { GameController, SHIPS_HIDDEN, SHIPS_VISIBLE };
export type { GameState, Renderer };
//# sourceMappingURL=GameController.d.ts.map