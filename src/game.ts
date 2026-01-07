import { Player } from "ts/Player";

// Function to generate the setup page with a player name inserted.
const displayGamePage = (players: Player[]) => {
    if (players.length !== 2) {
        alert(`Incorrect number of players: ${players.length}`);
        console.error("Incorrect number of players:", players.length);
    } else {
        const mainContainer = document.querySelector("main") as HTMLDivElement;
        mainContainer.innerHTML = `<div class="main__game">
                <div class="game__board" data-name="${players[0]?.name}">
                    <div class="board__cell cell__label --top --left"></div>
                    <div class="board__cell cell__label --top">1</div>
                    <div class="board__cell cell__label --top">2</div>
                    <div class="board__cell cell__label --top">3</div>
                    <div class="board__cell cell__label --top">4</div>
                    <div class="board__cell cell__label --top">5</div>
                    <div class="board__cell cell__label --top">6</div>
                    <div class="board__cell cell__label --top">7</div>
                    <div class="board__cell cell__label --top">8</div>
                    <div class="board__cell cell__label --top">9</div>
                    <div class="board__cell cell__label --top --right">10</div>
                    <div class="board__cell cell__label --left">A</div>
                    <div class="board__cell" data-cell="0" tabindex="0"></div>
                    <div class="board__cell" data-cell="1" tabindex="0"></div>
                    <div class="board__cell" data-cell="2" tabindex="0"></div>
                    <div class="board__cell" data-cell="3" tabindex="0"></div>
                    <div class="board__cell" data-cell="4" tabindex="0"></div>
                    <div class="board__cell" data-cell="5" tabindex="0"></div>
                    <div class="board__cell" data-cell="6" tabindex="0"></div>
                    <div class="board__cell" data-cell="7" tabindex="0"></div>
                    <div class="board__cell" data-cell="8" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="9"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">B</div>
                    <div class="board__cell" data-cell="10" tabindex="0"></div>
                    <div class="board__cell" data-cell="11" tabindex="0"></div>
                    <div class="board__cell" data-cell="12" tabindex="0"></div>
                    <div class="board__cell" data-cell="13" tabindex="0"></div>
                    <div class="board__cell" data-cell="14" tabindex="0"></div>
                    <div class="board__cell" data-cell="15" tabindex="0"></div>
                    <div class="board__cell" data-cell="16" tabindex="0"></div>
                    <div class="board__cell" data-cell="17" tabindex="0"></div>
                    <div class="board__cell" data-cell="18" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="19"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">C</div>
                    <div class="board__cell" data-cell="20" tabindex="0"></div>
                    <div class="board__cell" data-cell="21" tabindex="0"></div>
                    <div class="board__cell" data-cell="22" tabindex="0"></div>
                    <div class="board__cell" data-cell="23" tabindex="0"></div>
                    <div class="board__cell" data-cell="24" tabindex="0"></div>
                    <div class="board__cell" data-cell="25" tabindex="0"></div>
                    <div class="board__cell" data-cell="26" tabindex="0"></div>
                    <div class="board__cell" data-cell="27" tabindex="0"></div>
                    <div class="board__cell" data-cell="28" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="29"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">D</div>
                    <div class="board__cell" data-cell="30" tabindex="0"></div>
                    <div class="board__cell" data-cell="31" tabindex="0"></div>
                    <div class="board__cell" data-cell="32" tabindex="0"></div>
                    <div class="board__cell" data-cell="33" tabindex="0"></div>
                    <div class="board__cell" data-cell="34" tabindex="0"></div>
                    <div class="board__cell" data-cell="35" tabindex="0"></div>
                    <div class="board__cell" data-cell="36" tabindex="0"></div>
                    <div class="board__cell" data-cell="37" tabindex="0"></div>
                    <div class="board__cell" data-cell="38" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="39"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">E</div>
                    <div class="board__cell" data-cell="40" tabindex="0"></div>
                    <div class="board__cell" data-cell="41" tabindex="0"></div>
                    <div class="board__cell" data-cell="42" tabindex="0"></div>
                    <div class="board__cell" data-cell="43" tabindex="0"></div>
                    <div class="board__cell" data-cell="44" tabindex="0"></div>
                    <div class="board__cell" data-cell="45" tabindex="0"></div>
                    <div class="board__cell" data-cell="46" tabindex="0"></div>
                    <div class="board__cell" data-cell="47" tabindex="0"></div>
                    <div class="board__cell" data-cell="48" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="49"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">F</div>
                    <div class="board__cell" data-cell="50" tabindex="0"></div>
                    <div class="board__cell" data-cell="51" tabindex="0"></div>
                    <div class="board__cell" data-cell="52" tabindex="0"></div>
                    <div class="board__cell" data-cell="53" tabindex="0"></div>
                    <div class="board__cell" data-cell="54" tabindex="0"></div>
                    <div class="board__cell" data-cell="55" tabindex="0"></div>
                    <div class="board__cell" data-cell="56" tabindex="0"></div>
                    <div class="board__cell" data-cell="57" tabindex="0"></div>
                    <div class="board__cell" data-cell="58" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="59"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">G</div>
                    <div class="board__cell" data-cell="60" tabindex="0"></div>
                    <div class="board__cell" data-cell="61" tabindex="0"></div>
                    <div class="board__cell" data-cell="62" tabindex="0"></div>
                    <div class="board__cell" data-cell="63" tabindex="0"></div>
                    <div class="board__cell" data-cell="64" tabindex="0"></div>
                    <div class="board__cell" data-cell="65" tabindex="0"></div>
                    <div class="board__cell" data-cell="66" tabindex="0"></div>
                    <div class="board__cell" data-cell="67" tabindex="0"></div>
                    <div class="board__cell" data-cell="68" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="69"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">H</div>
                    <div class="board__cell" data-cell="70" tabindex="0"></div>
                    <div class="board__cell" data-cell="71" tabindex="0"></div>
                    <div class="board__cell" data-cell="72" tabindex="0"></div>
                    <div class="board__cell" data-cell="73" tabindex="0"></div>
                    <div class="board__cell" data-cell="74" tabindex="0"></div>
                    <div class="board__cell" data-cell="75" tabindex="0"></div>
                    <div class="board__cell" data-cell="76" tabindex="0"></div>
                    <div class="board__cell" data-cell="77" tabindex="0"></div>
                    <div class="board__cell" data-cell="78" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="79"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">I</div>
                    <div class="board__cell" data-cell="80" tabindex="0"></div>
                    <div class="board__cell" data-cell="81" tabindex="0"></div>
                    <div class="board__cell" data-cell="82" tabindex="0"></div>
                    <div class="board__cell" data-cell="83" tabindex="0"></div>
                    <div class="board__cell" data-cell="84" tabindex="0"></div>
                    <div class="board__cell" data-cell="85" tabindex="0"></div>
                    <div class="board__cell" data-cell="86" tabindex="0"></div>
                    <div class="board__cell" data-cell="87" tabindex="0"></div>
                    <div class="board__cell" data-cell="88" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="89"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --bottom --left">J</div>
                    <div
                        class="board__cell --bottom"
                        data-cell="90"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="91"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="92"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="93"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="94"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="95"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="96"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="97"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="98"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom --right"
                        data-cell="99"
                        tabindex="0"
                    ></div>
                </div>

                <div class="game__status"></div>
                <div class="game__board" data-name="${players[1]?.name}">
                    <div class="board__cell cell__label --top --left"></div>
                    <div class="board__cell cell__label --top">1</div>
                    <div class="board__cell cell__label --top">2</div>
                    <div class="board__cell cell__label --top">3</div>
                    <div class="board__cell cell__label --top">4</div>
                    <div class="board__cell cell__label --top">5</div>
                    <div class="board__cell cell__label --top">6</div>
                    <div class="board__cell cell__label --top">7</div>
                    <div class="board__cell cell__label --top">8</div>
                    <div class="board__cell cell__label --top">9</div>
                    <div class="board__cell cell__label --top --right">10</div>
                    <div class="board__cell cell__label --left">A</div>
                    <div class="board__cell" data-cell="0" tabindex="0"></div>
                    <div class="board__cell" data-cell="1" tabindex="0"></div>
                    <div class="board__cell" data-cell="2" tabindex="0"></div>
                    <div class="board__cell" data-cell="3" tabindex="0"></div>
                    <div class="board__cell" data-cell="4" tabindex="0"></div>
                    <div class="board__cell" data-cell="5" tabindex="0"></div>
                    <div class="board__cell" data-cell="6" tabindex="0"></div>
                    <div class="board__cell" data-cell="7" tabindex="0"></div>
                    <div class="board__cell" data-cell="8" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="9"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">B</div>
                    <div class="board__cell" data-cell="10" tabindex="0"></div>
                    <div class="board__cell" data-cell="11" tabindex="0"></div>
                    <div class="board__cell" data-cell="12" tabindex="0"></div>
                    <div class="board__cell" data-cell="13" tabindex="0"></div>
                    <div class="board__cell" data-cell="14" tabindex="0"></div>
                    <div class="board__cell" data-cell="15" tabindex="0"></div>
                    <div class="board__cell" data-cell="16" tabindex="0"></div>
                    <div class="board__cell" data-cell="17" tabindex="0"></div>
                    <div class="board__cell" data-cell="18" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="19"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">C</div>
                    <div class="board__cell" data-cell="20" tabindex="0"></div>
                    <div class="board__cell" data-cell="21" tabindex="0"></div>
                    <div class="board__cell" data-cell="22" tabindex="0"></div>
                    <div class="board__cell" data-cell="23" tabindex="0"></div>
                    <div class="board__cell" data-cell="24" tabindex="0"></div>
                    <div class="board__cell" data-cell="25" tabindex="0"></div>
                    <div class="board__cell" data-cell="26" tabindex="0"></div>
                    <div class="board__cell" data-cell="27" tabindex="0"></div>
                    <div class="board__cell" data-cell="28" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="29"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">D</div>
                    <div class="board__cell" data-cell="30" tabindex="0"></div>
                    <div class="board__cell" data-cell="31" tabindex="0"></div>
                    <div class="board__cell" data-cell="32" tabindex="0"></div>
                    <div class="board__cell" data-cell="33" tabindex="0"></div>
                    <div class="board__cell" data-cell="34" tabindex="0"></div>
                    <div class="board__cell" data-cell="35" tabindex="0"></div>
                    <div class="board__cell" data-cell="36" tabindex="0"></div>
                    <div class="board__cell" data-cell="37" tabindex="0"></div>
                    <div class="board__cell" data-cell="38" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="39"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">E</div>
                    <div class="board__cell" data-cell="40" tabindex="0"></div>
                    <div class="board__cell" data-cell="41" tabindex="0"></div>
                    <div class="board__cell" data-cell="42" tabindex="0"></div>
                    <div class="board__cell" data-cell="43" tabindex="0"></div>
                    <div class="board__cell" data-cell="44" tabindex="0"></div>
                    <div class="board__cell" data-cell="45" tabindex="0"></div>
                    <div class="board__cell" data-cell="46" tabindex="0"></div>
                    <div class="board__cell" data-cell="47" tabindex="0"></div>
                    <div class="board__cell" data-cell="48" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="49"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">F</div>
                    <div class="board__cell" data-cell="50" tabindex="0"></div>
                    <div class="board__cell" data-cell="51" tabindex="0"></div>
                    <div class="board__cell" data-cell="52" tabindex="0"></div>
                    <div class="board__cell" data-cell="53" tabindex="0"></div>
                    <div class="board__cell" data-cell="54" tabindex="0"></div>
                    <div class="board__cell" data-cell="55" tabindex="0"></div>
                    <div class="board__cell" data-cell="56" tabindex="0"></div>
                    <div class="board__cell" data-cell="57" tabindex="0"></div>
                    <div class="board__cell" data-cell="58" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="59"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">G</div>
                    <div class="board__cell" data-cell="60" tabindex="0"></div>
                    <div class="board__cell" data-cell="61" tabindex="0"></div>
                    <div class="board__cell" data-cell="62" tabindex="0"></div>
                    <div class="board__cell" data-cell="63" tabindex="0"></div>
                    <div class="board__cell" data-cell="64" tabindex="0"></div>
                    <div class="board__cell" data-cell="65" tabindex="0"></div>
                    <div class="board__cell" data-cell="66" tabindex="0"></div>
                    <div class="board__cell" data-cell="67" tabindex="0"></div>
                    <div class="board__cell" data-cell="68" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="69"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">H</div>
                    <div class="board__cell" data-cell="70" tabindex="0"></div>
                    <div class="board__cell" data-cell="71" tabindex="0"></div>
                    <div class="board__cell" data-cell="72" tabindex="0"></div>
                    <div class="board__cell" data-cell="73" tabindex="0"></div>
                    <div class="board__cell" data-cell="74" tabindex="0"></div>
                    <div class="board__cell" data-cell="75" tabindex="0"></div>
                    <div class="board__cell" data-cell="76" tabindex="0"></div>
                    <div class="board__cell" data-cell="77" tabindex="0"></div>
                    <div class="board__cell" data-cell="78" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="79"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --left">I</div>
                    <div class="board__cell" data-cell="80" tabindex="0"></div>
                    <div class="board__cell" data-cell="81" tabindex="0"></div>
                    <div class="board__cell" data-cell="82" tabindex="0"></div>
                    <div class="board__cell" data-cell="83" tabindex="0"></div>
                    <div class="board__cell" data-cell="84" tabindex="0"></div>
                    <div class="board__cell" data-cell="85" tabindex="0"></div>
                    <div class="board__cell" data-cell="86" tabindex="0"></div>
                    <div class="board__cell" data-cell="87" tabindex="0"></div>
                    <div class="board__cell" data-cell="88" tabindex="0"></div>
                    <div
                        class="board__cell --right"
                        data-cell="89"
                        tabindex="0"
                    ></div>
                    <div class="board__cell cell__label --bottom --left">J</div>
                    <div
                        class="board__cell --bottom"
                        data-cell="90"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="91"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="92"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="93"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="94"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="95"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="96"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="97"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom"
                        data-cell="98"
                        tabindex="0"
                    ></div>
                    <div
                        class="board__cell --bottom --right"
                        data-cell="99"
                        tabindex="0"
                    ></div>
                </div>
            </div>`;
    }
};

export { displayGamePage };
