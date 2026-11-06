import { Component, input } from '@angular/core';
@Component({
  selector: 'app-portal-shell',
  templateUrl: './portal-shell.html',
  styleUrl: './portal-shell.scss',
})
export class PortalShell {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly items = input.required<Array<{ number: string; label: string; note: string }>>();
}
