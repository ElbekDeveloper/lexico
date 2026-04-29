import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Login</h1>
    </main>
  `,
})
export class LoginComponent implements OnInit {
  readonly #title = inject(Title);

  ngOnInit(): void {
    this.#title.setTitle('Login – Lexico');
  }
}
