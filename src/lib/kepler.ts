import { Vector3 } from 'three';
import { MS_PER_DAY } from './constants';

export type OrbitalElements = {
  /** Semi-major axis, in AU. */
  a: number;
  /** Eccentricity (0 = circular, <1 = elliptic). */
  e: number;
  /** Inclination relative to the ecliptic, in radians. */
  iRad: number;
  /** Longitude of the ascending node Ω, in radians. */
  omegaRad: number;
  /** Argument of periapsis ω, in radians. */
  wRad: number;
  /** Mean anomaly at epoch, in radians. */
  m0Rad: number;
  /** Epoch, in Unix milliseconds. */
  epochMs: number;
  /** Orbital period, in days. */
  periodDays: number;
};

const TAU = Math.PI * 2;
const KEPLER_ITERATIONS = 6;

/** Newton iteration for eccentric anomaly given eccentricity `e` and mean anomaly `m`. */
export const solveKeplerEccentricAnomaly = (e: number, m: number): number => {
  let ea = m;
  for (let k = 0; k < KEPLER_ITERATIONS; k++) {
    const f = ea - e * Math.sin(ea) - m;
    const fp = 1 - e * Math.cos(ea);
    ea -= f / fp;
  }
  return ea;
};

/**
 * Perifocal position at eccentric anomaly `ea`, rotated into the ecliptic
 * frame (AU, unscaled). Used by `propagate` and by the physics lab init.
 */
export const setEclipticAuFromEa = (
  el: Pick<OrbitalElements, "a" | "e" | "iRad" | "omegaRad" | "wRad">,
  ea: number,
  out: Vector3,
): void => {
  const e = el.e;
  const xPf = el.a * (Math.cos(ea) - e);
  const yPf = el.a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(ea);

  const cosI = Math.cos(el.iRad);
  const sinI = Math.sin(el.iRad);
  const cosO = Math.cos(el.omegaRad);
  const sinO = Math.sin(el.omegaRad);
  const cosW = Math.cos(el.wRad);
  const sinW = Math.sin(el.wRad);

  const xEc =
    (cosO * cosW - sinO * sinW * cosI) * xPf +
    (-cosO * sinW - sinO * cosW * cosI) * yPf;
  const yEc =
    (sinO * cosW + cosO * sinW * cosI) * xPf +
    (-sinO * sinW + cosO * cosW * cosI) * yPf;
  const zEc = sinW * sinI * xPf + cosW * sinI * yPf;

  out.set(xEc, yEc, zEc);
};

/**
 * Computes the body's position at `timeMs` from its orbital elements and
 * writes it into `out`. The result is in the three.js frame (Y-up, Z
 * flipped) with distances multiplied by `scale` – pass `AU_SCALE` for
 * heliocentric planets and `MOON_AU_SCALE` for moon offsets.
 *
 * No allocations occur in the hot path; all trig is inlined.
 */
export const propagate = (
  el: OrbitalElements,
  timeMs: number,
  out: Vector3,
  scale: number,
): Vector3 => {
  const dtDays = (timeMs - el.epochMs) / MS_PER_DAY;
  const n = TAU / el.periodDays;
  const m = el.m0Rad + n * dtDays;
  const ea = solveKeplerEccentricAnomaly(el.e, m);

  setEclipticAuFromEa(el, ea, out);
  const xEc = out.x;
  const yEc = out.y;
  const zEc = out.z;
  out.set(xEc * scale, zEc * scale, -yEc * scale);
  return out;
};

const SMALL = 1e-12;

/**
 * Converts an instantaneous state (position + velocity) in NASA ecliptic
 * J2000 coordinates into classical Kepler elements, given the central
 * body's gravitational parameter μ (AU³/day²).
 *
 * Intended for the one-shot build-time `generate-orbital-elements`
 * script – not used at runtime.
 */
export const stateToElements = (
  rAu: Vector3,
  vAuPerDay: Vector3,
  mu: number,
  epochMs: number,
): OrbitalElements => {
  const rMag = rAu.length();
  const vMag = vAuPerDay.length();

  const h = new Vector3().crossVectors(rAu, vAuPerDay);
  const hMag = h.length();

  const nx = -h.y;
  const ny = h.x;
  const nMag = Math.hypot(nx, ny);

  const rDotV = rAu.dot(vAuPerDay);
  const coefR = vMag * vMag - mu / rMag;
  const eVec = new Vector3(
    (coefR * rAu.x - rDotV * vAuPerDay.x) / mu,
    (coefR * rAu.y - rDotV * vAuPerDay.y) / mu,
    (coefR * rAu.z - rDotV * vAuPerDay.z) / mu,
  );
  const e = eVec.length();

  const energy = (vMag * vMag) / 2 - mu / rMag;
  if (energy >= 0) {
    throw new Error('Non-bound orbit (energy >= 0); Kepler elements undefined');
  }
  const a = -mu / (2 * energy);

  const iRad = Math.acos(clamp(h.z / hMag, -1, 1));

  let omegaRad = 0;
  if (nMag > SMALL) {
    omegaRad = Math.acos(clamp(nx / nMag, -1, 1));
    if (ny < 0) omegaRad = TAU - omegaRad;
  }

  let wRad = 0;
  if (nMag > SMALL && e > SMALL) {
    const dot = (nx * eVec.x + ny * eVec.y) / (nMag * e);
    wRad = Math.acos(clamp(dot, -1, 1));
    if (eVec.z < 0) wRad = TAU - wRad;
  } else if (e > SMALL) {
    wRad = Math.atan2(eVec.y, eVec.x);
    if (wRad < 0) wRad += TAU;
  }

  let nu = 0;
  if (e > SMALL) {
    const dot = eVec.dot(rAu) / (e * rMag);
    nu = Math.acos(clamp(dot, -1, 1));
    if (rDotV < 0) nu = TAU - nu;
  } else if (nMag > SMALL) {
    const dot = (nx * rAu.x + ny * rAu.y) / (nMag * rMag);
    nu = Math.acos(clamp(dot, -1, 1));
    if (rAu.z < 0) nu = TAU - nu;
  } else {
    nu = Math.atan2(rAu.y, rAu.x);
    if (nu < 0) nu += TAU;
  }

  const ea = 2 * Math.atan2(
    Math.sqrt(1 - e) * Math.sin(nu / 2),
    Math.sqrt(1 + e) * Math.cos(nu / 2),
  );
  let m0Rad = ea - e * Math.sin(ea);
  m0Rad = ((m0Rad % TAU) + TAU) % TAU;

  const periodDays = TAU * Math.sqrt((a * a * a) / mu);

  return { a, e, iRad, omegaRad, wRad, m0Rad, epochMs, periodDays };
};

const clamp = (value: number, lo: number, hi: number): number =>
  value < lo ? lo : value > hi ? hi : value;
