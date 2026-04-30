import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
})
export class TextInputComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly type = input<string>('text');
  readonly errorMessage = input<string>('');
  readonly placeholder = input<string>('');

  readonly value = signal<string>('');
  readonly showPassword = signal<boolean>(false);

  readonly effectiveType = computed<string>(() =>
    this.type() === 'password' && this.showPassword() ? 'text' : this.type(),
  );
  readonly hasError = computed<boolean>(() => this.errorMessage().length > 0);

  static #idCounter = 0;
  readonly inputId = `text-input-${++TextInputComponent.#idCounter}`;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  #onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  #onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  protected onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.#onChange(val);
  }

  protected onBlur(): void {
    this.#onTouched();
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
