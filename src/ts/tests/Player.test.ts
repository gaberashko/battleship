import { GameBoard } from "../GameBoard";
import { Player } from "../Player";

describe("Player test suite", () => {
    let p1: Player, p2: Player;

    beforeEach(() => {
        p1 = new Player({ name: "p1", isHuman: true, difficulty: "easy" });
        p2 = new Player({ name: "p2", isHuman: false, difficulty: "medium" });
    });

    test("constructor() returns accurate properties.", () => {
        expect(p1.name).toMatch("p1");
        expect(p2.name).toMatch("p2");
        expect(p1.isHuman).toBeTruthy();
        expect(p2.isHuman).toBeFalsy();
        expect(p1.difficulty).toMatch("easy");
        expect(p2.difficulty).toMatch("medium");
    });

    test("placeShip() returns false on invalid ship names.", () => {
        expect(p1.placeShip("notAShip", [0, 0], "horizontal")).toBeFalsy();
        expect(p1.placeShip("", [0, 0], "horizontal")).toBeFalsy();
    });

    test("placeShip() returns false on invalid coordinates.", () => {
        expect(p1.placeShip("destroyer", [-2, 0], "horizontal")).toBeFalsy();
        expect(p1.placeShip("cruiser", [0, 20], "horizontal")).toBeFalsy();
    });

    test("placeShip() returns false when placing same ship twice.", () => {
        expect(p1.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        expect(p1.placeShip("destroyer", [5, 0], "horizontal")).toBeFalsy();
    });

    test("placeShip() returns true on valid placement.", () => {
        expect(p1.placeShip("destroyer", [2, 0], "horizontal")).toBeTruthy();
    });

    test("placeShip() returns true for valid placment of two ships.", () => {
        expect(p1.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        expect(p1.placeShip("cruiser", [5, 0], "horizontal")).toBeTruthy();
    });

    test("placeShip() returns true on ship that was removed.", () => {
        expect(p1.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        p1.board.removeShip("destroyer");

        expect(p1.placeShip("destroyer", [5, 0], "horizontal")).toBeTruthy();
    });

    test("AI attack easy mode output", () => {
        let easy: Player = new Player({
            name: "p",
            isHuman: false,
            difficulty: "easy",
        });
        let ob: GameBoard = new GameBoard();
        ob.placeShip("destroyer", [2, 0], "horizontal");

        for (let i = 0; i < 25; ++i) {
            easy.attack(ob);
        }
        console.log("Easy mode:");
        ob.print();
    });

    test("AI attack medium mode output", () => {
        let med: Player = new Player({
            name: "p",
            isHuman: false,
            difficulty: "medium",
        });
        let ob: GameBoard = new GameBoard();
        ob.placeShip("destroyer", [2, 0], "horizontal");

        for (let i = 0; i < 25; ++i) {
            med.attack(ob);
        }
        console.log("Medium mode:");
        ob.print();
    });

    test("AI attack hard mode output", () => {
        let med: Player = new Player({
            name: "p",
            isHuman: false,
            difficulty: "hard",
        });
        let ob: GameBoard = new GameBoard();
        ob.placeShip("destroyer", [2, 0], "horizontal");

        for (let i = 0; i < 25; ++i) {
            med.attack(ob);
        }
        console.log("Hard mode:");
        ob.print();
    });
});
