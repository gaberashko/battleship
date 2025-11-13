class Ship {
    public readonly name: string;
    public readonly length: number;
    private hits: number = 0;
    private sunk: boolean = false;

    public constructor(name: string, length: number) {
        if (!name || typeof name !== "string")
            throw new Error(
                `Invalid name argument: Name arg ${name} not non-empty string`
            );
        if (length <= 0 || typeof length !== "number")
            throw new Error(
                `Invalid length argument: Length arg ${length} not positive number`
            );

        this.name = name;
        this.length = length;
    }

    // Increases the number of hits on the ship
    public hit(): void {
        if (this.isSunk()) {
            throw new Error("hit() called on an already-sunken ship");
        } else {
            ++this.hits;

            this.sunk = this.isSunk();
        }
    }

    // Returns if a ship was sunk based on its length, and number of hits it's received.
    public isSunk(): boolean {
        return this.hits >= this.length;
    }
}

export { Ship };
