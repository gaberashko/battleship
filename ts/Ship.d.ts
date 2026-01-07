declare class Ship {
    readonly name: string;
    readonly length: number;
    private hits;
    private sunk;
    constructor(name: string, length: number);
    hit(): void;
    isSunk(): boolean;
}
export { Ship };
//# sourceMappingURL=Ship.d.ts.map