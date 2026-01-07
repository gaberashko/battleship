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
    renderBoard({
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
    }): void;
    renderAttack(state: GameState): void;
    renderPlayerTransition(state: GameState): void;
    displayGameOver(state: GameState): void;
}

const [SHIPS_HIDDEN, SHIPS_VISIBLE] = [true, false];
const ATTACK_TRANSITION_TIME: number = 2.5; // In seconds

class GameController {
    private state: GameState;
    // Takes a callback function that will be called when the game state changes.
    public constructor(
        private player1: Player,
        private player2: Player,
        private renderer?: Renderer
    ) {
        this.state = this.initializeGameState();
        this.start();
    }

    // Getter function for the current state of the game.
    public getState(): Readonly<GameState> {
        return this.state;
    }

    public async attack(
        board?: GameBoard,
        coords?: [number, number]
    ): Promise<void> {
        // console.log("Attack function called");
        let result = this.state.curPlayer.attack(
            board ? board : this.state.oppPlayer.board,
            coords
        );
        if (result) {
            this.state.attackResult = result;
            await this.renderer?.renderAttack(this.state);
        }
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

    // Initialize the game-loop.
    private async start() {
        let gameOver: boolean = false;
        let turn: number = 1;
        while (!gameOver) {
            // console.log("Game not over, turn ", turn);
            await this.handleTurn();
            gameOver =
                this.state.curPlayer.board.allShipsSunk() ||
                this.state.oppPlayer.board.allShipsSunk();
            ++turn;
            // If we aren't done, swap the players.
            if (!gameOver) {
                await this.swapPlayers();
            }
        }
        this.renderer?.displayGameOver(this.state);
    }

    // Let the current player attack, and swap afterwards.
    private handleTurn(): Promise<void> {
        return new Promise(async (res) => {
            const curPlayer: Player = this.state.curPlayer;
            const oppPlayer: Player = this.state.oppPlayer;
            const isCurPlayerAI: boolean = !curPlayer.isHuman;

            // Render the players' boards.
            this.renderer?.renderBoard({
                player: curPlayer,
                hideShips: isCurPlayerAI ? SHIPS_HIDDEN : SHIPS_VISIBLE,
                isCurPlayer: true,
            });
            // console.log("Rendered board for", curPlayer);
            this.renderer?.renderBoard({
                player: oppPlayer,
                hideShips: isCurPlayerAI ? SHIPS_VISIBLE : SHIPS_HIDDEN,
                callback: curPlayer.isHuman
                    ? async (coords) => {
                          await this.attack(oppPlayer.board, coords);
                          await delay(ATTACK_TRANSITION_TIME * 1000);
                          res();
                      }
                    : () => {},
                isCurPlayer: false,
                // ^ We only allow callback given that the person attacking is not an AI.
            });
            // console.log("Rendered board for", oppPlayer);

            // If the player is an AI, generate an attack after a time delay.
            if (!curPlayer.isHuman) {
                await delay(ATTACK_TRANSITION_TIME * 1000);
                await this.attack();
                res();
            }
        });
    }

    // Switches the current player.
    private async swapPlayers(): Promise<void> {
        [this.state.curPlayer, this.state.oppPlayer] = [
            this.state.oppPlayer,
            this.state.curPlayer,
        ];

        await this.renderer?.renderPlayerTransition(this.state);
    }
}

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export { GameController, SHIPS_HIDDEN, SHIPS_VISIBLE };
export type { GameState, Renderer };
