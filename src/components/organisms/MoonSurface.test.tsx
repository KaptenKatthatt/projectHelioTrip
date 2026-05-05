// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { FactSlideshow, MOON_FACTS } from './MoonSurface';

vi.mock('../../store/useStore', () => ({
  useStore: (selector: (s: { locale: string }) => unknown) =>
    selector({ locale: 'sv' }),
}));

describe('FactSlideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first fact card by default', () => {
    render(<FactSlideshow />);
    expect(screen.getByText(MOON_FACTS[0]!.title.sv)).toBeInTheDocument();
  });

  it('auto-advances to the next card after 4 seconds', () => {
    render(<FactSlideshow />);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText(MOON_FACTS[1]!.title.sv)).toBeInTheDocument();
  });

  it('wraps from last card back to first after 4 seconds', () => {
    render(<FactSlideshow />);
    act(() => { vi.advanceTimersByTime(4000 * MOON_FACTS.length); });
    expect(screen.getByText(MOON_FACTS[0]!.title.sv)).toBeInTheDocument();
  });

  it('jumps to clicked dot card and resets timer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FactSlideshow />);
    const dots = screen.getAllByRole('button', { name: /Fakta/i });
    await user.click(dots[2]!);
    expect(screen.getByText(MOON_FACTS[2]!.title.sv)).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3999); });
    expect(screen.getByText(MOON_FACTS[2]!.title.sv)).toBeInTheDocument();
  });

  it('renders 5 dot buttons', () => {
    render(<FactSlideshow />);
    expect(screen.getAllByRole('button', { name: /Fakta/i })).toHaveLength(5);
  });
});
