import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('render_WithMessage_DisplaysMessage', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('render_WithMessage_HasAlertRole', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('dismiss_WithCallback_CallsOnDismiss', async () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Error" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByLabelText('Dismiss error'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('render_NoDismiss_NoDismissButton', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByLabelText('Dismiss error')).not.toBeInTheDocument();
  });
});
