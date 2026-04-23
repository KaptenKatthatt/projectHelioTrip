import type { ConstellationId } from './constellations';

export type ConstellationStarNode = {
  readonly id: string;
  readonly rightAscensionHours: number;
  readonly declinationDeg: number;
};

export type ConstellationSegment = readonly [from: string, to: string];

export type ConstellationShape = {
  readonly stars: readonly ConstellationStarNode[];
  readonly segments: readonly ConstellationSegment[];
};

export const CONSTELLATION_SHAPES: Record<ConstellationId, ConstellationShape> = {
  orion: {
    stars: [
      { id: 'betelgeuse', rightAscensionHours: 5.92, declinationDeg: 7.41 },
      { id: 'bellatrix', rightAscensionHours: 5.42, declinationDeg: 6.35 },
      { id: 'mintaka', rightAscensionHours: 5.53, declinationDeg: -0.3 },
      { id: 'alnilam', rightAscensionHours: 5.6, declinationDeg: -1.2 },
      { id: 'alnitak', rightAscensionHours: 5.68, declinationDeg: -1.94 },
      { id: 'saiph', rightAscensionHours: 5.8, declinationDeg: -9.67 },
      { id: 'rigel', rightAscensionHours: 5.24, declinationDeg: -8.2 },
    ],
    segments: [
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'mintaka'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['saiph', 'rigel'],
      ['rigel', 'mintaka'],
    ],
  },
  ursaMajor: {
    stars: [
      { id: 'dubhe', rightAscensionHours: 11.06, declinationDeg: 61.75 },
      { id: 'merak', rightAscensionHours: 11.03, declinationDeg: 56.38 },
      { id: 'phecda', rightAscensionHours: 11.9, declinationDeg: 53.7 },
      { id: 'megrez', rightAscensionHours: 12.25, declinationDeg: 57.03 },
      { id: 'alioth', rightAscensionHours: 12.9, declinationDeg: 55.96 },
      { id: 'mizar', rightAscensionHours: 13.4, declinationDeg: 54.93 },
      { id: 'alkaid', rightAscensionHours: 13.79, declinationDeg: 49.31 },
    ],
    segments: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  ursaMinor: {
    stars: [
      { id: 'polarisEdge', rightAscensionHours: 2.53, declinationDeg: 89.26 },
      { id: 'kochab', rightAscensionHours: 14.85, declinationDeg: 74.15 },
      { id: 'pherkad', rightAscensionHours: 15.35, declinationDeg: 71.83 },
      { id: 'yildun', rightAscensionHours: 17.53, declinationDeg: 86.58 },
      { id: 'epsilon', rightAscensionHours: 16.77, declinationDeg: 82.03 },
    ],
    segments: [
      ['polarisEdge', 'yildun'],
      ['yildun', 'epsilon'],
      ['epsilon', 'kochab'],
      ['kochab', 'pherkad'],
    ],
  },
  cassiopeia: {
    stars: [
      { id: 'schedar', rightAscensionHours: 0.68, declinationDeg: 56.54 },
      { id: 'caph', rightAscensionHours: 0.15, declinationDeg: 59.15 },
      { id: 'gamma', rightAscensionHours: 0.95, declinationDeg: 60.72 },
      { id: 'ruchbah', rightAscensionHours: 1.43, declinationDeg: 60.24 },
      { id: 'segin', rightAscensionHours: 2.3, declinationDeg: 63.67 },
    ],
    segments: [
      ['caph', 'schedar'],
      ['schedar', 'gamma'],
      ['gamma', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  cygnus: {
    stars: [
      { id: 'deneb', rightAscensionHours: 20.69, declinationDeg: 45.28 },
      { id: 'sadr', rightAscensionHours: 20.37, declinationDeg: 40.26 },
      { id: 'albireo', rightAscensionHours: 19.51, declinationDeg: 27.96 },
      { id: 'epsilon', rightAscensionHours: 20.77, declinationDeg: 33.97 },
      { id: 'delta', rightAscensionHours: 19.75, declinationDeg: 45.13 },
    ],
    segments: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['sadr', 'epsilon'],
      ['sadr', 'delta'],
    ],
  },
  scorpius: {
    stars: [
      { id: 'antares', rightAscensionHours: 16.49, declinationDeg: -26.43 },
      { id: 'acruxHead', rightAscensionHours: 16.09, declinationDeg: -19.8 },
      { id: 'dschubba', rightAscensionHours: 16.01, declinationDeg: -22.62 },
      { id: 'sargas', rightAscensionHours: 17.62, declinationDeg: -42.99 },
      { id: 'shaula', rightAscensionHours: 17.56, declinationDeg: -37.1 },
    ],
    segments: [
      ['acruxHead', 'dschubba'],
      ['dschubba', 'antares'],
      ['antares', 'sargas'],
      ['sargas', 'shaula'],
    ],
  },
  leo: {
    stars: [
      { id: 'regulus', rightAscensionHours: 10.14, declinationDeg: 11.97 },
      { id: 'algieba', rightAscensionHours: 10.33, declinationDeg: 19.84 },
      { id: 'zosma', rightAscensionHours: 11.23, declinationDeg: 20.52 },
      { id: 'denebola', rightAscensionHours: 11.82, declinationDeg: 14.57 },
      { id: 'chort', rightAscensionHours: 11.24, declinationDeg: 15.43 },
    ],
    segments: [
      ['regulus', 'algieba'],
      ['algieba', 'zosma'],
      ['zosma', 'denebola'],
      ['denebola', 'chort'],
      ['chort', 'regulus'],
    ],
  },
  taurus: {
    stars: [
      { id: 'aldebaran', rightAscensionHours: 4.6, declinationDeg: 16.51 },
      { id: 'elnath', rightAscensionHours: 5.43, declinationDeg: 28.61 },
      { id: 'ain', rightAscensionHours: 4.48, declinationDeg: 19.18 },
      { id: 'zeta', rightAscensionHours: 5.63, declinationDeg: 21.14 },
    ],
    segments: [
      ['aldebaran', 'ain'],
      ['ain', 'elnath'],
      ['aldebaran', 'zeta'],
    ],
  },
  gemini: {
    stars: [
      { id: 'castor', rightAscensionHours: 7.58, declinationDeg: 31.89 },
      { id: 'pollux', rightAscensionHours: 7.75, declinationDeg: 28.02 },
      { id: 'alhena', rightAscensionHours: 6.63, declinationDeg: 16.4 },
      { id: 'mebsuta', rightAscensionHours: 6.73, declinationDeg: 25.13 },
    ],
    segments: [
      ['castor', 'pollux'],
      ['castor', 'mebsuta'],
      ['pollux', 'alhena'],
    ],
  },
  sagittarius: {
    stars: [
      { id: 'kausAustralis', rightAscensionHours: 18.4, declinationDeg: -34.38 },
      { id: 'kausMedia', rightAscensionHours: 18.35, declinationDeg: -29.83 },
      { id: 'arkaab', rightAscensionHours: 19.38, declinationDeg: -44.8 },
      { id: 'nunki', rightAscensionHours: 18.92, declinationDeg: -26.3 },
      { id: 'ascella', rightAscensionHours: 19.04, declinationDeg: -29.88 },
    ],
    segments: [
      ['kausAustralis', 'kausMedia'],
      ['kausMedia', 'nunki'],
      ['nunki', 'ascella'],
      ['ascella', 'kausAustralis'],
      ['ascella', 'arkaab'],
    ],
  },
  crux: {
    stars: [
      { id: 'acrux', rightAscensionHours: 12.45, declinationDeg: -63.1 },
      { id: 'mimosa', rightAscensionHours: 12.8, declinationDeg: -59.69 },
      { id: 'gacrux', rightAscensionHours: 12.52, declinationDeg: -57.11 },
      { id: 'delta', rightAscensionHours: 12.25, declinationDeg: -58.75 },
    ],
    segments: [
      ['gacrux', 'acrux'],
      ['mimosa', 'delta'],
    ],
  },
  canisMajor: {
    stars: [
      { id: 'sirius', rightAscensionHours: 6.75, declinationDeg: -16.72 },
      { id: 'adhaara', rightAscensionHours: 6.98, declinationDeg: -28.97 },
      { id: 'wezen', rightAscensionHours: 7.13, declinationDeg: -26.39 },
      { id: 'mirzam', rightAscensionHours: 6.38, declinationDeg: -17.96 },
    ],
    segments: [
      ['mirzam', 'sirius'],
      ['sirius', 'wezen'],
      ['wezen', 'adhaara'],
    ],
  },
  pegasus: {
    stars: [
      { id: 'markab', rightAscensionHours: 23.08, declinationDeg: 15.21 },
      { id: 'scheat', rightAscensionHours: 23.07, declinationDeg: 28.08 },
      { id: 'algenib', rightAscensionHours: 0.22, declinationDeg: 15.18 },
      { id: 'alpheratz', rightAscensionHours: 0.14, declinationDeg: 29.09 },
    ],
    segments: [
      ['markab', 'scheat'],
      ['scheat', 'alpheratz'],
      ['alpheratz', 'algenib'],
      ['algenib', 'markab'],
    ],
  },
  andromeda: {
    stars: [
      { id: 'alpheratz', rightAscensionHours: 0.14, declinationDeg: 29.09 },
      { id: 'mirach', rightAscensionHours: 1.16, declinationDeg: 35.62 },
      { id: 'almach', rightAscensionHours: 2.07, declinationDeg: 42.33 },
      { id: 'mu', rightAscensionHours: 0.95, declinationDeg: 38.5 },
    ],
    segments: [
      ['alpheratz', 'mirach'],
      ['mirach', 'almach'],
      ['mirach', 'mu'],
    ],
  },
  aquarius: {
    stars: [
      { id: 'sadalmelik', rightAscensionHours: 22.1, declinationDeg: -0.32 },
      { id: 'sadalsuud', rightAscensionHours: 21.52, declinationDeg: -5.57 },
      { id: 'skat', rightAscensionHours: 22.92, declinationDeg: -15.82 },
      { id: 'albali', rightAscensionHours: 20.79, declinationDeg: -9.5 },
    ],
    segments: [
      ['sadalmelik', 'sadalsuud'],
      ['sadalsuud', 'albali'],
      ['sadalsuud', 'skat'],
    ],
  },
};

