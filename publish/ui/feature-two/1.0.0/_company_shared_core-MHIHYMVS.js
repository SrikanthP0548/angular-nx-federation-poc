import { a as u } from "@nf-internal/chunk-DUTPQ56Q";
import { InjectionToken as d } from "@angular/core";
var g = "1.0", E = new d("platform.runtime-config"), w = new d("platform.logger");
function y(a, t = g) { return a.split(".")[0] === t.split(".")[0]; }
import { createEnvironmentInjector as p } from "@angular/core";
import { createCustomElement as l } from "@angular/elements";
function L(a) { let t = new Map, c = new Set; function f(e, r) { return u(this, null, function* () { let n = a[e]; if (!n)
    throw new Error(`feature.register.unknown-element: "${e}" is not served by remote "${r.feature.remoteName}" (serves: ${Object.keys(a).join(", ")})`); if (customElements.get(e) && !c.has(e))
    throw new Error(`feature.register.collision: custom element "${e}" is already registered outside this provider`); let o = yield n(), i; try {
    i = p(o.providers, r.shellInjector, e);
    let s = l(o.component, { injector: i });
    customElements.define(e, s);
}
catch (s) {
    throw i?.destroy(), s;
} c.add(e); let m = { elementNames: [e] }; try {
    r.logger.event("feature.register.completed", { elementName: e, featureVersion: r.feature.featureVersion });
}
catch (s) {
    console.error("[provider] telemetry failed after registration was committed", s);
} return m; }); } return { contractVersion: g, register(e) { let r = e.feature.elementName, n = t.get(r); if (n)
        return n; let o = f(r, e).catch(i => { throw t.delete(r), i; }); return t.set(r, o), o; } }; }
export { g as PLATFORM_CONTRACT_VERSION, w as PLATFORM_LOGGER, E as RUNTIME_CONFIG, L as createFederatedFeature, y as isContractCompatible };
