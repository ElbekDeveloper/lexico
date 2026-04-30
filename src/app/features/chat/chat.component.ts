import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Chat</h1>
    </main>
  `,
})
export class ChatComponent implements OnInit {
  readonly #title = inject(Title);

  ngOnInit(): void {
    this.#title.setTitle('Chat – Lexico');
  }
}
