import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegacyApplicationHostComponent } from './legacy-application-host.component';

@Component({
  imports: [LegacyApplicationHostComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
