import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  styleUrl: './button.component.scss',
  template: `
    <button
      [type]="type()"
      [class]="'btn btn--' + variant() + (isDisabled() ? ' btn--disabled' : '') + (loading() ? ' btn--loading' : '')"
      [disabled]="isDisabled() || null"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <app-spinner size="sm" label="Loading…" aria-hidden="true" />
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly isDisabled = computed(() => this.loading() || this.disabled());
}
