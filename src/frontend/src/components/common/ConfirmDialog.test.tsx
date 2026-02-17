import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('render_WithMessage_DisplaysMessage', () => {
    render(<ConfirmDialog message="Delete this?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Delete this?')).toBeInTheDocument();
  });

  it('confirm_Click_CallsOnConfirm', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('cancel_Click_CallsOnCancel', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('render_Default_HasDialogRole', () => {
    render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
