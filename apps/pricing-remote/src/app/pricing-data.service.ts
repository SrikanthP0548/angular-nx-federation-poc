import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RUNTIME_CONFIG } from '@company/shared-core';
import { PricingResponse } from './pricing-models';

/**
 * Domain data access (doc section 7.3): all browser-to-backend traffic goes
 * through the BFF JSON contract. HttpClient and RuntimeConfig resolve from
 * the shell's environment through the feature injector chain — proof that
 * the Angular runtime and platform services are shared singletons.
 */
@Injectable()
export class PricingDataService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RUNTIME_CONFIG);

  getPricing(customerId: string): Observable<PricingResponse> {
    return this.http.get<PricingResponse>(`${this.config.apiBaseUrl}/pricing/${encodeURIComponent(customerId)}`);
  }
}
