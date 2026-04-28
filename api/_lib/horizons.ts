const HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type HorizonsVectorResult = {
  position: Vector3D;
  velocity: Vector3D;
  distanceAu: number;
  lightTimeDays: number;
};

type FetchHorizonsOptions = {
  commandId: number;
  date: Date;
  center?: string;
};

export class HorizonsError extends Error {
}

export const fetchHorizonsVectors = async (
  options: FetchHorizonsOptions,
): Promise<HorizonsVectorResult> => {
  const { commandId, date, center = '500@0' } = options;
  const start = toIsoDate(date);
  const stop = toIsoDate(addDays(date, 1));

  const params = new URLSearchParams({
    format: 'json',
    COMMAND: quote(String(commandId)),
    OBJ_DATA: quote('NO'),
    MAKE_EPHEM: quote('YES'),
    EPHEM_TYPE: quote('VECTORS'),
    CENTER: quote(center),
    START_TIME: quote(start),
    STOP_TIME: quote(stop),
    STEP_SIZE: quote('1 d'),
    VEC_TABLE: quote('3'),
    OUT_UNITS: quote('AU-D'),
    REF_PLANE: quote('ECLIPTIC'),
    REF_SYSTEM: quote('ICRF'),
    CSV_FORMAT: quote('NO'),
    VEC_LABELS: quote('YES'),
    VEC_CORR: quote('NONE'),
  });

  const url = `${HORIZONS_URL}?${params.toString()}`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: 'application/json' } });
  } catch {
    throw new HorizonsError('Failed to reach NASA Horizons');
  }

  if (!response.ok) {
    throw new HorizonsError(
      `Horizons responded with HTTP ${response.status}`,
    );
  }

  const data = (await response.json()) as { result?: unknown; error?: unknown };
  if (typeof data.error === 'string' && data.error.length > 0) {
    throw new HorizonsError(`Horizons error: ${data.error}`);
  }
  if (typeof data.result !== 'string') {
    throw new HorizonsError('Missing result field in Horizons response');
  }

  return parseVectors(data.result);
};

const quote = (value: string): string => `'${value}'`;

const toIsoDate = (d: Date): string => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, days: number): Date =>
  new Date(d.getTime() + days * 86_400_000);

const parseVectors = (raw: string): HorizonsVectorResult => {
  const soeIdx = raw.indexOf('$$SOE');
  const eoeIdx = raw.indexOf('$$EOE');
  if (soeIdx === -1 || eoeIdx === -1) {
    throw new HorizonsError('Ephemeris markers ($$SOE/$$EOE) not found');
  }
  const block = raw.slice(soeIdx + 5, eoeIdx);

  return {
    position: {
      x: extract(block, 'X'),
      y: extract(block, 'Y'),
      z: extract(block, 'Z'),
    },
    velocity: {
      x: extract(block, 'VX'),
      y: extract(block, 'VY'),
      z: extract(block, 'VZ'),
    },
    distanceAu: extract(block, 'RG'),
    lightTimeDays: extract(block, 'LT'),
  };
};

const extract = (block: string, key: string): number => {
  const re = new RegExp(`(?:^|\\s)${key}\\s*=\\s*([-+.\\dEe]+)`);
  const match = re.exec(block);
  if (!match?.[1]) {
    throw new HorizonsError(`Missing field "${key}" in ephemeris block`);
  }
  const value = Number(match[1]);
  if (!Number.isFinite(value)) {
    throw new HorizonsError(`Non-numeric value for "${key}": ${match[1]}`);
  }
  return value;
};
