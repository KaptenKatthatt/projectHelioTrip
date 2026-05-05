// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { FactSlideshow } from './MoonSurface/FactSlideshow';

const MOCK_FACTS = [
  { title: 'Fact 1 Title', body: 'Fact 1 Body' },
  { title: 'Fact 2 Title', body: 'Fact 2 Body' },
  { title: 'Fact 3 Title', body: 'Fact 3 Body' },
  { title: 'Fact 4 Title', body: 'Fact 4 Body' },
  { title: 'Fact 5 Title', body: 'Fact 5 Body' },
];

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: {
      moonSurface: {
        factLabel: 'Mock Label',
        factAriaLabel: (n: number) => `Fakta ${n}`,
        facts: MOCK_FACTS,
      },
    },
  }),
}));

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
    expect(screen.getByText(MOCK_FACTS[0]!.title)).toBeInTheDocument();
  });

  it('auto-advances to the next card after 4 seconds', () => {
    render(<FactSlideshow />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText(MOCK_FACTS[1]!.title)).toBeInTheDocument();
  });

  it('wraps from last card back to first after 4 seconds', () => {
    render(<FactSlideshow />);
    act(() => {
      vi.advanceTimersByTime(4000 * MOCK_FACTS.length);
    });
    expect(screen.getByText(MOCK_FACTS[0]!.title)).toBeInTheDocument();
  });

  it('jumps to clicked dot card and resets timer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FactSlideshow />);
    const dots = screen.getAllByRole('button', { name: /Fakta/i });
    await user.click(dots[2]!);
    expect(screen.getByText(MOCK_FACTS[2]!.title)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(screen.getByText(MOCK_FACTS[2]!.title)).toBeInTheDocument();
  });

  it('renders 5 dot buttons', () => {
    render(<FactSlideshow />);
    expect(screen.getAllByRole('button', { name: /Fakta/i })).toHaveLength(5);
  });
});
