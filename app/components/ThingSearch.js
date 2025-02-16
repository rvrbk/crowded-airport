import Select from 'react-select';

export default function ThingSearch({ selectedThing, things, handleThingChange, setActiveForm }) {
    return (<>
        <Select 
            id="thingSelect"
            value={selectedThing}
            options={things} 
            isSearchable 
            onChange={handleThingChange}
            placeholder="What are you looking for?" 
            className="w-full shadow-xl mb-3 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            getOptionLabel={(option) => option.thing} 
            getOptionValue={(option) => option.id}
        />
        <button name="add" onClick={() => setActiveForm('add-thing')} className="w-full mb-3 shadow-xl px-4 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">I know where something is</button>
    </>);
}