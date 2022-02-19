import {NextPage} from "next";
import React, {FC, MouseEventHandler, useEffect, useState} from "react";
import {CountryGdpData, fetchCountryGdp} from "../data/fetchCountryGdp";
import {passThroughSymbol} from "next/dist/server/web/spec-compliant/fetch-event";
import {func} from "prop-types";


function numFormatter(num: number) {
    if (num > 999 && num < 1000000) {
        return (num / 1000).toFixed(1) + 'Thousand';
    } else if (num > 1000000000000) {
        return (num / 1000000000000).toFixed(2) + ' Trillion';
    } else if (num > 1000000000) {
        return (num / 1000000000).toFixed(2) + ' Billion';
    } else if (num > 1000000) {
        return (num / 1000000).toFixed(2) + ' Million';
    } else {
        return num;
    }
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(list: any[]) {
    var j, x, i;
    for (i = list.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = list[i];
        list[i] = list[j];
        list[j] = x;
    }
    return list;
}

type GuessItem = {
    name: string;
    value: number;
    displayedValue: string;
    imageUrl?: string;
}

const HigherOrLowerButtons: FC<{
    onSelection: (selectedHigher: boolean) => void
}> = ({onSelection}) => {
    return (
        <div style={{ display: "inline", paddingLeft: 10}}>
            <button onClick={() => onSelection(true)}> Higher</button>
            <button onClick={() => onSelection(false)}> Lower</button>
        </div>
    )
}


enum GameMode {
    CountriesGdp,
    CompaniesMarketCap,
}

const PlayGame: React.FC<{
    // gameMode: GameMode
}> = ({}) => {
    const FILLER_WORDS = "has a GDP of"
    const [guessItems, setGuessItems] = useState<GuessItem[]>([])
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const gameMode = GameMode.CountriesGdp;

    useEffect(() => {
        async function fetchAndSetData() {
            // TODO - this should be dynamic based on what mode someone clicks
            let normalizedData: any[] = [];
            console.log(gameMode);
            if (gameMode === GameMode.CountriesGdp) {
                const fetchedData: CountryGdpData[] = await fetchCountryGdp();
                console.log(shuffle(fetchedData));
                normalizedData = fetchedData.map(countryDatum =>
                    ({
                        name: countryDatum.country,
                        value: countryDatum.gdp,
                        displayedValue: numFormatter(countryDatum.gdp)
                    }) as GuessItem);
            } else if (gameMode === GameMode.CompaniesMarketCap) {

            }
            console.log(normalizedData);
            setGuessItems(shuffle(normalizedData));
        }

        console.log("HELLO!")
        fetchAndSetData();

    }, []);

    function onSelection(selectedHigher: boolean) {
        const firstItemVal = guessItems[currIndex].value;
        const secondItemVal = guessItems[currIndex + 1].value;
        if ((firstItemVal === secondItemVal) || (firstItemVal > secondItemVal && !selectedHigher) || (firstItemVal < secondItemVal && selectedHigher)) {
            setCurrIndex(currIndex + 1);
        } else {
            setGameOver(true);
        }
    }

    const firstCardValueColor = () => currIndex > 0 ? "green" : "black";

    return (
        <>
            <div style={{ padding: 20 }}>
                {guessItems.length > 2 &&
                <div>
                    <div className={"firstCard"}>
                        {guessItems[currIndex].name + " " + FILLER_WORDS + " "}
                        <div style={{ display: "inline", color: firstCardValueColor()}}>
                            {guessItems[currIndex].displayedValue}
                        </div>

                    </div>
                    <div className={"secondCard"}>
                        {guessItems[currIndex + 1].name + " " + FILLER_WORDS + " "}
                        {gameOver &&
                            <div style={{ display: "inline", color: "red"}}>
                                {guessItems[currIndex + 1].displayedValue}
                            </div>
                        }
                        {!gameOver && <HigherOrLowerButtons onSelection={onSelection}/>}
                    </div>

                </div>
                }
                <div>
                    {gameOver && (
                        <p>
                            Incorrect! You finished with a score of {currIndex}!
                        </p>
                    )}
                </div>
            <footer style={{marginTop: 20 }}> Score: {currIndex}</footer>
            </div>


        </>
    )
}

export default PlayGame;
