export const HORIZONS_COMMAND_IDS = {
    sun: 10,
    mercury: 199,
    venus: 299,
    earth: 399,
    mars: 499,
    jupiter: 599,
    saturn: 699,
    uranus: 799,
    neptune: 899,
    pluto: 999,
};
export const PLANET_IDS = Object.keys(HORIZONS_COMMAND_IDS);
export const isPlanetId = (value) => Object.prototype.hasOwnProperty.call(HORIZONS_COMMAND_IDS, value);
export const MOON_META = {
    moon: { parent: 'earth', commandId: 301 },
    io: { parent: 'jupiter', commandId: 501 },
    europa: { parent: 'jupiter', commandId: 502 },
    ganymede: { parent: 'jupiter', commandId: 503 },
    callisto: { parent: 'jupiter', commandId: 504 },
    titan: { parent: 'saturn', commandId: 606 },
    triton: { parent: 'neptune', commandId: 801 },
};
export const MOON_IDS = Object.keys(MOON_META);
export const isMoonId = (value) => Object.prototype.hasOwnProperty.call(MOON_META, value);
//# sourceMappingURL=planets.js.map