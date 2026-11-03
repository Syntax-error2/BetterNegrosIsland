import type { ScopedProject } from './scope';

/** Explicit locality annotations only: a province query reason is not an LGU match. */
export function communityProjects(projects: ScopedProject[], place: { code: string; name: string }) {
  return projects.filter(p => p.locationMatches?.includes(place.code));
}
