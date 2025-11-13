import { Ship } from "../Ship";

test("Ship constructor executes", () => {
    expect(() => {
        let s: Ship = new Ship("a", 2);
    }).not.toThrow();
});

test("Ship constructor throws with empty string name", () => {
    expect(() => {
        let s: Ship = new Ship("", 2);
    }).toThrow();
});

test("Ship constructor throws with length 0", () => {
    expect(() => {
        let s: Ship = new Ship("a", 0);
    }).toThrow();
});

test("Ship constructor throws with negative length", () => {
    expect(() => {
        let s1: Ship = new Ship("a", -1);
        let s2: Ship = new Ship("a", -5);
    }).toThrow();
});

test("Ship constructor returns proper name & sunk status", () => {
    let s1: Ship = new Ship("a", 2);
    expect(s1.name).toMatch("a");
    expect(s1.length).toBe(2);
    expect(s1.isSunk()).toBeFalsy();

    let s2: Ship = new Ship("ship", 5);
    expect(s2.name).toMatch("ship");
    expect(s2.length).toBe(5);
    expect(s2.isSunk()).toBeFalsy();
});

test("hit() triggers sunk status only when # hits is length", () => {
    let s1: Ship = new Ship("a", 1);
    expect(s1.isSunk()).toBeFalsy();
    s1.hit();
    expect(s1.isSunk()).toBeTruthy();

    let s2: Ship = new Ship("a", 2);
    s2.hit();
    expect(s2.isSunk()).toBeFalsy();
    s2.hit();
    expect(s2.isSunk()).toBeTruthy();
});

test("hit() throws when called on an already-sunken ship", () => {
    let s1: Ship = new Ship("a", 1);
    expect(s1.isSunk()).toBeFalsy();
    s1.hit();
    expect(s1.isSunk()).toBeTruthy();

    expect(() => {
        s1.hit();
    }).toThrow();
});
