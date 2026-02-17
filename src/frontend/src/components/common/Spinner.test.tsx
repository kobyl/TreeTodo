import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('render_Default_HasStatusRole', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('render_SmallSize_AppliesSmallDimension', () => {
    render(<Spinner size="small" />);
    const spinner = screen.getByRole('status');
    expect(spinner.style.width).toBe('16px');
  });

  it('render_LargeSize_AppliesLargeDimension', () => {
    render(<Spinner size="large" />);
    const spinner = screen.getByRole('status');
    expect(spinner.style.width).toBe('48px');
  });
});
