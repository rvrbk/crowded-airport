import Select from "react-select";

export default function AirportSearch({ airports, selectedAirport, handleAirportChange, handleWhereAmIClick, activeForm }) {
    const airportFilter = ({ data }, query) => {
        if (!query) return true;

        return (
            data.name.toLowerCase().includes(query.toLowerCase()) ||
            data.iata.toLowerCase().includes(query.toLowerCase()) ||
            data.icao.toLowerCase().includes(query.toLowerCase()) ||
            data.country.toLowerCase().includes(query.toLowerCase()) ||
            data.city.toLowerCase().includes(query.toLowerCase())
        );
    };

    return (<>
            <Select
                id="airportSelect"
                value={selectedAirport}
                options={airports}
                filterOption={airportFilter}
                isSearchable
                onChange={handleAirportChange}
                placeholder="Airport..."
                className="w-full shadow-xl mb-3 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                getOptionLabel={(option) => `${option.name} (${option.iata})`}
                getOptionValue={(option) => option.iata}
            />
            <button
                onClick={handleWhereAmIClick}
                className={`${activeForm !== 'airport-search' ? 'hidden' : ''} w-full mb-3 shadow-xl px-4 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >Where am I?</button>
        </>);
}