import { attackResult } from "./GameBoard";
import type { GameState, Renderer } from "./GameController";

class GameRenderer implements Renderer {
    // Takes in a DOM element to display the game on.
    public constructor(private container: HTMLElement) {
        // Insert the HTML to comprise the Battleship game
        // container.innerHTML =
    }

    // Handles the rendering of the board.
    public renderBoard(state: GameState): void {}

    public showAttackResults(result: attackResult): void {}

    public displayGameOver(): void {}
}

export { GameRenderer };
