import { TestBed } from '@angular/core/testing';
import { LegacyApplicationHostComponent } from './legacy-application-host.component';
import { DEFAULT_LEGACY_ENTRY_URL, LEGACY_ENTRY_URL } from './legacy-entry-url';

function createFixture() {
  const fixture = TestBed.createComponent(LegacyApplicationHostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('LegacyApplicationHostComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LegacyApplicationHostComponent] }).compileComponents();
  });

  it('loads the default legacy entry URL', () => {
    const iframe = createFixture().nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe(DEFAULT_LEGACY_ENTRY_URL);
  });

  it('has a non-empty, accessible title', () => {
    const iframe = createFixture().nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.getAttribute('title')?.length).toBeGreaterThan(0);
  });

  it('renders exactly one iframe and no other chrome', () => {
    const compiled = createFixture().nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('iframe').length).toBe(1);
    expect(compiled.querySelectorAll('nav, header, footer, button, a').length).toBe(0);
  });

  it('is borderless and full-viewport', () => {
    const iframe = createFixture().nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.classList.contains('legacy-app-frame')).toBe(true);
  });
});

describe('LegacyApplicationHostComponent with an invalid injected URL', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegacyApplicationHostComponent],
      providers: [{ provide: LEGACY_ENTRY_URL, useValue: '//evil.example.com/phish' }],
    }).compileComponents();
  });

  it('falls back to the default entry URL rather than framing a foreign origin', () => {
    const iframe = createFixture().nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe(DEFAULT_LEGACY_ENTRY_URL);
  });

  it('emits telemetry naming the rejected value and the fallback used', () => {
    let received: CustomEvent | undefined;
    const listener = (event: Event) => {
      received = event as CustomEvent;
    };
    window.addEventListener('legacy-container-telemetry', listener);

    createFixture();

    window.removeEventListener('legacy-container-telemetry', listener);
    expect(received?.detail).toEqual({
      name: 'legacy-container.invalid-entry-url',
      data: { requested: '//evil.example.com/phish', fallback: DEFAULT_LEGACY_ENTRY_URL },
    });
  });
});

describe('LegacyApplicationHostComponent with a valid injected override', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegacyApplicationHostComponent],
      providers: [{ provide: LEGACY_ENTRY_URL, useValue: '/legacy-page.asp' }],
    }).compileComponents();
  });

  it('uses the overridden root-relative URL', () => {
    const iframe = createFixture().nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe('/legacy-page.asp');
  });

  it('emits no telemetry when the URL is valid', () => {
    let firedCount = 0;
    const listener = () => firedCount++;
    window.addEventListener('legacy-container-telemetry', listener);

    createFixture();

    window.removeEventListener('legacy-container-telemetry', listener);
    expect(firedCount).toBe(0);
  });
});
