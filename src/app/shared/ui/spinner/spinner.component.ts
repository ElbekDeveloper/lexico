import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './spinner.component.scss',
  template: `
    <span role="status" [attr.aria-label]="label()">
      <span
        class="spinner__ring"
        [class.spinner__ring--sm]="size() === 'sm'"
        [class.spinner__ring--md]="size() === 'md'"
        aria-hidden="true"
      ></span>
    </span>
  `,
})
export class SpinnerComponent {
  readonly label = input<string>('Loading…');
  readonly size = input<'sm' | 'md'>('md');
}
