import { Player, GameBoard } from "./Player";
import { GameRenderer } from "./GameRenderer";
import type { attackResult } from "./Player";

type GameState = {
    curPlayer: Player;
    oppPlayer: Player;
    gameOver: boolean;
    attackResult: attackResult | null;
};

interface Renderer {
    renderBoard(
        player: Player,
        hideShips?: boolean,
        callbacks?: (...arg: any) => any
    ): void;
    renderAttack(state: GameState): void;
    displayGameOver(): void;
}

const [SHIPS_HIDDEN, SHIPS_VISIBLE] = [true, false];
const AI_ATTACK_DELAY: number = 1000;

class GameController {
    private state: GameState;
    // Takes a callback function that will be called when the game state changes.
    public constructor(
        private player1: Player,
        private player2: Player,
        private renderer?: Renderer
    ) {
        this.state = this.initializeGameState();
        this.renderer?.renderBoard(player1, SHIPS_HIDDEN, (coords) =>
            this.attack(player2.board, coords)
        );
        this.renderer?.renderBoard(player2, SHIPS_VISIBLE, (coords) =>
            this.attack(player1.board, coords)
        );
    }

    // Getter function for the current state of the game.
    public getState(): Readonly<GameState> {
        return this.state;
    }

    // Attack the coordinates passed, or if AI, generate coordinates.
    public attack(board?: GameBoard, coords?: [number, number]): void {
        let result = this.state.curPlayer.attack(
            board ? board : this.state.oppPlayer.board,
            coords
        );
        if (result) {
            this.state.attackResult = result;
            this.renderer?.renderAttack(this.state);
            this.renderer?.renderBoard(this.state.oppPlayer, SHIPS_VISIBLE);
        }
        /*
        if (!this.state.curPlayer.isHuman) {
            await delay(AI_ATTACK_DELAY);
            return this.state.curPlayer.attack(this.state.oppPlayer.board);
        } else {
            return this.state.curPlayer.attack(
                this.state.oppPlayer.board,
                coords
            );
        }*/
    }

    // INTERNAL FUNCTIONS

    // Create the initial game state.
    private initializeGameState(): GameState {
        return {
            curPlayer: this.player1,
            oppPlayer: this.player2,
            gameOver: false,
            attackResult: null,
        };
    }

    // Initialize the game loop.
    private start(): void {}

    // Switches the current player, and rerenders the board.
    private async nextTurn(): Promise<void> {
        // Swap the current player.
        [this.state.curPlayer, this.state.oppPlayer] = [
            this.state.oppPlayer,
            this.state.curPlayer,
        ];

        // If the current player is an AI, generate an attack.
        if (!this.state.curPlayer.isHuman) {
            await this.attack();
            await this.nextTurn();
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export { GameController, SHIPS_HIDDEN, SHIPS_VISIBLE };
export type { GameState, Renderer };
