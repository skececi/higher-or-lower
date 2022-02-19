export type CountryGdpData = {
    country: string;
    countryIso3Code: string;
    gdp: number;
}

export async function fetchCountryGdp(): Promise<CountryGdpData[]> {
    const gdpEndpoint = "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?per_page=500&date=2020&format=json";
    const countryGdps: CountryGdpData[] = await fetch(gdpEndpoint)
        .then(res => res.json())
        .then(res => res[1].map((x: any) =>
            ({country: x.country.value, countryIso3Code: x.countryiso3code, gdp: x.value}) as CountryGdpData
        ))
    const FIRST_REAL_COUNTRY_INDEX = 49;
    return countryGdps.slice(FIRST_REAL_COUNTRY_INDEX).filter(country => country.gdp);
}
