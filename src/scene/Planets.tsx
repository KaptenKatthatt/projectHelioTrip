import { PLANETS } from '../lib/planets';
import { Planet } from './Planet';

export const Planets = () => (
  <>
    {PLANETS.map((p) => (
      <Planet key={p.id} id={p.id} radius={p.radius} color={p.color} />
    ))}
  </>
);
