const DICTIONARY = {
    /* road types */
    "Vyhrazený jízdní pruh pro cyklisty - V14": "Dedicated lane for cyclists",
    "Vjezd cyklistům povolen": "Cyclists allowed (one-way road)",
    "Jízda cyklistů v protisměru (piktogram)": "Cyclists riding in the opposite direction (pictogram)",
    "Stezka pro chodce s povoleným vjezdem cyklistů": "Pedestrian path with cyclists allowed",
    "Piktogramový koridor pro cyklisty - V20": "Pictogram corridor for cyclists - V20",

    "Jízda cyklistů v protisměru - E12": "Cyclists riding in the opposite direction - E12",
    "Zákaz vjezdu všech motorových vozidel - B11": "No entry for all motor vehicles - B11",
    "Stezka pro chodce a cyklisty (nedělená) - C9": "Pedestrian and cycle path (undivided) - C9",
    "Úsek byl zrušen": "The section has been cancelled",
    "Přejezd pro cyklisty": "Crossing for cyclists",

    "Jízda cyklistů v protisměru (jízdní pruh)": "Cyclists riding in the opposite direction (lane)",
    "Stezka pro chodce a cyklisty (dělená) - C10": "Pedestrian and cycle path (divided) - C10",
    "Ochranný jízdní pruh pro cyklisty": "Protective lane for cyclists",
    "Stezka pro cyklisty - C8": "Cycle path - C8",
    "Vjezd cyklistům zakázán": "No entry for cyclists",

    "Vyhrazený pruh pro taxi, cyklo, bus": "Dedicated lane for taxi, bike, bus",
    "Ostatní": "Other"
}


const translate = (text) => DICTIONARY[text.trim()] || text;
