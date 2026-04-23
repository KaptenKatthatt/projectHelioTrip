import { SATELLITES } from '../lib/satellites';
import { Satellite } from './Satellite';

export const Satellites = () => (
  <>
    {SATELLITES.map((s) => (
      <Satellite key={s.id} satellite={s} />
    ))}
  </>
);
