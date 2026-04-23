import { MOONS } from '../lib/moons';
import { Moon } from './Moon';

export const Moons = () => (
  <>
    {MOONS.map((m) => (
      <Moon key={m.id} moon={m} />
    ))}
  </>
);
