import { Ship } from "../Ship";
import { GameBoard, NumberPair, attackResult } from "../GameBoard";

describe("GameBoard test suite", () => {
    let gb: GameBoard;

    beforeEach(() => {
        // Initialize a default GameBoard object.
        gb = new GameBoard();
    });

    test("getShip() returns null with invalid ship name", () => {
        expect(gb.getShip("")).toBeUndefined();
        expect(gb.getShip("notAShip")).toBeUndefined();
    });

    test("getShip() returns ship object", () => {
        expect(gb.getShip("destroyer")).toBeInstanceOf(Ship);
    });

    test("getShip() returns correct ship object details", () => {
        const ship = gb.getShip("destroyer")!;
        expect(ship.name).toMatch("destroyer");
        expect(ship.length).toBe(2);
        expect(ship.isSunk()).toBeFalsy();
    });

    test("allShipsSunk() with no ships on board returns true.", () => {
        expect(gb.allShipsSunk()).toBeTruthy();
    });

    test("allShipsSunk() with unsunk ship on board returns false.", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        expect(gb.allShipsSunk()).toBeFalsy();
    });

    test("allShipsSunk() with sunk ship returns true", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.receiveAttack([0, 0]);
        gb.receiveAttack([1, 0]);

        expect(gb.allShipsSunk()).toBeTruthy();
    });

    test("allShipsSunk() with sunk and unsunk ship returns false", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        let ship1 = gb.getShip("destroyer")!;
        gb.receiveAttack([0, 0]);
        gb.receiveAttack([1, 0]);

        gb.placeShip("cruiser", [ship1.length, 0], "horizontal");

        expect(gb.allShipsSunk()).toBeFalsy();
    });

    test("allShipsSunk() with multiple sunk ships returns true", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.placeShip("cruiser", [0, 1], "horizontal");
        gb.receiveAttack([0, 0]);
        gb.receiveAttack([1, 0]);
        // Ship 1 sunk ^
        gb.receiveAttack([0, 1]);
        gb.receiveAttack([1, 1]);
        gb.receiveAttack([2, 1]);
        // Ship 2 sunk ^

        expect(gb.allShipsSunk()).toBeTruthy();
    });

    test("receiveAttack() throws on invalid attack coordinates.", () => {
        expect(() => {
            gb.receiveAttack([-1, -1]);
        }).toThrow();
        expect(() => {
            gb.receiveAttack([-1, 0]);
        }).toThrow();
        expect(() => {
            gb.receiveAttack([gb.size, 0]);
        }).toThrow();
        expect(() => {
            gb.receiveAttack([0, gb.size + 1]);
        }).toThrow();
    });

    test("receiveAttack() does not throw on valid coordinates", () => {
        expect(() => {
            gb.receiveAttack([0, 0]);
        }).not.toThrow();
        expect(() => {
            gb.receiveAttack([5, 1]);
        }).not.toThrow();
        expect(() => {
            gb.receiveAttack([1, 2]);
        }).not.toThrow();
        expect(() => {
            gb.receiveAttack([0, gb.size - 1]);
        }).not.toThrow();
        expect(() => {
            gb.receiveAttack([gb.size - 1, gb.size - 1]);
        }).not.toThrow();
    });

    test("receiveAttack() returns correct attack result info on valid attack.", () => {
        const c1: NumberPair = [0, 0];
        let result: attackResult = gb.receiveAttack(c1)!;

        expect(result).not.toBeNull();

        expect(result.coords).toEqual(c1);
        expect(result.hit).toBeFalsy();
        expect(result.sunk).toBeFalsy();
    });

    test("receiveAttack() returns null on previously attacked coordinate", () => {
        const c1: NumberPair = [0, 0];
        let result = gb.receiveAttack(c1);
        result = gb.receiveAttack(c1);

        expect(result).toBeNull();
    });

    test("receiveAttack() returns correct result on hit ship", () => {
        const c1: NumberPair = [0, 0];

        gb.placeShip("destroyer", c1, "horizontal");
        let result = gb.receiveAttack(c1)!;

        expect(result.coords).toEqual(c1);
        expect(result.hit).toBeTruthy();
        expect(result.sunk).toBeFalsy();
    });

    test("receiveAttack() returns correct result on sunk ship", () => {
        const c1: NumberPair = [0, 0];
        const c2: NumberPair = [1, 0];

        gb.placeShip("destroyer", c1, "horizontal");
        let result = gb.receiveAttack(c1)!;
        result = gb.receiveAttack(c2)!;

        expect(result.coords).toEqual(c2);
        expect(result.hit).toBeTruthy();
        expect(result.sunk).toBeTruthy();
    });

    test("placeShip() returns false on unsuccesful placements and ship args.", () => {
        // Ship doesn't exist.
        expect(gb.placeShip("notAShip", [0, 0], "horizontal")).toBeFalsy();

        // Coords invalid.
        expect(gb.placeShip("destroyer", [-1, -1], "horizontal")).toBeFalsy();
    });

    test("placeShip() returns true on valid placement", () => {
        expect(gb.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
    });

    test("placeShip() not successful on overlapping horizontal ships", () => {
        expect(gb.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        expect(gb.placeShip("cruiser", [1, 0], "horizontal")).toBeFalsy();
    });

    test("placeShip() not successful on overlapping vertical ships", () => {
        expect(gb.placeShip("destroyer", [0, 5], "vertical")).toBeTruthy();
        expect(gb.placeShip("cruiser", [0, 4], "vertical")).toBeFalsy();
    });

    test("placeShip() not successful on overlapping ships of different orientation", () => {
        expect(gb.placeShip("destroyer", [2, 5], "vertical")).toBeTruthy();
        expect(gb.placeShip("cruiser", [1, 6], "horizontal")).toBeFalsy();
    });

    test("placeShip() returns false on ship that was already placed.", () => {
        expect(gb.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        expect(gb.placeShip("destroyer", [5, 0], "horizontal")).toBeFalsy();
    });

    test("placeShip() returns false on already-placed ship of different orientation", () => {
        expect(gb.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        expect(gb.placeShip("destroyer", [5, 0], "vertical")).toBeFalsy();
    });

    test("placeShip() valid placement of multiple ships returns true.", () => {
        expect(gb.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        expect(gb.placeShip("cruiser", [5, 0], "horizontal")).toBeTruthy();
        expect(gb.placeShip("carrier", [0, 1], "horizontal")).toBeTruthy();
        expect(gb.placeShip("submarine", [5, 1], "horizontal")).toBeTruthy();
        expect(gb.placeShip("battleship", [0, 2], "horizontal")).toBeTruthy();
    });

    test("placeShip() can place previously-removed ship.", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.removeShip("destroyer");
        expect(gb.placeShip("destroyer", [0, 0], "horizontal")).toBeTruthy();
        gb.removeShip("destroyer");
        expect(gb.placeShip("destroyer", [1, 0], "horizontal")).toBeTruthy();
    });

    test("placeShip() can place ships in cells of previously-removed ship (horizontal).", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.removeShip("destroyer");

        expect(gb.placeShip("cruiser", [0, 0], "horizontal")).toBeTruthy();
        gb.removeShip("cruiser");
        expect(gb.placeShip("battleship", [1, 0], "horizontal")).toBeTruthy();
        gb.removeShip("battleship");
        expect(gb.placeShip("submarine", [2, 0], "horizontal")).toBeTruthy();
    });

    test("placeShip() can place ships in cells of previously-removed ship (vertical).", () => {
        gb.placeShip("destroyer", [0, 4], "vertical");
        gb.removeShip("destroyer");

        expect(gb.placeShip("cruiser", [0, 4], "vertical")).toBeTruthy();
        gb.removeShip("cruiser");
        expect(gb.placeShip("battleship", [0, 5], "vertical")).toBeTruthy();
        gb.removeShip("battleship");
        expect(gb.placeShip("submarine", [0, 6], "vertical")).toBeTruthy();
    });

    test("removeShip() returns false on invalid ship name.", () => {
        expect(gb.removeShip("notAShip")).toBeFalsy();
    });

    test("removeShip() returns false for ship yet to be placed.", () => {
        expect(gb.removeShip("destroyer")).toBeFalsy();
    });

    test("removeShip() returns true for placed ship.", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        expect(gb.removeShip("destroyer")).toBeTruthy();
    });

    test("removeShip() returns false for already-removed ship.", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.removeShip("destroyer");

        expect(gb.removeShip("destroyer")).toBeFalsy();
    });

    test("removeShip() returns false for already-removed ship when another exists.", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.placeShip("cruiser", [0, 1], "horizontal");
        gb.removeShip("destroyer");

        expect(gb.removeShip("destroyer")).toBeFalsy();
    });

    test("removeShip() successfully removes multiple placed ships.", () => {
        gb.placeShip("destroyer", [0, 0], "horizontal");
        gb.placeShip("cruiser", [0, 1], "horizontal");
        expect(gb.removeShip("destroyer")).toBeTruthy();
        expect(gb.removeShip("cruiser")).toBeTruthy();
        expect(gb.removeShip("destroyer")).toBeFalsy();
        expect(gb.removeShip("cruiser")).toBeFalsy();
    });
});
