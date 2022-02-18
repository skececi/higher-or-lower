import {NextPage} from "next";
import {MouseEventHandler, useEffect, useState} from "react";
import {CountryGdpData, fetchCountryGdp} from "../data/fetchCountryGdp";
import {passThroughSymbol} from "next/dist/server/web/spec-compliant/fetch-event";

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


// TODO - generecize types
type GuessItem = {
    name: string;
    value: number;
    displayedValue: string;
    imageUrl?: string;
}


const Cards: React.FC<{
    firstItem: GuessItem;
    secondItem: GuessItem;
    fillerWords: string;
}> = ({firstItem, secondItem, fillerWords}) => {
    return (
        <div>
            <div className={"leftCard"}>
                {firstItem.name + " " + fillerWords + " " + firstItem.displayedValue}
            </div>
            <div className={"rightCard"}>
                {secondItem.name + " " + fillerWords + " "}
                <HigherOrLowerButtons/>
            </div>

        </div>
    )
}


const HigherOrLowerButtons = (onSelection: (selectedHigher: boolean) => void) => {
    return (
        <>
            <button onClick={() => onSelection(true)}> Higher</button>
            <button onClick={() => onSelection(false)}> Lower</button>
        </>
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
    const [score, setScore] = useState<number>(0);
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

    return (
        <>
            <div>
                {guessItems.length > 2 &&
                    <Cards
                        firstItem={guessItems[currIndex]}
                        secondItem={guessItems[currIndex + 1]}
                        fillerWords={FILLER_WORDS}
                    />
                }


            </div>
        </>
    )
}

export default PlayGame;
