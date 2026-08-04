var Ww = Object.defineProperty, zw = Object.defineProperties;
var Qw = Object.getOwnPropertyDescriptors;
var cs = Object.getOwnPropertySymbols;
var ng = Object.prototype.hasOwnProperty, rg = Object.prototype.propertyIsEnumerable;
var ll = (e, t) => (t = Symbol[e]) ? t : Symbol.for("Symbol." + e), Zw = e => { throw TypeError(e); };
var tg = (e, t, n) => t in e ? Ww(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, O = (e, t) => { for (var n in t ||= {})
    ng.call(t, n) && tg(e, n, t[n]); if (cs)
    for (var n of cs(t))
        rg.call(t, n) && tg(e, n, t[n]); return e; }, X = (e, t) => zw(e, Qw(t));
var og = (e, t) => { var n = {}; for (var r in e)
    ng.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]); if (e != null && cs)
    for (var r of cs(e))
        t.indexOf(r) < 0 && rg.call(e, r) && (n[r] = e[r]); return n; };
var Te = (e, t, n) => new Promise((r, o) => { var i = c => { try {
    a(n.next(c));
}
catch (l) {
    o(l);
} }, s = c => { try {
    a(n.throw(c));
}
catch (l) {
    o(l);
} }, a = c => c.done ? r(c.value) : Promise.resolve(c.value).then(i, s); a((n = n.apply(e, t)).next()); }), Yw = function (e, t) { this[0] = e, this[1] = t; };
var ul = e => { var t = e[ll("asyncIterator")], n = !1, r, o = {}; return t == null ? (t = e[ll("iterator")](), r = i => o[i] = s => t[i](s)) : (t = t.call(e), r = i => o[i] = s => { if (n) {
    if (n = !1, i === "throw")
        throw s;
    return s;
} return n = !0, { done: !1, value: new Yw(new Promise(a => { var c = t[i](s); c instanceof Object || Zw("Object expected"), a(c); }), 1) }; }), o[ll("iterator")] = () => o, r("next"), "throw" in t ? r("throw") : o.throw = i => { throw i; }, "return" in t && r("return"), o; };
var Ce = null, ls = !1, vn = 1, Kw = null, Y = Symbol("SIGNAL");
function C(e) { let t = Ce; return Ce = e, t; }
function co() { return Ce; }
var Wt = { version: 0, lastCleanEpoch: 0, dirty: !1, producers: void 0, producersTail: void 0, consumers: void 0, consumersTail: void 0, recomputing: !1, consumerAllowSignalWrites: !1, consumerIsAlwaysLive: !1, kind: "unknown", producerMustRecompute: () => !1, producerRecomputeValue: () => { }, consumerMarkedDirty: () => { }, consumerOnSignalRead: () => { } };
function Ct(e) { if (ls)
    throw new Error(""); if (Ce === null)
    return; Ce.consumerOnSignalRead(e); let t = Ce.producersTail; if (t !== void 0 && t.producer === e)
    return; let n, r = Ce.recomputing; if (r && (n = t !== void 0 ? t.nextProducer : Ce.producers, n !== void 0 && n.producer === e)) {
    Ce.producersTail = n, n.lastReadVersion = e.version, n.knownValidAtEpoch = vn;
    return;
} let o = e.consumersTail; if (o !== void 0 && o.consumer === Ce && (!r || o.knownValidAtEpoch === vn))
    return; let i = sr(Ce), s = { producer: e, consumer: Ce, nextProducer: n, prevConsumer: void 0, knownValidAtEpoch: vn, lastReadVersion: e.version, nextConsumer: void 0 }; Ce.producersTail = s, t !== void 0 ? t.nextProducer = s : Ce.producers = s, i && cg(e, s); }
function ig() { vn++; }
function In(e) { if (!(sr(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === vn)) {
    if (!e.producerMustRecompute(e) && !ir(e)) {
        or(e);
        return;
    }
    e.producerRecomputeValue(e), or(e);
} }
function dl(e) { if (e.consumers === void 0)
    return; let t = ls; ls = !0; try {
    for (let n = e.consumers; n !== void 0; n = n.nextConsumer) {
        let r = n.consumer;
        r.dirty || Jw(r);
    }
}
finally {
    ls = t;
} }
function fl() { return Ce?.consumerAllowSignalWrites !== !1; }
function Jw(e) { e.dirty = !0, dl(e), e.consumerMarkedDirty?.(e); }
function or(e) { e.dirty = !1, e.lastCleanEpoch = vn; }
function Mt(e) { return e && sg(e), C(e); }
function sg(e) { if (e.producersTail?.knownValidAtEpoch === vn) {
    let t = e.producers;
    for (; t !== void 0;)
        t.knownValidAtEpoch = null, t = t.nextProducer;
} e.producersTail = void 0, e.recomputing = !0; }
function zt(e, t) { C(t), e && ag(e); }
function ag(e) { e.recomputing = !1; let t = e.producersTail, n = t !== void 0 ? t.nextProducer : e.producers; if (n !== void 0) {
    if (sr(e))
        do
            n = pl(n);
        while (n !== void 0);
    t !== void 0 ? t.nextProducer = void 0 : e.producers = void 0;
} }
function ir(e) { for (let t = e.producers; t !== void 0; t = t.nextProducer) {
    let n = t.producer, r = t.lastReadVersion;
    if (r !== n.version || (In(n), r !== n.version))
        return !0;
} return !1; }
function Qt(e) { if (sr(e)) {
    let t = e.producers;
    for (; t !== void 0;)
        t = pl(t);
} e.producers = void 0, e.producersTail = void 0, e.consumers = void 0, e.consumersTail = void 0; }
function cg(e, t) { let n = e.consumersTail, r = sr(e); if (n !== void 0 ? (t.nextConsumer = n.nextConsumer, n.nextConsumer = t) : (t.nextConsumer = void 0, e.consumers = t), t.prevConsumer = n, e.consumersTail = t, !r)
    for (let o = e.producers; o !== void 0; o = o.nextProducer)
        cg(o.producer, o); }
function pl(e) { let t = e.producer, n = e.nextProducer, r = e.nextConsumer, o = e.prevConsumer; if (e.nextConsumer = void 0, e.prevConsumer = void 0, r !== void 0 ? r.prevConsumer = o : t.consumersTail = o, o !== void 0)
    o.nextConsumer = r;
else if (t.consumers = r, !sr(t)) {
    let i = t.producers;
    for (; i !== void 0;)
        i = pl(i);
} return n; }
function sr(e) { return e.consumerIsAlwaysLive || e.consumers !== void 0; }
function lo(e) { Kw?.(e); }
function uo(e, t) { return Object.is(e, t); }
function fo(e, t) { let n = Object.create(Xw); n.computation = e, t !== void 0 && (n.equal = t); let r = () => { if (In(n), Ct(n), n.value === ut)
    throw n.error; return n.value; }; return r[Y] = n, lo(n), r; }
var yn = Symbol("UNSET"), En = Symbol("COMPUTING"), ut = Symbol("ERRORED"), Xw = X(O({}, Wt), { value: yn, dirty: !0, error: null, equal: uo, kind: "computed", producerMustRecompute(e) { return e.value === yn || e.value === En; }, producerRecomputeValue(e) { if (e.value === En)
        throw new Error(""); let t = e.value; e.value = En; let n = Mt(e), r, o = !1; try {
        r = e.computation(), C(null), o = t !== yn && t !== ut && r !== ut && e.equal(t, r);
    }
    catch (i) {
        r = ut, e.error = i;
    }
    finally {
        zt(e, n);
    } if (o) {
        e.value = t;
        return;
    } e.value = r, e.version++; } });
function eN() { throw new Error; }
var lg = eN;
function ug(e) { lg(e); }
function hl(e) { lg = e; }
var tN = null;
function gl(e, t) { let n = Object.create(po); n.value = e, t !== void 0 && (n.equal = t); let r = () => dg(n); return r[Y] = n, lo(n), [r, s => Zt(n, s), s => us(n, s)]; }
function dg(e) { return Ct(e), e.value; }
function Zt(e, t) { fl() || ug(e), e.equal(e.value, t) || (e.value = t, nN(e)); }
function us(e, t) { fl() || ug(e), Zt(e, t(e.value)); }
var po = X(O({}, Wt), { equal: uo, value: void 0, kind: "signal" });
function nN(e) { e.version++, ig(), dl(e), tN?.(e); }
var ml = X(O({}, Wt), { consumerIsAlwaysLive: !0, consumerAllowSignalWrites: !0, dirty: !0, kind: "effect" });
function vl(e) { if (e.dirty = !1, e.version > 0 && !ir(e))
    return; e.version++; let t = Mt(e); try {
    e.cleanup(), e.fn();
}
finally {
    zt(e, t);
} }
var yl;
function ds() { return yl; }
function tt(e) { let t = yl; return yl = e, t; }
var fg = Symbol("NotFound");
function ar(e) { return e === fg || e?.name === "\u0275NotFound"; }
function El(e, t, n) { let r = Object.create(rN); r.source = e, r.computation = t, n != null && (r.equal = n); let i = () => { if (In(r), Ct(r), r.value === ut)
    throw r.error; return r.value; }; return i[Y] = r, lo(r), i; }
function pg(e, t) { In(e), Zt(e, t), or(e); }
function hg(e, t) { if (In(e), e.value === ut)
    throw e.error; us(e, t), or(e); }
var rN = X(O({}, Wt), { value: yn, dirty: !0, error: null, equal: uo, kind: "linkedSignal", producerMustRecompute(e) { return e.value === yn || e.value === En; }, producerRecomputeValue(e) { if (e.value === En)
        throw new Error(""); let t = e.value; e.value = En; let n = Mt(e), r, o = !1; try {
        let i = e.source(), s = t !== yn && t !== ut, a = s ? { source: e.sourceValue, value: t } : void 0;
        r = e.computation(i, a), e.sourceValue = i, C(null), o = s && r !== ut && e.equal(t, r);
    }
    catch (i) {
        r = ut, e.error = i;
    }
    finally {
        zt(e, n);
    } if (o) {
        e.value = t;
        return;
    } e.value = r, e.version++; } });
function gg(e) { let t = C(null); try {
    return e();
}
finally {
    C(t);
} }
function oN(e) { }
import { BehaviorSubject as iN, Observable as sN, Subject as aN, Subscription as cN } from "rxjs";
var ps = class {
    full;
    major;
    minor;
    patch;
    constructor(t) { this.full = t; let n = t.split("."); this.major = n[0], this.minor = n[1], this.patch = n.slice(2).join("."); }
}, hs = new ps("22.0.8"), vs = (() => { let e = hs.full; return `https://${e.includes("-next") || e.includes("-rc") || e === "0.0.0-PLACEHOLDER" ? "next" : `v${hs.major}`}.angular.dev`; })(), lN = `${vs}/errors`, ys = "https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss", D = class extends Error {
    code;
    constructor(t, n) { super(To(t, n)), this.code = t; }
};
function uN(e) { return `NG0${Math.abs(e)}`; }
function To(e, t) { return `${uN(e)}${t ? ": " + t : ""}`; }
function H(e) { for (let t in e)
    if (e[t] === H)
        return t; throw Error(""); }
function Dg(e, t) { for (let n in t)
    t.hasOwnProperty(n) && !e.hasOwnProperty(n) && (e[n] = t[n]); }
function Co(e) {
    if (typeof e == "string")
        return e;
    if (Array.isArray(e))
        return `[${e.map(Co).join(", ")}]`;
    if (e == null)
        return "" + e;
    let t = e.overriddenName || e.name;
    if (t)
        return `${t}`;
    let n = e.toString();
    if (n == null)
        return "" + n;
    let r = n.indexOf(`
`);
    return r >= 0 ? n.slice(0, r) : n;
}
function Es(e, t) { return e ? t ? `${e} ${t}` : e : t || ""; }
function dN(e, t = 100) { if (!e || t < 1 || e.length <= t)
    return e; if (t == 1)
    return e.substring(0, 1) + "..."; let n = Math.round(t / 2); return e.substring(0, n) + "..." + e.substring(e.length - n); }
var fN = H({ __forward_ref__: H });
function Mo(e) { return e.__forward_ref__ = Mo, e; }
function F(e) { return wo(e) ? e() : e; }
function wo(e) { return typeof e == "function" && e.hasOwnProperty(fN) && e.__forward_ref__ === Mo; }
function xl(e, t, n) { e != t && Jt(n, e, t, "=="); }
function kl(e, t) { e == null && Jt(t, e, null, "!="); }
function Jt(e, t, n, r) { throw new Error(`ASSERTION ERROR: ${e}` + (r == null ? "" : ` [Expected=> ${n} ${r} ${t} <=Actual]`)); }
function K(e) { return { token: e.token, providedIn: e.providedIn || null, factory: e.factory, value: void 0 }; }
function No(e) { return { providers: e.providers || [], imports: e.imports || [] }; }
function So(e) { return hN(e, Xt); }
function pN(e) { return So(e) !== null; }
function hN(e, t) { return e.hasOwnProperty(t) && e[t] || null; }
function gN(e) { let t = e?.[Xt] ?? null; return t || null; }
function go(e) { return e && e.hasOwnProperty(mo) ? e[mo] : null; }
var Xt = H({ \u0275prov: H }), mo = H({ \u0275inj: H }), M = class {
    _desc;
    ngMetadataName = "InjectionToken";
    \u0275prov;
    constructor(t, n) { this._desc = t, this.\u0275prov = void 0, typeof n == "number" ? this.__NG_ELEMENT_ID__ = n : n !== void 0 && (this.\u0275prov = K({ token: this, providedIn: n.providedIn || "root", factory: n.factory })); }
    get multi() { return this; }
    toString() { return `InjectionToken ${this._desc}`; }
}, mg;
function mN(e) { Jt("setInjectorProfilerContext should never be called in production mode"); let t = mg; return mg = e, t; }
function Ol(e) { return e && !!e.\u0275providers; }
var Mn = H({ \u0275cmp: H }), _o = H({ \u0275dir: H }), bo = H({ \u0275pipe: H }), Is = H({ \u0275mod: H }), $e = H({ \u0275fac: H }), wn = H({ __NG_ELEMENT_ID__: H }), vg = H({ __NG_ENV_ID__: H });
function lr(e) { return Ts(e, "@NgModule"), e[Is] || null; }
function Ds(e) { let t = lr(e); if (!t)
    throw new D(915, !1); return t; }
function W(e) { return Ts(e, "@Component"), e[Mn] || null; }
function Le(e) { return Ts(e, "@Directive"), e[_o] || null; }
function rt(e) { return Ts(e, "@Pipe"), e[bo] || null; }
function Ts(e, t) { if (e == null)
    throw new D(-919, !1); }
function Ao(e) { let t = W(e) || Le(e) || rt(e); return t !== null && t.standalone; }
function A(e) { return typeof e == "string" ? e : e == null ? "" : String(e); }
function We(e) { return typeof e == "function" ? e.name || e.toString() : typeof e == "object" && e != null && typeof e.type == "function" ? e.type.name || e.type.toString() : A(e); }
var Tg = H({ ngErrorCode: H }), vN = H({ ngErrorMessage: H }), yN = H({ ngTokenPath: H });
function Ll(e, t) { return Cg("", -200, t); }
function Cs(e, t) { throw new D(-201, !1); }
function Cg(e, t, n) { let r = new D(t, e); return r[Tg] = t, r[vN] = e, n && (r[yN] = n), r; }
function EN(e) { return e[Tg]; }
var Dl;
function Mg() { return Dl; }
function Me(e) { let t = Dl; return Dl = e, t; }
function Pl(e, t, n) { let r = So(e); if (r && r.providedIn == "root")
    return r.value === void 0 ? r.value = r.factory() : r.value; if (n & 8)
    return null; if (t !== void 0)
    return t; Cs(e, ""); }
var Pe = globalThis;
var IN = {}, Dn = IN, Tl = "__NG_DI_FLAG__", Cl = class {
    injector;
    constructor(t) { this.injector = t; }
    retrieve(t, n) { let r = Tn(n) || 0; try {
        return this.injector.get(t, r & 8 ? null : Dn, r);
    }
    catch (o) {
        if (ar(o))
            return o;
        throw o;
    } }
};
function DN(e, t = 0) { let n = ds(); if (n === void 0)
    throw new D(-203, !1); if (n === null)
    return Pl(e, void 0, t); {
    let r = TN(t), o = n.retrieve(e, r);
    if (ar(o)) {
        if (r.optional)
            return null;
        throw o;
    }
    return o;
} }
function ge(e, t = 0) { return (Mg() || DN)(F(e), t); }
function Ms(e) { throw new D(202, !1); }
function E(e, t) { return ge(e, Tn(t)); }
function Tn(e) { return typeof e > "u" || typeof e == "number" ? e : 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4); }
function TN(e) { return { optional: !!(e & 8), host: !!(e & 1), self: !!(e & 2), skipSelf: !!(e & 4) }; }
function Ml(e) { let t = []; for (let n = 0; n < e.length; n++) {
    let r = F(e[n]);
    if (Array.isArray(r)) {
        if (r.length === 0)
            throw new D(900, !1);
        let o, i = 0;
        for (let s = 0; s < r.length; s++) {
            let a = r[s], c = CN(a);
            typeof c == "number" ? c === -1 ? o = a.token : i |= c : o = a;
        }
        t.push(ge(o, i));
    }
    else
        t.push(ge(r));
} return t; }
function ur(e, t) { return e[Tl] = t, e.prototype[Tl] = t, e; }
function CN(e) { return e[Tl]; }
function Yt(e, t) { let n = e.hasOwnProperty($e); return n ? e[$e] : null; }
function wg(e, t, n) { if (e.length !== t.length)
    return !1; for (let r = 0; r < e.length; r++) {
    let o = e[r], i = t[r];
    if (n && (o = n(o), i = n(i)), i !== o)
        return !1;
} return !0; }
function ot(e) { return e.flat(Number.POSITIVE_INFINITY); }
function Ro(e, t) { e.forEach(n => Array.isArray(n) ? Ro(n, t) : t(n)); }
function Fl(e, t, n) { t >= e.length ? e.push(n) : e.splice(t, 0, n); }
function xo(e, t) { return t >= e.length - 1 ? e.pop() : e.splice(t, 1)[0]; }
function ko(e, t) { let n = []; for (let r = 0; r < e; r++)
    n.push(t); return n; }
function jl(e, t, n) { let r = e.length - n; for (; t < r;)
    e[t] = e[t + n], t++; for (; n--;)
    e.pop(); }
function Vl(e, t, n, r) { let o = e.length; if (o == t)
    e.push(n, r);
else if (o === 1)
    e.push(r, e[0]), e[0] = n;
else {
    for (o--, e.push(e[o - 1], e[o]); o > t;) {
        let i = o - 2;
        e[o] = e[i], o--;
    }
    e[t] = n, e[t + 1] = r;
} }
function Oo(e, t, n) { let r = dr(e, t); return r >= 0 ? e[r | 1] = n : (r = ~r, Vl(e, r, t, n)), r; }
function ws(e, t) { let n = dr(e, t); if (n >= 0)
    return e[n | 1]; }
function dr(e, t) { return MN(e, t, 1); }
function MN(e, t, n) { let r = 0, o = e.length >> n; for (; o !== r;) {
    let i = r + (o - r >> 1), s = e[i << n];
    if (t === s)
        return i << n;
    s > t ? o = i : r = i + 1;
} return ~(o << n); }
var bt = {}, j = [], ze = new M(""), Lo = new M("", -1), Ns = new M(""), St = class {
    get(t, n = Dn) { if (n === Dn) {
        let o = Cg("", -201);
        throw o.name = "\u0275NotFound", o;
    } return n; }
};
function Fe(e) { return { \u0275providers: e }; }
function Hl(e) { return Fe([{ provide: ze, multi: !0, useValue: e }]); }
function Ng(...e) { return { \u0275providers: Ss(!0, e), \u0275fromNgModule: !0 }; }
function Ss(e, ...t) { let n = [], r = new Set, o, i = s => { n.push(s); }; return Ro(t, s => { let a = s; vo(a, i, [], r) && (o ||= [], o.push(a)); }), o !== void 0 && Sg(o, i), n; }
function Sg(e, t) { for (let n = 0; n < e.length; n++) {
    let { ngModule: r, providers: o } = e[n];
    Bl(o, i => { t(i, r); });
} }
function vo(e, t, n, r) { if (e = F(e), !e)
    return !1; let o = null, i = go(e), s = !i && W(e); if (!i && !s) {
    let c = e.ngModule;
    if (i = go(c), i)
        o = c;
    else
        return !1;
}
else {
    if (s && !s.standalone)
        return !1;
    o = e;
} let a = r.has(o); if (s) {
    if (a)
        return !1;
    if (r.add(o), s.dependencies) {
        let c = typeof s.dependencies == "function" ? s.dependencies() : s.dependencies;
        for (let l of c)
            vo(l, t, n, r);
    }
}
else if (i) {
    if (i.imports != null && !a) {
        r.add(o);
        let l;
        Ro(i.imports, u => { vo(u, t, n, r) && (l ||= [], l.push(u)); }), l !== void 0 && Sg(l, t);
    }
    if (!a) {
        let l = Yt(o) || (() => new o);
        t({ provide: o, useFactory: l, deps: j }, o), t({ provide: Ns, useValue: o, multi: !0 }, o), t({ provide: ze, useValue: () => ge(o), multi: !0 }, o);
    }
    let c = i.providers;
    if (c != null && !a) {
        let l = e;
        Bl(c, u => { t(u, l); });
    }
}
else
    return !1; return o !== e && e.providers !== void 0; }
function Bl(e, t) { for (let n of e)
    Ol(n) && (n = n.\u0275providers), Array.isArray(n) ? Bl(n, t) : t(n); }
var wN = H({ provide: String, useValue: H });
function _g(e) { return e !== null && typeof e == "object" && wN in e; }
function NN(e) { return !!(e && e.useExisting); }
function SN(e) { return !!(e && e.useFactory); }
function Cn(e) { return typeof e == "function"; }
function bg(e) { return !!e.useClass; }
var Ul = new M(""), fs = {}, yg = {}, Il;
function fr() { return Il === void 0 && (Il = new St), Il; }
var Ae = class {
}, nt = class extends Ae {
    parent;
    source;
    scopes;
    records = new Map;
    _ngOnDestroyHooks = new Set;
    _onDestroyHooks = [];
    get destroyed() { return this._destroyed; }
    _destroyed = !1;
    injectorDefTypes;
    constructor(t, n, r, o) { super(), this.parent = n, this.source = r, this.scopes = o, Nl(t, s => this.processProvider(s)), this.records.set(Lo, cr(void 0, this)), o.has("environment") && this.records.set(Ae, cr(void 0, this)); let i = this.records.get(Ul); i != null && typeof i.value == "string" && this.scopes.add(i.value), this.injectorDefTypes = new Set(this.get(Ns, j, { self: !0 })); }
    retrieve(t, n) { let r = Tn(n) || 0; try {
        return this.get(t, Dn, r);
    }
    catch (o) {
        if (ar(o))
            return o;
        throw o;
    } }
    destroy() { ho(this), this._destroyed = !0; let t = C(null); try {
        for (let r of this._ngOnDestroyHooks)
            r.ngOnDestroy();
        let n = this._onDestroyHooks;
        this._onDestroyHooks = [];
        for (let r of n)
            r();
    }
    finally {
        this.records.clear(), this._ngOnDestroyHooks.clear(), this.injectorDefTypes.clear(), C(t);
    } }
    onDestroy(t) { return ho(this), this._onDestroyHooks.push(t), () => this.removeOnDestroy(t); }
    runInContext(t) { ho(this); let n = tt(this), r = Me(void 0), o; try {
        return t();
    }
    finally {
        tt(n), Me(r);
    } }
    get(t, n = Dn, r) { if (ho(this), t.hasOwnProperty(vg))
        return t[vg](this); let o = Tn(r), i, s = tt(this), a = Me(void 0); try {
        if (!(o & 4)) {
            let l = this.records.get(t);
            if (l === void 0) {
                let u = xN(t) && So(t);
                u && this.injectableDefInScope(u) ? l = cr(wl(t), fs) : l = null, this.records.set(t, l);
            }
            if (l != null)
                return this.hydrate(t, l, o);
        }
        let c = o & 2 ? fr() : this.parent;
        return n = o & 8 && n === Dn ? null : n, c.get(t, n);
    }
    catch (c) {
        let l = EN(c);
        throw l === -200 || l === -201 ? new D(l, null) : c;
    }
    finally {
        Me(a), tt(s);
    } }
    resolveInjectorInitializers() { let t = C(null), n = tt(this), r = Me(void 0), o; try {
        let i = this.get(ze, j, { self: !0 });
        for (let s of i)
            s();
    }
    finally {
        tt(n), Me(r), C(t);
    } }
    toString() { return "R3Injector[...]"; }
    processProvider(t) { t = F(t); let n = Cn(t) ? t : F(t && t.provide), r = bN(t); if (!Cn(t) && t.multi === !0) {
        let o = this.records.get(n);
        o || (o = cr(void 0, fs, !0), o.factory = () => Ml(o.multi), this.records.set(n, o)), n = t, o.multi.push(t);
    } this.records.set(n, r); }
    hydrate(t, n, r) { let o = C(null); try {
        if (n.value === yg)
            throw Ll("");
        return n.value === fs && (n.value = yg, n.value = n.factory(void 0, r)), typeof n.value == "object" && n.value && RN(n.value) && this._ngOnDestroyHooks.add(n.value), n.value;
    }
    finally {
        C(o);
    } }
    injectableDefInScope(t) { if (!t.providedIn)
        return !1; let n = F(t.providedIn); return typeof n == "string" ? n === "any" || this.scopes.has(n) : this.injectorDefTypes.has(n); }
    removeOnDestroy(t) { let n = this._onDestroyHooks.indexOf(t); n !== -1 && this._onDestroyHooks.splice(n, 1); }
};
function wl(e) { let t = So(e), n = t !== null ? t.factory : Yt(e); if (n !== null)
    return n; if (e instanceof M)
    throw new D(-204, !1); if (e instanceof Function)
    return _N(e); throw new D(-204, !1); }
function _N(e) { if (e.length > 0)
    throw new D(-204, !1); let n = gN(e); return n !== null ? () => n.factory(e) : () => new e; }
function bN(e) { if (_g(e))
    return cr(void 0, e.useValue); {
    let t = $l(e);
    return cr(t, fs);
} }
function $l(e, t, n) { let r; if (Cn(e)) {
    let o = F(e);
    return Yt(o) || wl(o);
}
else if (_g(e))
    r = () => F(e.useValue);
else if (SN(e))
    r = () => e.useFactory(...Ml(e.deps || []));
else if (NN(e))
    r = (o, i) => ge(F(e.useExisting), i !== void 0 && i & 8 ? 8 : void 0);
else {
    let o = F(e && (e.useClass || e.provide));
    if (AN(e))
        r = () => new o(...Ml(e.deps));
    else
        return Yt(o) || wl(o);
} return r; }
function ho(e) { if (e.destroyed)
    throw new D(-205, !1); }
function cr(e, t, n = !1) { return { factory: e, value: t, multi: n ? [] : void 0 }; }
function AN(e) { return !!e.deps; }
function RN(e) { return e !== null && typeof e == "object" && typeof e.ngOnDestroy == "function"; }
function xN(e) { return typeof e == "function" || typeof e == "object" && e.ngMetadataName === "InjectionToken"; }
function Nl(e, t) { for (let n of e)
    Array.isArray(n) ? Nl(n, t) : n && Ol(n) ? Nl(n.\u0275providers, t) : t(n); }
function Po(e, t) { let n; e instanceof nt ? (ho(e), n = e) : n = new Cl(e); let r, o = tt(n), i = Me(void 0); try {
    return t();
}
finally {
    tt(o), Me(i);
} }
function _s() { return Mg() !== void 0 || ds() != null; }
function kN(e) { if (!_s())
    throw new D(-203, !1); }
var U = 0, m = 1, N = 2, z = 3, me = 4, le = 5, pe = 6, en = 7, V = 8, k = 9, Qe = 10, S = 11, tn = 12, Fo = 13, nn = 14, se = 15, rn = 16, Nn = 17, dt = 18, je = 19, Gl = 20, Nt = 21, bs = 22, Kt = 23, Re = 24, Sn = 25, Ze = 26, I = 27, ql = 1, Ve = 6, it = 7, jo = 8, _n = 9, G = 10;
function ee(e) { return Array.isArray(e) && typeof e[ql] == "object"; }
function J(e) { return Array.isArray(e) && e[ql] === !0; }
function Wl(e) { return (e.flags & 4) !== 0; }
function we(e) { return e.componentOffset > -1; }
function pr(e) { return (e.flags & 1) === 1; }
function Ye(e) { return !!e.template; }
function st(e) { return (e[N] & 512) !== 0; }
function zl(e) { return (e.type & 16) === 16; }
function Ag(e) { return (e[N] & 32) === 32; }
function ft(e) { return (e[N] & 256) === 256; }
function Rg(e, t) { ON(e, t[m]); }
function ON(e, t) { Ql(e); let n = t.data; for (let r = I; r < n.length; r++)
    if (n[r] === e)
        return; Jt("This TNode does not belong to this TView."); }
function Ql(e) { kl(e, "TNode must be defined"), e && typeof e == "object" && e.hasOwnProperty("directiveStylingLast") || Jt("Not of type TNode, got: " + e); }
function xg(e) { kl(e, "LView must be defined"), xl(ee(e), !0, "Expecting LView"); }
var Zl = "svg", Yl = "math";
function L(e) { for (; Array.isArray(e);)
    e = e[U]; return e; }
function Vo(e) { for (; Array.isArray(e);) {
    if (typeof e[ql] == "object")
        return e;
    e = e[U];
} return null; }
function bn(e, t) { return L(t[e]); }
function ae(e, t) { return L(t[e.index]); }
function kg(e, t) { let n = e === null ? -1 : e.index; return n !== -1 ? L(t[n]) : null; }
function on(e, t) { return e.data[t]; }
function sn(e, t) { return e[t]; }
function Ho(e, t, n, r) { n >= e.data.length && (e.data[n] = null, e.blueprint[n] = null), t[n] = r; }
function ve(e, t) { let n = t[e]; return ee(n) ? n : n[U]; }
function Og(e) { return (e[N] & 4) === 4; }
function As(e) { return (e[N] & 128) === 128; }
function Lg(e) { return J(e[z]); }
function ye(e, t) { return t == null ? null : e[t]; }
function Kl(e) { e[Nn] = 0; }
function Bo(e) { e[N] & 1024 || (e[N] |= 1024, As(e) && An(e)); }
function Jl(e, t) { for (; e > 0;)
    t = t[nn], e--; return t; }
function hr(e) { return !!(e[N] & 9216 || e[Re]?.dirty); }
function Rs(e) { e[Qe].changeDetectionScheduler?.notify(8), e[N] & 64 && (e[N] |= 1024), hr(e) && An(e); }
function An(e) { e[Qe].changeDetectionScheduler?.notify(0); let t = Ge(e); for (; t !== null && !(t[N] & 8192 || (t[N] |= 8192, !As(t)));)
    t = Ge(t); }
function gr(e, t) { if (ft(e))
    throw new D(911, !1); e[Nt] === null && (e[Nt] = []), e[Nt].push(t); }
function xs(e, t) { if (e[Nt] === null)
    return; let n = e[Nt].indexOf(t); n !== -1 && e[Nt].splice(n, 1); }
function Ge(e) { let t = e[z]; return J(t) ? t[z] : t; }
function Xl(e) { return e[en] ??= []; }
function eu(e) { return e.cleanup ??= []; }
function Pg(e, t, n, r) { let o = Xl(t); o.push(n), e.firstCreatePass && eu(e).push(r, o.length - 1); }
var b = { lFrame: Gg(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var Sl = !1;
function Fg() { return b.lFrame.elementDepthCount; }
function jg() { b.lFrame.elementDepthCount++; }
function tu() { b.lFrame.elementDepthCount--; }
function ks() { return b.bindingsEnabled; }
function Uo() { return b.skipHydrationRootTNode !== null; }
function nu(e) { return b.skipHydrationRootTNode === e; }
function ru() { b.bindingsEnabled = !0; }
function Vg(e) { b.skipHydrationRootTNode = e; }
function ou() { b.bindingsEnabled = !1; }
function iu() { b.skipHydrationRootTNode = null; }
function g() { return b.lFrame.lView; }
function R() { return b.lFrame.tView; }
function su(e) { return b.lFrame.contextLView = e, e[V]; }
function au(e) { return b.lFrame.contextLView = null, e; }
function _() { let e = cu(); for (; e !== null && e.type === 64;)
    e = e.parent; return e; }
function cu() { return b.lFrame.currentTNode; }
function mr() { let e = b.lFrame, t = e.currentTNode; return e.isParent ? t : t.parent; }
function pt(e, t) { let n = b.lFrame; n.currentTNode = e, n.isParent = t; }
function lu() { return b.lFrame.isParent; }
function uu() { b.lFrame.isParent = !1; }
function du() { return b.lFrame.contextLView; }
function fu() { return Sl; }
function yo(e) { let t = Sl; return Sl = e, t; }
function Ee() { let e = b.lFrame, t = e.bindingRootIndex; return t === -1 && (t = e.bindingRootIndex = e.tView.bindingStartIndex), t; }
function ht() { return b.lFrame.bindingIndex; }
function pu(e) { return b.lFrame.bindingIndex = e; }
function De() { return b.lFrame.bindingIndex++; }
function gt(e) { let t = b.lFrame, n = t.bindingIndex; return t.bindingIndex = t.bindingIndex + e, n; }
function Hg() { return b.lFrame.inI18n; }
function hu(e) { b.lFrame.inI18n = e; }
function Bg(e, t) { let n = b.lFrame; n.bindingIndex = n.bindingRootIndex = e, Os(t); }
function Ug() { return b.lFrame.currentDirectiveIndex; }
function Os(e) { b.lFrame.currentDirectiveIndex = e; }
function Ls(e) { let t = b.lFrame.currentDirectiveIndex; return t === -1 ? null : e[t]; }
function Ps() { return b.lFrame.currentQueryIndex; }
function $o(e) { b.lFrame.currentQueryIndex = e; }
function LN(e) { let t = e[m]; return t.type === 2 ? t.declTNode : t.type === 1 ? e[le] : null; }
function gu(e, t, n) { if (n & 4) {
    let o = t, i = e;
    for (; o = o.parent, o === null && !(n & 1);)
        if (o = LN(i), o === null || (i = i[nn], o.type & 10))
            break;
    if (o === null)
        return !1;
    t = o, e = i;
} let r = b.lFrame = $g(); return r.currentTNode = t, r.lView = e, !0; }
function Fs(e) { let t = $g(), n = e[m]; b.lFrame = t, t.currentTNode = n.firstChild, t.lView = e, t.tView = n, t.contextLView = e, t.bindingIndex = n.bindingStartIndex, t.inI18n = !1; }
function $g() { let e = b.lFrame, t = e === null ? null : e.child; return t === null ? Gg(e) : t; }
function Gg(e) { let t = { currentTNode: null, isParent: !0, lView: null, tView: null, selectedIndex: -1, contextLView: null, elementDepthCount: 0, currentNamespace: null, currentDirectiveIndex: -1, bindingRootIndex: -1, bindingIndex: -1, currentQueryIndex: 0, parent: e, child: null, inI18n: !1 }; return e !== null && (e.child = t), t; }
function qg() { let e = b.lFrame; return b.lFrame = e.parent, e.currentTNode = null, e.lView = null, e; }
var mu = qg;
function js() { let e = qg(); e.isParent = !0, e.tView = null, e.selectedIndex = -1, e.contextLView = null, e.elementDepthCount = 0, e.currentDirectiveIndex = -1, e.currentNamespace = null, e.bindingRootIndex = -1, e.bindingIndex = -1, e.currentQueryIndex = 0; }
function Wg(e) { return (b.lFrame.contextLView = Jl(e, b.lFrame.contextLView))[V]; }
function ue() { return b.lFrame.selectedIndex; }
function mt(e) { b.lFrame.selectedIndex = e; }
function He() { let e = b.lFrame; return on(e.tView, e.selectedIndex); }
function vu() { b.lFrame.currentNamespace = Zl; }
function yu() { b.lFrame.currentNamespace = Yl; }
function Eu() { PN(); }
function PN() { b.lFrame.currentNamespace = null; }
function Vs() { return b.lFrame.currentNamespace; }
var zg = !0;
function Go() { return zg; }
function at(e) { zg = e; }
function vr() { let e, t; return { promise: new Promise((r, o) => { e = r, t = o; }), resolve: e, reject: t }; }
function _l(e, t = null, n = null, r) { let o = Iu(e, t, n, r); return o.resolveInjectorInitializers(), o; }
function Iu(e, t = null, n = null, r, o = new Set) { let i = [n || j, Ng(e)], s; return new nt(i, t || fr(), s || null, o); }
var FN = new Set;
function Qg() { return FN; }
var ie = class e {
    static THROW_IF_NOT_FOUND = Dn;
    static NULL = new St;
    static create(t, n) { if (Array.isArray(t))
        return _l({ name: "" }, n, t, ""); {
        let r = t.name ?? "";
        return _l({ name: r }, t.parent, t.providers, r);
    } }
    static \u0275prov = K({ token: e, providedIn: "any", factory: () => ge(Lo) });
    static __NG_ELEMENT_ID__ = -1;
}, At = new M(""), xe = (() => { class e {
    static __NG_ELEMENT_ID__ = jN;
    static __NG_ENV_ID__ = n => n;
} return e; })(), gs = class extends xe {
    _lView;
    constructor(t) { super(), this._lView = t; }
    get destroyed() { return ft(this._lView); }
    onDestroy(t) { let n = this._lView; return gr(n, t), () => xs(n, t); }
};
function jN() { return new gs(g()); }
var Du = !1, Tu = new M(""), vt = (() => { class e {
    taskId = 0;
    pendingTasks = new Set;
    destroyed = !1;
    pendingTask = new iN(!1);
    debugTaskTracker = E(Tu, { optional: !0 });
    get hasPendingTasks() { return this.destroyed ? !1 : this.pendingTask.value; }
    get hasPendingTasksObservable() { return this.destroyed ? new sN(n => { n.next(!1), n.complete(); }) : this.pendingTask; }
    add() { !this.hasPendingTasks && !this.destroyed && this.pendingTask.next(!0); let n = this.taskId++; return this.pendingTasks.add(n), this.debugTaskTracker?.add(n), n; }
    has(n) { return this.pendingTasks.has(n); }
    remove(n) { this.pendingTasks.delete(n), this.debugTaskTracker?.remove(n), this.pendingTasks.size === 0 && this.hasPendingTasks && this.pendingTask.next(!1); }
    ngOnDestroy() { this.pendingTasks.clear(), this.hasPendingTasks && this.pendingTask.next(!1), this.destroyed = !0, this.pendingTask.unsubscribe(); }
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new e });
} return e; })(), bl = class extends aN {
    __isAsync;
    destroyRef = void 0;
    pendingTasks = void 0;
    constructor(t = !1) { super(), this.__isAsync = t, _s() && (this.destroyRef = E(xe, { optional: !0 }) ?? void 0, this.pendingTasks = E(vt, { optional: !0 }) ?? void 0); }
    emit(t) { let n = C(null); try {
        super.next(t);
    }
    finally {
        C(n);
    } }
    subscribe(t, n, r) { let o = t, i = n || (() => null), s = r; if (t && typeof t == "object") {
        let c = t;
        o = c.next?.bind(c), i = c.error?.bind(c), s = c.complete?.bind(c);
    } this.__isAsync && (i = this.wrapInTimeout(i), o && (o = this.wrapInTimeout(o)), s && (s = this.wrapInTimeout(s))); let a = super.subscribe({ next: o, error: i, complete: s }); return t instanceof cN && t.add(a), a; }
    wrapInTimeout(t) { return n => { let r = this.pendingTasks?.add(); setTimeout(() => { try {
        t(n);
    }
    finally {
        r !== void 0 && this.pendingTasks?.remove(r);
    } }); }; }
}, wt = bl;
function ms(...e) { }
function Cu(e) { let t, n; function r() { e = ms; try {
    n !== void 0 && typeof cancelAnimationFrame == "function" && cancelAnimationFrame(n), t !== void 0 && clearTimeout(t);
}
catch { } } return t = setTimeout(() => { e(), r(); }), typeof requestAnimationFrame == "function" && (n = requestAnimationFrame(() => { e(), r(); })), () => r(); }
function Zg(e) { return queueMicrotask(() => e()), () => { e = ms; }; }
var Mu = "isAngularZone", Eo = Mu + "_ID", VN = 0, q = class e {
    hasPendingMacrotasks = !1;
    hasPendingMicrotasks = !1;
    isStable = !0;
    onUnstable = new wt(!1);
    onMicrotaskEmpty = new wt(!1);
    onStable = new wt(!1);
    onError = new wt(!1);
    constructor(t) { let { enableLongStackTrace: n = !1, shouldCoalesceEventChangeDetection: r = !1, shouldCoalesceRunChangeDetection: o = !1, scheduleInRootZone: i = Du } = t; if (typeof Zone > "u")
        throw new D(908, !1); Zone.assertZonePatched(); let s = this; s._nesting = 0, s._outer = s._inner = Zone.current, Zone.TaskTrackingZoneSpec && (s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec)), n && Zone.longStackTraceZoneSpec && (s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)), s.shouldCoalesceEventChangeDetection = !o && r, s.shouldCoalesceRunChangeDetection = o, s.callbackScheduled = !1, s.scheduleInRootZone = i, UN(s); }
    static isInAngularZone() { return typeof Zone < "u" && Zone.current.get(Mu) === !0; }
    static assertInAngularZone() { if (!e.isInAngularZone())
        throw new D(909, !1); }
    static assertNotInAngularZone() { if (e.isInAngularZone())
        throw new D(909, !1); }
    run(t, n, r) { return this._inner.run(t, n, r); }
    runTask(t, n, r, o) { let i = this._inner, s = i.scheduleEventTask("NgZoneEvent: " + o, t, HN, ms, ms); try {
        return i.runTask(s, n, r);
    }
    finally {
        i.cancelTask(s);
    } }
    runGuarded(t, n, r) { return this._inner.runGuarded(t, n, r); }
    runOutsideAngular(t) { return this._outer.run(t); }
}, HN = {};
function wu(e) { if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
    try {
        e._nesting++, e.onMicrotaskEmpty.emit(null);
    }
    finally {
        if (e._nesting--, !e.hasPendingMicrotasks)
            try {
                e.runOutsideAngular(() => e.onStable.emit(null));
            }
            finally {
                e.isStable = !0;
            }
    } }
function BN(e) { if (e.isCheckStableRunning || e.callbackScheduled)
    return; e.callbackScheduled = !0; function t() { Cu(() => { e.callbackScheduled = !1, Al(e), e.isCheckStableRunning = !0, wu(e), e.isCheckStableRunning = !1; }); } e.scheduleInRootZone ? Zone.root.run(() => { t(); }) : e._outer.run(() => { t(); }), Al(e); }
function UN(e) { let t = () => { BN(e); }, n = VN++; e._inner = e._inner.fork({ name: "angular", properties: { [Mu]: !0, [Eo]: n, [Eo + n]: !0 }, onInvokeTask: (r, o, i, s, a, c) => { if ($N(c))
        return r.invokeTask(i, s, a, c); try {
        return Eg(e), r.invokeTask(i, s, a, c);
    }
    finally {
        (e.shouldCoalesceEventChangeDetection && s.type === "eventTask" || e.shouldCoalesceRunChangeDetection) && t(), Ig(e);
    } }, onInvoke: (r, o, i, s, a, c, l) => { try {
        return Eg(e), r.invoke(i, s, a, c, l);
    }
    finally {
        e.shouldCoalesceRunChangeDetection && !e.callbackScheduled && !GN(c) && t(), Ig(e);
    } }, onHasTask: (r, o, i, s) => { r.hasTask(i, s), o === i && (s.change == "microTask" ? (e._hasPendingMicrotasks = s.microTask, Al(e), wu(e)) : s.change == "macroTask" && (e.hasPendingMacrotasks = s.macroTask)); }, onHandleError: (r, o, i, s) => (r.handleError(i, s), e.runOutsideAngular(() => e.onError.emit(s)), !1) }); }
function Al(e) { e._hasPendingMicrotasks || (e.shouldCoalesceEventChangeDetection || e.shouldCoalesceRunChangeDetection) && e.callbackScheduled === !0 ? e.hasPendingMicrotasks = !0 : e.hasPendingMicrotasks = !1; }
function Eg(e) { e._nesting++, e.isStable && (e.isStable = !1, e.onUnstable.emit(null)); }
function Ig(e) { e._nesting--, wu(e); }
var Io = class {
    hasPendingMicrotasks = !1;
    hasPendingMacrotasks = !1;
    isStable = !0;
    onUnstable = new wt;
    onMicrotaskEmpty = new wt;
    onStable = new wt;
    onError = new wt;
    run(t, n, r) { return t.apply(n, r); }
    runGuarded(t, n, r) { return t.apply(n, r); }
    runOutsideAngular(t) { return t(); }
    runTask(t, n, r, o) { return t.apply(n, r); }
};
function $N(e) { return Yg(e, "__ignore_ng_zone__"); }
function GN(e) { return Yg(e, "__scheduler_tick__"); }
function Yg(e, t) { return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[t] === !0; }
var _t = class {
    _console = console;
    handleError(t) { this._console.error("ERROR", t); }
}, Rt = new M("", { factory: () => { let e = E(q), t = E(Ae), n; return r => { e.runOutsideAngular(() => { t.destroyed && !n ? setTimeout(() => { throw r; }) : (n ??= t.get(_t), n.handleError(r)); }); }; } }), Nu = { provide: ze, useValue: () => { let e = E(_t, { optional: !0 }); }, multi: !0 }, qN = new M("", { factory: () => { if (typeof ngServerMode < "u" && ngServerMode)
        return; let e = E(At).defaultView; if (!e)
        return; let t = E(Rt), n = i => { t(i.reason), i.preventDefault(); }, r = i => { i.error ? t(i.error) : t(new Error(i.message, { cause: i })), i.preventDefault(); }, o = () => { e.addEventListener("unhandledrejection", n), e.addEventListener("error", r); }; typeof Zone < "u" ? Zone.root.run(o) : o(), E(xe).onDestroy(() => { e.removeEventListener("error", r), e.removeEventListener("unhandledrejection", n); }); } });
function WN() { return Fe([Hl(() => { E(qN); })]); }
function zN(e) { return null; }
function yt(e, t) { let [n, r, o] = gl(e, t?.equal), i = n, s = i[Y]; return i.set = r, i.update = o, i.asReadonly = yr.bind(i), i; }
function yr() { let e = this[Y]; if (e.readonlyFn === void 0) {
    let t = () => this();
    t[Y] = e, e.readonlyFn = t;
} return e.readonlyFn; }
var Et = new M("", { factory: () => QN }), QN = "ng";
var Su = new M(""), ZN = new M("", { providedIn: "platform", factory: () => "unknown" }), YN = new M(""), KN = new M("", { factory: () => E(At).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce") || null }), Kg = { breakpoints: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840], placeholderResolution: 30, disableImageSizeWarning: !1, disableImageLazyLoadWarning: !1 }, JN = new M("", { factory: () => Kg });
function Jg(e) { return e; }
var xt = (() => { class e {
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => { let n = new e; return (typeof ngServerMode > "u" || !ngServerMode) && (n.store = _u(E(At), E(Et))), n; } });
    store = {};
    onSerializeCallbacks = {};
    get(n, r) { return this.store[n] !== void 0 ? this.store[n] : r; }
    set(n, r) { this.store[n] = r; }
    remove(n) { delete this.store[n]; }
    hasKey(n) { return this.store.hasOwnProperty(n); }
    get isEmpty() { return Object.keys(this.store).length === 0; }
    onSerialize(n, r) { this.onSerializeCallbacks[n] = r; }
    toJson() { for (let n in this.onSerializeCallbacks)
        if (this.onSerializeCallbacks.hasOwnProperty(n))
            try {
                this.store[n] = this.onSerializeCallbacks[n]();
            }
            catch (r) {
                console.warn("Exception in onSerialize callback: ", r);
            } return JSON.stringify(this.store).replace(/</g, "\\u003C").replace(/\//g, "\\u002F"); }
} return e; })();
function _u(e, t) { let n = e.getElementById(t + "-state"); if (n?.tagName === "SCRIPT" && n.textContent)
    try {
        return JSON.parse(n.textContent);
    }
    catch (r) {
        console.warn("Exception while restoring TransferState for app " + t, r);
    } return {}; }
function XN(e, t) { if (co() !== null)
    throw new D(-602, !1); }
var Er = (() => { class e {
    view;
    node;
    constructor(n, r) { this.view = n, this.node = r; }
    static __NG_ELEMENT_ID__ = eS;
} return e; })();
function eS() { return new Er(g(), _()); }
var qe = class {
}, Ir = new M("", { factory: () => !0 }), tS = new M("", { factory: () => !1 }), Hs = new M(""), Bs = (() => { class e {
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new Rl });
} return e; })(), Rl = class {
    dirtyEffectCount = 0;
    queues = new Map;
    add(t) { this.enqueue(t), this.schedule(t); }
    schedule(t) { t.dirty && this.dirtyEffectCount++; }
    remove(t) { let n = t.zone, r = this.queues.get(n); r.has(t) && (r.delete(t), t.dirty && this.dirtyEffectCount--); }
    enqueue(t) { let n = t.zone; this.queues.has(n) || this.queues.set(n, new Set); let r = this.queues.get(n); r.has(t) || r.add(t); }
    flush() { for (; this.dirtyEffectCount > 0;) {
        let t = !1;
        for (let [n, r] of this.queues)
            n === null ? t ||= this.flushQueue(r) : t ||= n.run(() => this.flushQueue(r));
        t || (this.dirtyEffectCount = 0);
    } }
    flushQueue(t) { let n = !1; for (let r of t)
        r.dirty && (this.dirtyEffectCount--, n = !0, r.run()); return n; }
}, Do = class {
    [Y];
    constructor(t) { this[Y] = t; }
    destroy() { this[Y].destroy(); }
};
function Us(e, t) { let n = t?.injector ?? E(ie), r = t?.manualCleanup !== !0 ? n.get(xe) : null, o, i = n.get(Er, null, { optional: !0 }), s = n.get(qe); return i !== null ? (o = oS(i.view, s, e), r instanceof gs && r._lView === i.view && (r = null)) : o = iS(e, n.get(Bs), s), o.injector = n, r !== null && (o.onDestroyFns = [r.onDestroy(() => o.destroy())]), new Do(o); }
var Xg = X(O({}, ml), { cleanupFns: void 0, zone: null, onDestroyFns: null, run() { let e = yo(!1); try {
        vl(this);
    }
    finally {
        yo(e);
    } }, cleanup() { if (!this.cleanupFns?.length)
        return; let e = C(null); try {
        for (; this.cleanupFns.length;)
            this.cleanupFns.pop()();
    }
    finally {
        this.cleanupFns = [], C(e);
    } } }), nS = X(O({}, Xg), { consumerMarkedDirty() { this.scheduler.schedule(this), this.notifier.notify(12); }, destroy() { if (Qt(this), this.onDestroyFns !== null)
        for (let e of this.onDestroyFns)
            e(); this.cleanup(), this.scheduler.remove(this); } }), rS = X(O({}, Xg), { consumerMarkedDirty() { this.view[N] |= 8192, An(this.view), this.notifier.notify(13); }, destroy() { if (Qt(this), this.onDestroyFns !== null)
        for (let e of this.onDestroyFns)
            e(); this.cleanup(), this.view[Kt]?.delete(this); } });
function oS(e, t, n) { let r = Object.create(rS); return r.view = e, r.zone = typeof Zone < "u" ? Zone.current : null, r.notifier = t, r.fn = em(r, n), e[Kt] ??= new Set, e[Kt].add(r), r.consumerMarkedDirty(r), r; }
function iS(e, t, n) { let r = Object.create(nS); return r.fn = em(r, e), r.scheduler = t, r.notifier = n, r.zone = typeof Zone < "u" ? Zone.current : null, r.scheduler.add(r), r.notifier.notify(12), r; }
function em(e, t) { return () => { t(n => (e.cleanupFns ??= []).push(n)); }; }
function Dr(e) { return typeof e == "function" && e[Y] !== void 0; }
function $s(e) { return Dr(e) && typeof e.set == "function"; }
var qo = (() => { class e {
    internalPendingTasks = E(vt);
    scheduler = E(qe);
    errorHandler = E(Rt);
    add() { let n = this.internalPendingTasks.add(); return () => { this.internalPendingTasks.has(n) && (this.scheduler.notify(11), this.internalPendingTasks.remove(n)); }; }
    run(n) { let r = this.add(); try {
        n().catch(this.errorHandler).finally(r);
    }
    catch (o) {
        this.errorHandler(o), r();
    } }
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new e });
} return e; })();
import { Subject as wv, Subscription as sS } from "rxjs";
import { map as aS } from "rxjs/operators";
var Tr = { JSACTION: "jsaction" };
function Dt(e) { return { toString: e }.toString(); }
var P = (function (e) { return e[e.TemplateCreateStart = 0] = "TemplateCreateStart", e[e.TemplateCreateEnd = 1] = "TemplateCreateEnd", e[e.TemplateUpdateStart = 2] = "TemplateUpdateStart", e[e.TemplateUpdateEnd = 3] = "TemplateUpdateEnd", e[e.LifecycleHookStart = 4] = "LifecycleHookStart", e[e.LifecycleHookEnd = 5] = "LifecycleHookEnd", e[e.OutputStart = 6] = "OutputStart", e[e.OutputEnd = 7] = "OutputEnd", e[e.BootstrapApplicationStart = 8] = "BootstrapApplicationStart", e[e.BootstrapApplicationEnd = 9] = "BootstrapApplicationEnd", e[e.BootstrapComponentStart = 10] = "BootstrapComponentStart", e[e.BootstrapComponentEnd = 11] = "BootstrapComponentEnd", e[e.ChangeDetectionStart = 12] = "ChangeDetectionStart", e[e.ChangeDetectionEnd = 13] = "ChangeDetectionEnd", e[e.ChangeDetectionSyncStart = 14] = "ChangeDetectionSyncStart", e[e.ChangeDetectionSyncEnd = 15] = "ChangeDetectionSyncEnd", e[e.AfterRenderHooksStart = 16] = "AfterRenderHooksStart", e[e.AfterRenderHooksEnd = 17] = "AfterRenderHooksEnd", e[e.ComponentStart = 18] = "ComponentStart", e[e.ComponentEnd = 19] = "ComponentEnd", e[e.DeferBlockStateStart = 20] = "DeferBlockStateStart", e[e.DeferBlockStateEnd = 21] = "DeferBlockStateEnd", e[e.DynamicComponentStart = 22] = "DynamicComponentStart", e[e.DynamicComponentEnd = 23] = "DynamicComponentEnd", e[e.HostBindingsUpdateStart = 24] = "HostBindingsUpdateStart", e[e.HostBindingsUpdateEnd = 25] = "HostBindingsUpdateEnd", e; })(P || {}), da = class {
    previousValue;
    currentValue;
    firstChange;
    constructor(t, n, r) { this.previousValue = t, this.currentValue = n, this.firstChange = r; }
    isFirstChange() { return this.firstChange; }
};
function Nv(e, t, n, r) { t !== null ? t.applyValueToInputSignal(t, r) : e[n] = r; }
var Sv = null, _v = (() => { Sv = tm; let e = () => tm; return e.ngInherit = !0, e; })();
function cS() { return Sv; }
function tm(e) { return e.type.prototype.ngOnChanges && (e.setInput = uS), lS; }
function lS() { let e = bv(this), t = e?.current; if (t) {
    let n = e.previous;
    if (n === bt)
        e.previous = t;
    else
        for (let r in t)
            n[r] = t[r];
    e.current = null, this.ngOnChanges(t);
} }
function uS(e, t, n, r, o) { let i = this.declaredInputs[r], s = bv(e) || dS(e, { previous: bt, current: null }), a = s.current || (s.current = {}), c = s.previous, l = c[i]; a[i] = new da(l && l.currentValue, n, c === bt), Nv(e, t, o, n); }
var Xu = "__ngSimpleChanges__";
function bv(e) { return Object.hasOwn(e, Xu) && e[Xu] || null; }
function dS(e, t) { return e[Xu] = t; }
var nm = [];
var B = function (e, t = null, n) { for (let r = 0; r < nm.length; r++) {
    let o = nm[r];
    o(e, t, n);
} };
function fS(e, t, n) { let { ngOnChanges: r, ngOnInit: o, ngDoCheck: i } = t.type.prototype; if (r) {
    let s = cS()(t);
    (n.preOrderHooks ??= []).push(e, s), (n.preOrderCheckHooks ??= []).push(e, s);
} o && (n.preOrderHooks ??= []).push(0 - e, o), i && ((n.preOrderHooks ??= []).push(e, i), (n.preOrderCheckHooks ??= []).push(e, i)); }
function Av(e, t) { for (let n = t.directiveStart, r = t.directiveEnd; n < r; n++) {
    let i = e.data[n].type.prototype, { ngAfterContentInit: s, ngAfterContentChecked: a, ngAfterViewInit: c, ngAfterViewChecked: l, ngOnDestroy: u } = i;
    s && (e.contentHooks ??= []).push(-n, s), a && ((e.contentHooks ??= []).push(n, a), (e.contentCheckHooks ??= []).push(n, a)), c && (e.viewHooks ??= []).push(-n, c), l && ((e.viewHooks ??= []).push(n, l), (e.viewCheckHooks ??= []).push(n, l)), u != null && (e.destroyHooks ??= []).push(n, u);
} }
function na(e, t, n) { Rv(e, t, 3, n); }
function ra(e, t, n, r) { (e[N] & 3) === n && Rv(e, t, n, r); }
function bu(e, t) { let n = e[N]; (n & 3) === t && (n &= 16383, n += 1, e[N] = n); }
function Rv(e, t, n, r) { let o = r !== void 0 ? e[Nn] & 65535 : 0, i = r ?? -1, s = t.length - 1, a = 0; for (let c = o; c < s; c++)
    if (typeof t[c + 1] == "number") {
        if (a = t[c], r != null && a >= r)
            break;
    }
    else
        t[c] < 0 && (e[Nn] += 65536), (a < i || i == -1) && (pS(e, n, t, c), e[Nn] = (e[Nn] & 4294901760) + c + 2), c++; }
function rm(e, t) { B(P.LifecycleHookStart, e, t); let n = C(null); try {
    t.call(e);
}
finally {
    C(n), B(P.LifecycleHookEnd, e, t);
} }
function pS(e, t, n, r) { let o = n[r] < 0, i = n[r + 1], s = o ? -n[r] : n[r], a = e[s]; o ? e[N] >> 14 < e[Nn] >> 16 && (e[N] & 3) === t && (e[N] += 16384, rm(a, i)) : rm(a, i); }
var br = -1, Fn = class {
    factory;
    name;
    injectImpl;
    resolving = !1;
    canSeeViewProviders;
    multi;
    componentProviders;
    index;
    providerFactory;
    constructor(t, n, r, o) { this.factory = t, this.name = o, this.canSeeViewProviders = n, this.injectImpl = r; }
};
function Ha(e) { return e != null && typeof e == "object" && (e.insertBeforeIndex === null || typeof e.insertBeforeIndex == "number" || Array.isArray(e.insertBeforeIndex)); }
function xv(e) { return !!(e.type & 128); }
function hS(e) { return (e.flags & 8) !== 0; }
function gS(e) { return (e.flags & 16) !== 0; }
function mS(e, t, n) { let r = 0; for (; r < n.length;) {
    let o = n[r];
    if (typeof o == "number") {
        if (o !== 0)
            break;
        r++;
        let i = n[r++], s = n[r++], a = n[r++];
        e.setAttribute(t, s, a, i);
    }
    else {
        let i = o, s = n[++r];
        vS(i) ? e.setProperty(t, i, s) : e.setAttribute(t, i, s), r++;
    }
} return r; }
function kv(e) { return e === 3 || e === 4 || e === 6; }
function vS(e) { return e.charCodeAt(0) === 64; }
function Or(e, t) { if (!(t === null || t.length === 0))
    if (e === null || e.length === 0)
        e = t.slice();
    else {
        let n = -1;
        for (let r = 0; r < t.length; r++) {
            let o = t[r];
            typeof o == "number" ? n = o : n === 0 || (n === -1 || n === 2 ? om(e, n, o, null, t[++r]) : om(e, n, o, null, null));
        }
    } return e; }
function om(e, t, n, r, o) { let i = 0, s = e.length; if (t === -1)
    s = -1;
else
    for (; i < e.length;) {
        let a = e[i++];
        if (typeof a == "number") {
            if (a === t) {
                s = -1;
                break;
            }
            else if (a > t) {
                s = i - 1;
                break;
            }
        }
    } for (; i < e.length;) {
    let a = e[i];
    if (typeof a == "number")
        break;
    if (a === n) {
        o !== null && (e[i + 1] = o);
        return;
    }
    i++, o !== null && i++;
} s !== -1 && (e.splice(s, 0, t), i = s + 1), e.splice(i++, 0, n), o !== null && e.splice(i++, 0, o); }
function Ov(e) { return e !== br; }
function fa(e) { return e & 32767; }
function yS(e) { return e >> 16; }
function pa(e, t) { let n = yS(e), r = t; for (; n > 0;)
    r = r[nn], n--; return r; }
var ed = !0;
function ha(e) { let t = ed; return ed = e, t; }
var ES = 256, Lv = ES - 1, Pv = 5, IS = 0, It = {};
function DS(e, t, n) { let r; typeof n == "string" ? r = n.charCodeAt(0) || 0 : n.hasOwnProperty(wn) && (r = n[wn]), r == null && (r = n[wn] = IS++); let o = r & Lv, i = 1 << o; t.data[e + (o >> Pv)] |= i; }
function ga(e, t) { let n = Fv(e, t); if (n !== -1)
    return n; let r = t[m]; r.firstCreatePass && (e.injectorIndex = t.length, Au(r.data, e), Au(t, null), Au(r.blueprint, null)); let o = af(e, t), i = e.injectorIndex; if (Ov(o)) {
    let s = fa(o), a = pa(o, t), c = a[m].data;
    for (let l = 0; l < 8; l++)
        t[i + l] = a[s + l] | c[s + l];
} return t[i + 8] = o, i; }
function Au(e, t) { e.push(0, 0, 0, 0, 0, 0, 0, 0, t); }
function Fv(e, t) { return e.injectorIndex === -1 || e.parent && e.parent.injectorIndex === e.injectorIndex || t[e.injectorIndex + 8] === null ? -1 : e.injectorIndex; }
function af(e, t) { if (e.parent && e.parent.injectorIndex !== -1)
    return e.parent.injectorIndex; let n = 0, r = null, o = t; for (; o !== null;) {
    if (r = $v(o), r === null)
        return br;
    if (n++, o = o[nn], r.injectorIndex !== -1)
        return r.injectorIndex | n << 16;
} return br; }
function td(e, t, n) { DS(e, t, n); }
function TS(e, t) { if (t === "class")
    return e.classes; if (t === "style")
    return e.styles; let n = e.attrs; if (n) {
    let r = n.length, o = 0;
    for (; o < r;) {
        let i = n[o];
        if (kv(i))
            break;
        if (i === 0)
            o = o + 2;
        else if (typeof i == "number")
            for (o++; o < r && typeof n[o] == "string";)
                o++;
        else {
            if (i === t)
                return n[o + 1];
            o = o + 2;
        }
    }
} return null; }
function jv(e, t, n) { if (n & 8 || e !== void 0)
    return e; Cs(t, "NodeInjector"); }
function Vv(e, t, n, r) { if (n & 8 && r === void 0 && (r = null), (n & 3) === 0) {
    let o = e[k], i = Me(void 0);
    try {
        return o ? o.get(t, r, n & 8) : Pl(t, r, n & 8);
    }
    finally {
        Me(i);
    }
} return jv(r, t, n); }
function Hv(e, t, n, r = 0, o) { if (e !== null) {
    if (t[N] & 2048 && !(r & 2)) {
        let s = NS(e, t, n, r, It);
        if (s !== It)
            return s;
    }
    let i = Bv(e, t, n, r, It);
    if (i !== It)
        return i;
} return Vv(t, n, r, o); }
function Bv(e, t, n, r, o) { let i = MS(n); if (typeof i == "function") {
    if (!gu(t, e, r))
        return r & 1 ? jv(o, n, r) : Vv(t, n, r, o);
    try {
        let s;
        if (s = i(r), s == null && !(r & 8))
            Cs(n);
        else
            return s;
    }
    finally {
        mu();
    }
}
else if (typeof i == "number") {
    let s = null, a = Fv(e, t), c = br, l = r & 1 ? t[se][le] : null;
    for ((a === -1 || r & 4) && (c = a === -1 ? af(e, t) : t[a + 8], c === br || !sm(r, !1) ? a = -1 : (s = t[m], a = fa(c), t = pa(c, t))); a !== -1;) {
        let u = t[m];
        if (im(i, a, u.data)) {
            let d = CS(a, t, n, s, r, l);
            if (d !== It)
                return d;
        }
        c = t[a + 8], c !== br && sm(r, t[m].data[a + 8] === l) && im(i, a, t) ? (s = u, a = fa(c), t = pa(c, t)) : a = -1;
    }
} return o; }
function CS(e, t, n, r, o, i) { let s = t[m], a = s.data[e + 8], c = r == null ? we(a) && ed : r != s && (a.type & 3) !== 0, l = o & 1 && i === a, u = oa(a, s, n, c, l); return u !== null ? li(t, s, u, a, o) : It; }
function oa(e, t, n, r, o) { let i = e.providerIndexes, s = t.data, a = i & 1048575, c = e.directiveStart, l = e.directiveEnd, u = i >> 20, d = r ? a : a + u, f = o ? a + u : l; for (let p = d; p < f; p++) {
    let h = s[p];
    if (p < c && n === h || p >= c && h.type === n)
        return p;
} if (o) {
    let p = s[c];
    if (p && Ye(p) && p.type === n)
        return c;
} return null; }
function li(e, t, n, r, o) { let i = e[n], s = t.data; if (i instanceof Fn) {
    let a = i;
    if (a.resolving)
        throw Ll("");
    let c = ha(a.canSeeViewProviders);
    a.resolving = !0;
    let l = s[n].type || s[n], u, d = a.injectImpl ? Me(a.injectImpl) : null, f = gu(e, r, 0);
    try {
        i = e[n] = a.factory(void 0, o, s, e, r), t.firstCreatePass && n >= r.directiveStart && fS(n, s[n], t);
    }
    finally {
        d !== null && Me(d), ha(c), a.resolving = !1, mu();
    }
} return i; }
function MS(e) { if (typeof e == "string")
    return e.charCodeAt(0) || 0; let t = e.hasOwnProperty(wn) ? e[wn] : void 0; return typeof t == "number" ? t >= 0 ? t & Lv : wS : t; }
function im(e, t, n) { let r = 1 << e; return !!(n[t + (e >> Pv)] & r); }
function sm(e, t) { return !(e & 2) && !(e & 1 && t); }
function cf(e) { return e._lView; }
function Ai(e) { return e._tNode; }
var Ne = class {
    _tNode;
    _lView;
    constructor(t, n) { this._tNode = t, this._lView = n; }
    get(t, n, r) { return Hv(this._tNode, this._lView, t, Tn(r), n); }
};
function wS() { return new Ne(_(), g()); }
function Uv(e) { return Dt(() => { let t = e.prototype.constructor, n = t[$e] || nd(t), r = Object.prototype, o = Object.getPrototypeOf(e.prototype).constructor; for (; o && o !== r;) {
    let i = o[$e] || nd(o);
    if (i && i !== n)
        return i;
    o = Object.getPrototypeOf(o);
} return i => new i; }); }
function nd(e) { return wo(e) ? () => { let t = nd(F(e)); return t && t(); } : Yt(e); }
function NS(e, t, n, r, o) { let i = e, s = t; for (; i !== null && s !== null && s[N] & 2048 && !st(s);) {
    let a = Bv(i, s, n, r | 2, It);
    if (a !== It)
        return a;
    let c = i.parent;
    if (!c) {
        let l = s[Gl];
        if (l) {
            let u = l.get(n, It, r & -5);
            if (u !== It)
                return u;
        }
        c = $v(s), s = s[nn];
    }
    i = c;
} return o; }
function $v(e) { let t = e[m], n = t.type; return n === 2 ? t.declTNode : n === 1 ? e[le] : null; }
function Ba(e) { return TS(_(), e); }
var SS = () => (typeof requestIdleCallback < "u" ? requestIdleCallback : e => setTimeout(e)).bind(globalThis), _S = () => (typeof requestIdleCallback < "u" ? cancelIdleCallback : clearTimeout).bind(globalThis), Ua = new M("", { factory: () => new rd });
function bS(e) { return Fe([{ provide: Ua, useExisting: e }]); }
var rd = class {
    requestIdleCallback = SS();
    cancelIdleCallback = _S();
    requestOnIdle(t, n) { return this.requestIdleCallback(t, n); }
    cancelOnIdle(t) { return this.cancelIdleCallback(t); }
}, Mr = "__annotations__", wr = "__parameters__", Nr = "__prop__metadata__";
function Ur(e, t, n, r, o) { return Dt(() => { let i = lf(t); function s(...a) { if (this instanceof s)
    return i.call(this, ...a), this; let c = new s(...a); return function (u) { return o && o(u, ...a), (u.hasOwnProperty(Mr) ? u[Mr] : Object.defineProperty(u, Mr, { value: [] })[Mr]).push(c), u; }; } return n && (s.prototype = Object.create(n.prototype)), s.prototype.ngMetadataName = e, s.annotationCls = s, s; }); }
function lf(e) { return function (...n) { if (e) {
    let r = e(...n);
    for (let o in r)
        this[o] = r[o];
} }; }
function $r(e, t, n) { return Dt(() => { let r = lf(t); function o(...i) { if (this instanceof o)
    return r.apply(this, i), this; let s = new o(...i); return a.annotation = s, a; function a(c, l, u) { let d = c.hasOwnProperty(wr) ? c[wr] : Object.defineProperty(c, wr, { value: [] })[wr]; for (; d.length <= u;)
    d.push(null); return (d[u] = d[u] || []).push(s), c; } } return o.prototype.ngMetadataName = e, o.annotationCls = o, o; }); }
function jt(e, t, n, r) { return Dt(() => { let o = lf(t); function i(...s) { if (this instanceof i)
    return o.apply(this, s), this; let a = new i(...s); function c(l, u) { if (l === void 0)
    throw new Error("Standard Angular field decorators are not supported in JIT mode."); let d = l.constructor, f = d.hasOwnProperty(Nr) ? d[Nr] : Object.defineProperty(d, Nr, { value: {} })[Nr]; f[u] = f.hasOwnProperty(u) && f[u] || [], f[u].unshift(a); } return c; } return n && (i.prototype = Object.create(n.prototype)), i.prototype.ngMetadataName = e, i.annotationCls = i, i; }); }
function ne(e) { let t = Pe.ng; if (t && t.\u0275compilerFacade)
    return t.\u0275compilerFacade; throw new Error("JIT compiler unavailable"); }
function Vt(e) { return { token: e.token, providedIn: e.autoProvided === !1 ? null : "root", factory: e.factory, value: void 0 }; }
var ma = { \u0275\u0275defineInjectable: K, \u0275\u0275defineInjector: No, \u0275\u0275defineService: Vt, \u0275\u0275inject: ge, \u0275\u0275invalidFactoryDep: Ms, resolveForwardRef: F }, Gv = Function;
function Gs(e) { return typeof e == "function"; }
var AS = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*(arguments|(?:[^()]+\(\[\],)?[^()]+\(arguments\).*)\)/, RS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{/, xS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(/, kS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(\)\s*{[^}]*super\(\.\.\.arguments\)/;
function OS(e) { return AS.test(e) || kS.test(e) || RS.test(e) && !xS.test(e); }
var va = class {
    _reflect;
    constructor(t) { this._reflect = t || Pe.Reflect; }
    factory(t) { return (...n) => new t(...n); }
    _zipTypesAndAnnotations(t, n) { let r; typeof t > "u" ? r = ko(n.length) : r = ko(t.length); for (let o = 0; o < r.length; o++)
        typeof t > "u" ? r[o] = [] : t[o] && t[o] != Object ? r[o] = [t[o]] : r[o] = [], n && n[o] != null && (r[o] = r[o].concat(n[o])); return r; }
    _ownParameters(t, n) { let r = t.toString(); if (OS(r))
        return null; if (t.parameters && t.parameters !== n.parameters)
        return t.parameters; let o = t.ctorParameters; if (o && o !== n.ctorParameters) {
        let a = typeof o == "function" ? o() : o, c = a.map(u => u && u.type), l = a.map(u => u && Ru(u.decorators));
        return this._zipTypesAndAnnotations(c, l);
    } let i = t.hasOwnProperty(wr) && t[wr], s = this._reflect && this._reflect.getOwnMetadata && this._reflect.getOwnMetadata("design:paramtypes", t); return s || i ? this._zipTypesAndAnnotations(s, i) : ko(t.length); }
    parameters(t) { if (!Gs(t))
        return []; let n = qs(t), r = this._ownParameters(t, n); return !r && n !== Object && (r = this.parameters(n)), r || []; }
    _ownAnnotations(t, n) { if (t.annotations && t.annotations !== n.annotations) {
        let r = t.annotations;
        return typeof r == "function" && r.annotations && (r = r.annotations), r;
    } return t.decorators && t.decorators !== n.decorators ? Ru(t.decorators) : t.hasOwnProperty(Mr) ? t[Mr] : null; }
    annotations(t) { if (!Gs(t))
        return []; let n = qs(t), r = this._ownAnnotations(t, n) || []; return (n !== Object ? this.annotations(n) : []).concat(r); }
    _ownPropMetadata(t, n) { if (t.propMetadata && t.propMetadata !== n.propMetadata) {
        let r = t.propMetadata;
        return typeof r == "function" && r.propMetadata && (r = r.propMetadata), r;
    } if (t.propDecorators && t.propDecorators !== n.propDecorators) {
        let r = t.propDecorators, o = {};
        return Object.keys(r).forEach(i => { o[i] = Ru(r[i]); }), o;
    } return t.hasOwnProperty(Nr) ? t[Nr] : null; }
    propMetadata(t) { if (!Gs(t))
        return {}; let n = qs(t), r = {}; if (n !== Object) {
        let i = this.propMetadata(n);
        Object.keys(i).forEach(s => { r[s] = i[s]; });
    } let o = this._ownPropMetadata(t, n); return o && Object.keys(o).forEach(i => { let s = []; r.hasOwnProperty(i) && s.push(...r[i]), s.push(...o[i]), r[i] = s; }), r; }
    ownPropMetadata(t) { return Gs(t) ? this._ownPropMetadata(t, qs(t)) || {} : {}; }
    hasLifecycleHook(t, n) { return t instanceof Gv && n in t.prototype; }
};
function Ru(e) { return e ? e.map(t => { let r = t.type.annotationCls, o = t.args ? t.args : []; return new r(...o); }) : []; }
function qs(e) { let t = e.prototype ? Object.getPrototypeOf(e.prototype) : null; return (t ? t.constructor : null) || Object; }
var qv = ur($r("Inject", e => ({ token: e })), -1), Wv = ur($r("Optional"), 8), zv = ur($r("Self"), 2), Qv = ur($r("SkipSelf"), 4), Zv = ur($r("Host"), 1), Yv = $r("Attribute", e => ({ attributeName: e, __NG_ELEMENT_ID__: () => Ba(e) })), am = null;
function uf() { return am = am || new va; }
function Ri(e) { return Kv(uf().parameters(e)); }
function Kv(e) { return e.map(t => LS(t)); }
function LS(e) { let t = { token: null, attribute: null, host: !1, optional: !1, self: !1, skipSelf: !1 }; if (Array.isArray(e) && e.length > 0)
    for (let n = 0; n < e.length; n++) {
        let r = e[n];
        if (r === void 0)
            continue;
        let o = Object.getPrototypeOf(r);
        if (r instanceof Wv || o.ngMetadataName === "Optional")
            t.optional = !0;
        else if (r instanceof Qv || o.ngMetadataName === "SkipSelf")
            t.skipSelf = !0;
        else if (r instanceof zv || o.ngMetadataName === "Self")
            t.self = !0;
        else if (r instanceof Zv || o.ngMetadataName === "Host")
            t.host = !0;
        else if (r instanceof qv)
            t.token = r.token;
        else if (r instanceof Yv) {
            if (r.attributeName === void 0)
                throw new D(-204, !1);
            t.attribute = r.attributeName;
        }
        else
            t.token = r;
    }
else
    e === void 0 || Array.isArray(e) && e.length === 0 ? t.token = null : t.token = e; return t; }
function PS(e, t) { let n = null, r = null; e.hasOwnProperty(Xt) || Object.defineProperty(e, Xt, { get: () => (n === null && (n = ne({ usage: 0, kind: "injectable", type: e }).compileInjectable(ma, `ng:///${e.name}/\u0275prov.js`, HS(e, t))), n) }), e.hasOwnProperty($e) || Object.defineProperty(e, $e, { get: () => { if (r === null) {
        let o = ne({ usage: 0, kind: "injectable", type: e });
        r = o.compileFactory(ma, `ng:///${e.name}/\u0275fac.js`, { name: e.name, type: e, typeArgumentCount: 0, deps: Ri(e), target: o.FactoryTarget.Injectable });
    } return r; }, configurable: !0 }); }
var FS = H({ provide: String, useValue: H });
function cm(e) { return e.useClass !== void 0; }
function jS(e) { return FS in e; }
function lm(e) { return e.useFactory !== void 0; }
function VS(e) { return e.useExisting !== void 0; }
function HS(e, t) { let n = t || { providedIn: null }, r = { name: e.name, type: e, typeArgumentCount: 0, providedIn: n.providedIn }; return (cm(n) || lm(n)) && n.deps !== void 0 && (r.deps = Kv(n.deps)), cm(n) ? r.useClass = n.useClass : jS(n) ? r.useValue = n.useValue : lm(n) ? r.useFactory = n.useFactory : VS(n) && (r.useExisting = n.useExisting), r; }
var BS = Ur("Injectable", void 0, void 0, void 0, (e, t) => PS(e, t));
function US(e, t) { let n = null, r = null; e.hasOwnProperty(Xt) || Object.defineProperty(e, Xt, { get: () => (n === null && (n = ne({ usage: 0, kind: "service", type: e }).compileService(ma, `ng:///${e.name}/\u0275prov.js`, $S(e, t))), n) }), e.hasOwnProperty($e) || Object.defineProperty(e, $e, { get: () => { if (r === null) {
        let o = ne({ usage: 0, kind: "service", type: e });
        r = o.compileFactory(ma, `ng:///${e.name}/\u0275fac.js`, { name: e.name, type: e, typeArgumentCount: 0, deps: Ri(e), target: o.FactoryTarget.Service });
    } return r; }, configurable: !0 }); }
function $S(e, t) { return { name: e.name, type: e, typeArgumentCount: 0, autoProvided: t?.autoProvided, factory: t?.factory }; }
var GS = Ur("Service", void 0, void 0, void 0, (e, t) => US(e, t));
function qS() { return Gr(_(), g()); }
function Gr(e, t) { return new xi(ae(e, t)); }
var xi = (() => { class e {
    nativeElement;
    constructor(n) { this.nativeElement = n; }
    static __NG_ELEMENT_ID__ = qS;
} return e; })();
function Jv(e) { return e instanceof xi ? e.nativeElement : e; }
function WS() { return this._results[Symbol.iterator](); }
var ya = class {
    _emitDistinctChangesOnly;
    dirty = !0;
    _onDirty = void 0;
    _results = [];
    _changesDetected = !1;
    _changes = void 0;
    length = 0;
    first = void 0;
    last = void 0;
    get changes() { return this._changes ??= new wv; }
    constructor(t = !1) { this._emitDistinctChangesOnly = t; }
    get(t) { return this._results[t]; }
    map(t) { return this._results.map(t); }
    filter(t) { return this._results.filter(t); }
    find(t) { return this._results.find(t); }
    reduce(t, n) { return this._results.reduce(t, n); }
    forEach(t) { this._results.forEach(t); }
    some(t) { return this._results.some(t); }
    toArray() { return this._results.slice(); }
    toString() { return this._results.toString(); }
    reset(t, n) { this.dirty = !1; let r = ot(t); (this._changesDetected = !wg(this._results, r, n)) && (this._results = r, this.length = r.length, this.last = r[this.length - 1], this.first = r[0]); }
    notifyOnChanges() { this._changes !== void 0 && (this._changesDetected || !this._emitDistinctChangesOnly) && this._changes.next(this); }
    onDirty(t) { this._onDirty = t; }
    setDirty() { this.dirty = !0, this._onDirty?.(); }
    destroy() { this._changes !== void 0 && (this._changes.complete(), this._changes.unsubscribe()); }
    [Symbol.iterator] = WS;
}, Zn = "ngSkipHydration", zS = "ngskiphydration";
function df(e) { let t = e.mergedAttrs; if (t === null)
    return !1; for (let n = 0; n < t.length; n += 2) {
    let r = t[n];
    if (typeof r == "number")
        return !1;
    if (typeof r == "string" && r.toLowerCase() === zS)
        return !0;
} return !1; }
function Xv(e) { return e.hasAttribute(Zn); }
function ui(e) { return (e.flags & 128) === 128; }
function qr(e) { if (ui(e))
    return !0; let t = e.parent; for (; t;) {
    if (ui(e) || df(t))
        return !0;
    t = t.parent;
} return !1; }
function ey(e) { return ui(e) || df(e) || qr(e); }
var $a = (function (e) { return e[e.OnPush = 0] = "OnPush", e[e.Eager = 1] = "Eager", e[e.Default = 1] = "Default", e; })($a || {}), Ga = new Map, QS = 0;
function ZS() { return QS++; }
function YS(e) { Ga.set(e[je], e); }
function ty(e) { return Ga.get(e) || null; }
function od(e) { Ga.delete(e[je]); }
function KS() { return Ga; }
var Ea = class {
    lViewId;
    nodeIndex;
    native;
    component;
    directives;
    localRefs;
    get lView() { return ty(this.lViewId); }
    constructor(t, n, r) { this.lViewId = t, this.nodeIndex = n, this.native = r; }
};
function Se(e) { let t = ia(e); if (t) {
    if (ee(t)) {
        let n = t, r, o, i;
        if (ny(e)) {
            if (r = t_(n, e), r == -1)
                throw new Error("The provided component was not found in the application");
            o = e;
        }
        else if (XS(e)) {
            if (r = n_(n, e), r == -1)
                throw new Error("The provided directive was not found in the application");
            i = ry(r, n);
        }
        else if (r = dm(n, e), r == -1)
            return null;
        let s = L(n[r]), a = ia(s), c = a && !Array.isArray(a) ? a : um(n, r, s);
        if (o && c.component === void 0 && (c.component = o, Ke(c.component, c)), i && c.directives === void 0) {
            c.directives = i;
            for (let l = 0; l < i.length; l++)
                Ke(i[l], c);
        }
        Ke(c.native, c), t = c;
    }
}
else {
    let n = e, r = n;
    for (; r = r.parentNode;) {
        let o = ia(r);
        if (o) {
            let i = Array.isArray(o) ? o : o.lView;
            if (!i)
                return null;
            let s = dm(i, n);
            if (s >= 0) {
                let a = L(i[s]), c = um(i, s, a);
                Ke(a, c), t = c;
                break;
            }
        }
    }
} return t || null; }
function um(e, t, n) { return new Ea(e[je], t, n); }
var id = "__ngContext__";
function Ke(e, t) { ee(t) ? (e[id] = t[je], YS(t)) : e[id] = t; }
function ia(e) { let t = e[id]; return typeof t == "number" ? ty(t) : t || null; }
function JS(e) { let t = ia(e); return t ? ee(t) ? t : t.lView : null; }
function ny(e) { return e && e.constructor && e.constructor.\u0275cmp; }
function XS(e) { return e && e.constructor && e.constructor.\u0275dir; }
function dm(e, t) { let n = e[m]; for (let r = I; r < n.bindingStartIndex; r++)
    if (L(e[r]) === t)
        return r; return -1; }
function e_(e) { if (e.child)
    return e.child; if (e.next)
    return e.next; for (; e.parent && !e.parent.next;)
    e = e.parent; return e.parent && e.parent.next; }
function t_(e, t) { let n = e[m].components; if (n)
    for (let r = 0; r < n.length; r++) {
        let o = n[r];
        if (ve(o, e)[V] === t)
            return o;
    }
else if (ve(I, e)[V] === t)
    return I; return -1; }
function n_(e, t) { let n = e[m].firstChild; for (; n;) {
    let r = n.directiveStart, o = n.directiveEnd;
    for (let i = r; i < o; i++)
        if (e[i] === t)
            return n.index;
    n = e_(n);
} return -1; }
function ry(e, t) { let n = t[m].data[e]; if (n.directiveStart === 0)
    return j; let r = []; for (let o = n.directiveStart; o < n.directiveEnd; o++) {
    let i = t[o];
    ny(i) || r.push(i);
} return r; }
function r_(e, t) { let n = t[m].data[e]; return we(n) ? t[n.directiveStart + n.componentOffset] : null; }
function o_(e, t) { let n = e[m].data[t]; if (n && n.localNames) {
    let r = {}, o = n.index + 1;
    for (let i = 0; i < n.localNames.length; i += 2)
        r[n.localNames[i]] = e[o], o++;
    return r;
} return null; }
function oy(e) { return sy(e[tn]); }
function iy(e) { return sy(e[me]); }
function sy(e) { for (; e !== null && !J(e);)
    e = e[me]; return e; }
function* i_(e, t) { let n = e.child; for (; n;)
    yield [n, t], n = n.next; if (e.componentOffset > -1) {
    let o = ve(e.index, t);
    if (ee(o)) {
        let s = o[m].firstChild;
        for (; s;)
            yield [s, o], s = s.next;
    }
} let r = t[e.index]; if (J(r))
    for (let o = G; o < r.length; o++) {
        let i = r[o], a = i[m].firstChild;
        for (; a;)
            yield [a, i], a = a.next;
    } }
function* s_(e) { let n = e[m].firstChild; for (; n;)
    yield* ul(ay(n, e)), n = n.next; }
function* ay(e, t) { yield [e, t]; for (let [n, r] of i_(e, t))
    yield* ul(ay(n, r)); }
function* ff(e) { for (let [t, n] of s_(e))
    t.directiveEnd > t.directiveStart && (yield [t, n]); }
function fm(e) { let t = Se(e); if (t === null)
    return null; if (t.component === void 0) {
    let n = t.lView;
    if (n === null)
        return null;
    t.component = r_(t.nodeIndex, n);
} return t.component; }
function a_(e) { m_(e); let t = Se(e), n = t ? t.lView : null; return n === null ? null : n[V]; }
function c_(e) { let t = Se(e), n = t ? t.lView : null; if (n === null)
    return null; let r; for (; n[m].type === 2 && (r = Ge(n));)
    n = r; return st(n) ? null : n[V]; }
function pf(e) { let t = Se(e), n = t ? t.lView : null; if (n === null)
    return ie.NULL; let r = n[m].data[t.nodeIndex]; return new Ne(r, n); }
function l_(e) { let t = Se(e), n = t ? t.lView : null; if (n === null)
    return []; let r = n[m], o = r.data[t.nodeIndex], i = [], s = o.providerIndexes & 1048575, a = o.directiveEnd; for (let c = s; c < a; c++) {
    let l = r.data[c];
    g_(l) && (l = l.type), i.push(l);
} return i; }
function u_(e) { if (e instanceof Text)
    return []; let t = Se(e), n = t ? t.lView : null; if (n === null)
    return []; let r = n[m], o = t.nodeIndex; return r?.data[o] ? (t.directives === void 0 && (t.directives = ry(o, n)), t.directives === null ? [] : [...t.directives]) : []; }
var cy = (function (e) { return e[e.Default = 0] = "Default", e[e.OnPush = 1] = "OnPush", e; })(cy || {}), ly = (function (e) { return e[e.Emulated = 0] = "Emulated", e[e.None = 1] = "None", e; })(ly || {});
function d_(e) { let t = Se(e); if (t === null)
    return {}; if (t.localRefs === void 0) {
    let n = t.lView;
    if (n === null)
        return {};
    t.localRefs = o_(n, t.nodeIndex);
} return t.localRefs || {}; }
function f_(e) { return Se(e).native; }
function p_(e) { let t = Se(e), n = t === null ? null : t.lView; if (n === null)
    return []; let r = n[m], o = n[en], i = r.cleanup, s = []; if (i && o)
    for (let a = 0; a < i.length;) {
        let c = i[a++], l = i[a++];
        if (typeof c == "string") {
            let u = c, d = L(n[l]), f = o[i[a++]], p = i[a++], h = typeof p == "boolean" || p >= 0 ? "dom" : "output", v = typeof p == "boolean" ? p : !1;
            e == d && s.push({ element: e, name: u, callback: f, useCapture: v, type: h });
        }
    } return s.sort(h_), s; }
function h_(e, t) { return e.name == t.name ? 0 : e.name < t.name ? -1 : 1; }
function g_(e) { return e.type !== void 0 && e.declaredInputs !== void 0 && e.resolveHostDirectives !== void 0; }
function m_(e) { if (typeof Element < "u" && !(e instanceof Element))
    throw new Error("Expecting instance of DOM Element"); }
var sd;
function v_(e) { sd = e; }
function ki() { if (sd !== void 0)
    return sd; if (typeof document < "u")
    return document; throw new D(210, !1); }
var hf = "h", gf = "b", uy = "f", dy = "n", Oi = "e", qa = "t", Wr = "c", Li = "x", Pt = "r", Wa = "i", Pi = "n", zr = "d", za = "l", Qa = "di", Fi = "s", mf = "p", ji = "t", Yn = new M(""), fy = !1, vf = new M("", { factory: () => fy }), yf = new M(""), Za = new M(""), Ef = !1, py = new M("", { factory: () => [] }), If = new M(""), Vi = new M("", { factory: () => new Map }), y_ = new M(""), Ia = { passive: !0, capture: !0 }, xu = new WeakMap, ku = new WeakMap, ln = new WeakMap, Da = ["click", "keydown"], Ta = ["mouseenter", "mouseover", "focusin"], Ws = new Map, di = class {
    callbacks = new Set;
    listener = () => { for (let t of this.callbacks)
        t(); };
};
function hy(e, t) { let n = ku.get(e); if (!n) {
    n = new di, ku.set(e, n);
    for (let r of Da)
        e.addEventListener(r, n.listener, Ia);
} return n.callbacks.add(t), () => { let { callbacks: r, listener: o } = n; if (r.delete(t), r.size === 0) {
    ku.delete(e);
    for (let i of Da)
        e.removeEventListener(i, o, Ia);
} }; }
function gy(e, t) { let n = xu.get(e); if (!n) {
    n = new di, xu.set(e, n);
    for (let r of Ta)
        e.addEventListener(r, n.listener, Ia);
} return n.callbacks.add(t), () => { let { callbacks: r, listener: o } = n; if (r.delete(t), r.size === 0) {
    for (let i of Ta)
        e.removeEventListener(i, o, Ia);
    xu.delete(e);
} }; }
function E_(e) { let t = my(e); return new IntersectionObserver(n => { for (let r of n)
    r.isIntersecting && ln.has(r.target) && ln.get(r.target)?.get(t)?.listener(); }, e); }
function I_(e, t, n, r) { let o = my(r), i = ln.get(e)?.get(o); Ws.has(o) || Ws.set(o, { observer: n(r), count: 0 }); let s = Ws.get(o); if (!i) {
    i = new di, s.observer.observe(e);
    let a = ln.get(e);
    a ? a.set(o, i) : (a = new Map, ln.set(e, a)), a.set(o, i), s.count++;
} return i.callbacks.add(t), () => { if (ln.get(e)?.has(o)) {
    if (i.callbacks.delete(t), i.callbacks.size === 0) {
        s.observer.unobserve(e), s.count--;
        let a = ln.get(e);
        a && (a.delete(o), a.size === 0 && ln.delete(e));
    }
    s.count === 0 && (s.observer.disconnect(), Ws.delete(o));
} }; }
function my(e) {
    return e ? `${e.rootMargin}/${typeof e.threshold == "number" ? e.threshold : e.threshold?.join(`
`)}` : "";
}
var Qr = "ngb";
function Df(e, t, n = null) { if (t.length === 0 || e.nodeType !== Node.ELEMENT_NODE)
    return; let r = e.getAttribute(Tr.JSACTION), o = t.reduce((s, a) => (r?.indexOf(a) ?? -1) === -1 ? s + a + ":;" : s, ""); e.setAttribute(Tr.JSACTION, `${r ?? ""}${o}`); let i = n ?? ""; i !== "" && o.length > 0 && e.setAttribute(Qr, i); }
var vy = (e, t, n) => { let r = e, o = r.__jsaction_fns ?? new Map, i = o.get(t) ?? []; i.push(n), o.set(t, i), r.__jsaction_fns = o; }, Tf = (e, t) => { let n = e, r = n.getAttribute(Qr) ?? "", o = t.get(r) ?? new Set; o.has(n) || o.add(n), t.set(r, o); };
function D_(e, t) { if (e.length > 0) {
    let n = [];
    for (let o of e)
        t.has(o) && (n = [...n, ...t.get(o)]);
    new Set(n).forEach(Cf);
} }
var Cf = e => { e.removeAttribute(Tr.JSACTION), e.removeAttribute(Qr), e.__jsaction_fns = void 0; }, Mf = new M("", { factory: () => ({}) }), ad = new WeakMap;
function T_(e, t) { if (e == null || typeof e != "object")
    return; let n = ad.get(e); n || (n = new WeakSet, ad.set(e, n)), n.add(t); }
function wf(e, t) { let n = t?.__jsaction_fns?.get(e.type); if (!(!n || !t?.isConnected) && !(t && ad.get(e)?.has(t)))
    for (let r of n)
        r(e); }
var cd = new Map;
function yy(e, t) { return cd.set(e, t), () => cd.delete(e); }
var pm = !1, Ey = (e, t, n, r) => { };
function C_(e, t, n, r) { Ey(e, t, n, r); }
function Iy() { pm || (Ey = (e, t, n, r) => { let o = e[k].get(Et); cd.get(o)?.(t, n, r); }, pm = !0); }
var Ht = new M(""), M_ = (() => { class e {
    registry = new Map;
    cleanupFns = new Map;
    jsActionMap = E(Vi);
    contract = E(Mf);
    add(n, r) { if (this.registry.set(n, r), this.awaitingCallbacks.has(n)) {
        let o = this.awaitingCallbacks.get(n);
        for (let i of o)
            i();
    } }
    get(n) { return this.registry.get(n) ?? null; }
    has(n) { return this.registry.has(n); }
    cleanup(n) { D_(n, this.jsActionMap); for (let r of n)
        this.registry.delete(r), this.jsActionMap.delete(r), this.invokeTriggerCleanupFns(r), this.hydrating.delete(r), this.awaitingCallbacks.delete(r); this.size === 0 && this.contract.instance?.cleanUp(); }
    get size() { return this.registry.size; }
    addCleanupFn(n, r) { let o = []; this.cleanupFns.has(n) && (o = this.cleanupFns.get(n)), o.push(r), this.cleanupFns.set(n, o); }
    invokeTriggerCleanupFns(n) { let r = this.cleanupFns.get(n) ?? []; for (let o of r)
        o(); this.cleanupFns.delete(n); }
    hydrating = new Map;
    awaitingCallbacks = new Map;
    awaitParentBlock(n, r) { let o = this.awaitingCallbacks.get(n) ?? []; o.push(r), this.awaitingCallbacks.set(n, o); }
    static \u0275prov = K({ token: e, providedIn: null, factory: () => new e });
} return e; })();
function Zr(e) { return (e.flags & 32) === 32; }
var Dy = "__nghData__", Ya = Dy, Ty = "__nghDeferData__", Ka = Ty;
function w_(e) { return e === Dy || e === Ty; }
var Ar = "ngh", Cy = "nghm", My = () => null;
function N_(e, t, n = !1) { let r = e.getAttribute(Ar); if (r == null)
    return null; let [o, i] = r.split("|"); if (r = n ? i : o, !r)
    return null; let s = i ? `|${i}` : "", a = n ? o : s, c = {}; if (r !== "") {
    let u = t.get(xt, null, { optional: !0 });
    u !== null && (c = u.get(Ya, [])[Number(r)]);
} let l = { data: c, firstChild: e.firstChild ?? null }; return n && (l.firstChild = e, Ja(l, 0, e.nextSibling)), a ? e.setAttribute(Ar, a) : e.removeAttribute(Ar), l; }
function wy() { My = N_; }
function Ny(e, t, n = !1) { return My(e, t, n); }
function Nf(e) { let t = e._lView; return t[m].type === 2 ? null : (st(t) && (t = t[I]), t); }
function S_(e) { return e.textContent?.replace(/\s/gm, ""); }
function __(e) { let t = ki(), n = t.createNodeIterator(e, NodeFilter.SHOW_COMMENT, { acceptNode(i) { let s = S_(i); return s === "ngetn" || s === "ngtns" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } }), r, o = []; for (; r = n.nextNode();)
    o.push(r); for (let i of o)
    i.textContent === "ngetn" ? i.replaceWith(t.createTextNode("")) : i.remove(); }
var Sy = (function (e) { return e.Hydrated = "hydrated", e.Skipped = "skipped", e.Mismatched = "mismatched", e; })(Sy || {}), b_ = "__ngDebugHydrationInfo__";
function A_(e) { return e[b_] ?? null; }
function Ja(e, t, n) { e.segmentHeads ??= {}, e.segmentHeads[t] = n; }
function ld(e, t) { return e.segmentHeads?.[t] ?? null; }
function Hi(e) { return e.get(If, !1, { optional: !0 }); }
var R_ = !1;
function x_() { R_ = !1; }
function _y(e, t) { let n = e.data, r = n[Oi]?.[t] ?? null; return r === null && n[Wr]?.[t] && (r = Sf(e, t)), r; }
function k_(e, t) { return e.data[Oi]?.[t] !== void 0; }
function by(e, t) { return e.data[Wr]?.[t] ?? null; }
function Sf(e, t) { let n = by(e, t) ?? [], r = 0; for (let o of n)
    r += o[Pt] * (o[Li] ?? 1); return r; }
function Ay(e) { if (typeof e.disconnectedNodes > "u") {
    let t = e.data[zr];
    e.disconnectedNodes = t ? new Set(t) : null;
} return e.disconnectedNodes; }
function Xa(e, t) { if (typeof e.disconnectedNodes > "u") {
    let n = e.data[zr];
    e.disconnectedNodes = n ? new Set(n) : null;
} return !!Ay(e)?.has(t); }
function ec(e, t) { let n = e[pe]; return n !== null && !Uo() && !Zr(t) && !Xa(n, t.index - I); }
function _f(e, t) { let n = t, r = e.corruptedTextNodes; n.textContent === "" ? r.set(n, "ngetn") : n.nextSibling?.nodeType === Node.TEXT_NODE && r.set(n, "ngtns"); }
function Ry(e) { let t = []; return e !== null && (e.has(4) && t.push(...Ta), e.has(3) && t.push(...Da)), t; }
function O_(e, t) { let n = t.get(Ht), o = t.get(xt).get(Ka, {}), i = !1, s = e, a = null, c = []; for (; !i && s;) {
    i = n.has(s);
    let l = n.hydrating.get(s);
    if (a === null && l != null) {
        a = l.promise;
        break;
    }
    c.unshift(s), s = o[s][mf];
} return { parentBlockPromise: a, hydrationQueue: c }; }
function L_(e) { let t = e.body.querySelectorAll("[jsaction]"), n = new Set, r = [Ta.join(":;"), Da.join(":;")].join("|"); for (let o of t) {
    let i = o.getAttribute("jsaction"), s = o.getAttribute("ngb");
    i?.match(r) && s !== null && n.add(o);
} return n; }
function P_(e, t) { let n = L_(e), r = t.get(Vi); for (let o of n)
    Tf(o, r); }
var xy = () => ({});
function F_(e) { let t = e.get(xt, null, { optional: !0 }); return t !== null ? t.get(Ka, {}) : {}; }
function j_() { xy = F_; }
function V_(e) { return xy(e); }
function H_(e) { return typeof e == "object" && e.trigger === 5; }
function B_(e) { return e[ji]?.find(n => H_(n))?.delay ?? null; }
function U_(e) { let t = e[ji]; if (t)
    for (let n of t) {
        if (n === 2)
            return !0;
        if (typeof n == "object" && n.trigger === 2)
            return n.intersectionObserverOptions || !0;
    } return null; }
function hm(e, t) { return e[ji]?.includes(t) ?? !1; }
function $_(e) { return { data: e, hydrate: { idle: hm(e, 0), immediate: hm(e, 1), timer: B_(e), viewport: U_(e) } }; }
function G_(e) { let t = V_(e), n = new Map; for (let r in t)
    n.set(r, $_(t[r])); return n; }
function Ou(e) { return !!e && e.nodeType === Node.COMMENT_NODE && e.textContent?.trim() === Cy; }
function gm(e) { for (; e && e.nodeType === Node.TEXT_NODE;)
    e = e.previousSibling; return e; }
function ky(e) { for (let r of e.body.childNodes)
    if (Ou(r))
        return; let t = gm(e.body.previousSibling); if (Ou(t))
    return; let n = gm(e.head.lastChild); if (!Ou(n))
    throw new D(-507, !1); }
function Oy(e, t) { let n = e.contentQueries; if (n !== null) {
    let r = C(null);
    try {
        for (let o = 0; o < n.length; o += 2) {
            let i = n[o], s = n[o + 1];
            if (s !== -1) {
                let a = e.data[s];
                $o(i), a.contentQueries(2, t[s], s);
            }
        }
    }
    finally {
        C(r);
    }
} }
function ud(e, t, n) { $o(0); let r = C(null); try {
    t(e, n);
}
finally {
    C(r);
} }
function bf(e, t, n) { if (Wl(t)) {
    let r = C(null);
    try {
        let o = t.directiveStart, i = t.directiveEnd;
        for (let s = o; s < i; s++) {
            let a = e.data[s];
            if (a.contentQueries) {
                let c = n[s];
                a.contentQueries(1, c, s);
            }
        }
    }
    finally {
        C(r);
    }
} }
var Je = (function (e) { return e[e.Emulated = 0] = "Emulated", e[e.None = 2] = "None", e[e.ShadowDom = 3] = "ShadowDom", e[e.ExperimentalIsolatedShadowDom = 4] = "ExperimentalIsolatedShadowDom", e; })(Je || {}), q_ = { name: "custom-elements" }, W_ = { name: "no-errors-schema" }, Ly = !1;
function z_(e) { Ly = e; }
function Q_() { return Ly; }
var Py = !1;
function Z_(e) { Py = e; }
function Y_() { return Py; }
var zs;
function Fy() { if (zs === void 0 && (zs = null, Pe.trustedTypes))
    try {
        zs = Pe.trustedTypes.createPolicy("angular", { createHTML: e => e, createScript: e => e, createScriptURL: e => e });
    }
    catch { } return zs; }
function Yr(e) { return Fy()?.createHTML(e) || e; }
function K_(e) { return Fy()?.createScriptURL(e) || e; }
var Qs;
function Af() { if (Qs === void 0 && (Qs = null, Pe.trustedTypes))
    try {
        Qs = Pe.trustedTypes.createPolicy("angular#unsafe-bypass", { createHTML: e => e, createScript: e => e, createScriptURL: e => e });
    }
    catch { } return Qs; }
function mm(e) { return Af()?.createHTML(e) || e; }
function vm(e) { return Af()?.createScript(e) || e; }
function ym(e) { return Af()?.createScriptURL(e) || e; }
var Ft = class {
    changingThisBreaksApplicationSecurity;
    constructor(t) { this.changingThisBreaksApplicationSecurity = t; }
    toString() { return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${ys})`; }
}, dd = class extends Ft {
    getTypeName() { return "HTML"; }
}, fd = class extends Ft {
    getTypeName() { return "Style"; }
}, pd = class extends Ft {
    getTypeName() { return "Script"; }
}, hd = class extends Ft {
    getTypeName() { return "URL"; }
}, gd = class extends Ft {
    getTypeName() { return "ResourceURL"; }
};
function Bt(e) { return e instanceof Ft ? e.changingThisBreaksApplicationSecurity : e; }
function Kr(e, t) { let n = jy(e); if (n != null && n !== t) {
    if (n === "ResourceURL" && t === "URL")
        return !0;
    throw new Error(`Required a safe ${t}, got a ${n} (see ${ys})`);
} return n === t; }
function jy(e) { return e instanceof Ft && e.getTypeName() || null; }
function J_(e) { return new dd(e); }
function X_(e) { return new fd(e); }
function eb(e) { return new pd(e); }
function tb(e) { return new hd(e); }
function nb(e) { return new gd(e); }
function Vy(e) { let t = new vd(e); return rb() ? new md(t) : t; }
var md = class {
    inertDocumentHelper;
    constructor(t) { this.inertDocumentHelper = t; }
    getInertBodyElement(t) { t = "<body><remove></remove>" + t; try {
        let n = new window.DOMParser().parseFromString(Yr(t), "text/html").body;
        return n === null ? this.inertDocumentHelper.getInertBodyElement(t) : (n.firstChild?.remove(), n);
    }
    catch {
        return null;
    } }
}, vd = class {
    defaultDoc;
    inertDocument;
    constructor(t) { this.defaultDoc = t, this.inertDocument = this.defaultDoc.implementation.createHTMLDocument("sanitization-inert"); }
    getInertBodyElement(t) { let n = this.inertDocument.createElement("template"); return n.innerHTML = Yr(t), n; }
};
function rb() { try {
    return !!new window.DOMParser().parseFromString(Yr(""), "text/html");
}
catch {
    return !1;
} }
var ob = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
function tc(e) { return e = String(e), e.match(ob) ? e : "unsafe:" + e; }
function Ut(e) { let t = {}; for (let n of e.split(","))
    t[n] = !0; return t; }
function Bi(...e) { let t = {}; for (let n of e)
    for (let r in n)
        n.hasOwnProperty(r) && (t[r] = !0); return t; }
var Hy = Ut("area,br,col,hr,img,wbr"), By = Ut("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"), Uy = Ut("rp,rt"), ib = Bi(Uy, By), sb = Bi(By, Ut("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul")), ab = Bi(Uy, Ut("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video")), yd = Bi(Hy, sb, ab, ib), $y = Ut("background,cite,href,itemtype,longdesc,poster,src,xlink:href"), cb = Ut("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width"), lb = Ut("aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext"), Ed = Bi($y, cb, lb), ub = Ut("script,style,template"), Id = class {
    sanitizedSomething = !1;
    buf = [];
    sanitizeChildren(t) { let n = t.firstChild, r = !0, o = []; for (; n;) {
        if (n.nodeType === Node.ELEMENT_NODE ? r = this.startElement(n) : n.nodeType === Node.TEXT_NODE ? this.chars(n.nodeValue) : this.sanitizedSomething = !0, r && n.firstChild) {
            o.push(n), n = pb(n);
            continue;
        }
        for (; n;) {
            n.nodeType === Node.ELEMENT_NODE && this.endElement(n);
            let i = fb(n);
            if (i) {
                n = i;
                break;
            }
            n = o.pop();
        }
    } return this.buf.join(""); }
    startElement(t) { let n = Em(t).toLowerCase(); if (!yd.hasOwnProperty(n))
        return this.sanitizedSomething = !0, !ub.hasOwnProperty(n); this.buf.push("<"), this.buf.push(n); let r = t.attributes; for (let o = 0; o < r.length; o++) {
        let i = r.item(o), s = i.name, a = s.toLowerCase();
        if (!Ed.hasOwnProperty(a)) {
            this.sanitizedSomething = !0;
            continue;
        }
        let c = i.value;
        $y[a] && (c = tc(c)), this.buf.push(" ", s, '="', Im(c), '"');
    } return this.buf.push(">"), !0; }
    endElement(t) { let n = Em(t).toLowerCase(); yd.hasOwnProperty(n) && !Hy.hasOwnProperty(n) && (this.buf.push("</"), this.buf.push(n), this.buf.push(">")); }
    chars(t) { this.buf.push(Im(t)); }
};
function db(e, t) { return (e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== Node.DOCUMENT_POSITION_CONTAINED_BY; }
function fb(e) { let t = e.nextSibling; if (t && e !== t.previousSibling)
    throw Gy(t); return t; }
function pb(e) { let t = e.firstChild; if (t && db(e, t))
    throw Gy(t); return t; }
function Em(e) { let t = e.nodeName; return typeof t == "string" ? t : "FORM"; }
function Gy(e) { return new Error(`Failed to sanitize html because the element is clobbered: ${e.outerHTML}`); }
var hb = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, gb = /([^\#-~ |!])/g;
function Im(e) { return e.replace(/&/g, "&amp;").replace(hb, function (t) { let n = t.charCodeAt(0), r = t.charCodeAt(1); return "&#" + ((n - 55296) * 1024 + (r - 56320) + 65536) + ";"; }).replace(gb, function (t) { return "&#" + t.charCodeAt(0) + ";"; }).replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
var Zs;
function qy(e, t) { let n = null; try {
    Zs = Zs || Vy(e);
    let r = t ? String(t) : "";
    n = Zs.getInertBodyElement(r);
    let o = 5, i = r;
    do {
        if (o === 0)
            throw new Error("Failed to sanitize html because the input is unstable");
        o--, r = i, i = n.innerHTML, n = Zs.getInertBodyElement(r);
    } while (r !== i);
    let a = new Id().sanitizeChildren(Dd(n) || n);
    return Yr(a);
}
finally {
    if (n) {
        let r = Dd(n) || n;
        for (; r.firstChild;)
            r.firstChild.remove();
    }
} }
function Dd(e) { return "content" in e && mb(e) ? e.content : null; }
function mb(e) { return e.nodeType === Node.ELEMENT_NODE && e.nodeName === "TEMPLATE"; }
var vb = /^>|^->|<!--|-->|--!>|<!-$/g, yb = /(<|>)/g, Eb = "\u200B$1\u200B";
function Ib(e) { return e.replace(vb, t => t.replace(yb, Eb)); }
function Rf(e, t) { return e.createText(t); }
function Wy(e, t, n) { e.setValue(t, n); }
function xf(e, t) { return e.createComment(Ib(t)); }
function nc(e, t, n) { return e.createElement(t, n); }
function jn(e, t, n, r, o) { e.insertBefore(t, n, r, o); }
function zy(e, t, n) { e.appendChild(t, n); }
function Dm(e, t, n, r, o) { r !== null ? jn(e, t, n, r, o) : zy(e, t, n); }
function Ui(e, t, n, r) { e.removeChild(null, t, n, r); }
function Qy(e) { e.textContent = ""; }
function Db(e, t, n) { e.setAttribute(t, "style", n); }
function Tb(e, t, n) { n === "" ? e.removeAttribute(t, "class") : e.setAttribute(t, "class", n); }
function Zy(e, t, n) { let { mergedAttrs: r, classes: o, styles: i } = n; r !== null && mS(e, t, r), o !== null && Tb(e, t, o), i !== null && Db(e, t, i); }
function Cb(e) { let t = g(); e.src = "", e.srcdoc = Yr(""), Ui(t[S], e); }
var te = (function (e) { return e[e.NONE = 0] = "NONE", e[e.HTML = 1] = "HTML", e[e.STYLE = 2] = "STYLE", e[e.SCRIPT = 3] = "SCRIPT", e[e.URL = 4] = "URL", e[e.RESOURCE_URL = 5] = "RESOURCE_URL", e[e.ATTRIBUTE_NO_BINDING = 6] = "ATTRIBUTE_NO_BINDING", e; })(te || {}), Qo, Tm = "svg", Mb = "math", Yy = "", Cm = "*", Td = () => Object.create(null);
function wb() { return Qo || (Qo = Td(), an(te.HTML, void 0, [["iframe", ["srcdoc"]], ["*", ["innerHTML", "outerHTML"]]]), an(te.STYLE, void 0, [["*", ["style"]]]), an(te.URL, void 0, [["*", ["formAction"]], ["area", ["href"]], ["a", ["href", "xlink:href"]], ["form", ["action"]], ["img", ["src"]], ["video", ["src"]]]), an(te.URL, Mb, [["*", ["href", "xlink:href"]]]), an(te.RESOURCE_URL, void 0, [["base", ["href"]], ["embed", ["src"]], ["frame", ["src"]], ["iframe", ["src"]], ["link", ["href"]], ["object", ["codebase", "data"]]]), an(te.URL, Tm, [["a", ["href", "xlink:href"]]]), an(te.ATTRIBUTE_NO_BINDING, Tm, [["animate", ["attributeName", "values", "to", "from"]], ["set", ["to", "attributeName"]], ["animateMotion", ["attributeName"]], ["animateTransform", ["attributeName"]]]), an(te.ATTRIBUTE_NO_BINDING, void 0, [["unknown", ["attributeName", "values", "to", "from", "sandbox", "allow", "allowFullscreen", "referrerPolicy", "csp", "fetchPriority", "credentialless"]], ["iframe", ["sandbox", "allow", "allowFullscreen", "referrerPolicy", "csp", "fetchPriority", "credentialless"]]]), Qo); }
function an(e, t, n) { let r = t ?? Yy; for (let [o, i] of n) {
    let s = o.toLowerCase();
    for (let a of i) {
        let c = a.toLowerCase(), l = Qo[c] ??= Td(), u = l[r] ??= Td();
        u[s] = e;
    }
} }
function Mm(e, t, n) { let o = wb()[t.toLowerCase()]; if (!o)
    return te.NONE; let i = e.toLowerCase(), s; if (n) {
    let a = o[n];
    a && (s = a[i] ?? a[Cm]);
} if (s === void 0) {
    let a = o[Yy];
    a && (s = a[i] ?? a[Cm]);
} return s ?? te.NONE; }
function kf(e) { let t = $i(); return t ? mm(t.sanitize(te.HTML, e) || "") : Kr(e, "HTML") ? mm(Bt(e)) : qy(ki(), A(e)); }
function Of(e) { let t = $i(); return t ? t.sanitize(te.STYLE, e) || "" : Kr(e, "Style") ? Bt(e) : A(e); }
function Lf(e) { let t = $i(); return t ? t.sanitize(te.URL, e) || "" : Kr(e, "URL") ? Bt(e) : tc(A(e)); }
function rc(e) { let t = $i(); if (t)
    return ym(t.sanitize(te.RESOURCE_URL, e) || ""); if (Kr(e, "ResourceURL"))
    return ym(Bt(e)); throw new D(904, !1); }
function Pf(e) { let t = $i(); if (t)
    return vm(t.sanitize(te.SCRIPT, e) || ""); if (Kr(e, "Script"))
    return vm(Bt(e)); throw new D(905, !1); }
function Ky(e) { return Yr(e[0]); }
function Jy(e) { return K_(e[0]); }
var Nb = { embed: { src: !0 }, frame: { src: !0 }, iframe: { src: !0 }, media: { src: !0 }, base: { href: !0 }, link: { href: !0 }, object: { data: !0, codebase: !0 } };
function Sb(e, t) { return Nb[e.toLowerCase()]?.[t.toLowerCase()] === !0 ? rc : Lf; }
function Xy(e, t, n) { return Sb(t, n)(e); }
function $i() { let e = g(); return e && e[Qe].sanitizer; }
var Ys = new Set(["href", "xlink:href"]), _b = { iframe: { sandbox: !0, allow: !0, allowfullscreen: !0, referrerpolicy: !0, csp: !0, fetchpriority: !0, credentialless: !0 }, ":svg:animate": { attributename: !0, to: Ys, values: Ys, from: Ys }, ":svg:set": { attributename: !0, to: Ys }, ":svg:animatemotion": { attributename: !0 }, ":svg:animatetransform": { attributename: !0 } };
function Ff(e, t, n) { let r = t.toLowerCase(), o = n.toLowerCase(), s = ue() === -1 ? null : He(); if (s && s.type !== 2)
    return e; let a = r[0] !== ":" && s?.namespace ? `:${s.namespace}:${r}` : r, c = _b[a]?.[o]; if (!c)
    return e; let l = g(); if (s && r === "iframe") {
    let f = ae(s, l);
    Cb(f);
} let u = t[0] === ":" ? t.split(":").pop() : t; if (typeof c != "boolean") {
    if (!s)
        throw new D(-910, !1);
    let f = ae(s, l);
    if (bb(f, c))
        throw new D(-910, !1);
    return e;
} let d = !1; throw new D(-910, d); }
function bb(e, t) { for (let n of e.getAttributeNames()) {
    if (n.toLowerCase() !== "attributename")
        continue;
    let r = e.getAttribute(n);
    if (r !== null && t.has(r.toLowerCase()))
        return r;
} return null; }
function Ab() { return Fe([]); }
function eE(e) { return e.ownerDocument.defaultView; }
function tE(e) { return e.ownerDocument; }
function jf(e) { return e.ownerDocument.body; }
var Rb = "\uFFFD";
function Zo(e) { return e instanceof Function ? e() : e; }
function xb(e, t, n) { let r = e.length; for (;;) {
    let o = e.indexOf(t, n);
    if (o === -1)
        return o;
    if (o === 0 || e.charCodeAt(o - 1) <= 32) {
        let i = t.length;
        if (o + i === r || e.charCodeAt(o + i) <= 32)
            return o;
    }
    n = o + 1;
} }
var nE = "ng-template";
function kb(e, t, n, r) { let o = 0; if (r) {
    for (; o < t.length && typeof t[o] == "string"; o += 2)
        if (t[o] === "class" && xb(t[o + 1].toLowerCase(), n, 0) !== -1)
            return !0;
}
else if (Vf(e))
    return !1; if (o = t.indexOf(1, o), o > -1) {
    let i;
    for (; ++o < t.length && typeof (i = t[o]) == "string";)
        if (i.toLowerCase() === n)
            return !0;
} return !1; }
function Vf(e) { return e.type === 4 && e.value !== nE; }
function Ob(e, t, n) { let r = e.type === 4 && !n ? nE : e.value; return t === r; }
function Lb(e, t, n) { let r = 4, o = e.attrs, i = o !== null ? jb(o) : 0, s = !1; for (let a = 0; a < t.length; a++) {
    let c = t[a];
    if (typeof c == "number") {
        if (!s && !ct(r) && !ct(c))
            return !1;
        if (s && ct(c))
            continue;
        s = !1, r = c | r & 1;
        continue;
    }
    if (!s)
        if (r & 4) {
            if (r = 2 | r & 1, c !== "" && !Ob(e, c, n) || c === "" && t.length === 1) {
                if (ct(r))
                    return !1;
                s = !0;
            }
        }
        else if (r & 8) {
            if (o === null || !kb(e, o, c, n)) {
                if (ct(r))
                    return !1;
                s = !0;
            }
        }
        else {
            let l = t[++a], u = Pb(c, o, Vf(e), n);
            if (u === -1) {
                if (ct(r))
                    return !1;
                s = !0;
                continue;
            }
            if (l !== "") {
                let d;
                if (u > i ? d = "" : d = o[u + 1].toLowerCase(), r & 2 && l !== d) {
                    if (ct(r))
                        return !1;
                    s = !0;
                }
            }
        }
} return ct(r) || s; }
function ct(e) { return (e & 1) === 0; }
function Pb(e, t, n, r) { if (t === null)
    return -1; let o = 0; if (r || !n) {
    let i = !1;
    for (; o < t.length;) {
        let s = t[o];
        if (s === e)
            return o;
        if (s === 3 || s === 6)
            i = !0;
        else if (s === 1 || s === 2) {
            let a = t[++o];
            for (; typeof a == "string";)
                a = t[++o];
            continue;
        }
        else {
            if (s === 4)
                break;
            if (s === 0) {
                o += 4;
                continue;
            }
        }
        o += i ? 1 : 2;
    }
    return -1;
}
else
    return Vb(t, e); }
function rE(e, t, n = !1) { for (let r = 0; r < t.length; r++)
    if (Lb(e, t[r], n))
        return !0; return !1; }
function Fb(e) { let t = e.attrs; if (t != null) {
    let n = t.indexOf(5);
    if ((n & 1) === 0)
        return t[n + 1];
} return null; }
function jb(e) { for (let t = 0; t < e.length; t++) {
    let n = e[t];
    if (kv(n))
        return t;
} return e.length; }
function Vb(e, t) { let n = e.indexOf(4); if (n > -1)
    for (n++; n < e.length;) {
        let r = e[n];
        if (typeof r == "number")
            return -1;
        if (r === t)
            return n;
        n++;
    } return -1; }
function Hb(e, t) { e: for (let n = 0; n < t.length; n++) {
    let r = t[n];
    if (e.length === r.length) {
        for (let o = 0; o < e.length; o++)
            if (e[o] !== r[o])
                continue e;
        return !0;
    }
} return !1; }
function wm(e, t) { return e ? ":not(" + t.trim() + ")" : t; }
function Bb(e) { let t = e[0], n = 1, r = 2, o = "", i = !1; for (; n < e.length;) {
    let s = e[n];
    if (typeof s == "string")
        if (r & 2) {
            let a = e[++n];
            o += "[" + s + (a.length > 0 ? '="' + a + '"' : "") + "]";
        }
        else
            r & 8 ? o += "." + s : r & 4 && (o += " " + s);
    else
        o !== "" && !ct(s) && (t += wm(i, o), o = ""), r = s, i = i || !ct(r);
    n++;
} return o !== "" && (t += wm(i, o)), t; }
function Ub(e) { return e.map(Bb).join(","); }
function $b(e) { let t = [], n = [], r = 1, o = 2; for (; r < e.length;) {
    let i = e[r];
    if (typeof i == "string")
        o === 2 ? i !== "" && t.push(i, e[++r]) : o === 8 && n.push(i);
    else {
        if (!ct(o))
            break;
        o = i;
    }
    r++;
} return n.length && t.push(1, ...n), t; }
var $ = {}, Ca = (function (e) { return e[e.Important = 1] = "Important", e[e.DashCase = 2] = "DashCase", e; })(Ca || {}), Cd;
function Hf(e, t) { return Cd(e, t); }
function Gb(e) { Cd === void 0 && (Cd = e()); }
var oE = new M("", { factory: () => !1 }), iE = new M("", { factory: () => qb }), qb = 4e3, Wb = !1, Kn = (typeof ngServerMode > "u" || !ngServerMode) && typeof document < "u" && typeof document?.documentElement?.getAnimations == "function";
function oc(e) { return e[k].get(oE, Wb); }
function zb(e, t, n) { let r = Lr.get(e); if (r) {
    for (let o of t)
        r.classList.push(o);
    for (let o of n)
        r.cleanupFns.push(o);
}
else
    Lr.set(e, { classList: t, cleanupFns: n }); }
function Bf(e) { let t = Lr.get(e); if (t) {
    for (let n of t.cleanupFns)
        n();
    Lr.delete(e);
} Pn.delete(e); }
var Qb = () => { }, Lr = new WeakMap, Pn = new WeakMap, fi = new WeakMap;
function sE(e) { return e ? e[nn] ?? e : null; }
var Yo = new WeakSet;
function Md(e, t) { let n = fi.get(e); if (n && n.length > 0) {
    let r = n.findIndex(o => o.el === t);
    r > -1 && n.splice(r, 1);
} n?.length === 0 && fi.delete(e); }
function Zb(e, t, n) { let r = fi.get(e); if (!r || r.length === 0)
    return; let o = t.parentNode, i = t.previousSibling, s = sE(n); for (let a = r.length - 1; a >= 0; a--) {
    let { el: c, declarationView: l } = r[a], u = c.parentNode;
    c === t ? (r.splice(a, 1), Yo.add(c), c.dispatchEvent(new CustomEvent("animationend", { detail: { cancel: !0 } }))) : i && c === i ? (r.splice(a, 1), c.dispatchEvent(new CustomEvent("animationend", { detail: { cancel: !0 } })), c.parentNode?.removeChild(c)) : u && o && u !== o && (s === null || l === null || s === l) && (r.splice(a, 1), c.dispatchEvent(new CustomEvent("animationend", { detail: { cancel: !0 } })), c.parentNode?.removeChild(c));
} }
function Uf(e, t, n) { let r = sE(n), o = fi.get(e); o ? o.some(i => i.el === t) || o.push({ el: t, declarationView: r }) : fi.set(e, [{ el: t, declarationView: r }]); }
function Ma(e) { let t = e[Ze] ??= {}; return t.enter ??= new Map; }
function Vn(e) { let t = e[Ze] ??= {}; return t.leave ??= new Map; }
function aE(e) { let t = typeof e == "function" ? e() : e, n = Array.isArray(t) ? t : null; return typeof t == "string" && (n = t.trim().split(/\s+/).filter(r => r)), n; }
function Yb(e, t) { if (!Kn)
    return; let n = Lr.get(e); if (n && n.classList.length > 0 && Kb(e, n.classList))
    for (let r of n.classList)
        t.removeClass(e, r); Bf(e); }
function Kb(e, t) { for (let n of t)
    if (e.classList.contains(n))
        return !0; return !1; }
function pi(e) { return e.composedPath ? e.composedPath()[0] : e.target; }
function $f(e, t) { let n = Pn.get(t); return n === void 0 ? !0 : t === pi(e) && (n.animationName !== void 0 && e.animationName === n.animationName || n.propertyName !== void 0 && (n.propertyName === "all" || e.propertyName === n.propertyName)); }
function ic(e, t, n) { let r = e.get(t.index) ?? { animateFns: [] }; r.animateFns.push(n), e.set(t.index, r); }
function wd(e, t) { if (e)
    for (let n of e)
        n(); for (let n of t)
    n(); }
function Nd(e, t) { let n = Vn(e).get(t.index); n && (n.resolvers = void 0); }
function Ks(e, t, n, r, o) { Md(t, n), wd(r, o), Nd(e, t); }
function wa(e) { if (!e)
    return 0; let t = e.toLowerCase().indexOf("ms") > -1 ? 1 : 1e3; return parseFloat(e) * t; }
function On(e, t) { return e.getPropertyValue(t).split(",").map(r => r.trim()); }
function Jb(e) { let t = On(e, "transition-property"), n = On(e, "transition-duration"), r = On(e, "transition-delay"), o = { propertyName: "", duration: 0, animationName: void 0 }; for (let i = 0; i < t.length; i++) {
    let s = wa(r[i]) + wa(n[i]);
    s > o.duration && (o.propertyName = t[i], o.duration = s);
} return o; }
function Xb(e) { let t = On(e, "animation-name"), n = On(e, "animation-delay"), r = On(e, "animation-duration"), o = On(e, "animation-iteration-count"), i = { animationName: "", propertyName: void 0, duration: 0 }; for (let s = 0; s < t.length; s++) {
    let a = wa(n[s]) + wa(r[s]), c = o[s];
    a > i.duration && c !== "infinite" && (i.animationName = t[s], i.duration = a);
} return i; }
function cE(e, t) { return e !== void 0 && e.duration > t.duration; }
function lE(e) { return (e.animationName != null || e.propertyName != null) && e.duration > 0; }
function eA(e, t) { let n = getComputedStyle(e), r = Xb(n), o = Jb(n), i = r.duration > o.duration ? r : o; cE(t.get(e), i) || lE(i) && t.set(e, i); }
function uE(e, t, n) { if (!n)
    return; let r = e.getAnimations(); return r.length === 0 ? eA(e, t) : tA(e, t, r); }
function tA(e, t, n) { let r = { animationName: void 0, propertyName: void 0, duration: 0 }; for (let o of n) {
    let i = o.effect?.getTiming();
    if (i?.iterations === 1 / 0)
        continue;
    let s = typeof i?.duration == "number" ? i.duration : 0, a = (i?.delay ?? 0) + s, c = o.playbackRate;
    c !== void 0 && c !== 0 && c !== 1 && (a /= Math.abs(c));
    let l, u;
    o.animationName ? u = o.animationName : l = o.transitionProperty, a >= r.duration && (r = { animationName: u, propertyName: l, duration: a });
} cE(t.get(e), r) || lE(r) && t.set(e, r); }
var fn = new Set, sc = (function (e) { return e[e.CHANGE_DETECTION = 0] = "CHANGE_DETECTION", e[e.AFTER_NEXT_RENDER = 1] = "AFTER_NEXT_RENDER", e; })(sc || {}), Jn = new M(""), Nm = new Set;
function re(e) { Nm.has(e) || (Nm.add(e), performance?.mark?.("mark_feature_usage", { detail: { feature: e } })); }
var ac = (() => { class e {
    impl = null;
    execute() { this.impl?.execute(); }
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new e });
} return e; })(), Gf = [0, 1, 2, 3], qf = (() => { class e {
    ngZone = E(q);
    scheduler = E(qe);
    errorHandler = E(_t, { optional: !0 });
    sequences = new Set;
    deferredRegistrations = new Set;
    executing = !1;
    constructor() { E(Jn, { optional: !0 }); }
    execute() { let n = this.sequences.size > 0; n && B(P.AfterRenderHooksStart), this.executing = !0; for (let r of Gf)
        for (let o of this.sequences)
            if (!(o.erroredOrDestroyed || !o.hooks[r]))
                try {
                    o.pipelinedValue = this.ngZone.runOutsideAngular(() => this.maybeTrace(() => { let i = o.hooks[r]; return i(o.pipelinedValue); }, o.snapshot));
                }
                catch (i) {
                    o.erroredOrDestroyed = !0, this.errorHandler?.handleError(i);
                } this.executing = !1; for (let r of this.sequences)
        r.afterRun(), r.once && (this.sequences.delete(r), r.destroy()); for (let r of this.deferredRegistrations)
        this.sequences.add(r); this.deferredRegistrations.size > 0 && this.scheduler.notify(7), this.deferredRegistrations.clear(), n && B(P.AfterRenderHooksEnd); }
    register(n) { let { view: r } = n; r !== void 0 ? ((r[Sn] ??= []).push(n), An(r), r[N] |= 8192) : this.executing ? this.deferredRegistrations.add(n) : this.addSequence(n); }
    addSequence(n) { this.sequences.add(n), this.scheduler.notify(7); }
    unregister(n) { this.executing && this.sequences.has(n) ? (n.erroredOrDestroyed = !0, n.pipelinedValue = void 0, n.once = !0) : (this.sequences.delete(n), this.deferredRegistrations.delete(n)); }
    maybeTrace(n, r) { return r ? r.run(sc.AFTER_NEXT_RENDER, n) : n(); }
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new e });
} return e; })(), hi = class {
    impl;
    hooks;
    view;
    once;
    snapshot;
    erroredOrDestroyed = !1;
    pipelinedValue = void 0;
    unregisterOnDestroy;
    constructor(t, n, r, o, i, s = null) { this.impl = t, this.hooks = n, this.view = r, this.once = o, this.snapshot = s, this.unregisterOnDestroy = i?.onDestroy(() => this.destroy()); }
    afterRun() { this.erroredOrDestroyed = !1, this.pipelinedValue = void 0, this.snapshot?.dispose(), this.snapshot = null; }
    destroy() { this.impl.unregister(this), this.unregisterOnDestroy?.(); let t = this.view?.[Sn]; t && (this.view[Sn] = t.filter(n => n !== this)); }
};
function dE(e, t) { let n = t?.injector ?? E(ie); return typeof ngServerMode < "u" && ngServerMode ? cc : (re("NgAfterRender"), fE(e, n, t, !1)); }
function Wf(e, t) { let n = t?.injector ?? E(ie); return typeof ngServerMode < "u" && ngServerMode ? cc : (re("NgAfterNextRender"), fE(e, n, t, !0)); }
function nA(e) { return e instanceof Function ? [void 0, void 0, e, void 0] : [e.earlyRead, e.write, e.mixedReadWrite, e.read]; }
function fE(e, t, n, r) { let o = t.get(ac); o.impl ??= t.get(qf); let i = t.get(Jn, null, { optional: !0 }), s = n?.manualCleanup !== !0 ? t.get(xe) : null, a = t.get(Er, null, { optional: !0 }), c = new hi(o.impl, nA(e), a?.view, r, s, i?.snapshot(null)); return o.impl.register(c), c; }
var cc = { destroy() { } }, Gi = new M("", { factory: () => { let e = E(Ae), t = new Set; return e.onDestroy(() => t.clear()), { queue: t, isScheduled: !1, scheduler: null, injector: e }; } });
function pE(e, t, n) { let r = e.get(Gi); if (Array.isArray(t))
    for (let o of t)
        r.queue.add(o), n?.detachedLeaveAnimationFns?.push(o);
else
    r.queue.add(t), n?.detachedLeaveAnimationFns?.push(t); r.scheduler && r.scheduler(e); }
function rA(e, t) { let n = e.get(Gi); if (Array.isArray(t))
    for (let r of t)
        n.queue.delete(r);
else
    n.queue.delete(t); }
function oA(e, t) { let n = e.get(Gi); if (t.detachedLeaveAnimationFns) {
    for (let r of t.detachedLeaveAnimationFns)
        n.queue.delete(r);
    t.detachedLeaveAnimationFns = void 0;
} }
function iA(e) { let t = e.get(Gi); t.isScheduled || (Wf(() => { t.isScheduled = !1; for (let n of t.queue)
    n(); t.queue.clear(); }, { injector: t.injector }), t.isScheduled = !0); }
function lc(e) { let t = e.get(Gi); t.scheduler = iA, t.scheduler(e); }
function zf(e, t) { for (let [n, r] of t)
    pE(e, r.animateFns); }
function Sm(e, t, n, r) { let o = e?.[Ze]?.enter; t !== null && o && o.has(n.index) && zf(r, o); }
function _m(e, t, n, r) { try {
    n.get(Lo);
}
catch {
    return r(!1);
} let o = e?.[Ze]; o?.enter?.has(t.index) && rA(n, o.enter.get(t.index).animateFns); let i = sA(e, t, o); if (i.size === 0) {
    let s = !1;
    if (e) {
        let a = [];
        uc(e, t, a), s = a.length > 0;
    }
    if (!s)
        return r(!1);
} e && fn.add(e[je]), pE(n, () => aA(e, t, o || void 0, i, r), o || void 0); }
function sA(e, t, n) { let r = new Map, o = n?.leave; if (o && o.has(t.index) && r.set(t.index, o.get(t.index)), e && o)
    for (let [i, s] of o) {
        if (r.has(i))
            continue;
        let c = e[m].data[i].parent;
        for (; c;) {
            if (c === t) {
                r.set(i, s);
                break;
            }
            c = c.parent;
        }
    } return r; }
function aA(e, t, n, r, o) { let i = []; if (n && n.leave)
    for (let [s] of r) {
        if (!n.leave.has(s))
            continue;
        let a = n.leave.get(s);
        for (let c of a.animateFns) {
            let { promise: l } = c();
            i.push(l);
        }
        n.detachedLeaveAnimationFns = void 0;
    } if (e && uc(e, t, i), i.length > 0) {
    let s = n || e?.[Ze];
    if (s) {
        let a = s.running;
        a && i.push(a), s.running = Promise.allSettled(i), lA(e, s.running, o);
    }
    else
        Promise.allSettled(i).then(() => { e && fn.delete(e[je]), o(!0); });
}
else
    e && fn.delete(e[je]), o(!1); }
function uc(e, t, n) { if (t.type & 12) {
    let o = e[t.index];
    if (J(o))
        for (let i = G; i < o.length; i++) {
            let s = o[i];
            s[m].type === 2 && cA(s, n);
        }
} let r = t.child; for (; r;)
    uc(e, r, n), r = r.next; }
function cA(e, t) { let n = e[Ze]; if (n && n.leave)
    for (let o of n.leave.values())
        for (let i of o.animateFns) {
            let { promise: s } = i();
            t.push(s);
        } let r = e[m].firstChild; for (; r;)
    uc(e, r, t), r = r.next; }
function lA(e, t, n) { t.then(() => { e[Ze]?.running === t && (e[Ze].running = void 0, fn.delete(e[je])), n(!0); }); }
function Sr(e, t, n, r, o, i, s, a) { if (o != null) {
    let c, l = !1;
    J(o) ? c = o : ee(o) && (l = !0, o = o[U]);
    let u = L(o);
    e === 0 && r !== null ? (Sm(a, r, i, n), s == null ? zy(t, r, u) : jn(t, r, u, s || null, !0)) : e === 1 && r !== null ? (Sm(a, r, i, n), jn(t, r, u, s || null, !0), Zb(i, u, a)) : e === 2 ? (a?.[Ze]?.leave?.has(i.index) && Uf(i, u, a), Yo.delete(u), _m(a, i, n, d => { if (Yo.has(u)) {
        Yo.delete(u);
        return;
    } Ui(t, u, l, d); })) : e === 3 && (Yo.delete(u), _m(a, i, n, () => { t.destroyNode(u); })), c != null && gA(t, e, n, c, i, r, s);
} }
function hE(e, t) { gE(e, t), t[U] = null, t[le] = null; }
function uA(e, t, n, r, o, i) { r[U] = o, r[le] = t, dc(e, r, n, 1, o, i); }
function gE(e, t) { t[Qe].changeDetectionScheduler?.notify(9), dc(e, t, t[S], 2, null, null); }
function dA(e) { let t = e[tn]; if (!t)
    return Lu(e[m], e); for (; t;) {
    let n = null;
    if (ee(t))
        n = t[tn];
    else {
        let r = t[G];
        r && (n = r);
    }
    if (!n) {
        for (; t && !t[me] && t !== e;)
            ee(t) && Lu(t[m], t), t = t[z];
        t === null && (t = e), ee(t) && Lu(t[m], t), n = t && t[me];
    }
    t = n;
} }
function Qf(e, t) { let n = e[_n], r = n.indexOf(t); n.splice(r, 1); }
function qi(e, t) { if (ft(t))
    return; let n = t[S]; n.destroyNode && dc(e, t, n, 3, null, null), dA(t); }
function Lu(e, t) { if (ft(t))
    return; let n = C(null); try {
    t[N] &= -129, t[N] |= 256, t[Re] && Qt(t[Re]), pA(e, t), fA(e, t), t[m].type === 1 && t[S].destroy();
    let r = t[rn];
    if (r !== null && J(t[z])) {
        r !== t[z] && Qf(r, t);
        let o = t[dt];
        o !== null && o.detachView(e);
    }
    od(t);
}
finally {
    C(n);
} }
function fA(e, t) { let n = e.cleanup, r = t[en]; if (n !== null)
    for (let s = 0; s < n.length - 1; s += 2)
        if (typeof n[s] == "string") {
            let a = n[s + 3];
            a >= 0 ? r[a]() : r[-a].unsubscribe(), s += 2;
        }
        else {
            let a = r[n[s + 1]];
            n[s].call(a);
        } r !== null && (t[en] = null); let o = t[Nt]; if (o !== null) {
    t[Nt] = null;
    for (let s = 0; s < o.length; s++) {
        let a = o[s];
        a();
    }
} let i = t[Kt]; if (i !== null) {
    t[Kt] = null;
    for (let s of i)
        s.destroy();
} }
function pA(e, t) { let n; if (e != null && (n = e.destroyHooks) != null)
    for (let r = 0; r < n.length; r += 2) {
        let o = t[n[r]];
        if (!(o instanceof Fn)) {
            let i = n[r + 1];
            if (Array.isArray(i))
                for (let s = 0; s < i.length; s += 2) {
                    let a = o[i[s]], c = i[s + 1];
                    B(P.LifecycleHookStart, a, c);
                    try {
                        c.call(a);
                    }
                    finally {
                        B(P.LifecycleHookEnd, a, c);
                    }
                }
            else {
                B(P.LifecycleHookStart, o, i);
                try {
                    i.call(o);
                }
                finally {
                    B(P.LifecycleHookEnd, o, i);
                }
            }
        }
    } }
function Zf(e, t, n) { return mE(e, t.parent, n); }
function mE(e, t, n) { let r = t; for (; r !== null && r.type & 168;)
    t = r, r = t.parent; if (r === null)
    return n[U]; if (we(r)) {
    let { encapsulation: o } = e.data[r.directiveStart + r.componentOffset];
    if (o === Je.None || o === Je.Emulated)
        return null;
} return ae(r, n); }
function vE(e, t, n) { return EE(e, t, n); }
function yE(e, t, n) { return e.type & 40 ? ae(e, n) : null; }
var EE = yE, Sd;
function IE(e, t) { EE = e, Sd = t; }
function Yf(e, t, n, r) { let o = Zf(e, r, t), i = t[S], s = r.parent || t[le], a = vE(s, r, t); if (o != null)
    if (Array.isArray(n))
        for (let c = 0; c < n.length; c++)
            Dm(i, o, n[c], a, !1);
    else
        Dm(i, o, n, a, !1); Sd !== void 0 && Sd(i, r, t, n, o); }
function Ln(e, t) { if (t !== null) {
    let n = t.type;
    if (n & 3)
        return ae(t, e);
    if (n & 4)
        return _d(-1, e[t.index]);
    if (n & 8) {
        let r = t.child;
        if (r !== null)
            return Ln(e, r);
        {
            let o = e[t.index];
            return J(o) ? _d(-1, o) : L(o);
        }
    }
    else {
        if (n & 128)
            return Ln(e, t.next);
        if (n & 32)
            return Hf(t, e)() || L(e[t.index]);
        {
            let r = DE(e, t);
            if (r !== null) {
                if (Array.isArray(r))
                    return r[0];
                let o = Ge(e[se]);
                return Ln(o, r);
            }
            else
                return Ln(e, t.next);
        }
    }
} return null; }
function DE(e, t) { if (t !== null) {
    let r = e[se][le], o = t.projection;
    return r.projection[o];
} return null; }
function _d(e, t) { let n = G + e + 1; if (n < t.length) {
    let r = t[n], o = r[m].firstChild;
    if (o !== null)
        return Ln(r, o);
} return t[it]; }
function Kf(e, t, n, r, o, i, s) { for (; n != null;) {
    let a = r[k];
    if (n.type === 128) {
        n = n.next;
        continue;
    }
    let c = r[n.index], l = n.type;
    if (s && t === 0 && (c && Ke(L(c), r), n.flags |= 2), !Zr(n))
        if (l & 8)
            Kf(e, t, n.child, r, o, i, !1), Sr(t, e, a, o, c, n, i, r);
        else if (l & 32) {
            let u = Hf(n, r), d;
            for (; d = u();)
                Sr(t, e, a, o, d, n, i, r);
            Sr(t, e, a, o, c, n, i, r);
        }
        else
            l & 16 ? TE(e, t, r, n, o, i) : Sr(t, e, a, o, c, n, i, r);
    n = s ? n.projectionNext : n.next;
} }
function dc(e, t, n, r, o, i) { Kf(n, r, e.firstChild, t, o, i, !1); }
function hA(e, t, n) { let r = t[S], o = Zf(e, n, t), i = n.parent || t[le], s = vE(i, n, t); TE(r, 0, t, n, o, s); }
function TE(e, t, n, r, o, i) { let s = n[se], c = s[le].projection[r.projection]; if (Array.isArray(c))
    for (let l = 0; l < c.length; l++) {
        let u = c[l];
        Sr(t, e, n[k], o, u, r, i, n);
    }
else {
    let l = c, u = s[z];
    ui(r) && (l.flags |= 128), Kf(e, t, l, u, o, i, !0);
} }
function gA(e, t, n, r, o, i, s) { let a = r[it], c = L(r); a !== c && Sr(t, e, n, i, a, o, s); for (let l = G; l < r.length; l++) {
    let u = r[l];
    dc(u[m], u, e, t, i, a);
} }
function mA(e, t, n, r, o) { if (t)
    o ? e.addClass(n, r) : e.removeClass(n, r);
else {
    let i = r.indexOf("-") === -1 ? void 0 : Ca.DashCase;
    o == null ? e.removeStyle(n, r, i) : (typeof o == "string" && o.endsWith("!important") && (o = o.slice(0, -10), i |= Ca.Important), e.setStyle(n, r, o, i));
} }
function Jf(e, t, n, r, o, i, s, a, c, l, u) { let d = I + r, f = d + o, p = vA(d, f), h = typeof l == "function" ? l() : l; return p[m] = { type: e, blueprint: p, template: n, queries: null, viewQuery: a, declTNode: t, data: p.slice().fill(null, d), bindingStartIndex: d, expandoStartIndex: f, hostBindingOpCodes: null, firstCreatePass: !0, firstUpdatePass: !0, staticViewQueries: !1, staticContentQueries: !1, preOrderHooks: null, preOrderCheckHooks: null, contentHooks: null, contentCheckHooks: null, viewHooks: null, viewCheckHooks: null, destroyHooks: null, cleanup: null, contentQueries: null, components: null, directiveRegistry: typeof i == "function" ? i() : i, pipeRegistry: typeof s == "function" ? s() : s, firstChild: null, schemas: c, consts: h, incompleteFirstPass: !1, ssrId: u }; }
function vA(e, t) { let n = []; for (let r = 0; r < t; r++)
    n.push(r < e ? null : $); return n; }
function CE(e) { let t = e.tView; return t === null || t.incompleteFirstPass ? e.tView = Jf(1, null, e.template, e.decls, e.vars, e.directiveDefs, e.pipeDefs, e.viewQuery, e.schemas, e.consts, e.id) : t; }
function fc(e, t, n, r, o, i, s, a, c, l, u) { let d = t.blueprint.slice(); return d[U] = o, d[N] = r | 4 | 128 | 8 | 64 | 1024, (l !== null || e && e[N] & 2048) && (d[N] |= 2048), Kl(d), d[z] = d[nn] = e, d[V] = n, d[Qe] = s || e && e[Qe], d[S] = a || e && e[S], d[k] = c || e && e[k] || null, d[le] = i, d[je] = ZS(), d[pe] = u, d[Gl] = l, d[se] = t.type == 2 ? e[se] : d, d; }
function yA(e, t, n) { let r = ae(t, e), o = CE(n), i = e[Qe].rendererFactory, s = ep(e, fc(e, o, null, Xf(n), r, t, null, i.createRenderer(r, n), null, null, null)); return e[t.index] = s; }
function Xf(e) { let t = 16; return e.signals ? t = 4096 : e.onPush && (t = 64), t; }
function Wi(e, t, n, r) { if (n === 0)
    return -1; let o = t.length; for (let i = 0; i < n; i++)
    t.push(r), e.blueprint.push(r), e.data.push(null); return o; }
function ep(e, t) { return e[tn] ? e[Fo][me] = t : e[tn] = t, e[Fo] = t, t; }
function ME(e = 1) { wE(R(), g(), ue() + e, !1); }
function wE(e, t, n, r) { if (!r)
    if ((t[N] & 3) === 3) {
        let i = e.preOrderCheckHooks;
        i !== null && na(t, i, n);
    }
    else {
        let i = e.preOrderHooks;
        i !== null && ra(t, i, 0, n);
    } mt(n); }
var pc = (function (e) { return e[e.None = 0] = "None", e[e.SignalBased = 1] = "SignalBased", e[e.HasDecoratorInputTransform = 2] = "HasDecoratorInputTransform", e; })(pc || {});
function Hn(e, t, n, r) { let o = C(null); try {
    let [i, s, a] = e.inputs[n], c = null;
    (s & pc.SignalBased) !== 0 && (c = t[i][Y]), c !== null && c.transformFn !== void 0 ? r = c.transformFn(r) : a !== null && (r = a.call(t, r)), e.setInput !== null ? e.setInput(t, c, r, n, i) : Nv(t, c, i, r);
}
finally {
    C(o);
} }
function NE(e, t, n, r, o) { let i = ue(), s = r & 2; try {
    mt(-1), s && t.length > I && wE(e, t, I, !1);
    let a = s ? P.TemplateUpdateStart : P.TemplateCreateStart;
    B(a, o, n), n(r, o);
}
finally {
    mt(i);
    let a = s ? P.TemplateUpdateEnd : P.TemplateCreateEnd;
    B(a, o, n);
} }
function hc(e, t, n) { CA(e, t, n), (n.flags & 64) === 64 && MA(e, t, n); }
function Jr(e, t, n = ae) { let r = t.localNames; if (r !== null) {
    let o = t.index + 1;
    for (let i = 0; i < r.length; i += 2) {
        let s = r[i + 1], a = s === -1 ? n(t, e) : e[s];
        e[o++] = a;
    }
} }
function EA(e, t, n, r) { let i = r.get(vf, fy) || n === Je.ShadowDom || n === Je.ExperimentalIsolatedShadowDom, s = e.selectRootElement(t, i); return IA(s), s; }
function IA(e) { SE(e); }
var SE = () => null;
function DA(e) { Xv(e) ? Qy(e) : __(e); }
function _E() { SE = DA; }
function TA(e) { return e === "class" ? "className" : e === "for" ? "htmlFor" : e === "formaction" ? "formAction" : e === "innerHtml" ? "innerHTML" : e === "readonly" ? "readOnly" : e === "tabindex" ? "tabIndex" : e; }
function tp(e, t, n, r, o, i) { let s = t[m]; if (yc(e, s, t, n, r)) {
    we(e) && bE(t, e.index);
    return;
} e.type & 3 && (n = TA(n)), np(e, t, n, r, o, i); }
function np(e, t, n, r, o, i) { if (e.type & 3) {
    let s = ae(e, t);
    r = i != null ? i(r, e.value || "", n) : r, o.setProperty(s, n, r);
}
else
    e.type & 12; }
function bE(e, t) { let n = ve(t, e); n[N] & 16 || (n[N] |= 64); }
function CA(e, t, n) { let r = n.directiveStart, o = n.directiveEnd; we(n) && yA(t, n, e.data[r + n.componentOffset]), e.firstCreatePass || ga(n, t); let i = n.initialInputs; for (let s = r; s < o; s++) {
    let a = e.data[s], c = li(t, e, s, n);
    if (Ke(c, t), i !== null && SA(t, s - r, c, a, n, i), Ye(a)) {
        let l = ve(n.index, t);
        l[V] = li(t, e, s, n);
    }
} }
function MA(e, t, n) { let r = n.directiveStart, o = n.directiveEnd, i = n.index, s = Ug(); try {
    mt(i);
    for (let a = r; a < o; a++) {
        let c = e.data[a], l = t[a];
        Os(a), (c.hostBindings !== null || c.hostVars !== 0 || c.hostAttrs !== null) && wA(c, l);
    }
}
finally {
    mt(-1), Os(s);
} }
function wA(e, t) { e.hostBindings !== null && e.hostBindings(1, t); }
function rp(e, t) { let n = e.directiveRegistry, r = null; if (n)
    for (let o = 0; o < n.length; o++) {
        let i = n[o];
        rE(t, i.selectors, !1) && (r ??= [], Ye(i) ? r.unshift(i) : r.push(i));
    } return r; }
function NA(e, t, n, r, o, i) { let s = ae(e, t); gc(t[S], s, i, e.value, n, r, o); }
function gc(e, t, n, r, o, i, s) { if (i == null)
    s?.(i, r || "", o), e.removeAttribute(t, o, n);
else {
    let a = s == null ? A(i) : s(i, r || "", o);
    e.setAttribute(t, o, a, n);
} }
function SA(e, t, n, r, o, i) { let s = i[t]; if (s !== null)
    for (let a = 0; a < s.length; a += 2) {
        let c = s[a], l = s[a + 1];
        Hn(r, n, c, l);
    } }
function mc(e, t, n, r, o) { let i = I + n, s = t[m], a = o(s, t, e, r, n); t[i] = a, pt(e, !0); let c = e.type === 2; return c ? (Zy(t[S], a, e), (Fg() === 0 || pr(e)) && Ke(a, t), jg()) : Ke(a, t), Go() && (!c || !Zr(e)) && Yf(s, t, a, e), e; }
function vc(e) { let t = e; return lu() ? uu() : (t = t.parent, pt(t, !1)), t; }
function AE(e, t, n) { return (e === null || Ye(e)) && (n = Vo(n[t.index])), n[S]; }
function op(e, t) { let n = e[k]; if (!n)
    return; let r; try {
    r = n.get(Rt, null);
}
catch {
    r = null;
} r?.(t); }
function yc(e, t, n, r, o) { let i = e.inputs?.[r], s = e.hostDirectiveInputs?.[r], a = !1; if (s)
    for (let c = 0; c < s.length; c += 2) {
        let l = s[c], u = s[c + 1], d = t.data[l];
        Hn(d, n[l], u, o), a = !0;
    } if (i)
    for (let c of i) {
        let l = n[c], u = t.data[c];
        Hn(u, l, r, o), a = !0;
    } return a; }
function RE(e, t, n, r, o, i) { let s = null, a = null, c = null, l = !1, u = e.directiveToIndex.get(r.type); if (typeof u == "number" ? s = u : [s, a, c] = u, a !== null && c !== null && e.hostDirectiveInputs?.hasOwnProperty(o)) {
    let d = e.hostDirectiveInputs[o];
    for (let f = 0; f < d.length; f += 2) {
        let p = d[f];
        if (p >= a && p <= c) {
            let h = t.data[p], v = d[f + 1];
            Hn(h, n[p], v, i), l = !0;
        }
        else if (p > c)
            break;
    }
} return s !== null && r.inputs.hasOwnProperty(o) && (Hn(r, n[s], o, i), l = !0), l; }
function _A(e, t) { let n = ve(t, e), r = n[m]; bA(r, n); let o = n[U]; o !== null && n[pe] === null && (n[pe] = Ny(o, n[k])), B(P.ComponentStart); try {
    Ec(r, n, n[V]);
}
finally {
    B(P.ComponentEnd, n[V]);
} }
function bA(e, t) { for (let n = t.length; n < e.blueprint.length; n++)
    t.push(e.blueprint[n]); }
function Ec(e, t, n) { Fs(t); try {
    let r = e.viewQuery;
    r !== null && ud(1, r, n);
    let o = e.template;
    o !== null && NE(e, t, o, 1, n), e.firstCreatePass && (e.firstCreatePass = !1), t[dt]?.finishViewCreation(e), e.staticContentQueries && Oy(e, t), e.staticViewQueries && ud(2, e.viewQuery, n);
    let i = e.components;
    i !== null && AA(t, i);
}
catch (r) {
    throw e.firstCreatePass && (e.incompleteFirstPass = !0, e.firstCreatePass = !1), r;
}
finally {
    t[N] &= -5, js();
} }
function AA(e, t) { for (let n = 0; n < t.length; n++)
    _A(e, t[n]); }
function Xr(e, t, n, r) { let o = C(null); try {
    let i = t.tView, a = e[N] & 4096 ? 4096 : 16, c = fc(e, i, n, a, null, t, null, null, r?.injector ?? null, r?.embeddedViewInjector ?? null, r?.dehydratedView ?? null), l = e[t.index];
    c[rn] = l;
    let u = e[dt];
    return u !== null && (c[dt] = u.createEmbeddedView(i)), Ec(i, c, n), c;
}
finally {
    C(o);
} }
function Bn(e, t) { return !t || t.firstChild === null || ui(e); }
function Pr(e, t, n, r, o = !1) { for (; n !== null;) {
    if (n.type === 128) {
        n = o ? n.projectionNext : n.next;
        continue;
    }
    let i = t[n.index];
    i !== null && r.push(L(i)), J(i) && Ic(i, r);
    let s = n.type;
    if (s & 8)
        Pr(e, t, n.child, r);
    else if (s & 32) {
        let a = Hf(n, t), c;
        for (; c = a();)
            r.push(c);
    }
    else if (s & 16) {
        let a = DE(t, n);
        if (Array.isArray(a))
            r.push(...a);
        else {
            let c = Ge(t[se]);
            Pr(c[m], c, a, r, !0);
        }
    }
    n = o ? n.projectionNext : n.next;
} return r; }
function Ic(e, t) { for (let n = G; n < e.length; n++) {
    let r = e[n], o = r[m].firstChild;
    o !== null && Pr(r[m], r, o, t);
} e[it] !== e[U] && t.push(e[it]); }
function xE(e) { if (e[Sn] !== null) {
    for (let t of e[Sn])
        t.impl.addSequence(t);
    e[Sn].length = 0;
} }
var kE = [];
function RA(e) { return e[Re] ?? xA(e); }
function xA(e) { let t = kE.pop() ?? Object.create(OA); return t.lView = e, t; }
function kA(e) { e.lView[Re] !== e && (e.lView = null, kE.push(e)); }
var OA = X(O({}, Wt), { consumerIsAlwaysLive: !0, kind: "template", consumerMarkedDirty: e => { An(e.lView); }, consumerOnSignalRead() { this.lView[Re] = this; } });
function LA(e) { let t = e[Re] ?? Object.create(PA); return t.lView = e, t; }
var PA = X(O({}, Wt), { consumerIsAlwaysLive: !0, kind: "template", consumerMarkedDirty: e => { let t = Ge(e.lView); for (; t && !OE(t[m]);)
        t = Ge(t); t && Bo(t); }, consumerOnSignalRead() { this.lView[Re] = this; } });
function OE(e) { return e.type !== 2; }
function LE(e) { if (e[Kt] === null)
    return; let t = !0; for (; t;) {
    let n = !1;
    for (let r of e[Kt])
        r.dirty && (n = !0, r.zone === null || Zone.current === r.zone ? r.run() : r.zone.run(() => r.run()));
    t = n && !!(e[N] & 8192);
} }
var FA = 100;
function PE(e, t = 0) { let r = e[Qe].rendererFactory, o = !1; o || r.begin?.(); try {
    jA(e, t);
}
finally {
    o || r.end?.();
} }
function jA(e, t) { let n = fu(); try {
    yo(!0), bd(e, t);
    let r = 0;
    for (; hr(e);) {
        if (r === FA)
            throw new D(103, !1);
        r++, bd(e, 1);
    }
}
finally {
    yo(n);
} }
function FE(e, t, n, r) { if (ft(t))
    return; let o = t[N], i = !1, s = !1; Fs(t); let a = !0, c = null, l = null; i || (OE(e) ? (l = RA(t), c = Mt(l)) : co() === null ? (a = !1, l = LA(t), c = Mt(l)) : t[Re] && (Qt(t[Re]), t[Re] = null)); try {
    Kl(t), pu(e.bindingStartIndex), n !== null && NE(e, t, n, 2, r);
    let u = (o & 3) === 3;
    if (!i)
        if (u) {
            let p = e.preOrderCheckHooks;
            p !== null && na(t, p, null);
        }
        else {
            let p = e.preOrderHooks;
            p !== null && ra(t, p, 0, null), bu(t, 0);
        }
    if (s || VA(t), LE(t), jE(t, 0), e.contentQueries !== null && Oy(e, t), !i)
        if (u) {
            let p = e.contentCheckHooks;
            p !== null && na(t, p);
        }
        else {
            let p = e.contentHooks;
            p !== null && ra(t, p, 1), bu(t, 1);
        }
    BA(e, t);
    let d = e.components;
    d !== null && HE(t, d, 0);
    let f = e.viewQuery;
    if (f !== null && ud(2, f, r), !i)
        if (u) {
            let p = e.viewCheckHooks;
            p !== null && na(t, p);
        }
        else {
            let p = e.viewHooks;
            p !== null && ra(t, p, 2), bu(t, 2);
        }
    if (e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), t[bs]) {
        for (let p of t[bs])
            p();
        t[bs] = null;
    }
    i || (xE(t), t[N] &= -73);
}
catch (u) {
    throw i || An(t), u;
}
finally {
    l !== null && (zt(l, c), a && kA(l)), js();
} }
function jE(e, t) { for (let n = oy(e); n !== null; n = iy(n))
    for (let r = G; r < n.length; r++) {
        let o = n[r];
        VE(o, t);
    } }
function VA(e) { for (let t = oy(e); t !== null; t = iy(t)) {
    if (!(t[N] & 2))
        continue;
    let n = t[_n];
    for (let r = 0; r < n.length; r++) {
        let o = n[r];
        Bo(o);
    }
} }
function HA(e, t, n) { B(P.ComponentStart); let r = ve(t, e); try {
    VE(r, n);
}
finally {
    B(P.ComponentEnd, r[V]);
} }
function VE(e, t) { As(e) && bd(e, t); }
function bd(e, t) { let r = e[m], o = e[N], i = e[Re], s = !!(t === 0 && o & 16); if (s ||= !!(o & 64 && t === 0), s ||= !!(o & 1024), s ||= !!(i?.dirty && ir(i)), s ||= !1, i && (i.dirty = !1), e[N] &= -9217, s)
    FE(r, e, r.template, e[V]);
else if (o & 8192) {
    let a = C(null);
    try {
        LE(e), jE(e, 1);
        let c = r.components;
        c !== null && HE(e, c, 1), xE(e);
    }
    finally {
        C(a);
    }
} }
function HE(e, t, n) { for (let r = 0; r < t.length; r++)
    HA(e, t[r], n); }
function BA(e, t) { let n = e.hostBindingOpCodes; if (n !== null)
    try {
        for (let r = 0; r < n.length; r++) {
            let o = n[r];
            if (o < 0)
                mt(~o);
            else {
                let i = o, s = n[++r], a = n[++r];
                Bg(s, i);
                let c = t[i];
                B(P.HostBindingsUpdateStart, c);
                try {
                    a(2, c);
                }
                finally {
                    B(P.HostBindingsUpdateEnd, c);
                }
            }
        }
    }
    finally {
        mt(-1);
    } }
function Dc(e, t) { let n = fu() ? 64 : 1088; for (e[Qe].changeDetectionScheduler?.notify(t); e;) {
    e[N] |= n;
    let r = Ge(e);
    if (st(e) && !r)
        return e;
    e = r;
} return null; }
function BE(e, t, n, r) { return [e, !0, 0, t, null, r, null, n, null, null]; }
function UE(e, t) { let n = G + t; if (n < e.length)
    return e[n]; }
function eo(e, t, n, r = !0) { let o = t[m]; if (UA(o, t, e, n), r) {
    let s = _d(n, e), a = t[S], c = a.parentNode(e[it]);
    c !== null && uA(o, e[le], a, t, c, s);
} let i = t[pe]; i !== null && i.firstChild !== null && (i.firstChild = null); }
function ip(e, t) { let n = gi(e, t); return n !== void 0 && qi(n[m], n), n; }
function gi(e, t) { if (e.length <= G)
    return; let n = G + t, r = e[n]; if (r) {
    let o = r[rn];
    o !== null && o !== e && Qf(o, r), t > 0 && (e[n - 1][me] = r[me]);
    let i = xo(e, G + t);
    hE(r[m], r);
    let s = i[dt];
    s !== null && s.detachView(i[m]), r[z] = null, r[me] = null, r[N] &= -129;
} return r; }
function UA(e, t, n, r) { let o = G + r, i = n.length; r > 0 && (n[o - 1][me] = t), r < i - G ? (t[me] = n[o], Fl(n, G + r, t)) : (n.push(t), t[me] = null), t[z] = n; let s = t[rn]; s !== null && n !== s && $E(s, t); let a = t[dt]; a !== null && a.insertView(e), Rs(t), t[N] |= 128; }
function $E(e, t) { let n = e[_n], r = t[z]; if (ee(r))
    e[N] |= 2;
else {
    let o = r[z][se];
    t[se] !== o && (e[N] |= 2);
} n === null ? e[_n] = [t] : n.push(t); }
var pn = class {
    _lView;
    _cdRefInjectingView;
    _appRef = null;
    _attachedToViewContainer = !1;
    exhaustive;
    get rootNodes() { let t = this._lView, n = t[m]; return Pr(n, t, n.firstChild, []); }
    constructor(t, n) { this._lView = t, this._cdRefInjectingView = n; }
    get context() { return this._lView[V]; }
    set context(t) { this._lView[V] = t; }
    get destroyed() { return ft(this._lView); }
    destroy() { if (this._appRef)
        this._appRef.detachView(this);
    else if (this._attachedToViewContainer) {
        let t = this._lView[z];
        if (J(t)) {
            let n = t[jo], r = n ? n.indexOf(this) : -1;
            r > -1 && (gi(t, r), xo(n, r));
        }
        this._attachedToViewContainer = !1;
    } qi(this._lView[m], this._lView); }
    onDestroy(t) { gr(this._lView, t); }
    markForCheck() { Dc(this._cdRefInjectingView || this._lView, 4); }
    detach() { this._lView[N] &= -129; }
    reattach() { Rs(this._lView), this._lView[N] |= 128; }
    detectChanges() { this._lView[N] |= 1024, PE(this._lView); }
    checkNoChanges() { }
    attachToViewContainerRef() { if (this._appRef)
        throw new D(902, !1); this._attachedToViewContainer = !0; }
    detachFromAppRef() { this._appRef = null; let t = st(this._lView), n = this._lView[rn]; n !== null && !t && Qf(n, this._lView), gE(this._lView[m], this._lView); }
    attachToAppRef(t) { if (this._attachedToViewContainer)
        throw new D(902, !1); this._appRef = t; let n = st(this._lView), r = this._lView[rn]; r !== null && !n && $E(r, this._lView), Rs(this._lView); }
};
function $A(e) { return hr(e._lView) || !!(e._lView[N] & 64); }
function GA(e) { Bo(e._lView); }
var mi = (() => { class e {
    _declarationLView;
    _declarationTContainer;
    elementRef;
    static __NG_ELEMENT_ID__ = qA;
    constructor(n, r, o) { this._declarationLView = n, this._declarationTContainer = r, this.elementRef = o; }
    get ssrId() { return this._declarationTContainer.tView?.ssrId || null; }
    createEmbeddedView(n, r) { return this.createEmbeddedViewImpl(n, r); }
    createEmbeddedViewImpl(n, r, o) { let i = Xr(this._declarationLView, this._declarationTContainer, n, { embeddedViewInjector: r, dehydratedView: o }); return new pn(i); }
} return e; })();
function qA() { return Tc(_(), g()); }
function Tc(e, t) { return e.type & 4 ? new mi(t, e, Gr(e, t)) : null; }
var Ad = "<-- AT THIS LOCATION", WA = "/guide/hydration#third-party-scripts-with-dom-manipulation";
function zA(e) { switch (e) {
    case 4: return "view container";
    case 2: return "element";
    case 8: return "ng-container";
    case 32: return "icu";
    case 64: return "i18n";
    case 16: return "projection";
    case 1: return "text";
    case 128: return "@let";
    default: return "<unknown>";
} }
function QA(e, t) {
    let n = `During serialization, Angular was unable to find an element in the DOM:

`, r = `${JA(e, t, !1)}

`, o = eR();
    throw new D(-502, n + r + o);
}
function GE(e) {
    let t = "During serialization, Angular detected DOM nodes that were created outside of Angular context and provided as projectable nodes (likely via `ViewContainerRef.createComponent` or `createComponent` APIs). Hydration is not supported for such cases, consider refactoring the code to avoid this pattern or using `ngSkipHydration` on the host element of the component.\n\n", n = `${XA(e)}

`, r = t + n + tR();
    return new D(-503, r);
}
function ZA(e) { let t = []; if (e.attrs)
    for (let n = 0; n < e.attrs.length;) {
        let r = e.attrs[n++];
        if (typeof r == "number")
            break;
        let o = e.attrs[n++];
        t.push(`${r}="${Na(o)}"`);
    } return t.join(" "); }
var YA = new Set(["ngh", "ng-version", "ng-server-context"]);
function KA(e) { let t = []; for (let n = 0; n < e.attributes.length; n++) {
    let r = e.attributes[n];
    YA.has(r.name) || t.push(`${r.name}="${Na(r.value)}"`);
} return t.join(" "); }
function Pu(e, t = "\u2026") { switch (e.type) {
    case 1: return `#text${e.value ? `(${e.value})` : ""}`;
    case 2:
        let r = ZA(e), o = e.value.toLowerCase();
        return `<${o}${r ? " " + r : ""}>${t}</${o}>`;
    case 8: return "<!-- ng-container -->";
    case 4: return "<!-- container -->";
    default: return `#node(${zA(e.type)})`;
} }
function sa(e, t = "\u2026") { let n = e; switch (n.nodeType) {
    case Node.ELEMENT_NODE:
        let r = n.tagName.toLowerCase(), o = KA(n);
        return `<${r}${o ? " " + o : ""}>${t}</${r}>`;
    case Node.TEXT_NODE:
        let i = n.textContent ? Na(n.textContent) : "";
        return `#text${i ? `(${i})` : ""}`;
    case Node.COMMENT_NODE: return `<!-- ${Na(n.textContent ?? "")} -->`;
    default: return `#node(${n.nodeType})`;
} }
function JA(e, t, n) {
    let o = "";
    t.prev ? (o += `  \u2026
`, o += "  " + Pu(t.prev) + `
`) : t.type && t.type & 12 && (o += `  \u2026
`), n ? (o += "  " + Pu(t) + `
`, o += `  <!-- container -->  ${Ad}
`) : o += "  " + Pu(t) + `  ${Ad}
`, o += `  \u2026
`;
    let i = t.type ? Zf(e[m], t, e) : null;
    return i && (o = sa(i, `
` + o)), o;
}
function XA(e) {
    let n = "", r = e;
    return r.previousSibling && (n += `  \u2026
`, n += "  " + sa(r.previousSibling) + `
`), n += "  " + sa(r) + `  ${Ad}
`, e.nextSibling && (n += `  \u2026
`), e.parentNode && (n = sa(r.parentNode, `
` + n)), n;
}
function eR(e) {
    return `To fix this problem:
  * check ${e ? `the "${e}"` : "corresponding"} component for hydration-related issues
  * check to see if your template has valid HTML structure
  * check if there are any third-party scripts that manipulate the DOM. More info: ${vs}${WA}
  * or skip hydration by adding the \`ngSkipHydration\` attribute to its host node in a template

`;
}
function tR() {
    return `Note: attributes are only displayed to better represent the DOM but have no effect on hydration mismatches.

`;
}
function nR(e) { return e.replace(/\s+/gm, ""); }
function Na(e, t = 50) { return e ? (e = nR(e), e.length > t ? `${e.substring(0, t - 1)}\u2026` : e) : ""; }
function qE(e, t, n) { let r = t.insertBeforeIndex, o = Array.isArray(r) ? r[0] : r; return o === null ? yE(e, t, n) : L(n[o]); }
function WE(e, t, n, r, o) { let i = t.insertBeforeIndex; if (Array.isArray(i)) {
    let s = r, a = null;
    if (t.type & 3 || (a = s, s = o), s !== null && t.componentOffset === -1)
        for (let c = 1; c < i.length; c++) {
            let l = n[i[c]];
            jn(e, s, l, a, !1);
        }
} }
function Xn(e, t, n, r, o) { let i = e.data[t]; if (i === null)
    i = sp(e, t, n, r, o), Hg() && (i.flags |= 32);
else if (i.type & 64) {
    i.type = n, i.value = r, i.attrs = o;
    let s = mr();
    i.injectorIndex = s === null ? -1 : s.injectorIndex;
} return pt(i, !0), i; }
function sp(e, t, n, r, o) { let i = cu(), s = lu(), a = s ? i : i && i.parent, c = e.data[t] = oR(e, a, n, t, r, o); return rR(e, c, i, s), c; }
function rR(e, t, n, r) { e.firstChild === null && (e.firstChild = t), n !== null && (r ? n.child == null && t.parent !== null && (n.child = t) : n.next === null && (n.next = t, t.prev = n)); }
function oR(e, t, n, r, o, i) { let s = t ? t.injectorIndex : -1, a = 0; return Uo() && (a |= 128), { type: n, index: r, insertBeforeIndex: null, injectorIndex: s, directiveStart: -1, directiveEnd: -1, directiveStylingLast: -1, componentOffset: -1, controlDirectiveIndex: -1, customControlIndex: -1, propertyBindings: null, flags: a, providerIndexes: 0, value: o, namespace: Vs(), attrs: i, mergedAttrs: null, localNames: null, initialInputs: null, inputs: null, hostDirectiveInputs: null, outputs: null, hostDirectiveOutputs: null, directiveToIndex: null, tView: null, next: null, prev: null, projectionNext: null, child: null, parent: t, projection: null, styles: null, stylesWithoutHost: null, residualStyles: void 0, classes: null, classesWithoutHost: null, residualClasses: void 0, classBindings: 0, styleBindings: 0 }; }
function zE(e, t) { if (e.push(t), e.length > 1)
    for (let n = e.length - 2; n >= 0; n--) {
        let r = e[n];
        QE(r) || iR(r, t) && sR(r) === null && aR(r, t.index);
    } }
function QE(e) { return !(e.type & 64); }
function iR(e, t) { return QE(t) || e.index > t.index; }
function sR(e) { let t = e.insertBeforeIndex; return Array.isArray(t) ? t[0] : t; }
function aR(e, t) { let n = e.insertBeforeIndex; Array.isArray(n) ? n[0] = t : (IE(qE, WE), e.insertBeforeIndex = t); }
function Jo(e, t) { let n = e.data[t]; return n === null || typeof n == "string" ? null : n.hasOwnProperty("currentCaseLViewIndex") ? n : n.value; }
function cR(e, t, n) { let r = e.data[t]; r === null ? e.data[t] = n : r.value = n; }
function lR(e, t) { let n = e.insertBeforeIndex; n === null ? (IE(qE, WE), n = e.insertBeforeIndex = [null, t]) : (xl(Array.isArray(n), !0, "Expecting array here"), n.push(t)); }
function uR(e, t, n) { let r = sp(e, n, 64, null, null); return zE(t, r), r; }
function Cc(e, t) { let n = t[e.currentCaseLViewIndex]; return n === null ? n : n < 0 ? ~n : n; }
function dR(e) { return e >>> 17; }
function fR(e) { return (e & 131070) >>> 1; }
function pR(e, t, n) { return e | t << 17 | n << 1; }
function ZE(e) { return e === -1; }
function ap(e, t, n) { e.index = 0; let r = Cc(t, n); r !== null ? e.removes = t.remove[r] : e.removes = j; }
function Sa(e) { if (e.index < e.removes.length) {
    let t = e.removes[e.index++];
    if (t > 0)
        return e.lView[t];
    {
        e.stack.push(e.index, e.removes);
        let n = ~t, r = e.lView[m].data[n];
        return ap(e, r, e.lView), Sa(e);
    }
}
else
    return e.stack.length === 0 ? (e.lView = void 0, null) : (e.removes = e.stack.pop(), e.index = e.stack.pop(), Sa(e)); }
function hR() { let e = { stack: [], index: -1 }; function t(n, r) { for (e.lView = r; e.stack.length;)
    e.stack.pop(); return ap(e, n.value, r), Sa.bind(null, e); } return t; }
function gR(e, t) { let n = { stack: [], index: -1, lView: t }; return ap(n, e, t), Sa.bind(null, n); }
var mR = new RegExp(`^(\\d+)*(${gf}|${hf})*(.*)`);
function vR(e, t) { let n = [e]; for (let r of t) {
    let o = n.length - 1;
    if (o > 0 && n[o - 1] === r) {
        let i = n[o] || 1;
        n[o] = i + 1;
    }
    else
        n.push(r, "");
} return n.join(""); }
function yR(e) { let t = e.match(mR), [n, r, o, i] = t, s = r ? parseInt(r, 10) : o, a = []; for (let [c, l, u] of i.matchAll(/(f|n)(\d*)/g)) {
    let d = parseInt(u, 10) || 1;
    a.push(l, d);
} return [s, ...a]; }
function ER(e) { return !e.prev && e.parent?.type === 8; }
function Fu(e) { return e.index - I; }
function to(e, t) { return !(e.type & 144) && !!t[e.index] && YE(L(t[e.index])); }
function YE(e) { return !!e && !e.isConnected; }
function KE(e, t) { let n = e.i18nNodes; if (n)
    return n.get(t); }
function IR(e, t, n) { let o = e.data[Pi]?.[n]; return o ? JE(o, t) : null; }
function zi(e, t, n, r) { let o = Fu(r), i = KE(e, o); if (i === void 0) {
    let s = e.data[Pi];
    if (s?.[o])
        i = JE(s[o], n);
    else if (t.firstChild === r)
        i = e.firstChild;
    else {
        let a = r.prev === null, c = r.prev ?? r.parent;
        if (ER(r)) {
            let l = Fu(r.parent);
            i = ld(e, l);
        }
        else {
            let l = ae(c, n);
            if (a)
                i = l.firstChild;
            else {
                let u = Fu(c), d = ld(e, u);
                if (c.type === 2 && d) {
                    let p = Sf(e, u) + 1;
                    i = Mc(p, d);
                }
                else
                    i = l.nextSibling;
            }
        }
    }
} return i; }
function Mc(e, t) { let n = t; for (let r = 0; r < e; r++)
    n = n.nextSibling; return n; }
function DR(e, t) { let n = e; for (let r = 0; r < t.length; r += 2) {
    let o = t[r], i = t[r + 1];
    for (let s = 0; s < i; s++)
        switch (o) {
            case uy:
                n = n.firstChild;
                break;
            case dy:
                n = n.nextSibling;
                break;
        }
} return n; }
function JE(e, t) { let [n, ...r] = yR(e), o; if (n === hf)
    o = t[se][U];
else if (n === gf)
    o = jf(t[se][U]);
else {
    let i = Number(n);
    o = L(t[i + I]);
} return DR(o, r); }
function Rd(e, t) { if (e === t)
    return []; if (e.parentElement == null || t.parentElement == null)
    return null; if (e.parentElement === t.parentElement)
    return TR(e, t); {
    let n = t.parentElement, r = Rd(e, n), o = Rd(n.firstChild, t);
    return !r || !o ? null : [...r, uy, ...o];
} }
function TR(e, t) { let n = [], r = null; for (r = e; r != null && r !== t; r = r.nextSibling)
    n.push(dy); return r == null ? null : n; }
function bm(e, t, n) { let r = Rd(e, t); return r === null ? null : vR(n, r); }
function XE(e, t, n) { let r = e.parent, o, i, s; for (; r !== null && (to(r, t) || n?.has(r.index));)
    r = r.parent; r === null || !(r.type & 3) ? (o = s = hf, i = t[se][U]) : (o = r.index, i = L(t[o]), s = A(o - I)); let a = L(t[e.index]); if (e.type & 44) {
    let l = Ln(t, e);
    l && (a = l);
} let c = bm(i, a, s); if (c === null && i !== a) {
    let l = i.ownerDocument.body;
    if (c = bm(l, a, gf), c === null)
        throw QA(t, e);
} return c; }
function CR(e, t) { let n = e.createNodeIterator(t, NodeFilter.SHOW_COMMENT, { acceptNode: MR }), r, o = new Map; for (; r = n.nextNode();) {
    let i = "ngh=", s = r?.textContent, a = s?.indexOf(i) ?? -1;
    if (a > -1) {
        let c = s.substring(a + i.length).trim();
        o.set(c, r);
    }
} return o; }
function MR(e) { return e.textContent?.trimStart().startsWith("ngh=") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
var eI = !1, tI = () => { };
function cp(e) { eI = e; }
function wc() { return eI; }
function wR(e, t, n, r) { tI(e, t, n, r); }
function nI() { tI = AR; }
function rI(e) { return e = e ?? E(ie), e.get(yf, !1); }
function oI(e, t) { let n = t.i18nChildren.get(e); return n === void 0 && (n = NR(e), t.i18nChildren.set(e, n)), n; }
function NR(e) { let t = new Set; function n(r) { switch (t.add(r.index), r.kind) {
    case 1:
    case 2: {
        for (let o of r.children)
            n(o);
        break;
    }
    case 3: {
        for (let o of r.cases)
            for (let i of o)
                n(i);
        break;
    }
} } for (let r = I; r < e.bindingStartIndex; r++) {
    let o = e.data[r];
    if (!(!o || !o.ast))
        for (let i of o.ast)
            n(i);
} return t.size === 0 ? null : t; }
function iI(e, t, n) { if (!n.isI18nHydrationEnabled)
    return null; let r = e[m], o = r.data[t]; if (!o || !o.ast)
    return null; let i = r.data[o.parentTNodeIndex]; if (i && ey(i))
    return null; let s = { caseQueue: [], disconnectedNodes: new Set, disjointNodes: new Set }; return xd(e, s, n, o.ast), s.caseQueue.length === 0 && s.disconnectedNodes.size === 0 && s.disjointNodes.size === 0 ? null : s; }
function xd(e, t, n, r) { let o = null; for (let i of r) {
    let s = _R(e, t, n, i);
    s && (SR(o, s) && t.disjointNodes.add(i.index - I), o = s);
} return o; }
function SR(e, t) { return e && e.nextSibling !== t; }
function _R(e, t, n, r) { let o = L(e[r.index]); if (!o || YE(o))
    return t.disconnectedNodes.add(r.index - I), null; let i = o; switch (r.kind) {
    case 0: {
        _f(n, i);
        break;
    }
    case 1:
    case 2: {
        xd(e, t, n, r.children);
        break;
    }
    case 3: {
        let s = e[r.currentCaseLViewIndex];
        if (s != null) {
            let a = s < 0 ? ~s : s;
            t.caseQueue.push(a), xd(e, t, n, r.cases[a]);
        }
        break;
    }
} return bR(e, r); }
function bR(e, t) { let r = e[m].data[t.index]; return Ha(r) ? Ln(e, r) : t.kind === 3 ? gR(r, e)() ?? L(e[t.index]) : L(e[t.index]) ?? null; }
function Rn(e, t) { e.currentNode = t; }
function Wo(e, t, n) { let r = n.index - I, { disconnectedNodes: o } = e, i = t.currentNode; return t.isConnected ? (e.i18nNodes.set(r, i), o.delete(r)) : o.add(r), i; }
function ju(e, t) { let n = e.currentNode; for (let r = 0; r < t && n; r++)
    n = n?.nextSibling ?? null; return n; }
function Vu(e, t) { return { currentNode: t, isConnected: e.isConnected }; }
function AR(e, t, n, r) { let o = e[pe]; if (!o || !wc() || n && (ey(n) || Xa(o, n.index - I)))
    return; let i = e[m], s = i.data[t]; function a() { if (ZE(r)) {
    let p = zi(o, i, e, n);
    return n.type & 8 ? p : p.firstChild;
} return o?.firstChild; } let c = a(), l = Ay(o) ?? new Set, u = o.i18nNodes ??= new Map, d = o.data[za]?.[t - I] ?? [], f = o.dehydratedIcuData ??= new Map; Cr({ hydrationInfo: o, lView: e, i18nNodes: u, disconnectedNodes: l, caseQueue: d, dehydratedIcuData: f }, { currentNode: c, isConnected: !0 }, s.ast), o.disconnectedNodes = l.size === 0 ? null : l; }
function Cr(e, t, n) { if (Array.isArray(n)) {
    let r = t;
    for (let o of n) {
        let i = IR(e.hydrationInfo, e.lView, o.index - I);
        i && (r = Vu(t, i)), Cr(e, r, o);
    }
}
else {
    if (e.disconnectedNodes.has(n.index - I))
        return;
    switch (n.kind) {
        case 0: {
            let r = Wo(e, t, n);
            Rn(t, r?.nextSibling ?? null);
            break;
        }
        case 1: {
            Cr(e, Vu(t, t.currentNode?.firstChild ?? null), n.children);
            let r = Wo(e, t, n);
            Rn(t, r?.nextSibling ?? null);
            break;
        }
        case 2: {
            let r = n.index - I, { hydrationInfo: o } = e, i = _y(o, r);
            switch (n.type) {
                case 0: {
                    let s = Wo(e, t, n);
                    if (k_(o, r)) {
                        Cr(e, t, n.children);
                        let a = ju(t, 1);
                        Rn(t, a);
                    }
                    else if (Cr(e, Vu(t, t.currentNode?.firstChild ?? null), n.children), Rn(t, s?.nextSibling ?? null), i !== null) {
                        let a = ju(t, i + 1);
                        Rn(t, a);
                    }
                    break;
                }
                case 1: {
                    Wo(e, t, n);
                    let s = ju(t, i + 1);
                    Rn(t, s);
                    break;
                }
            }
            break;
        }
        case 3: {
            let r = t.isConnected ? e.caseQueue.shift() : null, o = { currentNode: null, isConnected: !1 };
            for (let s = 0; s < n.cases.length; s++)
                Cr(e, s === r ? t : o, n.cases[s]);
            r !== null && e.dehydratedIcuData.set(n.index, { case: r, node: n });
            let i = Wo(e, t, n);
            Rn(t, i?.nextSibling ?? null);
            break;
        }
    }
} }
var sI = () => { };
function RR(e, t, n) { sI(e, t, n); }
function aI() { sI = xR; }
function xR(e, t, n) { let r = e[pe]?.dehydratedIcuData; r && r.get(t)?.case === n && r.delete(t); }
function kR(e) { let t = e[pe]; if (t) {
    let { i18nNodes: n, dehydratedIcuData: r } = t;
    if (n && r) {
        let o = e[S];
        for (let i of r.values())
            OR(o, n, i);
    }
    t.i18nNodes = void 0, t.dehydratedIcuData = void 0;
} }
function OR(e, t, n) { for (let r of n.node.cases[n.case]) {
    let o = t.get(r.index - I);
    o && Ui(e, o, !1);
} }
function Nc(e) { let t = e[Ve] ?? [], r = e[z][S], o = []; for (let i of t)
    i.data[Qa] !== void 0 ? o.push(i) : cI(i, r); e[Ve] = o; }
function LR(e) { let { lContainer: t } = e, n = t[Ve]; if (n === null)
    return; let o = t[z][S]; for (let i of n)
    cI(i, o); }
function cI(e, t) { let n = 0, r = e.firstChild; if (r) {
    let o = e.data[Pt];
    for (; n < o;) {
        let i = r.nextSibling;
        Ui(t, r, !1), r = i, n++;
    }
} }
function Sc(e) { Nc(e); let t = e[U]; ee(t) && vi(t); for (let n = G; n < e.length; n++)
    vi(e[n]); }
function vi(e) { kR(e); let t = e[m]; for (let n = I; n < t.bindingStartIndex; n++)
    if (J(e[n])) {
        let r = e[n];
        Sc(r);
    }
    else
        ee(e[n]) && vi(e[n]); }
function lp(e) { let t = e._views; for (let n of t) {
    let r = Nf(n);
    r !== null && r[U] !== null && (ee(r) ? vi(r) : Sc(r));
} }
function PR(e, t, n, r) { e !== null && (n.cleanup(t), Sc(e.lContainer), lp(r)); }
function FR(e, t) { let n = []; for (let r of t)
    for (let o = 0; o < (r[Li] ?? 1); o++) {
        let i = { data: r, firstChild: null };
        r[Pt] > 0 && (i.firstChild = e, e = Mc(r[Pt], e)), n.push(i);
    } return [e, n]; }
var lI = () => null, uI = () => null;
function dI() { lI = jR, uI = VR; }
function jR(e, t) { return pI(e, t) ? e[Ve].shift() : (Nc(e), null); }
function yi(e, t) { return lI(e, t); }
function VR(e, t, n) { if (t.tView.ssrId === null)
    return null; let r = yi(e, t.tView.ssrId); return n[m].firstUpdatePass && r === null && HR(n, t), r; }
function fI(e, t, n) { return uI(e, t, n); }
function HR(e, t) { let n = t; for (; n;) {
    if (Am(e, n))
        return;
    if ((n.flags & 256) === 256)
        break;
    n = n.prev;
} for (n = t.next; n && (n.flags & 512) === 512;) {
    if (Am(e, n))
        return;
    n = n.next;
} }
function pI(e, t) { let n = e[Ve]; return !t || n === null || n.length === 0 ? !1 : n[0].data[Wa] === t; }
function Am(e, t) { let n = t.tView?.ssrId; if (n == null)
    return !1; let r = e[t.index]; return J(r) && pI(r, n) ? (Nc(r), !0) : !1; }
var hI = class {
}, Ei = class {
}, BR = (() => { class e {
    destroyNode = null;
    static __NG_ELEMENT_ID__ = () => UR();
} return e; })();
function UR() { let e = g(), t = _(), n = ve(t.index, e); return (ee(n) ? n : e)[S]; }
var gI = (() => { class e {
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => null });
} return e; })();
function up(e) { return e.ngModule !== void 0; }
function xn(e) { return !!lr(e); }
function Js(e) { return !!rt(e); }
function Rm(e) { return !!Le(e); }
function Xo(e) { return !!W(e); }
function $R(e) { return W(e) ? "component" : Le(e) ? "directive" : rt(e) ? "pipe" : "type"; }
function GR(e, t) { if (wo(e) && (e = F(e), !e))
    throw new Error(`Expected forwardRef function, imported from "${We(t)}", to return a standalone entity or NgModule but got "${We(e) || e}".`); if (lr(e) == null) {
    let n = W(e) || Le(e) || rt(e);
    if (n != null) {
        if (!n.standalone) {
            let r = $R(e);
            throw new Error(`The "${We(e)}" ${r}, imported from "${We(t)}", is not standalone. Does the ${r} have the standalone: false flag?`);
        }
    }
    else
        throw up(e) ? new Error(`A module with providers was imported from "${We(t)}". Modules with providers are not supported in standalone components imports.`) : new Error(`The "${We(e)}" type, imported from "${We(t)}", must be a standalone component / directive / pipe or an NgModule. Did you forget to add the required @Component / @Directive / @Pipe or @NgModule annotation?`);
} }
var kd = class {
    ownerNgModule = new WeakMap;
    ngModulesWithSomeUnresolvedDecls = new Set;
    ngModulesScopeCache = new WeakMap;
    standaloneComponentsScopeCache = new WeakMap;
    resolveNgModulesDecls() { if (this.ngModulesWithSomeUnresolvedDecls.size !== 0) {
        for (let t of this.ngModulesWithSomeUnresolvedDecls) {
            let n = lr(t);
            if (n?.declarations)
                for (let r of Zo(n.declarations))
                    Xo(r) && this.ownerNgModule.set(r, t);
        }
        this.ngModulesWithSomeUnresolvedDecls.clear();
    } }
    getComponentDependencies(t, n) { this.resolveNgModulesDecls(); let r = W(t); if (r === null)
        throw new Error(`Attempting to get component dependencies for a type that is not a component: ${t}`); if (r.standalone) {
        let o = this.getStandaloneComponentScope(t, n);
        return o.compilation.isPoisoned ? { dependencies: [] } : { dependencies: [...o.compilation.directives, ...o.compilation.pipes, ...o.compilation.ngModules] };
    }
    else {
        if (!this.ownerNgModule.has(t))
            return { dependencies: [] };
        let o = this.getNgModuleScope(this.ownerNgModule.get(t));
        return o.compilation.isPoisoned ? { dependencies: [] } : { dependencies: [...o.compilation.directives, ...o.compilation.pipes] };
    } }
    registerNgModule(t, n) { if (!xn(t))
        throw new Error(`Attempting to register a Type which is not NgModule as NgModule: ${t}`); this.ngModulesWithSomeUnresolvedDecls.add(t); }
    clearScopeCacheFor(t) { this.ngModulesScopeCache.delete(t), this.standaloneComponentsScopeCache.delete(t); }
    getNgModuleScope(t) { if (this.ngModulesScopeCache.has(t))
        return this.ngModulesScopeCache.get(t); let n = this.computeNgModuleScope(t); return this.ngModulesScopeCache.set(t, n), n; }
    computeNgModuleScope(t) { let n = Ds(t), r = { exported: { directives: new Set, pipes: new Set }, compilation: { directives: new Set, pipes: new Set } }; for (let o of Zo(n.imports))
        if (xn(o)) {
            let i = this.getNgModuleScope(o);
            cn(i.exported.directives, r.compilation.directives), cn(i.exported.pipes, r.compilation.pipes);
        }
        else if (Ao(o))
            if (Rm(o) || Xo(o))
                r.compilation.directives.add(o);
            else if (Js(o))
                r.compilation.pipes.add(o);
            else
                throw new D(980, "The standalone imported type is neither a component nor a directive nor a pipe");
        else {
            r.compilation.isPoisoned = !0;
            break;
        } if (!r.compilation.isPoisoned)
        for (let o of Zo(n.declarations)) {
            if (xn(o) || Ao(o)) {
                r.compilation.isPoisoned = !0;
                break;
            }
            Js(o) ? r.compilation.pipes.add(o) : r.compilation.directives.add(o);
        } for (let o of Zo(n.exports))
        if (xn(o)) {
            let i = this.getNgModuleScope(o);
            cn(i.exported.directives, r.exported.directives), cn(i.exported.pipes, r.exported.pipes), cn(i.exported.directives, r.compilation.directives), cn(i.exported.pipes, r.compilation.pipes);
        }
        else
            Js(o) ? r.exported.pipes.add(o) : r.exported.directives.add(o); return r; }
    getStandaloneComponentScope(t, n) { if (this.standaloneComponentsScopeCache.has(t))
        return this.standaloneComponentsScopeCache.get(t); let r = this.computeStandaloneComponentScope(t, n); return this.standaloneComponentsScopeCache.set(t, r), r; }
    computeStandaloneComponentScope(t, n) { let r = { compilation: { directives: new Set([t]), pipes: new Set, ngModules: new Set } }; for (let o of ot(n ?? [])) {
        let i = F(o);
        try {
            GR(i, t);
        }
        catch {
            return r.compilation.isPoisoned = !0, r;
        }
        if (xn(i)) {
            r.compilation.ngModules.add(i);
            let s = this.getNgModuleScope(i);
            if (s.exported.isPoisoned)
                return r.compilation.isPoisoned = !0, r;
            cn(s.exported.directives, r.compilation.directives), cn(s.exported.pipes, r.compilation.pipes);
        }
        else if (Js(i))
            r.compilation.pipes.add(i);
        else if (Rm(i) || Xo(i))
            r.compilation.directives.add(i);
        else
            return r.compilation.isPoisoned = !0, r;
    } return r; }
    isOrphanComponent(t) { let n = W(t); return !n || n.standalone ? !1 : (this.resolveNgModulesDecls(), !this.ownerNgModule.has(t)); }
};
function cn(e, t) { for (let n of e)
    t.add(n); }
var Fr = new kd;
function qR(e, t) { let n = e; for (; n;) {
    let r = JS(n);
    if (r !== null)
        for (let o = I; o < r.length; o++) {
            let i = r[o];
            if (!ee(i) && !J(i) || i[U] !== n)
                continue;
            let s = r[m], a = on(s, o);
            if (we(a)) {
                let c = s.data[a.directiveStart + a.componentOffset], l = dp(c);
                if (l !== null && (!t || t(n, l)))
                    return l;
                break;
            }
        }
    n = n.parentNode;
} return null; }
function dp(e) { return e.debugInfo?.className || e.type.name || null; }
var aa = {}, un = class {
    injector;
    parentInjector;
    constructor(t, n) { this.injector = t, this.parentInjector = n; }
    get(t, n, r) { let o = this.injector.get(t, aa, r); return o !== aa || n === aa ? o : this.parentInjector.get(t, n, r); }
};
function Ii(e) { return _c(e) ? Array.isArray(e) || !(e instanceof Map) && Symbol.iterator in e : !1; }
function WR(e, t, n) { let r = e[Symbol.iterator](), o = t[Symbol.iterator](); for (;;) {
    let i = r.next(), s = o.next();
    if (i.done && s.done)
        return !0;
    if (i.done || s.done || !n(i.value, s.value))
        return !1;
} }
function mI(e, t) { if (Array.isArray(e))
    for (let n = 0; n < e.length; n++)
        t(e[n]);
else {
    let n = e[Symbol.iterator](), r;
    for (; !(r = n.next()).done;)
        t(r.value);
} }
function _c(e) { return e !== null && (typeof e == "function" || typeof e == "object"); }
function vI(e, t) { let n = Ii(e), r = Ii(t); return n && r ? WR(e, t, vI) : !n && (e && (typeof e == "object" || typeof e == "function")) && !r && (t && (typeof t == "object" || typeof t == "function")) ? !0 : Object.is(e, t); }
function lt(e, t, n) { return e[t] = n; }
function no(e, t) { return e[t]; }
function Z(e, t, n) { if (n === $)
    return !1; let r = e[t]; return Object.is(r, n) ? !1 : (e[t] = n, !0); }
function Un(e, t, n, r) { let o = Z(e, t, n); return Z(e, t + 1, r) || o; }
function bc(e, t, n, r, o) { let i = Un(e, t, n, r); return Z(e, t + 2, o) || i; }
function Xe(e, t, n, r, o, i) { let s = Un(e, t, n, r); return Un(e, t + 2, o, i) || s; }
function dn(e, t, n) { return function r(o) { let i = r.__ngNativeEl__; i !== void 0 && T_(o, i); let s = we(e) ? ve(e.index, t) : t; Dc(s, 5); let a = t[V], c = xm(t, a, n, o), l = r.__ngNextListenerFn__; for (; l;)
    c = xm(t, a, l, o) && c, l = l.__ngNextListenerFn__; return c; }; }
function xm(e, t, n, r) { let o = C(null); try {
    return B(P.OutputStart, t, n), n(r) !== !1;
}
catch (i) {
    return op(e, i), !1;
}
finally {
    B(P.OutputEnd, t, n), C(o);
} }
function fp(e, t, n, r, o, i, s, a) { let c = pr(e), l = !1, u = null; if (!r && c && (u = QR(t, n, i, e.index)), u !== null) {
    let d = u.__ngLastListenerFn__ || u;
    d.__ngNextListenerFn__ = s, u.__ngLastListenerFn__ = s, l = !0;
}
else {
    let d = ae(e, n), f = r ? r(d) : d;
    C_(n, f, i, a), r || (a.__ngNativeEl__ = d);
    let p = o.listen(f, i, a);
    if (!zR(i)) {
        let h = r ? v => r(L(v[e.index])) : e.index;
        yI(h, t, n, i, a, p, !1);
    }
} return l; }
function zR(e) { return e.startsWith("animation") || e.startsWith("transition"); }
function QR(e, t, n, r) { let o = e.cleanup; if (o != null)
    for (let i = 0; i < o.length - 1; i += 2) {
        let s = o[i];
        if (s === n && o[i + 1] === r) {
            let a = t[en], c = o[i + 2];
            return a && a.length > c ? a[c] : null;
        }
        typeof s == "string" && (i += 2);
    } return null; }
function yI(e, t, n, r, o, i, s) { let a = t.firstCreatePass ? eu(t) : null, c = Xl(n), l = c.length; c.push(o, i), a && a.push(r, e, l, (l + 1) * (s ? -1 : 1)); }
function ZR(e, t, n, r, o) { let i = dn(e, t, n), s = Od(e, t, r, o, i); }
function Od(e, t, n, r, o) { let i = null, s = null, a = null, c = !1, l = e.directiveToIndex.get(n.type); if (typeof l == "number" ? i = l : [i, s, a] = l, s !== null && a !== null && e.hostDirectiveOutputs?.hasOwnProperty(r)) {
    let u = e.hostDirectiveOutputs[r];
    for (let d = 0; d < u.length; d += 2) {
        let f = u[d];
        if (f >= s && f <= a)
            c = !0, _a(e, t, f, u[d + 1], r, o);
        else if (f > a)
            break;
    }
} return n.outputs.hasOwnProperty(r) && (c = !0, _a(e, t, i, r, r, o)), c; }
function _a(e, t, n, r, o, i) { let s = t[n], a = t[m], l = a.data[n].outputs[r], d = s[l].subscribe(i); yI(e.index, a, t, o, i, d, !0); }
function EI() { II(); }
function II() { let e = g(), t = R(), n = _(); if (t.firstCreatePass && YR(t, n), n.controlDirectiveIndex === -1)
    return; re("NgSignalForms"); let r = e[n.controlDirectiveIndex]; t.data[n.controlDirectiveIndex].controlDef.create(r, new ba(e, t, n)); }
function DI() { TI(); }
function TI() { let e = g(), t = R(), n = He(); if (n.controlDirectiveIndex === -1)
    return; let r = t.data[n.controlDirectiveIndex].controlDef, o = e[n.controlDirectiveIndex]; r.update(o, new ba(e, t, n)); }
var ba = class {
    lView;
    tView;
    tNode;
    hasPassThrough;
    constructor(t, n, r) { this.lView = t, this.tView = n, this.tNode = r, this.hasPassThrough = !!(r.flags & 4096); }
    get customControl() { return this.tNode.customControlIndex !== -1 ? this.lView[this.tNode.customControlIndex] : void 0; }
    get nativeElement() { return ae(this.tNode, this.lView); }
    get descriptor() { return `<${this.tNode.value}>`; }
    listenToCustomControlOutput(t, n) { let r = this.tView.data[this.tNode.customControlIndex]; Od(this.tNode, this.lView, r, t, dn(this.tNode, this.lView, n)); }
    listenToCustomControlModel(t) { let n = this.tNode.flags & 1024 ? "valueChange" : "checkedChange", r = this.tView.data[this.tNode.customControlIndex]; Od(this.tNode, this.lView, r, n, dn(this.tNode, this.lView, t)); }
    listenToDom(t, n) { fp(this.tNode, this.tView, this.lView, void 0, this.lView[S], t, n, dn(this.tNode, this.lView, n)); }
    setInputOnDirectives(t, n) { let r = this.tNode.inputs?.[t], o = this.tNode.hostDirectiveInputs?.[t]; if (!r && !o)
        return !1; let i = !1; if (r)
        for (let s of r) {
            if (s === this.tNode.controlDirectiveIndex)
                continue;
            let a = this.tView.data[s], c = this.lView[s];
            Hn(a, c, t, n), i = !0;
        } if (o)
        for (let s = 0; s < o.length; s += 2) {
            let a = o[s];
            if (a === this.tNode.controlDirectiveIndex)
                continue;
            let c = o[s + 1], l = this.tView.data[a], u = this.lView[a];
            Hn(l, u, c, n), i = !0;
        } return i; }
    setCustomControlModelInput(t) { let n = this.tView.data[this.tNode.customControlIndex], r = this.tNode.flags & 1024 ? "value" : "checked"; RE(this.tNode, this.tView, this.lView, n, r, t); }
    customControlHasInput(t) { if (this.tNode.customControlIndex === -1)
        return !1; let n = this.tView.data[this.tNode.customControlIndex]; return (n.signalFormsInputPresence ??= this._buildCustomControlInputCache(n))[t] === !0; }
    _buildCustomControlInputCache(t) { let n = {}; for (let r in t.inputs)
        n[r] = !0; if (t.hostDirectives !== null) {
        let r = [...t.hostDirectives];
        for (; r.length > 0;) {
            let o = r.shift();
            if (typeof o != "function") {
                for (let s in o.inputs)
                    n[o.inputs[s]] = !0;
                let i = km(o.directive);
                i !== null && r.push(...i);
                continue;
            }
            for (let i of o()) {
                if (typeof i == "function")
                    continue;
                if (i.inputs)
                    for (let a = 0; a < i.inputs.length; a += 2) {
                        let c = i.inputs[a + 1] || i.inputs[a];
                        n[c] = !0;
                    }
                let s = km(i.directive);
                s !== null && r.push(...s);
            }
        }
    } return n; }
};
function km(e) { return typeof e == "function" && "\u0275dir" in e ? e.\u0275dir.hostDirectives ?? null : null; }
function YR(e, t, n) { for (let o = t.directiveStart; o < t.directiveEnd; o++)
    if (e.data[o].controlDef) {
        t.controlDirectiveIndex = o;
        break;
    } if (t.controlDirectiveIndex === -1)
    return; let r = e.data[t.controlDirectiveIndex].controlDef; if (r.passThroughInput && (t.inputs?.[r.passThroughInput]?.length ?? 0) > 1) {
    t.flags |= 4096;
    return;
} KR(e, t); }
function KR(e, t) { for (let n = t.directiveStart; n < t.directiveEnd; n++) {
    let r = e.data[n];
    if (!(t.directiveToIndex && !t.directiveToIndex.has(r.type))) {
        if (Om(r, "value")) {
            t.flags |= 1024, t.customControlIndex = n;
            return;
        }
        if (Om(r, "checked")) {
            t.flags |= 2048, t.customControlIndex = n;
            return;
        }
    }
} if (t.hostDirectiveInputs !== null && t.hostDirectiveOutputs !== null && t.directiveToIndex !== null) {
    let n = (r, o) => { let i = t.hostDirectiveInputs[r], s = t.hostDirectiveOutputs[r + "Change"]; if (!i || !s)
        return !1; for (let a = 0; a < i.length; a += 2) {
        let c = i[a];
        for (let l = 0; l < s.length; l += 2) {
            let u = s[l];
            if (c === u)
                for (let d of t.directiveToIndex.values()) {
                    if (!Array.isArray(d))
                        continue;
                    let [f, p, h] = d;
                    if (c >= p && c <= h)
                        return t.flags |= o, t.customControlIndex = f, !0;
                }
        }
    } return !1; };
    if (n("value", 1024) || n("checked", 2048))
        return;
} }
function Om(e, t) { return JR(e, t) && XR(e, t + "Change"); }
function JR(e, t) { return t in e.inputs; }
function XR(e, t) { return t in e.outputs; }
var Lt = Symbol("BINDING"), Lm = { kind: "input", requiredVars: 1 }, ex = { kind: "output", requiredVars: 0 };
function Pm(e, t, n) { let r = g(), o = De(); if (Z(r, o, n)) {
    let i = r[m], s = He(), a = ve(s.index, r);
    Dc(a, 1);
    let c = i.directiveRegistry[e], l = RE(s, i, r, c, t, n);
} }
function CI(e, t) { if (e === "formField") {
    let r = { [Lt]: Lm, create: () => { II(); }, update: () => { Pm(r.targetIdx, e, t()), TI(); } };
    return r;
} let n = { [Lt]: Lm, update: () => Pm(n.targetIdx, e, t()) }; return n; }
function MI(e, t) { let n = { [Lt]: ex, create: () => { let r = g(), o = _(), s = r[m].directiveRegistry[n.targetIdx]; ZR(o, r, t, s, e); } }; return n; }
function tx(e, t) { let n = CI(e, t), r = MI(e + "Change", i => t.set(i)); return { [Lt]: { kind: "twoWay", requiredVars: n[Lt].requiredVars + r[Lt].requiredVars }, set targetIdx(i) { n.targetIdx = i, r.targetIdx = i; }, create: r.create, update: n.update }; }
var wI = new M("");
function Aa(e, t, n) { let r = n ? e.styles : null, o = n ? e.classes : null, i = 0; if (t !== null)
    for (let s = 0; s < t.length; s++) {
        let a = t[s];
        if (typeof a == "number")
            i = a;
        else if (i == 1)
            o = Es(o, a);
        else if (i == 2) {
            let c = a, l = t[++s];
            r = Es(r, c + ": " + l + ";");
        }
    } n ? e.styles = r : e.stylesWithoutHost = r, n ? e.classes = o : e.classesWithoutHost = o; }
function ro(e, t = 0) { let n = g(); if (n === null)
    return ge(e, t); let r = _(); return Hv(r, n, F(e), t); }
function NI() { let e = "invalid"; throw new Error(e); }
function SI(e, t, n, r, o) { let i = r === null ? null : { "": -1 }, s = o(e, n); if (s !== null) {
    let a = s, c = null, l = null;
    for (let u of s)
        if (u.resolveHostDirectives !== null) {
            [a, c, l] = u.resolveHostDirectives(s);
            break;
        }
    ox(e, t, n, a, i, c, l);
} i !== null && r !== null && nx(n, r, i); }
function nx(e, t, n) { let r = e.localNames = []; for (let o = 0; o < t.length; o += 2) {
    let i = n[t[o + 1]];
    if (i == null)
        throw new D(-301, !1);
    r.push(t[o], i);
} }
function rx(e, t, n) { t.componentOffset = n, (e.components ??= []).push(t.index); }
function ox(e, t, n, r, o, i, s) { let a = r.length, c = null; for (let f = 0; f < a; f++) {
    let p = r[f];
    c === null && Ye(p) && (c = p, rx(e, n, f)), td(ga(n, t), e, p.type);
} ux(n, e.data.length, a), c?.viewProvidersResolver && c.viewProvidersResolver(c); for (let f = 0; f < a; f++) {
    let p = r[f];
    p.providersResolver && p.providersResolver(p);
} let l = !1, u = !1, d = Wi(e, t, a, null); a > 0 && (n.directiveToIndex = new Map); for (let f = 0; f < a; f++) {
    let p = r[f];
    if (n.mergedAttrs = Or(n.mergedAttrs, p.hostAttrs), sx(e, n, t, d, p), lx(d, p, o), s !== null && s.has(p)) {
        let [v, y] = s.get(p);
        n.directiveToIndex.set(p.type, [d, v + n.directiveStart, y + n.directiveStart]);
    }
    else
        (i === null || !i.has(p)) && n.directiveToIndex.set(p.type, d);
    p.contentQueries !== null && (n.flags |= 4), (p.hostBindings !== null || p.hostAttrs !== null || p.hostVars !== 0) && (n.flags |= 64);
    let h = p.type.prototype;
    !l && (h.ngOnChanges || h.ngOnInit || h.ngDoCheck) && ((e.preOrderHooks ??= []).push(n.index), l = !0), !u && (h.ngOnChanges || h.ngDoCheck) && ((e.preOrderCheckHooks ??= []).push(n.index), u = !0), d++;
} ix(e, n, i); }
function ix(e, t, n) { for (let r = t.directiveStart; r < t.directiveEnd; r++) {
    let o = e.data[r];
    if (n === null || !n.has(o))
        Fm(0, t, o, r), Fm(1, t, o, r), Vm(t, r, !1);
    else {
        let i = n.get(o);
        jm(0, t, i, r), jm(1, t, i, r), Vm(t, r, !0);
    }
} }
function Fm(e, t, n, r) { let o = e === 0 ? n.inputs : n.outputs; for (let i in o)
    if (o.hasOwnProperty(i)) {
        let s;
        e === 0 ? s = t.inputs ??= {} : s = t.outputs ??= {}, s[i] ??= [], s[i].push(r), _I(t, i);
    } }
function jm(e, t, n, r) { let o = e === 0 ? n.inputs : n.outputs; for (let i in o)
    if (o.hasOwnProperty(i)) {
        let s = o[i], a;
        e === 0 ? a = t.hostDirectiveInputs ??= {} : a = t.hostDirectiveOutputs ??= {}, a[s] ??= [], a[s].push(r, i), _I(t, s);
    } }
function _I(e, t) { t === "class" ? e.flags |= 8 : t === "style" && (e.flags |= 16); }
function Vm(e, t, n) { let { attrs: r, inputs: o, hostDirectiveInputs: i } = e; if (r === null || !n && o === null || n && i === null || Vf(e)) {
    e.initialInputs ??= [], e.initialInputs.push(null);
    return;
} let s = null, a = 0; for (; a < r.length;) {
    let c = r[a];
    if (c === 0) {
        a += 4;
        continue;
    }
    else if (c === 5) {
        a += 2;
        continue;
    }
    else if (typeof c == "number")
        break;
    if (!n && o.hasOwnProperty(c)) {
        let l = o[c];
        for (let u of l)
            if (u === t) {
                s ??= [], s.push(c, r[a + 1]);
                break;
            }
    }
    else if (n && i.hasOwnProperty(c)) {
        let l = i[c];
        for (let u = 0; u < l.length; u += 2)
            if (l[u] === t) {
                s ??= [], s.push(l[u + 1], r[a + 1]);
                break;
            }
    }
    a += 2;
} e.initialInputs ??= [], e.initialInputs.push(s); }
function sx(e, t, n, r, o) { e.data[r] = o; let i = o.factory || (o.factory = Yt(o.type, !0)), s = new Fn(i, Ye(o), ro, null); e.blueprint[r] = s, n[r] = s, ax(e, t, r, Wi(e, n, o.hostVars, $), o); }
function ax(e, t, n, r, o) { let i = o.hostBindings; if (i) {
    let s = e.hostBindingOpCodes;
    s === null && (s = e.hostBindingOpCodes = []);
    let a = ~t.index;
    cx(s) != a && s.push(a), s.push(n, r, i);
} }
function cx(e) { let t = e.length; for (; t > 0;) {
    let n = e[--t];
    if (typeof n == "number" && n < 0)
        return n;
} return 0; }
function lx(e, t, n) { if (n) {
    if (t.exportAs)
        for (let r = 0; r < t.exportAs.length; r++)
            n[t.exportAs[r]] = e;
    Ye(t) && (n[""] = e);
} }
function ux(e, t, n) { e.flags |= 1, e.directiveStart = t, e.directiveEnd = t + n, e.providerIndexes = t; }
function pp(e, t, n, r, o, i, s, a) { let c = t[m], l = c.consts, u = ye(l, s), d = Xn(c, e, n, r, u); return i && SI(c, t, d, ye(l, a), o), d.mergedAttrs = Or(d.mergedAttrs, d.attrs), d.attrs !== null && Aa(d, d.attrs, !1), d.mergedAttrs !== null && Aa(d, d.mergedAttrs, !0), c.queries !== null && c.queries.elementStart(c, d), d; }
function hp(e, t) { Av(e, t), Wl(t) && e.queries.elementEnd(t); }
function bI(e, t, n, r, o, i) { let s = t.consts, a = ye(s, o), c = Xn(t, e, n, r, a); if (c.mergedAttrs = Or(c.mergedAttrs, c.attrs), i != null) {
    let l = ye(s, i);
    c.localNames = [];
    for (let u = 0; u < l.length; u += 2)
        c.localNames.push(l[u], -1);
} return c.attrs !== null && Aa(c, c.attrs, !1), c.mergedAttrs !== null && Aa(c, c.mergedAttrs, !0), t.queries !== null && t.queries.elementStart(t, c), c; }
var AI = typeof ShadowRoot < "u", dx = typeof Document < "u";
function fx(e) { return Object.keys(e).map(t => { let [n, r, o] = e[t], i = { propName: n, templateName: t, isSignal: (r & pc.SignalBased) !== 0 }; return o && (i.transform = o), i; }); }
function px(e) { return Object.keys(e).map(t => ({ propName: e[t], templateName: t })); }
function hx(e, t, n) { let r = t instanceof Ae ? t : t?.injector; return r && e.getStandaloneInjector !== null && (r = e.getStandaloneInjector(r) || r), r ? new un(n, r) : n; }
function gx(e) { let t = e.get(Ei, null); if (t === null)
    throw new D(407, !1); let n = e.get(gI, null), r = e.get(qe, null), o = e.get(Jn, null, { optional: !0 }); return { rendererFactory: t, sanitizer: n, changeDetectionScheduler: r, ngReflect: !1, tracingService: o }; }
function mx(e, t) { let n = RI(e); return nc(t, n, n === "svg" ? Zl : n === "math" ? Yl : null); }
function vx(e) { if (e?.toLowerCase() === "script")
    throw new D(905, !1); }
function RI(e) { return (e.selectors[0][0] || "div").toLowerCase(); }
var $n = class {
    componentDef;
    ngModule;
    selector;
    componentType;
    ngContentSelectors;
    isBoundToModule;
    cachedInputs = null;
    cachedOutputs = null;
    get inputs() { return this.cachedInputs ??= fx(this.componentDef.inputs), this.cachedInputs; }
    get outputs() { return this.cachedOutputs ??= px(this.componentDef.outputs), this.cachedOutputs; }
    constructor(t, n) { this.componentDef = t, this.ngModule = n, this.componentType = t.type, this.selector = Ub(t.selectors), this.ngContentSelectors = t.ngContentSelectors ?? [], this.isBoundToModule = !!n; }
    create(t, n, r, o, i, s) { B(P.DynamicComponentStart); let a = C(null); try {
        let c = this.componentDef, l = hx(c, o || this.ngModule, t), u = gx(l), d = u.tracingService;
        return d && d.componentCreate ? d.componentCreate(dp(c), () => this.createComponentRef(u, l, n, r, i, s)) : this.createComponentRef(u, l, n, r, i, s);
    }
    finally {
        C(a);
    } }
    createComponentRef(t, n, r, o, i, s) { let a = this.componentDef, c = yx(o, a, s, i), l = t.rendererFactory.createRenderer(null, a), u = o ? EA(l, o, a.encapsulation, n) : mx(a, l); vx(u?.tagName); let d = n.get(wI, null), f = Ex(u, () => n.get(At, null) ?? ki()); d && d.addHost(f); let p = s?.some(Hm) || i?.some(y => typeof y != "function" && y.bindings.some(Hm)), h = fc(null, c, null, 512 | Xf(a), null, null, t, l, n, null, Ny(u, n, !0)); d && AI && f instanceof ShadowRoot && gr(h, () => { d.removeHost(f); }), h[I] = u, Fs(h); let v = null; try {
        let y = pp(I, h, 2, "#host", () => c.directiveRegistry, !0, 0);
        Zy(l, u, y), Ke(u, h), hc(c, h, y), bf(c, y, h), hp(c, y), r !== void 0 && Dx(y, this.ngContentSelectors, r), v = ve(y.index, h), h[V] = v[V], Ec(c, h, null);
    }
    catch (y) {
        throw v !== null && od(v), od(h), y;
    }
    finally {
        B(P.DynamicComponentEnd), js();
    } return new Ra(this.componentType, h, !!p); }
};
function yx(e, t, n, r) { let o = e ? ["ng-version", "22.0.8"] : $b(t.selectors[0]), i = null, s = null, a = 0; if (n)
    for (let u of n)
        a += u[Lt].requiredVars, u.create && (u.targetIdx = 0, (i ??= []).push(u)), u.update && (u.targetIdx = 0, (s ??= []).push(u)); if (r)
    for (let u = 0; u < r.length; u++) {
        let d = r[u];
        if (typeof d != "function")
            for (let f of d.bindings) {
                a += f[Lt].requiredVars;
                let p = u + 1;
                f.create && (f.targetIdx = p, (i ??= []).push(f)), f.update && (f.targetIdx = p, (s ??= []).push(f));
            }
    } let c = [t]; if (r)
    for (let u of r) {
        let d = typeof u == "function" ? u : u.type, f = Le(d);
        c.push(f);
    } return Jf(0, null, Ix(i, s), 1, a, c, null, null, null, [o], null); }
function Ex(e, t) { let n = e.getRootNode?.(); return dx && n instanceof Document ? n.head : n && AI && n instanceof ShadowRoot ? n : t().head; }
function Ix(e, t) { return !e && !t ? null : n => { if (n & 1 && e)
    for (let r of e)
        r.create(); if (n & 2 && t)
    for (let r of t)
        r.update(); }; }
function Hm(e) { let t = e[Lt].kind; return t === "input" || t === "twoWay"; }
var Ra = class extends hI {
    _rootLView;
    _hasInputBindings;
    instance;
    hostView;
    changeDetectorRef;
    componentType;
    location;
    previousInputValues = null;
    _tNode;
    constructor(t, n, r) { super(), this._rootLView = n, this._hasInputBindings = r, this._tNode = on(n[m], I), this.location = Gr(this._tNode, n), this.instance = ve(this._tNode.index, n)[V], this.hostView = this.changeDetectorRef = new pn(n, void 0), this.componentType = t; }
    setInput(t, n) { this._hasInputBindings; let r = this._tNode; if (this.previousInputValues ??= new Map, this.previousInputValues.has(t) && Object.is(this.previousInputValues.get(t), n))
        return; let o = this._rootLView, i = yc(r, o[m], o, t, n); this.previousInputValues.set(t, n); let s = ve(r.index, o); Dc(s, 1); }
    get injector() { return new Ne(this._tNode, this._rootLView); }
    destroy() { this.hostView.destroy(); }
    onDestroy(t) { this.hostView.onDestroy(t); }
};
function Dx(e, t, n) { let r = e.projection = []; for (let o = 0; o < t.length; o++) {
    let i = n[o];
    r.push(i != null && i.length ? Array.from(i) : null);
} }
var Ac = (() => { class e {
    static __NG_ELEMENT_ID__ = Tx;
} return e; })();
function Tx() { let e = _(); return xI(e, g()); }
var Ld = class e extends Ac {
    _lContainer;
    _hostTNode;
    _hostLView;
    constructor(t, n, r) { super(), this._lContainer = t, this._hostTNode = n, this._hostLView = r; }
    get element() { return Gr(this._hostTNode, this._hostLView); }
    get injector() { return new Ne(this._hostTNode, this._hostLView); }
    get parentInjector() { let t = af(this._hostTNode, this._hostLView); if (Ov(t)) {
        let n = pa(t, this._hostLView), r = fa(t), o = n[m].data[r + 8];
        return new Ne(o, n);
    }
    else
        return new Ne(null, this._hostLView); }
    clear() { for (; this.length > 0;)
        this.remove(this.length - 1); }
    get(t) { let n = Bm(this._lContainer); return n !== null && n[t] || null; }
    get length() { return this._lContainer.length - G; }
    createEmbeddedView(t, n, r) { let o, i; typeof r == "number" ? o = r : r != null && (o = r.index, i = r.injector); let s = yi(this._lContainer, t.ssrId), a = t.createEmbeddedViewImpl(n || {}, i, s); return this.insertImpl(a, o, Bn(this._hostTNode, s)), a; }
    createComponent(t, n, r, o, i, s, a) { let c, l = n || {}; c = l.index, r = l.injector, o = l.projectableNodes, i = l.environmentInjector || l.ngModuleRef, s = l.directives, a = l.bindings; let u = new $n(W(t)), d = r || this.parentInjector; if (!i && u.ngModule == null) {
        let T = this.parentInjector.get(Ae, null);
        T && (i = T);
    } let f = W(u.componentType ?? {}), p = yi(this._lContainer, f?.id ?? null), h = p?.firstChild ?? null, v = u.create(d, o, h, i, s, a); return this.insertImpl(v.hostView, c, Bn(this._hostTNode, p)), v; }
    insert(t, n) { return this.insertImpl(t, n, !0); }
    insertImpl(t, n, r) { let o = t._lView; if (Lg(o)) {
        let a = this.indexOf(t);
        if (a !== -1)
            this.detach(a);
        else {
            let c = o[z], l = new e(c, c[le], c[z]);
            l.detach(l.indexOf(t));
        }
    } let i = this._adjustIndex(n), s = this._lContainer; return eo(s, o, i, r), t.attachToViewContainerRef(), Fl(Hu(s), i, t), t; }
    move(t, n) { return this.insert(t, n); }
    indexOf(t) { let n = Bm(this._lContainer); return n !== null ? n.indexOf(t) : -1; }
    remove(t) { let n = this._adjustIndex(t, -1), r = gi(this._lContainer, n); r && (xo(Hu(this._lContainer), n), qi(r[m], r)); }
    detach(t) { let n = this._adjustIndex(t, -1), r = gi(this._lContainer, n); return r && xo(Hu(this._lContainer), n) != null ? new pn(r) : null; }
    _adjustIndex(t, n = 0) { return t ?? this.length + n; }
};
function Bm(e) { return e[jo]; }
function Hu(e) { return e[jo] || (e[jo] = []); }
function xI(e, t) { let n, r = t[e.index]; return J(r) ? n = r : (n = BE(r, t, null, e), t[e.index] = n, ep(t, n)), kI(n, t, e, r), new Ld(n, e, t); }
function Cx(e, t) { let n = e[S], r = n.createComment(""), o = ae(t, e), i = n.parentNode(o); return jn(n, i, r, n.nextSibling(o), !1), r; }
var kI = LI, gp = () => !1;
function OI(e, t, n) { return gp(e, t, n); }
function LI(e, t, n, r) { if (e[it])
    return; let o; n.type & 8 ? o = L(r) : o = Cx(t, n), e[it] = o; }
function Mx(e, t, n) { if (e[it] && e[Ve])
    return !0; let r = n[pe], o = t.index - I; if (!r || qr(t) || Xa(r, o))
    return !1; let s = ld(r, o), a = r.data[Wr]?.[o]; if (a === void 0)
    return !1; let [c, l] = FR(s, a); return e[it] = c, e[Ve] = l, !0; }
function wx(e, t, n, r) { gp(e, n, t) || LI(e, t, n, r); }
function PI() { kI = wx, gp = Mx; }
var Pd = class e {
    queryList;
    matches = null;
    constructor(t) { this.queryList = t; }
    clone() { return new e(this.queryList); }
    setDirty() { this.queryList.setDirty(); }
}, Fd = class e {
    queries;
    constructor(t = []) { this.queries = t; }
    createEmbeddedView(t) { let n = t.queries; if (n !== null) {
        let r = t.contentQueries !== null ? t.contentQueries[0] : n.length, o = [];
        for (let i = 0; i < r; i++) {
            let s = n.getByIndex(i), a = this.queries[s.indexInDeclarationView];
            o.push(a.clone());
        }
        return new e(o);
    } return null; }
    insertView(t) { this.dirtyQueriesWithMatches(t); }
    detachView(t) { this.dirtyQueriesWithMatches(t); }
    finishViewCreation(t) { this.dirtyQueriesWithMatches(t); }
    dirtyQueriesWithMatches(t) { for (let n = 0; n < this.queries.length; n++)
        vp(t, n).matches !== null && this.queries[n].setDirty(); }
}, xa = class {
    flags;
    read;
    predicate;
    constructor(t, n, r = null) { this.flags = n, this.read = r, typeof t == "string" ? this.predicate = Ax(t) : this.predicate = t; }
}, jd = class e {
    queries;
    constructor(t = []) { this.queries = t; }
    elementStart(t, n) { for (let r = 0; r < this.queries.length; r++)
        this.queries[r].elementStart(t, n); }
    elementEnd(t) { for (let n = 0; n < this.queries.length; n++)
        this.queries[n].elementEnd(t); }
    embeddedTView(t) { let n = null; for (let r = 0; r < this.length; r++) {
        let o = n !== null ? n.length : 0, i = this.getByIndex(r).embeddedTView(t, o);
        i && (i.indexInDeclarationView = r, n !== null ? n.push(i) : n = [i]);
    } return n !== null ? new e(n) : null; }
    template(t, n) { for (let r = 0; r < this.queries.length; r++)
        this.queries[r].template(t, n); }
    getByIndex(t) { return this.queries[t]; }
    get length() { return this.queries.length; }
    track(t) { this.queries.push(t); }
}, Vd = class e {
    metadata;
    matches = null;
    indexInDeclarationView = -1;
    crossesNgTemplate = !1;
    _declarationNodeIndex;
    _appliesToNextNode = !0;
    constructor(t, n = -1) { this.metadata = t, this._declarationNodeIndex = n; }
    elementStart(t, n) { this.isApplyingToNode(n) && this.matchTNode(t, n); }
    elementEnd(t) { this._declarationNodeIndex === t.index && (this._appliesToNextNode = !1); }
    template(t, n) { this.elementStart(t, n); }
    embeddedTView(t, n) { return this.isApplyingToNode(t) ? (this.crossesNgTemplate = !0, this.addMatch(-t.index, n), new e(this.metadata)) : null; }
    isApplyingToNode(t) { if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
        let n = this._declarationNodeIndex, r = t.parent;
        for (; r !== null && r.type & 8 && r.index !== n;)
            r = r.parent;
        return n === (r !== null ? r.index : -1);
    } return this._appliesToNextNode; }
    matchTNode(t, n) { let r = this.metadata.predicate; if (Array.isArray(r))
        for (let o = 0; o < r.length; o++) {
            let i = r[o];
            this.matchTNodeWithReadOption(t, n, Nx(n, i)), this.matchTNodeWithReadOption(t, n, oa(n, t, i, !1, !1));
        }
    else
        r === mi ? n.type & 4 && this.matchTNodeWithReadOption(t, n, -1) : this.matchTNodeWithReadOption(t, n, oa(n, t, r, !1, !1)); }
    matchTNodeWithReadOption(t, n, r) { if (r !== null) {
        let o = this.metadata.read;
        if (o !== null)
            if (o === xi || o === Ac || o === mi && n.type & 4)
                this.addMatch(n.index, -2);
            else {
                let i = oa(n, t, o, !1, !1);
                i !== null && this.addMatch(n.index, i);
            }
        else
            this.addMatch(n.index, r);
    } }
    addMatch(t, n) { this.matches === null ? this.matches = [t, n] : this.matches.push(t, n); }
};
function Nx(e, t) { let n = e.localNames; if (n !== null) {
    for (let r = 0; r < n.length; r += 2)
        if (n[r] === t)
            return n[r + 1];
} return null; }
function Sx(e, t) { return e.type & 11 ? Gr(e, t) : e.type & 4 ? Tc(e, t) : null; }
function _x(e, t, n, r) { return n === -1 ? Sx(t, e) : n === -2 ? bx(e, t, r) : li(e, e[m], n, t); }
function bx(e, t, n) { if (n === xi)
    return Gr(t, e); if (n === mi)
    return Tc(t, e); if (n === Ac)
    return xI(t, e); }
function FI(e, t, n, r) { let o = t[dt].queries[r]; if (o.matches === null) {
    let i = e.data, s = n.matches, a = [];
    for (let c = 0; s !== null && c < s.length; c += 2) {
        let l = s[c];
        if (l < 0)
            a.push(null);
        else {
            let u = i[l];
            a.push(_x(t, u, s[c + 1], n.metadata.read));
        }
    }
    o.matches = a;
} return o.matches; }
function Hd(e, t, n, r) { let o = e.queries.getByIndex(n), i = o.matches; if (i !== null) {
    let s = FI(e, t, o, n);
    for (let a = 0; a < i.length; a += 2) {
        let c = i[a];
        if (c > 0)
            r.push(s[a / 2]);
        else {
            let l = i[a + 1], u = t[-c];
            for (let d = G; d < u.length; d++) {
                let f = u[d];
                f[rn] === f[z] && Hd(f[m], f, l, r);
            }
            if (u[_n] !== null) {
                let d = u[_n];
                for (let f = 0; f < d.length; f++) {
                    let p = d[f];
                    Hd(p[m], p, l, r);
                }
            }
        }
    }
} return r; }
function mp(e, t) { return e[dt].queries[t].queryList; }
function jI(e, t, n) { let r = new ya((n & 4) === 4); return Pg(e, t, r, r.destroy), (t[dt] ??= new Fd).queries.push(new Pd(r)) - 1; }
function VI(e, t, n) { let r = R(); return r.firstCreatePass && (BI(r, new xa(e, t, n), -1), (t & 2) === 2 && (r.staticViewQueries = !0)), jI(r, g(), t); }
function HI(e, t, n, r) { let o = R(); if (o.firstCreatePass) {
    let i = _();
    BI(o, new xa(t, n, r), i.index), Rx(o, e), (n & 2) === 2 && (o.staticContentQueries = !0);
} return jI(o, g(), n); }
function Ax(e) { return e.split(",").map(t => t.trim()); }
function BI(e, t, n) { e.queries === null && (e.queries = new jd), e.queries.track(new Vd(t, n)); }
function Rx(e, t) { let n = e.contentQueries || (e.contentQueries = []), r = n.length ? n[n.length - 1] : -1; t !== r && n.push(e.queries.length - 1, t); }
function vp(e, t) { return e.queries.getByIndex(t); }
function UI(e, t) { let n = e[m], r = vp(n, t); return r.crossesNgTemplate ? Hd(n, e, t, []) : FI(n, e, r, t); }
function yp(e, t, n) { let r, o = fo(() => { r._dirtyCounter(); let i = xx(r, e); if (t && i === void 0)
    throw new D(-951, !1); return i; }); return r = o[Y], r._dirtyCounter = yt(0), r._flatValue = void 0, o; }
function Ep(e) { return yp(!0, !1, e); }
function Ip(e) { return yp(!0, !0, e); }
function Dp(e) { return yp(!1, !1, e); }
function $I(e, t) { let n = e[Y]; n._lView = g(), n._queryIndex = t, n._queryList = mp(n._lView, t), n._queryList.onDirty(() => n._dirtyCounter.update(r => r + 1)); }
function xx(e, t) { let n = e._lView, r = e._queryIndex; if (n === void 0 || r === void 0 || n[N] & 4)
    return t ? void 0 : j; let o = mp(n, r), i = UI(n, r); return o.reset(i, Jv), t ? o.first : o._changesDetected || e._flatValue === void 0 ? e._flatValue = o.toArray() : e._flatValue; }
function Tp(e) { return !!e && typeof e.then == "function"; }
function GI(e) { return !!e && typeof e.subscribe == "function"; }
var Gn = class {
}, qI = class {
};
function kx(e, t) { return new jr(e, t ?? null, []); }
var jr = class extends Gn {
    ngModuleType;
    _parent;
    _bootstrapComponents = [];
    _r3Injector;
    instance;
    destroyCbs = [];
    constructor(t, n, r, o = !0) { super(), this.ngModuleType = t, this._parent = n; let i = lr(t); this._bootstrapComponents = Zo(i.bootstrap), this._r3Injector = Iu(t, n, [{ provide: Gn, useValue: this }, ...r], Co(t), new Set(["environment"])), o && this.resolveInjectorInitializers(); }
    resolveInjectorInitializers() { this._r3Injector.resolveInjectorInitializers(), this.instance = this._r3Injector.get(this.ngModuleType); }
    get injector() { return this._r3Injector; }
    destroy() { let t = this._r3Injector; !t.destroyed && t.destroy(), this.destroyCbs.forEach(n => n()), this.destroyCbs = null; }
    onDestroy(t) { this.destroyCbs.push(t); }
}, Vr = class extends qI {
    moduleType;
    constructor(t) { super(), this.moduleType = t; }
    create(t) { return new jr(this.moduleType, t, []); }
};
function WI(e, t, n) { return new jr(e, t, n, !1); }
var Di = class extends Gn {
    injector;
    instance = null;
    constructor(t) { super(); let n = new nt([...t.providers, { provide: Gn, useValue: this }], t.parent || fr(), t.debugName, new Set(["environment"])); this.injector = n, t.runEnvironmentInitializers && n.resolveInjectorInitializers(); }
    destroy() { this.injector.destroy(); }
    onDestroy(t) { this.injector.onDestroy(t); }
};
function Cp(e, t, n = null) { return new Di({ providers: e, parent: t, debugName: n, runEnvironmentInitializers: !0 }).injector; }
var Ox = (() => { class e {
    _injector;
    cachedInjectors = new Map;
    constructor(n) { this._injector = n; }
    getOrCreateStandaloneInjector(n) { if (!n.standalone)
        return null; if (!this.cachedInjectors.has(n)) {
        let r = Ss(!1, n.type), o = r.length > 0 ? Cp([r], this._injector, "") : null;
        this.cachedInjectors.set(n, o);
    } return this.cachedInjectors.get(n); }
    ngOnDestroy() { try {
        for (let n of this.cachedInjectors.values())
            n !== null && n.destroy();
    }
    finally {
        this.cachedInjectors.clear();
    } }
    static \u0275prov = K({ token: e, providedIn: "environment", factory: () => new e(ge(Ae)) });
} return e; })();
function zI(e) { return Dt(() => { let t = KI(e), n = X(O({}, t), { decls: e.decls, vars: e.vars, template: e.template, consts: e.consts || null, ngContentSelectors: e.ngContentSelectors, onPush: e.changeDetection !== $a.Eager, directiveDefs: null, pipeDefs: null, dependencies: t.standalone && e.dependencies || null, getStandaloneInjector: t.standalone ? o => o.get(Ox).getOrCreateStandaloneInjector(n) : null, getExternalStyles: null, signals: e.signals ?? !1, data: e.data || {}, encapsulation: e.encapsulation || Je.Emulated, styles: e.styles || j, _: null, schemas: e.schemas || null, tView: null, id: "" }); t.standalone && re("NgStandalone"), JI(n); let r = e.dependencies; return n.directiveDefs = ka(r, QI), n.pipeDefs = ka(r, rt), n.id = jx(n), n; }); }
function QI(e) { return W(e) || Le(e); }
function Mp(e) { return Dt(() => ({ type: e.type, bootstrap: e.bootstrap || j, declarations: e.declarations || j, imports: e.imports || j, exports: e.exports || j, transitiveCompileScopes: null, schemas: e.schemas || null, id: e.id || null })); }
function Lx(e, t) { if (e == null)
    return bt; let n = {}; for (let r in e)
    if (e.hasOwnProperty(r)) {
        let o = e[r], i, s, a, c;
        Array.isArray(o) ? (a = o[0], i = o[1], s = o[2] ?? i, c = o[3] || null) : (i = o, s = o, a = pc.None, c = null), n[i] = [r, a, c], t[i] = s;
    } return n; }
function Px(e) { if (e == null)
    return bt; let t = {}; for (let n in e)
    e.hasOwnProperty(n) && (t[e[n]] = n); return t; }
function ZI(e) { return Dt(() => { let t = KI(e); return JI(t), t; }); }
function YI(e) { return { type: e.type, name: e.name, factory: null, pure: e.pure !== !1, standalone: e.standalone ?? !0, onDestroy: e.type.prototype.ngOnDestroy || null }; }
function KI(e) { let t = {}; return { type: e.type, providersResolver: null, viewProvidersResolver: null, factory: null, hostBindings: e.hostBindings || null, hostVars: e.hostVars || 0, hostAttrs: e.hostAttrs || null, contentQueries: e.contentQueries || null, declaredInputs: t, inputConfig: e.inputs || bt, exportAs: e.exportAs || null, standalone: e.standalone ?? !0, signals: e.signals === !0, selectors: e.selectors || j, viewQuery: e.viewQuery || null, features: e.features || null, setInput: null, resolveHostDirectives: null, hostDirectives: null, controlDef: null, signalFormsInputPresence: null, inputs: Lx(e.inputs, t), outputs: Px(e.outputs), debugInfo: null }; }
function JI(e) { e.features?.forEach(t => t(e)); }
function ka(e, t) { return e ? () => { let n = typeof e == "function" ? e() : e, r = []; for (let o of n) {
    let i = t(o);
    i !== null && r.push(i);
} return r; } : null; }
var Fx = new Map;
function jx(e) { let t = 0, n = typeof e.consts == "function" ? "" : e.consts, r = [e.selectors, e.ngContentSelectors, e.hostVars, e.hostAttrs, n, e.vars, e.decls, e.encapsulation, e.standalone, e.signals, e.exportAs, JSON.stringify(e.inputs), JSON.stringify(e.outputs), Object.getOwnPropertyNames(e.type.prototype), !!e.contentQueries, !!e.viewQuery]; for (let i of r.join("|"))
    t = Math.imul(31, t) + i.charCodeAt(0) << 0; return t += 2147483648, "c" + t; }
var ei = "__ngAsyncComponentMetadataFn__", XI = "__ngAsyncMetadataLoaded__";
function Vx(e) { let t = e; return t[ei] === XI ? null : t[ei] ?? null; }
function eD(e, t, n) { let r = e; return r[ei] = () => Promise.all(t()).then(o => (n(...o), r[ei] = XI, o)), r[ei]; }
function wp(e, t, n, r) { return Dt(() => { let o = e; t !== null && (o.hasOwnProperty("decorators") && o.decorators !== void 0 ? o.decorators.push(...t) : o.decorators = t), n !== null && (o.ctorParameters = n), r !== null && (o.hasOwnProperty("propDecorators") && o.propDecorators !== void 0 ? o.propDecorators = O(O({}, o.propDecorators), r) : o.propDecorators = r); }); }
var Np = new M("");
function tD(e) { return Fe([{ provide: Np, multi: !0, useValue: e }]); }
var Sp = (() => { class e {
    resolve;
    reject;
    initialized = !1;
    done = !1;
    donePromise = new Promise((n, r) => { this.resolve = n, this.reject = r; });
    appInits = E(Np, { optional: !0 }) ?? [];
    injector = E(ie);
    constructor() { }
    runInitializers() { if (this.initialized)
        return; let n = []; for (let o of this.appInits) {
        let i = Po(this.injector, o);
        if (Tp(i))
            n.push(i);
        else if (GI(i)) {
            let s = new Promise((a, c) => { i.subscribe({ complete: a, error: c }); });
            n.push(s);
        }
    } let r = () => { this.done = !0, this.resolve(); }; Promise.all(n).then(() => { r(); }).catch(o => { this.reject(o); }), n.length === 0 && r(), this.initialized = !0; }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = Vt({ token: e, factory: e.\u0275fac });
} return e; })(), qn = new Map, Ti = new Set;
function nD(e) { return Te(this, null, function* () { let t = qn; qn = new Map; let n = new Map; function r(i) { let s = n.get(i); if (s)
    return s; let a = e(i).then(c => Gx(i, c)); return n.set(i, a), a; } let o = Array.from(t).map(a => Te(null, [a], function* ([i, s]) { if (s.styleUrl && s.styleUrls?.length)
    throw new Error("@Component cannot define both `styleUrl` and `styleUrls`. Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple"); let c = []; s.templateUrl && c.push(r(s.templateUrl).then(f => { s.template = f; })); let l = typeof s.styles == "string" ? [s.styles] : s.styles ?? []; s.styles = l; let { styleUrl: u, styleUrls: d } = s; if (u && (d = [u], s.styleUrl = void 0), d?.length) {
    let f = Promise.all(d.map(p => r(p))).then(p => { l.push(...p), s.styleUrls = void 0; });
    c.push(f);
} yield Promise.all(c), Ti.delete(i); })); yield Promise.all(o); }); }
function Hx(e, t) { rD(t) && (qn.set(e, t), Ti.add(e)); }
function Bx(e) { return Ti.has(e); }
function rD(e) { return !!(e.templateUrl && !e.hasOwnProperty("template") || e.styleUrls?.length || e.styleUrl); }
function Ux() { let e = qn; return qn = new Map, e; }
function $x(e) { Ti.clear(); for (let t of e.keys())
    Ti.add(t); qn = e; }
function oD() { return qn.size === 0; }
function Gx(e, t) { return Te(this, null, function* () { if (typeof t == "string")
    return t; if (t.status !== void 0 && t.status !== 200)
    throw new D(918, !1); return t.text(); }); }
var Bd = new Map, iD = !0;
function qx(e, t, n) { if (t && t !== n && iD)
    throw new D(921, !1); }
function _p(e, t) { let n = Bd.get(t) || null; qx(t, n, e), Bd.set(t, e); }
function bp(e) { return Bd.get(e); }
function Wx(e) { iD = !e; }
function sD(e) { return t => { t.controlDef = { create: (n, r) => { n?.\u0275ngControlCreate(r); }, update: (n, r) => { n?.\u0275ngControlUpdate?.(r); }, passThroughInput: e }; }; }
function aD(e) { let t = n => { let r = Array.isArray(e); n.hostDirectives === null ? (n.resolveHostDirectives = zx, n.hostDirectives = r ? e.map(Ud) : [e]) : r ? n.hostDirectives.unshift(...e.map(Ud)) : n.hostDirectives.unshift(e); }; return t.ngInherit = !0, t; }
function zx(e) { let t = [], n = !1, r = null, o = null; for (let i = 0; i < e.length; i++) {
    let s = e[i];
    if (s.hostDirectives !== null) {
        let a = t.length;
        r ??= new Map, o ??= new Map, cD(s, t, r, e), o.set(s, [a, t.length - 1]);
    }
    i === 0 && Ye(s) && (n = !0, t.push(s));
} for (let i = n ? 1 : 0; i < e.length; i++)
    t.push(e[i]); return r !== null && r.forEach((i, s) => { Qx(s.declaredInputs, i.inputs); }), [t, r, o]; }
function cD(e, t, n, r) { if (e.hostDirectives !== null)
    for (let o of e.hostDirectives)
        if (typeof o == "function") {
            let i = o();
            for (let s of i)
                Um(Ud(s), t, n, r);
        }
        else
            Um(o, t, n, r); }
function Um(e, t, n, r) { let o = Le(e.directive); if (cD(o, t, n, r), n.has(o)) {
    let i = n.get(o);
    $m(i, e.inputs, "input"), $m(i, e.outputs, "output");
}
else
    r.includes(o) || (n.set(o, e), t.push(o)); }
function $m(e, t, n) { let r = n === "input" ? e.inputs : e.outputs; Object.keys(t).forEach(o => { let i = t[o]; (!r.hasOwnProperty(o) || r[o] === i) && (r[o] = i); }); }
function Ud(e) { return typeof e == "function" ? { directive: F(e), inputs: {}, outputs: {} } : { directive: F(e.directive), inputs: Gm(e.inputs), outputs: Gm(e.outputs) }; }
function Gm(e) { let t = {}; if (e !== void 0 && e.length > 0)
    for (let n = 0; n < e.length; n += 2)
        t[e[n]] = e[n + 1]; return t; }
function Qx(e, t) { for (let n in t)
    if (t.hasOwnProperty(n)) {
        let r = t[n], o = e[n];
        e[r] = o;
    } }
function Zx(e) { return Object.getPrototypeOf(e.prototype).constructor; }
function Ap(e) { let t = Zx(e.type), n = !0, r = [e]; for (; t;) {
    let o;
    if (Ye(e))
        o = t.\u0275cmp || t.\u0275dir;
    else {
        if (t.\u0275cmp)
            throw new D(903, !1);
        o = t.\u0275dir;
    }
    if (o) {
        if (n) {
            r.push(o);
            let s = e;
            s.inputs = Bu(e.inputs), s.declaredInputs = Bu(e.declaredInputs), s.outputs = Bu(e.outputs);
            let a = o.hostBindings;
            a && ek(e, a);
            let c = o.viewQuery, l = o.contentQueries;
            if (c && Jx(e, c), l && Xx(e, l), Yx(e, o), Dg(e.outputs, o.outputs), Ye(o) && o.data.animation) {
                let u = e.data;
                u.animation = (u.animation || []).concat(o.data.animation);
            }
        }
        let i = o.features;
        if (i)
            for (let s = 0; s < i.length; s++) {
                let a = i[s];
                a && a.ngInherit && a(e), a === Ap && (n = !1);
            }
    }
    t = Object.getPrototypeOf(t);
} Kx(r); }
function Yx(e, t) { for (let n in t.inputs) {
    if (!t.inputs.hasOwnProperty(n) || e.inputs.hasOwnProperty(n))
        continue;
    let r = t.inputs[n];
    r !== void 0 && (e.inputs[n] = r, e.declaredInputs[n] = t.declaredInputs[n]);
} }
function Kx(e) { let t = 0, n = null; for (let r = e.length - 1; r >= 0; r--) {
    let o = e[r];
    o.hostVars = t += o.hostVars, o.hostAttrs = Or(o.hostAttrs, n = Or(n, o.hostAttrs));
} }
function Bu(e) { return e === bt ? {} : e === j ? [] : e; }
function Jx(e, t) { let n = e.viewQuery; n ? e.viewQuery = (r, o) => { t(r, o), n(r, o); } : e.viewQuery = t; }
function Xx(e, t) { let n = e.contentQueries; n ? e.contentQueries = (r, o, i) => { t(r, o, i), n(r, o, i); } : e.contentQueries = t; }
function ek(e, t) { let n = e.hostBindings; n ? e.hostBindings = (r, o) => { t(r, o), n(r, o); } : e.hostBindings = t; }
function lD(e, t, n, r, o, i, s, a) { if (n.firstCreatePass) {
    e.mergedAttrs = Or(e.mergedAttrs, e.attrs);
    let u = e.tView = Jf(2, e, o, i, s, n.directiveRegistry, n.pipeRegistry, null, n.schemas, n.consts, null);
    n.queries !== null && (n.queries.template(n, e), u.queries = n.queries.embeddedTView(e));
} a && (e.flags |= a), pt(e, !1); let c = uD(n, t, e, r); Go() && Yf(n, t, c, e), Ke(c, t); let l = BE(c, t, c, e); t[r + I] = l, ep(t, l), OI(l, e, t); }
function tk(e, t, n, r, o, i, s, a, c, l, u) { let d = n + I, f; return t.firstCreatePass ? (f = Xn(t, d, 4, s || null, a || null), ks() && SI(t, e, f, ye(t.consts, l), rp), Av(t, f)) : f = t.data[d], lD(f, e, t, n, r, o, i, c), pr(f) && hc(t, e, f), l != null && Jr(e, f, u), f; }
function Wn(e, t, n, r, o, i, s, a, c, l, u) { let d = n + I, f; if (t.firstCreatePass) {
    if (f = Xn(t, d, 4, s || null, a || null), l != null) {
        let p = ye(t.consts, l);
        f.localNames = [];
        for (let h = 0; h < p.length; h += 2)
            f.localNames.push(p[h], -1);
    }
}
else
    f = t.data[d]; return lD(f, e, t, n, r, o, i, c), l != null && Jr(e, f, u), f; }
function Rp(e, t, n, r, o, i, s, a) { let c = g(), l = R(), u = ye(l.consts, i); return tk(c, l, e, t, n, r, o, u, void 0, s, a), Rp; }
function xp(e, t, n, r, o, i, s, a) { let c = g(), l = R(), u = ye(l.consts, i); return Wn(c, l, e, t, n, r, o, u, void 0, s, a), xp; }
var uD = dD;
function dD(e, t, n, r) { return at(!0), t[S].createComment(""); }
function nk(e, t, n, r) { let o = !ec(t, n); at(o); let i = t[pe]?.data[qa]?.[r] ?? null; if (i !== null && n.tView !== null && n.tView.ssrId === null && (n.tView.ssrId = i), o)
    return dD(e, t); let s = t[pe], a = zi(s, e, t, n); Ja(s, r, a); let c = Sf(s, r); return Mc(c, a); }
function fD() { uD = nk; }
var de = (function (e) { return e[e.NOT_STARTED = 0] = "NOT_STARTED", e[e.IN_PROGRESS = 1] = "IN_PROGRESS", e[e.COMPLETE = 2] = "COMPLETE", e[e.FAILED = 3] = "FAILED", e; })(de || {}), qm = 0, rk = 1, Q = (function (e) { return e[e.Placeholder = 0] = "Placeholder", e[e.Loading = 1] = "Loading", e[e.Complete = 2] = "Complete", e[e.Error = 3] = "Error", e; })(Q || {}), Ci = (function (e) { return e[e.Initial = -1] = "Initial", e; })(Ci || {}), Rr = 0, $t = 1, Ko = 2, Xs = 3, ok = 4, ik = 5, Rc = 6, sk = 7, xr = 8, ak = 9, kp = (function (e) { return e[e.Manual = 0] = "Manual", e[e.Playthrough = 1] = "Playthrough", e; })(kp || {});
function Qi(e, t, n) { let r = hD(e); t[r] === null && (t[r] = []), t[r].push(n); }
function ca(e, t) { let n = hD(e), r = t[n]; if (r !== null) {
    for (let o of r)
        o();
    t[n] = null;
} }
function pD(e) { ca(1, e), ca(0, e), ca(2, e); }
function hD(e) { let t = ok; return e === 1 ? t = ik : e === 2 && (t = ak), t; }
function Zi(e) { return e + 1; }
function _e(e, t) { let n = e[m], r = Zi(t.index); return e[r]; }
function ck(e, t, n) { let r = e[m], o = Zi(t); e[o] = n; }
function he(e, t) { let n = Zi(t.index); return e.data[n]; }
function lk(e, t, n) { let r = Zi(t); e.data[r] = n; }
function uk(e, t, n) { let r = t[m], o = he(r, n); switch (e) {
    case Q.Complete: return o.primaryTmplIndex;
    case Q.Loading: return o.loadingTmplIndex;
    case Q.Error: return o.errorTmplIndex;
    case Q.Placeholder: return o.placeholderTmplIndex;
    default: return null;
} }
function $d(e, t) { return t === Q.Placeholder ? e.placeholderBlockConfig?.[qm] ?? null : t === Q.Loading ? e.loadingBlockConfig?.[qm] ?? null : null; }
function gD(e) { return e.loadingBlockConfig?.[rk] ?? null; }
function Wm(e, t) { if (!e || e.length === 0)
    return t; let n = new Set(e); for (let r of t)
    n.add(r); return e.length === n.size ? e : Array.from(n); }
function dk(e, t) { let n = t.primaryTmplIndex + I; return on(e, n); }
function mD(e) { return e !== null && typeof e == "object" && typeof e.primaryTmplIndex == "number"; }
function vD(e, t) { let n = null, r = Zi(t.index); return I < r && r < e.bindingStartIndex && (n = he(e, t)), !!n && mD(n); }
var fk = (() => { class e {
    cachedInjectors = new Map;
    getOrCreateInjector(n, r, o, i) { if (!this.cachedInjectors.has(n)) {
        let s = o.length > 0 ? Cp(o, r, i) : null;
        this.cachedInjectors.set(n, s);
    } return this.cachedInjectors.get(n); }
    ngOnDestroy() { try {
        for (let n of this.cachedInjectors.values())
            n !== null && n.destroy();
    }
    finally {
        this.cachedInjectors.clear();
    } }
    static \u0275prov = K({ token: e, providedIn: "environment", factory: () => new e });
} return e; })();
function xc(e) { return (t, n) => yD(e, t, n); }
function yD(e, t, n) { let r = n.get(ED), o = n.get(q), i = () => r.remove(t); return r.add(e, t, o), i; }
var ED = (() => { class e {
    executingCallbacks = !1;
    timeoutId = null;
    invokeTimerAt = null;
    current = [];
    deferred = [];
    add(n, r, o) { let i = this.executingCallbacks ? this.deferred : this.current; this.addToQueue(i, Date.now() + n, r), this.scheduleTimer(o); }
    remove(n) { let { current: r, deferred: o } = this; this.removeFromQueue(r, n) === -1 && this.removeFromQueue(o, n), r.length === 0 && o.length === 0 && this.clearTimeout(); }
    addToQueue(n, r, o) { let i = n.length; for (let s = 0; s < n.length; s += 2)
        if (n[s] > r) {
            i = s;
            break;
        } Vl(n, i, r, o); }
    removeFromQueue(n, r) { let o = -1; for (let i = 0; i < n.length; i += 2)
        if (n[i + 1] === r) {
            o = i;
            break;
        } return o > -1 && jl(n, o, 2), o; }
    scheduleTimer(n) { let r = () => { this.clearTimeout(), this.executingCallbacks = !0; let i = [...this.current], s = Date.now(); for (let c = 0; c < i.length; c += 2) {
        let l = i[c], u = i[c + 1];
        if (l <= s)
            u();
        else
            break;
    } let a = -1; for (let c = 0; c < this.current.length && this.current[c] <= s; c += 2)
        a = c + 1; if (a >= 0 && jl(this.current, 0, a + 1), this.executingCallbacks = !1, this.deferred.length > 0) {
        for (let c = 0; c < this.deferred.length; c += 2) {
            let l = this.deferred[c], u = this.deferred[c + 1];
            this.addToQueue(this.current, l, u);
        }
        this.deferred.length = 0;
    } this.scheduleTimer(n); }; if (this.current.length > 0) {
        let i = Date.now(), s = this.current[0];
        if (this.timeoutId === null || this.invokeTimerAt && this.invokeTimerAt - s > 16) {
            this.clearTimeout();
            let a = Math.max(s - i, 16);
            this.invokeTimerAt = s, this.timeoutId = n.runOutsideAngular(() => setTimeout(() => n.run(r), a));
        }
    } }
    clearTimeout() { this.timeoutId !== null && (clearTimeout(this.timeoutId), this.timeoutId = null); }
    ngOnDestroy() { this.clearTimeout(), this.current.length = 0, this.deferred.length = 0; }
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new e });
} return e; })(), pk = new M("DEFER_BLOCK_DEPENDENCY_INTERCEPTOR"), ID = new M("");
function Uu(e, t, n) { return e.get(fk).getOrCreateInjector(t, e, n, ""); }
function hk(e, t, n) { if (e instanceof un) {
    let o = e.injector, i = e.parentInjector, s = Uu(i, t, n);
    return new un(o, s);
} let r = e.get(Ae); if (r !== e) {
    let o = Uu(r, t, n);
    return new un(e, o);
} return Uu(e, t, n); }
function Ot(e, t, n, r = !1) { let o = n[z], i = o[m]; if (ft(o))
    return; let s = _e(o, t), a = s[$t], c = s[sk]; if (!(c !== null && e < c) && Qm(a, e) && Qm(s[Rr] ?? -1, e)) {
    let l = he(i, t), d = !r && (typeof ngServerMode > "u" || !ngServerMode) && (gD(l) !== null || $d(l, Q.Loading) !== null || $d(l, Q.Placeholder)) ? Gd : DD;
    try {
        d(e, s, n, t, o);
    }
    catch (f) {
        op(o, f);
    }
} }
function gk(e, t) { let n = e[Ve]?.findIndex(o => o.data[Fi] === t[$t]) ?? -1; return { dehydratedView: n > -1 ? e[Ve][n] : null, dehydratedViewIx: n }; }
function DD(e, t, n, r, o) { B(P.DeferBlockStateStart); let i = uk(e, o, r); if (i !== null) {
    t[$t] = e;
    let s = o[m], a = i + I, c = on(s, a), l = 0;
    ip(n, l);
    let u;
    if (e === Q.Complete) {
        let h = he(s, r), v = h.providers;
        v && v.length > 0 && (u = hk(o[k], h, v));
    }
    let { dehydratedView: d, dehydratedViewIx: f } = gk(n, t), p = Xr(o, c, null, { injector: u, dehydratedView: d });
    if (eo(n, p, l, Bn(c, d)), Bo(p), f > -1 && n[Ve]?.splice(f, 1), (e === Q.Complete || e === Q.Error) && Array.isArray(t[xr])) {
        for (let h of t[xr])
            h();
        t[xr] = null;
    }
} B(P.DeferBlockStateEnd); }
function mk(e, t, n, r, o) { let i = Date.now(), s = o[m], a = he(s, r); if (t[Ko] === null || t[Ko] <= i) {
    t[Ko] = null;
    let c = gD(a), l = t[Xs] !== null;
    if (e === Q.Loading && c !== null && !l) {
        t[Rr] = e;
        let u = zm(c, t, r, n, o);
        t[Xs] = u;
    }
    else {
        e > Q.Loading && l && (t[Xs](), t[Xs] = null, t[Rr] = null), DD(e, t, n, r, o);
        let u = $d(a, e);
        u !== null && (t[Ko] = i + u, zm(u, t, r, n, o));
    }
}
else
    t[Rr] = e; }
function zm(e, t, n, r, o) { return yD(e, () => { let s = t[Rr]; t[Ko] = null, t[Rr] = null, s !== null && Ot(s, n, r); }, o[k]); }
function Qm(e, t) { return e < t; }
function oo(e, t) { let n = e[t.index]; Ot(Q.Placeholder, t, n); }
function Zm(e, t, n) { e.loadingPromise.then(() => { e.loadingState === de.COMPLETE ? Ot(Q.Complete, t, n) : e.loadingState === de.FAILED && Ot(Q.Error, t, n); }); }
var Gd = null;
function TD(e, t, n, r) { let o = e.consts; n != null && (t.placeholderBlockConfig = ye(o, n)), r != null && (t.loadingBlockConfig = ye(o, r)), Gd === null && (Gd = mk); }
function Op(e, t) { return !(e === 0 && typeof ngServerMode < "u" && ngServerMode || t[k].get(ID, null, { optional: !0 })?.behavior === kp.Manual); }
function Lp(e, t, n, r) { let o = n.get(q); return I_(e, () => o.run(t), i => o.runOutsideAngular(() => E_(i)), r); }
function vk(e, t, n) { return n == null ? e : n >= 0 ? Jl(n, e) : e[t.index][G] ?? null; }
function yk(e, t) { return bn(I + t, e); }
function io(e, t, n, r, o, i, s, a) { if (!Op(s, e))
    return; let c = e[k], l = c.get(q), u; function d() { if (ft(e)) {
    u.destroy();
    return;
} let f = _e(e, t), p = f[$t]; if (p !== Ci.Initial && p !== Q.Placeholder) {
    u.destroy();
    return;
} let h = vk(e, t, r); if (!h || (u.destroy(), ft(h)))
    return; let v = yk(h, n), y = o(v, () => { l.run(() => { e !== h && xs(h, y), i(); }); }, c, a); e !== h && gr(h, y), Qi(s, f, y); } u = dE({ read: d }, { injector: c }); }
var Ek = (() => { class e {
    log(n) { console.log(n); }
    warn(n) { console.warn(n); }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = K({ token: e, factory: e.\u0275fac, providedIn: "platform" });
} return e; })(), qd = class {
    resolverToTokenToDependencies = new WeakMap;
    resolverToProviders = new WeakMap;
    resolverToEffects = new WeakMap;
    standaloneInjectorToComponent = new WeakMap;
    reset() { this.resolverToTokenToDependencies = new WeakMap, this.resolverToProviders = new WeakMap, this.standaloneInjectorToComponent = new WeakMap; }
}, Ik = new qd;
function kc() { return Ik; }
var CD = (function (e) { return e[e.Defer = 0] = "Defer", e[e.For = 1] = "For", e; })(CD || {});
function Dk(e) { let { standaloneInjectorToComponent: t } = kc(); if (t.has(e))
    return t.get(e); let n = e.get(Gn, null, { self: !0, optional: !0 }); return n === null || n.instance === null ? null : n.instance.constructor; }
function Tk(e) { let t = Ai(e), { resolverToProviders: n } = kc(), r = n.get(t) ?? [], o = Array.from(Qg()).map(i => ({ token: i, isViewProvider: !1, provider: i })); return [...r, ...o]; }
function Ck(e) { let t = new Map, r = Mk(t, new Set); return vo(e, r, [], new Set), t; }
function Mk(e, t) { return (n, r) => { if (e.has(n) || e.set(n, [r]), !t.has(r))
    for (let o of e.keys()) {
        let i = e.get(o), s = go(r);
        if (!s) {
            let l = r.ngModule;
            s = go(l);
        }
        if (!s)
            return;
        let a = i[0], c = !1;
        Ro(s.imports, l => { c || (c = l.ngModule === a || l === a, c && e.get(o)?.unshift(r)); });
    } t.add(r); }; }
function wk(e) { let t = kc().resolverToProviders.get(e) ?? []; if (Nk(e))
    return t; let n = Dk(e); if (n === null)
    return t; let r = Ck(n), o = []; for (let i of t) {
    let s = i.provider, a = s.provide;
    if (a === ze || a === Ns)
        continue;
    let c = r.get(s) ?? [];
    W(n)?.standalone && (c = [n, ...c]), o.push(X(O({}, i), { importPath: c }));
} return o; }
function Nk(e) { return e instanceof nt && e.scopes.has("platform"); }
function MD(e) { if (e instanceof Ne)
    return Tk(e); if (e instanceof Ae)
    return wk(e); Jt("getInjectorProviders only supports NodeInjector and EnvironmentInjector"); }
function wD(e) { if (e instanceof Ne) {
    let t = cf(e), n = Ai(e);
    return Rg(n, t), { type: "element", source: ae(n, t) };
} return e instanceof nt ? { type: "environment", source: e.source ?? null } : e instanceof St ? { type: "null", source: null } : null; }
function Sk(e) { return e.kind === "computed"; }
function _k(e) { return e.kind === "template"; }
function bk(e) { return e.kind === "signal"; }
function Ak(e) { let t = Ai(e); Ql(t); let n = cf(e); xg(n); let r = n[t.index]; return ee(r) ? r[Re] ?? null : null; }
var Ym = new WeakMap, Km = 0;
function Rk(e) { let t = Array.from(e.keys()), n = [], r = []; for (let [o, i] of e.entries()) {
    let s = t.indexOf(o), a = Ym.get(o);
    a || (Km++, a = Km.toString(), Ym.set(o, a)), Sk(o) ? n.push({ label: o.debugName, value: o.value, kind: o.kind, epoch: o.version, debuggableFn: o.computation, id: a }) : bk(o) ? n.push({ label: o.debugName, value: o.value, kind: o.kind, epoch: o.version, id: a }) : _k(o) ? n.push({ label: o.debugName ?? o.lView?.[U]?.tagName?.toLowerCase?.(), kind: o.kind, epoch: o.version, debuggableFn: o.lView?.[V]?.constructor, id: a }) : n.push({ label: o.debugName, kind: o.kind, epoch: o.version, id: a });
    for (let c of i)
        r.push({ consumer: s, producer: t.indexOf(c) });
} return { nodes: n, edges: r }; }
function xk(e) { let t = e; return e instanceof Ne && (t = cf(e)), (kc().resolverToEffects.get(t) ?? []).map(o => o instanceof Do ? o[Y] : o.signal[Y]); }
function ND(e, t = new Map) { for (let n of e) {
    if (t.has(n))
        continue;
    let r = [];
    for (let o = n.producers; o !== void 0; o = o.nextProducer) {
        let i = o.producer;
        r.push(i);
    }
    t.set(n, r), ND(r, t);
} return t; }
function SD(e) { let t = null; if (!(e instanceof Ne) && !(e instanceof nt))
    return Jt("getSignalGraph must be called with a NodeInjector or R3Injector"); e instanceof Ne && (t = Ak(e)); let n = xk(e), r = t ? [t, ...n] : n, o = ND(r); return Rk(o); }
function kk() { return re("Chrome DevTools profiling"), () => { }; }
function Ok(e) { let t = e.get(At), n = e.get(Et), r = _u(t, n), o = {}; for (let [i, s] of Object.entries(r))
    w_(i) || (o[i] = s); return o; }
var Jm = "ng";
function Lk(e, t) { Pk(e, t); }
function Pk(e, t) { if (typeof COMPILED > "u" || !COMPILED) {
    let n = Pe;
    n[Jm] ??= {}, n[Jm][e] = t;
} }
var _D = new M(""), bD = new M(""), AD = new M("USE_PENDING_TASKS", { providedIn: "root", factory: () => typeof Zone > "u" }), Fk = (() => { class e {
    _ngZone;
    registry;
    _isZoneStable = !0;
    _callbacks = [];
    _taskTrackingZone = null;
    _destroyRef;
    pendingTasksInternal = E(vt);
    _usePendingTasks = E(AD);
    constructor(n, r, o) { this._ngZone = n, this.registry = r, _s() && (this._destroyRef = E(xe, { optional: !0 }) ?? void 0), Pp || (xD(o), o.addToWindow(r)), this._watchAngularEvents(), n.run(() => { this._taskTrackingZone = typeof Zone > "u" ? null : Zone.current.get("TaskTrackingZone"); }); }
    _watchAngularEvents() { let n = this._ngZone.onUnstable.subscribe({ next: () => { this._isZoneStable = !1; } }), r, o; this._ngZone.runOutsideAngular(() => { this._usePendingTasks && (r = this.pendingTasksInternal.hasPendingTasksObservable.subscribe(() => { this.isStable() && this._ngZone.runOutsideAngular(() => { this._runCallbacksIfReady(); }); })), o = this._ngZone.onStable.subscribe({ next: () => { q.assertNotInAngularZone(), queueMicrotask(() => { this._isZoneStable = !0, this._runCallbacksIfReady(); }); } }); }), this._destroyRef?.onDestroy(() => { n.unsubscribe(), r?.unsubscribe(), o.unsubscribe(); }); }
    isStable() { return this._isZoneStable && !this._ngZone.hasPendingMacrotasks && (!this._usePendingTasks || !this.pendingTasksInternal.hasPendingTasks); }
    _runCallbacksIfReady() { if (this.isStable())
        queueMicrotask(() => { for (; this._callbacks.length !== 0;) {
            let n = this._callbacks.pop();
            clearTimeout(n.timeoutId), n.doneCb();
        } });
    else {
        let n = this.getPendingTasks();
        this._callbacks = this._callbacks.filter(r => r.updateCb && r.updateCb(n) ? (clearTimeout(r.timeoutId), !1) : !0);
    } }
    getPendingTasks() { return this._taskTrackingZone ? this._taskTrackingZone.macroTasks.map(n => ({ source: n.source, creationLocation: n.creationLocation, data: n.data })) : []; }
    addCallback(n, r, o) { let i = -1; r && r > 0 && (i = setTimeout(() => { this._callbacks = this._callbacks.filter(s => s.timeoutId !== i), n(); }, r)), this._callbacks.push({ doneCb: n, timeoutId: i, updateCb: o }); }
    whenStable(n, r, o) { if (o && !this._taskTrackingZone)
        throw new Error('Task tracking zone is required when passing an update callback to whenStable(). Is "zone.js/plugins/task-tracking" loaded?'); this.addCallback(n, r, o), this._runCallbacksIfReady(); }
    registerApplication(n) { this.registry.registerApplication(n, this); }
    unregisterApplication(n) { this.registry.unregisterApplication(n); }
    findProviders(n, r, o) { return []; }
    static \u0275fac = function (r) { return new (r || e)(ge(q), ge(RD), ge(bD)); };
    static \u0275prov = K({ token: e, factory: e.\u0275fac });
} return e; })(), RD = (() => { class e {
    _applications = new Map;
    registerApplication(n, r) { this._applications.set(n, r); }
    unregisterApplication(n) { this._applications.delete(n); }
    unregisterAllApplications() { this._applications.clear(); }
    getTestability(n) { return this._applications.get(n) || null; }
    getAllTestabilities() { return Array.from(this._applications.values()); }
    getAllRootElements() { return Array.from(this._applications.keys()); }
    findTestabilityInTree(n, r = !0) { return Pp?.findTestabilityInTree(this, n, r) ?? null; }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = K({ token: e, factory: e.\u0275fac, providedIn: "platform" });
} return e; })();
function xD(e) { Pp = e; }
var Pp, Yi = new M("");
function Fp() { hl(() => { let e = ""; throw new D(600, e); }); }
var jk = 10;
function jp(e, t) { return Array.isArray(t) ? t.reduce(jp, e) : O(O({}, e), t); }
var Be = (() => { class e {
    _runningTick = !1;
    _destroyed = !1;
    _destroyListeners = [];
    _views = [];
    internalErrorHandler = E(Rt);
    afterRenderManager = E(ac);
    zonelessEnabled = E(Ir);
    rootEffectScheduler = E(Bs);
    dirtyFlags = 0;
    tracingSnapshot = null;
    allTestViews = new Set;
    autoDetectTestViews = new Set;
    includeAllTestViews = !1;
    afterTick = new wv;
    get allViews() { return [...(this.includeAllTestViews ? this.allTestViews : this.autoDetectTestViews).keys(), ...this._views]; }
    get destroyed() { return this._destroyed; }
    componentTypes = [];
    components = [];
    internalPendingTask = E(vt);
    get isStable() { return this.internalPendingTask.hasPendingTasksObservable.pipe(aS(n => !n)); }
    constructor() { E(Jn, { optional: !0 }); }
    whenStable() { let n; return new Promise(r => { n = this.isStable.subscribe({ next: o => { o && r(); } }); }).finally(() => { n.unsubscribe(); }); }
    _injector = E(Ae);
    _rendererFactory = null;
    get injector() { return this._injector; }
    bootstrap(n, r) { return this.bootstrapImpl(n, r); }
    bootstrapImpl(n, r, o = ie.NULL) { return this._injector.get(q).run(() => { if (B(P.BootstrapComponentStart), !this._injector.get(Sp).done) {
        let T = "";
        throw new D(405, T);
    } let a = W(n), c = this._injector.get(Gn), l = new $n(a, c); this.componentTypes.push(n); let { hostElement: u, directives: d, bindings: f } = Vk(r), p = u || l.selector, h = l.create(o, [], p, c.injector, d, f), v = h.location.nativeElement, y = h.injector.get(_D, null); return y?.registerApplication(v), h.onDestroy(() => { this.detachView(h.hostView), ti(this.components, h), y?.unregisterApplication(v); }), this._loadComponent(h), B(P.BootstrapComponentEnd, h), h; }); }
    tick() { this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick(); }
    _tick() { B(P.ChangeDetectionStart), this.tracingSnapshot !== null ? this.tracingSnapshot.run(sc.CHANGE_DETECTION, this.tickImpl) : this.tickImpl(); }
    tickImpl = () => { if (this._runningTick)
        throw B(P.ChangeDetectionEnd), new D(101, !1); let n = C(null); try {
        this._runningTick = !0, this.synchronize();
    }
    finally {
        this._runningTick = !1, this.tracingSnapshot?.dispose(), this.tracingSnapshot = null, C(n), this.afterTick.next(), B(P.ChangeDetectionEnd);
    } };
    synchronize() { this._rendererFactory === null && !this._injector.destroyed && (this._rendererFactory = this._injector.get(Ei, null, { optional: !0 })); let n = 0; for (; this.dirtyFlags !== 0 && n++ < jk;) {
        B(P.ChangeDetectionSyncStart);
        try {
            this.synchronizeOnce();
        }
        finally {
            B(P.ChangeDetectionSyncEnd);
        }
    } }
    synchronizeOnce() { this.dirtyFlags & 16 && (this.dirtyFlags &= -17, this.rootEffectScheduler.flush()); let n = !1; if (this.dirtyFlags & 7) {
        let r = !!(this.dirtyFlags & 1);
        this.dirtyFlags &= -8, this.dirtyFlags |= 8;
        for (let { _lView: o } of this.allViews) {
            if (!r && !hr(o))
                continue;
            let i = r && !this.zonelessEnabled ? 0 : 1;
            PE(o, i), n = !0;
        }
        if (this.dirtyFlags &= -5, this.syncDirtyFlagsWithViews(), this.dirtyFlags & 23)
            return;
    } n || (this._rendererFactory?.begin?.(), this._rendererFactory?.end?.()), this.dirtyFlags & 8 && (this.dirtyFlags &= -9, this.afterRenderManager.execute()), this.syncDirtyFlagsWithViews(); }
    syncDirtyFlagsWithViews() { if (this.allViews.some(({ _lView: n }) => hr(n))) {
        this.dirtyFlags |= 2;
        return;
    }
    else
        this.dirtyFlags &= -8; }
    attachView(n) { let r = n; this._views.push(r), r.attachToAppRef(this); }
    detachView(n) { let r = n; ti(this._views, r), r.detachFromAppRef(); }
    _loadComponent(n) { this.attachView(n.hostView); try {
        this.tick();
    }
    catch (o) {
        this.internalErrorHandler(o);
    } this.components.push(n), this._injector.get(Yi, []).forEach(o => o(n)); }
    ngOnDestroy() { if (!this._destroyed)
        try {
            this._destroyListeners.forEach(n => n()), this._views.slice().forEach(n => n.destroy());
        }
        finally {
            this._destroyed = !0, this._views = [], this._destroyListeners = [];
        } }
    onDestroy(n) { return this._destroyListeners.push(n), () => ti(this._destroyListeners, n); }
    destroy() { if (this._destroyed)
        throw new D(406, !1); let n = this._injector; n.destroy && !n.destroyed && n.destroy(); }
    get viewCount() { return this._views.length; }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = Vt({ token: e, factory: e.\u0275fac });
} return e; })();
function Vk(e) { return e === void 0 || typeof e == "string" || e instanceof Element ? { hostElement: e } : e; }
function ti(e, t) { let n = e.indexOf(t); n > -1 && e.splice(n, 1); }
function kD(e, t, n) { let r = t.get(Hk), o = () => r.remove(e); return r.add(e, n), o; }
function Vp(e) { return (t, n) => kD(t, n, e); }
var Hk = (() => { class e {
    buckets = new Map;
    callbackBucket = new Map;
    applicationRef = E(Be);
    ngZone = E(q);
    idleService = E(Ua);
    add(n, r) { let o = Xm(r); this.callbackBucket.set(n, o); let i = this.buckets.get(o); i == null && (i = { idleId: null, queue: new Set }, this.buckets.set(o, i)), i.queue.add(n), this.scheduleBucket(i, r); }
    remove(n) { let r = this.callbackBucket.get(n); if (r === void 0)
        return; this.callbackBucket.delete(n); let o = this.buckets.get(r); o && (o.queue.delete(n), o.queue.size === 0 && (this.cancelBucket(o), this.buckets.delete(r))); }
    scheduleBucket(n, r) { if (n.idleId !== null)
        return; let o = Xm(r), i = s => { this.cancelBucket(n); for (let a of n.queue)
        if (a(), this.applicationRef._tick(), n.queue.delete(a), this.callbackBucket.delete(a), s && s.timeRemaining() === 0 && !s.didTimeout)
            break; n.queue.size > 0 ? this.scheduleBucket(n, r) : this.buckets.delete(o); }; n.idleId = this.idleService.requestOnIdle(s => this.ngZone.run(() => i(s)), r); }
    cancelBucket(n) { n.idleId !== null && (this.idleService.cancelOnIdle(n.idleId), n.idleId = null); }
    ngOnDestroy() { for (let n of this.buckets.values())
        this.cancelBucket(n); this.buckets.clear(), this.callbackBucket.clear(); }
    static \u0275prov = K({ token: e, providedIn: "root", factory: () => new e });
} return e; })();
function Xm(e) { return !e || e.timeout == null ? "" : `${e.timeout}`; }
function OD(e) { let t = g(), n = _(); if (oo(t, n), !Op(0, t))
    return; let r = t[k], o = _e(t, n), i = e(() => be(0, t, n), r); Qi(0, o, i); }
function LD(e) { if (typeof ngServerMode < "u" && ngServerMode)
    return; let t = g(), n = t[k], r = _(), o = t[m], i = he(o, r); if (i.loadingState === de.NOT_STARTED) {
    let s = _e(t, r), c = e(() => Ki(i, t, r), n);
    Qi(1, s, c);
} }
function PD(e, t, n) { if (typeof ngServerMode < "u" && ngServerMode)
    return; let r = t[k], o = _e(t, n), i = o[Rc], s = e(() => Gt(r, i), r); Qi(2, o, s); }
function Ki(e, t, n) { Oc(e, t, n); }
function Oc(e, t, n) { let r = t[k], o = t[m]; if (e.loadingState !== de.NOT_STARTED)
    return e.loadingPromise ?? Promise.resolve(); let i = _e(t, n), s = dk(o, e); e.loadingState = de.IN_PROGRESS, ca(1, i); let a = e.dependencyResolverFn, c = r.get(qo).add(); return a ? (e.loadingPromise = Promise.allSettled(a()).then(l => { let u = !1, d = null, f = [], p = []; for (let h = 0; h < l.length; h++) {
    let v = l[h];
    if (v.status === "fulfilled") {
        let y = v.value, T = W(y) || Le(y);
        if (T)
            f.push(T);
        else {
            let x = rt(y);
            x && p.push(x);
        }
    }
    else {
        u = !0, d = v.reason instanceof Error ? v.reason : new Error(String(v.reason));
        break;
    }
} if (u) {
    if (e.loadingState = de.FAILED, e.errorTmplIndex === null) {
        let v = "", y = new D(-750, v);
        op(t, y);
    }
}
else {
    e.loadingState = de.COMPLETE;
    let h = s.tView;
    if (f.length > 0) {
        h.directiveRegistry = Wm(h.directiveRegistry, f);
        let v = f.map(T => T.type), y = Ss(!1, ...v);
        e.providers = y;
    }
    p.length > 0 && (h.pipeRegistry = Wm(h.pipeRegistry, p));
} }), e.loadingPromise.finally(() => { e.loadingPromise = null, c(); })) : (e.loadingPromise = Promise.resolve().then(() => { e.loadingPromise = null, e.loadingState = de.COMPLETE, c(); }), e.loadingPromise); }
function be(e, t, n) { let r = t[m], o = t[n.index]; if (!Op(e, t))
    return; let i = _e(t, n), s = he(r, n); switch (pD(i), s.loadingState) {
    case de.NOT_STARTED:
        Ot(Q.Loading, n, o), Oc(s, t, n), s.loadingState === de.IN_PROGRESS && Zm(s, n, o);
        break;
    case de.IN_PROGRESS:
        Ot(Q.Loading, n, o), Zm(s, n, o);
        break;
    case de.COMPLETE:
        Ot(Q.Complete, n, o);
        break;
    case de.FAILED:
        Ot(Q.Error, n, o);
        break;
    default:
} }
function Gt(e, t, n) { return Te(this, null, function* () { let r = e.get(Ht); if (r.hydrating.has(t))
    return; let { parentBlockPromise: i, hydrationQueue: s } = O_(t, e); if (s.length === 0)
    return; i !== null && s.shift(), $k(r, s), i !== null && (yield i); let a = s[0]; r.has(a) ? yield ev(e, s, n) : r.awaitParentBlock(a, () => Te(null, null, function* () { return yield ev(e, s, n); })); }); }
function ev(e, t, n) { return Te(this, null, function* () { let r = e.get(Ht), o = r.hydrating, i = e.get(vt), s = i.add(); for (let c = 0; c < t.length; c++) {
    let l = t[c], u = r.get(l);
    if (u != null) {
        if (yield qk(u), yield Gk(e), Bk(u)) {
            LR(u), tv(t.slice(c), r);
            break;
        }
        o.get(l).resolve();
    }
    else {
        Uk(c, t, r), tv(t.slice(c), r);
        break;
    }
} let a = t[t.length - 1]; yield o.get(a)?.promise, i.remove(s), n && n(t), PR(r.get(a), t, r, e.get(Be)); }); }
function Bk(e) { return _e(e.lView, e.tNode)[$t] === Q.Error; }
function Uk(e, t, n) { let r = e - 1, o = r > -1 ? n.get(t[r]) : null; o && Sc(o.lContainer); }
function tv(e, t) { let n = t.hydrating; for (let r in e)
    n.get(r)?.reject(); t.cleanup(e); }
function $k(e, t) { for (let n of t)
    e.hydrating.set(n, vr()); }
function Gk(e) { return new Promise(t => Wf(t, { injector: e })); }
function qk(e) { return Te(this, null, function* () { let { tNode: t, lView: n } = e, r = _e(n, t); return new Promise(o => { Wk(r, o), be(2, n, t); }); }); }
function Wk(e, t) { Array.isArray(e[xr]) || (e[xr] = []), e[xr].push(t); }
function oe(e, t, n) { return e === 0 ? nv(t, n) : e === 2 ? !nv(t, n) : !(typeof ngServerMode < "u" && ngServerMode); }
function zk(e) { return e != null && (e & 1) === 1; }
function nv(e, t) { let n = e[k], r = he(e[m], t), o = Hi(n), i = zk(r.flags); if (typeof ngServerMode < "u" && ngServerMode)
    return !o || !i; let a = _e(e, t)[Rc] !== null; return !(i && a && o); }
function hn(e, t) { let n = he(e, t); return n.hydrateTriggers ??= new Map; }
function Qk(e, t, n) { let r = [], o = [], i = [], s = []; for (let [a, c] of t) {
    let l = n.get(a);
    if (l !== void 0) {
        let u = c.data[Pt], d = l;
        for (let f = 0; f < u; f++) {
            if (d = d.previousSibling, d.nodeType !== Node.ELEMENT_NODE)
                continue;
            let p = { el: d, blockName: a };
            c.hydrate.idle && r.push(p), c.hydrate.immediate && s.push(p), c.hydrate.timer !== null && (p.delay = c.hydrate.timer, o.push(p)), c.hydrate.viewport && (typeof c.hydrate.viewport != "boolean" && (p.intersectionObserverOptions = c.hydrate.viewport), i.push(p));
        }
    }
} Zk(e, r), Jk(e, s), Yk(e, i), Kk(e, o); }
function Zk(e, t) { for (let n of t) {
    let r = e.get(Ht), i = kD(() => Gt(e, n.blockName), e);
    r.addCleanupFn(n.blockName, i);
} }
function Yk(e, t) { if (t.length > 0) {
    let n = e.get(Ht);
    for (let r of t) {
        let o = Lp(r.el, () => Gt(e, r.blockName), e, r.intersectionObserverOptions);
        n.addCleanupFn(r.blockName, o);
    }
} }
function Kk(e, t) { for (let n of t) {
    let r = e.get(Ht), o = () => Gt(e, n.blockName), s = xc(n.delay)(o, e);
    r.addCleanupFn(n.blockName, s);
} }
function Jk(e, t) { for (let n of t)
    Gt(e, n.blockName); }
function FD(e, t, n, r, o, i, s, a, c, l) { let u = g(), d = R(), f = e + I, p = Wn(u, d, e, null, 0, 0), h = u[k], v = Hi(h); if (d.firstCreatePass) {
    re("NgDefer");
    let Tt = { primaryTmplIndex: t, loadingTmplIndex: r ?? null, placeholderTmplIndex: o ?? null, errorTmplIndex: i ?? null, placeholderBlockConfig: null, loadingBlockConfig: null, dependencyResolverFn: n ?? null, loadingState: de.NOT_STARTED, loadingPromise: null, providers: null, hydrateTriggers: null, debug: null, flags: l ?? 0 };
    c?.(d, Tt, a, s), lk(d, f, Tt);
} let y = u[f]; OI(y, p, u); let T = null, x = null; if (y[Ve]?.length > 0) {
    let Tt = y[Ve][0].data;
    x = Tt[Qa] ?? null, T = Tt[Fi];
} let ce = [null, Ci.Initial, null, null, null, null, x, T, null, null]; ck(u, f, ce); let et = null; x !== null && v && (et = h.get(Ht), et.add(x, { lView: u, tNode: p, lContainer: y })); let Ue = () => { pD(ce), x !== null && et?.cleanup([x]); }; Qi(0, ce, () => xs(u, Ue)), gr(u, Ue); }
function jD(e) { let t = g(), n = He(); if (!oe(0, t, n))
    return; let r = De(); if (Z(t, r, e)) {
    let o = C(null);
    try {
        let i = !!e, a = _e(t, n)[$t];
        i === !1 && a === Ci.Initial ? oo(t, n) : i === !0 && (a === Ci.Initial || a === Q.Placeholder) && be(0, t, n);
    }
    finally {
        C(o);
    }
} }
function VD(e) { let t = g(), n = He(); if (!oe(1, t, n))
    return; let r = De(); if (Z(t, r, e)) {
    let o = C(null);
    try {
        let i = !!e, s = t[m], a = he(s, n);
        i === !0 && a.loadingState === de.NOT_STARTED && Ki(a, t, n);
    }
    finally {
        C(o);
    }
} }
function HD(e) { let t = g(), n = He(); if (!oe(2, t, n))
    return; let r = De(), o = R(); if (hn(o, n).set(6, null), Z(t, r, e))
    if (typeof ngServerMode < "u" && ngServerMode)
        be(2, t, n);
    else {
        let s = t[k], a = C(null);
        try {
            if (!!e === !0) {
                let u = _e(t, n)[Rc];
                Gt(s, u);
            }
        }
        finally {
            C(a);
        }
    } }
function BD() { let e = g(), t = _(); if (!oe(2, e, t))
    return; hn(R(), t).set(7, null), typeof ngServerMode < "u" && ngServerMode && be(2, e, t); }
function UD(e) { let t = g(), n = _(); oe(0, t, n) && OD(Vp({ timeout: e })); }
function $D(e) { let t = g(), n = _(); oe(1, t, n) && LD(Vp({ timeout: e })); }
function GD(e) { let t = g(), n = _(); if (!oe(2, t, n))
    return; hn(R(), n).set(0, null), typeof ngServerMode < "u" && ngServerMode ? be(2, t, n) : PD(Vp({ timeout: e }), t, n); }
function qD() { let e = g(), t = _(); if (!oe(0, e, t))
    return; he(e[m], t).loadingTmplIndex === null && oo(e, t), be(0, e, t); }
function WD() { let e = g(), t = _(); if (!oe(1, e, t))
    return; let n = e[m], r = he(n, t); r.loadingState === de.NOT_STARTED && Oc(r, e, t); }
function zD() { let e = g(), t = _(); if (!oe(2, e, t))
    return; if (hn(R(), t).set(1, null), typeof ngServerMode < "u" && ngServerMode)
    be(2, e, t);
else {
    let r = e[k], i = _e(e, t)[Rc];
    Gt(r, i);
} }
function QD(e) { let t = g(), n = _(); oe(0, t, n) && OD(xc(e)); }
function ZD(e) { let t = g(), n = _(); oe(1, t, n) && LD(xc(e)); }
function YD(e) { let t = g(), n = _(); if (!oe(2, t, n))
    return; hn(R(), n).set(5, { type: 5, delay: e }), typeof ngServerMode < "u" && ngServerMode ? be(2, t, n) : PD(xc(e), t, n); }
function KD(e, t) { let n = g(), r = _(); oe(0, n, r) && (oo(n, r), typeof ngServerMode < "u" && ngServerMode || io(n, r, e, t, gy, () => be(0, n, r), 0)); }
function JD(e, t) { let n = g(), r = _(); if (!oe(1, n, r))
    return; let o = n[m], i = he(o, r); i.loadingState === de.NOT_STARTED && io(n, r, e, t, gy, () => Ki(i, n, r), 1); }
function XD() { let e = g(), t = _(); if (!oe(2, e, t))
    return; hn(R(), t).set(4, null), typeof ngServerMode < "u" && ngServerMode && be(2, e, t); }
function eT(e, t) { let n = g(), r = _(); oe(0, n, r) && (oo(n, r), typeof ngServerMode < "u" && ngServerMode || io(n, r, e, t, hy, () => be(0, n, r), 0)); }
function tT(e, t) { let n = g(), r = _(); if (!oe(1, n, r))
    return; let o = n[m], i = he(o, r); i.loadingState === de.NOT_STARTED && io(n, r, e, t, hy, () => Ki(i, n, r), 1); }
function nT() { let e = g(), t = _(); if (!oe(2, e, t))
    return; hn(R(), t).set(3, null), typeof ngServerMode < "u" && ngServerMode && be(2, e, t); }
function rT(e, t, n) { let r = g(), o = _(); oe(0, r, o) && (oo(r, o), typeof ngServerMode < "u" && ngServerMode || io(r, o, e, t, Lp, () => be(0, r, o), 0, n)); }
function oT(e, t, n) { let r = g(), o = _(); if (!oe(1, r, o))
    return; let i = r[m], s = he(i, o); s.loadingState === de.NOT_STARTED && io(r, o, e, t, Lp, () => Ki(s, r, o), 1, n); }
function iT(e) { let t = g(), n = _(); if (!oe(2, t, n))
    return; hn(R(), n).set(2, e ? { type: 2, intersectionObserverOptions: e } : null), typeof ngServerMode < "u" && ngServerMode && be(2, t, n); }
function Hp(e, t) { let n = g(), r = De(); if (Z(n, r, t)) {
    let o = R(), i = He();
    if (yc(i, o, n, e, t))
        we(i) && bE(n, i.index);
    else {
        let a = ae(i, n);
        gc(n[S], a, null, i.value, e, t, null);
    }
} return Hp; }
function Bp(e, t, n, r) { let o = g(), i = De(); if (Z(o, i, t)) {
    let s = R(), a = He();
    NA(a, o, e, t, n, r);
} return Bp; }
function ni(e) { if (re("NgAnimateEnter"), typeof ngServerMode < "u" && ngServerMode || !Kn)
    return ni; let t = g(); if (oc(t))
    return ni; let n = _(), r = t[k].get(q); return ic(Ma(t), n, () => Xk(t, n, e, r)), lc(t[k]), zf(t[k], Ma(t)), ni; }
function Xk(e, t, n, r) { let o = ae(t, e), i = e[S], s = aE(n), a = [], c = !1, l = d => { if (pi(d) !== o)
    return; let f = d instanceof AnimationEvent ? "animationend" : "transitionend"; r.runOutsideAngular(() => { i.listen(o, f, u); }); }, u = d => { pi(d) === o && ($f(d, o) && (c = !0), eO(d, o, i)); }; if (s && s.length > 0) {
    r.runOutsideAngular(() => { a.push(i.listen(o, "animationstart", l)), a.push(i.listen(o, "transitionstart", l)); }), zb(o, s, a);
    for (let d of s)
        i.addClass(o, d);
    r.runOutsideAngular(() => { requestAnimationFrame(() => { if (!c && (uE(o, Pn, Kn), !Pn.has(o))) {
        for (let d of s)
            i.removeClass(o, d);
        Bf(o);
    } }); });
} }
function eO(e, t, n) { let r = Lr.get(t); if (!(pi(e) !== t || !r) && $f(e, t)) {
    e.stopPropagation();
    for (let o of r.classList)
        n.removeClass(t, o);
    Bf(t);
} }
function ri(e) { if (re("NgAnimateEnter"), typeof ngServerMode < "u" && ngServerMode || !Kn)
    return ri; let t = g(); if (oc(t))
    return ri; let n = _(); return ic(Ma(t), n, () => tO(t, n, e)), lc(t[k]), zf(t[k], Ma(t)), ri; }
function tO(e, t, n) { let r = ae(t, e); n.call(e[V], { target: r, animationComplete: Qb }); }
function oi(e) { if (re("NgAnimateLeave"), typeof ngServerMode < "u" && ngServerMode || !Kn)
    return oi; let t = g(); if (oc(t))
    return oi; let r = _(), o = t[k].get(q); return ic(Vn(t), r, () => nO(t, r, e, o)), lc(t[k]), oi; }
function nO(e, t, n, r) { let { promise: o, resolve: i } = vr(), s = ae(t, e), a = e[S]; fn.add(e[je]), (Vn(e).get(t.index).resolvers ??= []).push(i); let c = aE(n); return c && c.length > 0 ? rO(s, t, e, c, a, r) : i(), { promise: o, resolve: i }; }
function rO(e, t, n, r, o, i) { Yb(e, o); let s = [], a = Vn(n).get(t.index)?.resolvers, c, l = !1, u = d => { if (!(pi(d) !== e && d.type !== "animation-fallback") && (d.type === "animation-fallback" || $f(d, e))) {
    if (l = !0, c && clearTimeout(c), d.type !== "animation-fallback" && d.stopPropagation(), Pn.delete(e), Md(t, e), Array.isArray(t.projection))
        for (let p of r)
            o.removeClass(e, p);
    wd(a, s), Nd(n, t);
} }; i.runOutsideAngular(() => { s.push(o.listen(e, "animationend", u)), s.push(o.listen(e, "transitionend", u)); }), Uf(t, e); for (let d of r)
    o.addClass(e, d); i.runOutsideAngular(() => { requestAnimationFrame(() => { if (l)
    return; uE(e, Pn, Kn); let d = Pn.get(e); d ? (c = setTimeout(() => { u(new CustomEvent("animation-fallback")); }, d.duration + 50), s.push(() => clearTimeout(c))) : (Md(t, e), wd(a, s), Nd(n, t)); }); }); }
function Oa(e) { if (re("NgAnimateLeave"), typeof ngServerMode < "u" && ngServerMode || !Kn)
    return Oa; let t = g(), n = _(); fn.add(t[je]); let r = t[k].get(q), o = t[k].get(iE); return ic(Vn(t), n, () => oO(t, n, e, r, o)), lc(t[k]), Oa; }
function oO(e, t, n, r, o) { let { promise: i, resolve: s } = vr(), a = ae(t, e), c = [], l = e[S], u = oc(e); (Vn(e).get(t.index).resolvers ??= []).push(s); let d = Vn(e).get(t.index)?.resolvers; if (u)
    Ks(e, t, a, d, c);
else {
    let f = setTimeout(() => Ks(e, t, a, d, c), o), p = { target: a, animationComplete: () => { Ks(e, t, a, d, c), clearTimeout(f); } };
    Uf(t, a), r.runOutsideAngular(() => { c.push(l.listen(a, "animationend", () => { Ks(e, t, a, d, c), clearTimeout(f); }, { once: !0 })); }), n.call(e[V], p);
} return { promise: i, resolve: s }; }
function sT() { return g()[se][V]; }
var Wd = class {
    destroy(t) { }
    updateValue(t, n) { }
    swap(t, n) { let r = Math.min(t, n), o = Math.max(t, n), i = this.detach(o); if (o - r > 1) {
        let s = this.detach(r);
        this.attach(r, i), this.attach(o, s);
    }
    else
        this.attach(r, i); }
    move(t, n) { this.attach(n, this.detach(t)); }
};
function $u(e, t, n, r, o) { return e === n && Object.is(t, r) ? 1 : Object.is(o(e, t), o(n, r)) ? -1 : 0; }
function iO(e, t, n, r) { let o, i, s = 0, a = e.length - 1, c = void 0; if (Array.isArray(t)) {
    C(r);
    let l = t.length - 1;
    for (C(null); s <= a && s <= l;) {
        let u = e.at(s), d = t[s], f = $u(s, u, s, d, n);
        if (f !== 0) {
            f < 0 && e.updateValue(s, d), s++;
            continue;
        }
        let p = e.at(a), h = t[l], v = $u(a, p, l, h, n);
        if (v !== 0) {
            v < 0 && e.updateValue(a, h), a--, l--;
            continue;
        }
        let y = n(s, u), T = n(a, p), x = n(s, d);
        if (Object.is(x, T)) {
            let ce = n(l, h);
            Object.is(ce, y) ? (e.swap(s, a), e.updateValue(a, h), l--, a--) : e.move(a, s), e.updateValue(s, d), s++;
            continue;
        }
        if (o ??= new La, i ??= ov(e, s, a, n), zd(e, o, s, x))
            e.updateValue(s, d), s++, a++;
        else if (i.has(x))
            o.set(y, e.detach(s)), a--;
        else {
            let ce = e.create(s, t[s]);
            e.attach(s, ce), s++, a++;
        }
    }
    for (; s <= l;)
        rv(e, o, n, s, t[s]), s++;
}
else if (t != null) {
    C(r);
    let l = t[Symbol.iterator]();
    C(null);
    let u = l.next();
    for (; !u.done && s <= a;) {
        let d = e.at(s), f = u.value, p = $u(s, d, s, f, n);
        if (p !== 0)
            p < 0 && e.updateValue(s, f), s++, u = l.next();
        else {
            o ??= new La, i ??= ov(e, s, a, n);
            let h = n(s, f);
            if (zd(e, o, s, h))
                e.updateValue(s, f), s++, a++, u = l.next();
            else if (!i.has(h))
                e.attach(s, e.create(s, f)), s++, a++, u = l.next();
            else {
                let v = n(s, d);
                o.set(v, e.detach(s)), a--;
            }
        }
    }
    for (; !u.done;)
        rv(e, o, n, e.length, u.value), u = l.next();
} for (; s <= a;)
    e.destroy(e.detach(a--)); o?.forEach(l => { e.destroy(l); }); }
function zd(e, t, n, r) { return t !== void 0 && t.has(r) ? (e.attach(n, t.get(r)), t.delete(r), !0) : !1; }
function rv(e, t, n, r, o) { if (zd(e, t, r, n(r, o)))
    e.updateValue(r, o);
else {
    let i = e.create(r, o);
    e.attach(r, i);
} }
function ov(e, t, n, r) { let o = new Set; for (let i = t; i <= n; i++)
    o.add(r(i, e.at(i))); return o; }
var La = class {
    kvMap = new Map;
    _vMap = void 0;
    has(t) { return this.kvMap.has(t); }
    delete(t) { if (!this.has(t))
        return !1; let n = this.kvMap.get(t); return this._vMap !== void 0 && this._vMap.has(n) ? (this.kvMap.set(t, this._vMap.get(n)), this._vMap.delete(n)) : this.kvMap.delete(t), !0; }
    get(t) { return this.kvMap.get(t); }
    set(t, n) { if (this.kvMap.has(t)) {
        let r = this.kvMap.get(t);
        this._vMap === void 0 && (this._vMap = new Map);
        let o = this._vMap;
        for (; o.has(r);)
            r = o.get(r);
        o.set(r, n);
    }
    else
        this.kvMap.set(t, n); }
    forEach(t) { for (let [n, r] of this.kvMap)
        if (t(r, n), this._vMap !== void 0) {
            let o = this._vMap;
            for (; o.has(r);)
                r = o.get(r), t(r, n);
        } }
};
function aT(e, t, n, r, o, i, s, a) { re("NgControlFlow"); let c = g(), l = R(), u = ye(l.consts, i); return Wn(c, l, e, t, n, r, o, u, 256, s, a), Lc; }
function Lc(e, t, n, r, o, i, s, a) { re("NgControlFlow"); let c = g(), l = R(), u = ye(l.consts, i); return Wn(c, l, e, t, n, r, o, u, 512, s, a), Lc; }
function cT(e, t) { re("NgControlFlow"); let n = g(), r = De(), o = n[r] !== $ ? n[r] : -1, i = o !== -1 ? Pa(n, I + o) : void 0, s = 0; if (Z(n, r, e)) {
    let a = C(null);
    try {
        if (i !== void 0 && ip(i, s), e !== -1) {
            let c = I + e, l = Pa(n, c), u = Kd(n[m], c), d = fI(l, u, n), f = Xr(n, u, t, { dehydratedView: d });
            eo(l, f, s, Bn(u, d));
        }
    }
    finally {
        C(a);
    }
}
else if (i !== void 0) {
    let a = UE(i, s);
    a !== void 0 && (a[V] = t);
} }
var Qd = class {
    lContainer;
    $implicit;
    $index;
    constructor(t, n, r) { this.lContainer = t, this.$implicit = n, this.$index = r; }
    get $count() { return this.lContainer.length - G; }
};
function lT(e) { return e; }
function uT(e, t) { return t; }
var Zd = class {
    hasEmptyBlock;
    trackByFn;
    liveCollection;
    constructor(t, n, r) { this.hasEmptyBlock = t, this.trackByFn = n, this.liveCollection = r; }
};
function dT(e, t, n, r, o, i, s, a, c, l, u, d, f) { re("NgControlFlow"); let p = g(), h = R(), v = c !== void 0, y = g(), T = a ? s.bind(y[se][V]) : s, x = new Zd(v, T); y[I + e] = x, Wn(p, h, e + 1, t, n, r, o, ye(h.consts, i), 256), v && Wn(p, h, e + 2, c, l, u, d, ye(h.consts, f), 512); }
var Yd = class extends Wd {
    lContainer;
    hostLView;
    templateTNode;
    operationsCounter = void 0;
    needsIndexUpdate = !1;
    constructor(t, n, r) { super(), this.lContainer = t, this.hostLView = n, this.templateTNode = r; }
    get length() { return this.lContainer.length - G; }
    at(t) { return this.getLView(t)[V].$implicit; }
    attach(t, n) { let r = n[pe]; this.needsIndexUpdate ||= t !== this.length, eo(this.lContainer, n, t, Bn(this.templateTNode, r)), sO(this.lContainer, t); }
    detach(t) { return this.needsIndexUpdate ||= t !== this.length - 1, aO(this.lContainer, t), cO(this.lContainer, t); }
    create(t, n) { let r = yi(this.lContainer, this.templateTNode.tView.ssrId); return Xr(this.hostLView, this.templateTNode, new Qd(this.lContainer, n, t), { dehydratedView: r }); }
    destroy(t) { qi(t[m], t); }
    updateValue(t, n) { this.getLView(t)[V].$implicit = n; }
    reset() { this.needsIndexUpdate = !1; }
    updateIndexes() { if (this.needsIndexUpdate)
        for (let t = 0; t < this.length; t++)
            this.getLView(t)[V].$index = t; }
    getLView(t) { return lO(this.lContainer, t); }
};
function fT(e) { let t = C(null), n = ue(); try {
    let r = g(), o = r[m], i = r[n], s = n + 1, a = Pa(r, s);
    if (i.liveCollection === void 0) {
        let l = Kd(o, s);
        i.liveCollection = new Yd(a, r, l);
    }
    else
        i.liveCollection.reset();
    let c = i.liveCollection;
    if (iO(c, e, i.trackByFn, t), c.updateIndexes(), i.hasEmptyBlock) {
        let l = De(), u = c.length === 0;
        if (Z(r, l, u)) {
            let d = n + 2, f = Pa(r, d);
            if (u) {
                let p = Kd(o, d), h = fI(f, p, r), v = Xr(r, p, void 0, { dehydratedView: h });
                eo(f, v, 0, Bn(p, h));
            }
            else
                o.firstUpdatePass && Nc(f), ip(f, 0);
        }
    }
}
finally {
    C(t);
} }
function Pa(e, t) { return e[t]; }
function sO(e, t) { if (e.length <= G)
    return; let n = G + t, r = e[n], o = r ? r[Ze] : void 0; if (r && o && o.detachedLeaveAnimationFns && o.detachedLeaveAnimationFns.length > 0) {
    let i = r[k];
    oA(i, o), fn.delete(r[je]), o.detachedLeaveAnimationFns = void 0;
} }
function aO(e, t) { if (e.length <= G)
    return; let n = G + t, r = e[n], o = r ? r[Ze] : void 0; o && o.leave && o.leave.size > 0 && (o.detachedLeaveAnimationFns = []); }
function cO(e, t) { return gi(e, t); }
function lO(e, t) { return UE(e, t); }
function Kd(e, t) { return on(e, t); }
function Up(e, t, n) { let r = g(), o = De(); if (Z(r, o, t)) {
    let i = R(), s = He();
    tp(s, r, e, t, r[S], n);
} return Up; }
function Jd(e, t, n, r, o) { yc(t, e, n, o ? "class" : "style", r); }
function Mi(e, t, n, r) { let o = g(), i = o[m], s = e + I, a = i.firstCreatePass ? pp(s, o, 2, t, rp, ks(), n, r) : i.data[s]; if (we(a)) {
    let c = o[Qe].tracingService;
    if (c && c.componentCreate) {
        let l = i.data[a.directiveStart + a.componentOffset];
        return c.componentCreate(dp(l), () => (iv(e, t, o, a, r), Mi));
    }
} return iv(e, t, o, a, r), Mi; }
function iv(e, t, n, r, o) { if (mc(r, n, e, t, qp), pr(r)) {
    let i = n[m];
    hc(i, n, r), bf(i, r, n);
} o != null && Jr(n, r); }
function Pc() { let e = R(), t = _(), n = vc(t); return e.firstCreatePass && hp(e, n), nu(n) && iu(), tu(), n.classesWithoutHost != null && hS(n) && Jd(e, n, g(), n.classesWithoutHost, !0), n.stylesWithoutHost != null && gS(n) && Jd(e, n, g(), n.stylesWithoutHost, !1), Pc; }
function $p(e, t, n, r) { return Mi(e, t, n, r), Pc(), $p; }
function Fc(e, t, n, r) { let o = g(), i = o[m], s = e + I, a = i.firstCreatePass ? bI(s, i, 2, t, n, r) : i.data[s]; return mc(a, o, e, t, qp), r != null && Jr(o, a), Fc; }
function jc() { let e = _(), t = vc(e); return nu(t) && iu(), tu(), jc; }
function Gp(e, t, n, r) { return Fc(e, t, n, r), jc(), Gp; }
var qp = (e, t, n, r, o) => (at(!0), nc(t[S], r, Vs()));
function uO(e, t, n, r, o) { let i = !ec(t, n); if (at(i), i)
    return nc(t[S], r, Vs()); let s = t[pe], a = zi(s, e, t, n); return by(s, o) && Ja(s, o, a.nextSibling), s && (df(n) || Xv(a)) && we(n) && (Vg(n), Qy(a)), a; }
function pT() { qp = uO; }
function Vc(e, t, n) { let r = g(), o = r[m], i = e + I, s = o.firstCreatePass ? pp(i, r, 8, "ng-container", rp, ks(), t, n) : o.data[i]; if (mc(s, r, e, "ng-container", Zp), pr(s)) {
    let a = r[m];
    hc(a, r, s), bf(a, s, r);
} return n != null && Jr(r, s), Vc; }
function Ji() { let e = R(), t = _(), n = vc(t); return e.firstCreatePass && hp(e, n), Ji; }
function Wp(e, t, n) { return Vc(e, t, n), Ji(), Wp; }
function Hc(e, t, n) { let r = g(), o = r[m], i = e + I, s = o.firstCreatePass ? bI(i, o, 8, "ng-container", t, n) : o.data[i]; return mc(s, r, e, "ng-container", Zp), n != null && Jr(r, s), Hc; }
function zp() { let e = _(), t = vc(e); return Ji; }
function Qp(e, t, n) { return Hc(e, t, n), zp(), Qp; }
var Zp = (e, t, n, r, o) => (at(!0), xf(t[S], ""));
function dO(e, t, n, r, o) { let i, s = !ec(t, n); if (at(s), s)
    return xf(t[S], ""); let a = t[pe], c = zi(a, e, t, n), l = _y(a, o); return Ja(a, o, c), i = Mc(l, c), i; }
function hT() { Zp = dO; }
function gT() { return g(); }
function Yp(e, t, n) { let r = g(), o = De(); if (Z(r, o, t)) {
    let i = R(), s = He();
    np(s, r, e, t, r[S], n);
} return Yp; }
function Kp(e, t, n) { let r = g(), o = De(); if (Z(r, o, t)) {
    let i = R(), s = He(), a = Ls(i.data), c = AE(a, s, r);
    np(s, r, e, t, c, n);
} return Kp; }
var zo = void 0;
function fO(e) { let t = Math.floor(Math.abs(e)), n = e.toString().replace(/^[^.]*\.?/, "").length; return t === 1 && n === 0 ? 1 : 5; }
var pO = ["en", [["a", "p"], ["AM", "PM"]], [["AM", "PM"]], [["S", "M", "T", "W", "T", "F", "S"], ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]], zo, [["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]], zo, [["B", "A"], ["BC", "AD"], ["Before Christ", "Anno Domini"]], 0, [6, 0], ["M/d/yy", "MMM d, y", "MMMM d, y", "EEEE, MMMM d, y"], ["h:mm\u202Fa", "h:mm:ss\u202Fa", "h:mm:ss\u202Fa z", "h:mm:ss\u202Fa zzzz"], ["{1}, {0}", zo, zo, zo], [".", ",", ";", "%", "+", "-", "E", "\xD7", "\u2030", "\u221E", "NaN", ":"], ["#,##0.###", "#,##0%", "\xA4#,##0.00", "#E0"], "USD", "$", "US Dollar", {}, "ltr", fO], kr = Object.create(null);
function hO(e, t, n) { typeof t != "string" && (n = t, t = e[wi.LocaleId]), t = t.toLowerCase().replace(/_/g, "-"), kr[t] = e, n && (kr[t][wi.ExtraData] = n); }
function Jp(e) { let t = vO(e), n = sv(t); if (n)
    return n; let r = t.split("-")[0]; if (n = sv(r), n)
    return n; if (r === "en")
    return pO; throw new D(701, !1); }
function gO(e) { return Jp(e)[wi.CurrencyCode] || null; }
function mT(e) { return Jp(e)[wi.PluralCase]; }
function sv(e) { if (!(e in kr)) {
    let t = Pe.ng && Pe.ng.common && Pe.ng.common.locales && Pe.ng.common.locales[e];
    return t !== void 0 && (kr[e] = t), t;
} return kr[e]; }
function mO() { kr = Object.create(null); }
var wi = { LocaleId: 0, DayPeriodsFormat: 1, DayPeriodsStandalone: 2, DaysFormat: 3, DaysStandalone: 4, MonthsFormat: 5, MonthsStandalone: 6, Eras: 7, FirstDayOfWeek: 8, WeekendRange: 9, DateFormat: 10, TimeFormat: 11, DateTimeFormat: 12, NumberSymbols: 13, NumberFormats: 14, CurrencyCode: 15, CurrencySymbol: 16, CurrencyName: 17, Currencies: 18, Directionality: 19, PluralCase: 20, ExtraData: 21 };
function vO(e) { return e.toLowerCase().replace(/_/g, "-"); }
var yO = ["zero", "one", "two", "few", "many"];
function EO(e, t) { let n = mT(t)(parseInt(e, 10)), r = yO[n]; return r !== void 0 ? r : "other"; }
var Xi = "en-US", IO = "USD", vT = { marker: "element" }, yT = { marker: "ICU" }, kt = (function (e) { return e[e.SHIFT = 2] = "SHIFT", e[e.APPEND_EAGERLY = 1] = "APPEND_EAGERLY", e[e.COMMENT = 2] = "COMMENT", e; })(kt || {}), ET = Xi;
function IT(e) { typeof e == "string" && (ET = e.toLowerCase().replace(/_/g, "-")); }
function DO() { return ET; }
var Ni = 0, ii = 0;
function TO(e) { e && (Ni = Ni | 1 << Math.min(ii, 31)), ii++; }
function CO(e, t, n) { try {
    if (ii > 0) {
        let r = e.data[n], o = Array.isArray(r) ? r : r.update, i = ht() - ii - 1;
        MT(e, t, o, i, Ni);
    }
}
finally {
    Ni = 0, ii = 0;
} }
function DT(e, t, n) { let r = e[S]; switch (n) {
    case Node.COMMENT_NODE: return xf(r, t);
    case Node.TEXT_NODE: return Rf(r, t);
    case Node.ELEMENT_NODE: return nc(r, t, null);
} }
var si = (e, t, n, r) => (at(!0), DT(e, n, r));
function MO(e, t, n, r) { let o = e[pe], i = t - I, s = !wc() || !o || Uo() || Xa(o, i); return at(s), s ? DT(e, n, r) : KE(o, i); }
function TT() { si = MO; }
function wO(e, t, n, r) { let o = e[S]; for (let i = 0; i < t.length; i++) {
    let s = t[i++], a = t[i], c = (s & kt.COMMENT) === kt.COMMENT, l = (s & kt.APPEND_EAGERLY) === kt.APPEND_EAGERLY, u = s >>> kt.SHIFT, d = e[u], f = !1;
    d === null && (d = e[u] = si(e, u, a, c ? Node.COMMENT_NODE : Node.TEXT_NODE), f = Go()), l && n !== null && f && jn(o, n, d, r, !1);
} }
function CT(e, t, n, r) { let o = n[S], i = null, s; for (let a = 0; a < t.length; a++) {
    let c = t[a];
    if (typeof c == "string") {
        let l = t[++a];
        n[l] === null && (n[l] = si(n, l, c, Node.TEXT_NODE));
    }
    else if (typeof c == "number")
        switch (c & 1) {
            case 0:
                let l = dR(c);
                i === null && (i = l, s = o.parentNode(r));
                let u, d;
                if (l === i ? (u = r, d = s) : (u = null, d = L(n[l])), d !== null) {
                    let v = fR(c), y = n[v];
                    jn(o, d, y, u, !1);
                    let T = Jo(e, v);
                    if (T !== null && typeof T == "object") {
                        let x = Cc(T, n);
                        x !== null && CT(e, T.create[x], n, n[T.anchorIdx]);
                    }
                }
                break;
            case 1:
                let f = c >>> 1, p = t[++a], h = t[++a];
                gc(o, bn(f, n), null, null, p, h, null);
                break;
            default:
        }
    else
        switch (c) {
            case yT:
                let l = t[++a], u = t[++a];
                if (n[u] === null) {
                    let p = n[u] = si(n, u, l, Node.COMMENT_NODE);
                    Ke(p, n);
                }
                break;
            case vT:
                let d = t[++a], f = t[++a];
                if (n[f] === null) {
                    let p = n[f] = si(n, f, d, Node.ELEMENT_NODE);
                    Ke(p, n);
                }
                break;
            default:
        }
} }
function MT(e, t, n, r, o) { for (let i = 0; i < n.length; i++) {
    let s = n[i], a = n[++i];
    if (s & o) {
        let c = "";
        for (let l = i + 1; l <= i + a; l++) {
            let u = n[l];
            if (typeof u == "string")
                c += u;
            else if (typeof u == "number")
                if (u < 0)
                    c += A(t[r - u]);
                else {
                    let d = u >>> 2;
                    switch (u & 3) {
                        case 1:
                            let f = n[++l], p = n[++l], h = e.data[d];
                            if (typeof h == "string")
                                gc(t[S], t[d], null, h, f, c, p);
                            else {
                                let y = ue();
                                mt(d);
                                try {
                                    tp(h, t, f, c, t[S], p);
                                }
                                finally {
                                    mt(y);
                                }
                            }
                            break;
                        case 0:
                            let v = t[d];
                            v !== null && Wy(t[S], v, c);
                            break;
                        case 2:
                            NO(e, Jo(e, d), t, c);
                            break;
                        case 3:
                            av(e, Jo(e, d), r, t);
                            break;
                    }
                }
        }
    }
    else {
        let c = n[i + 1];
        if (c > 0 && (c & 3) === 3) {
            let l = c >>> 2, u = Jo(e, l);
            t[u.currentCaseLViewIndex] < 0 && av(e, u, r, t);
        }
    }
    i += a;
} }
function av(e, t, n, r) { let o = r[t.currentCaseLViewIndex]; if (o !== null) {
    let i = Ni;
    o < 0 && (o = r[t.currentCaseLViewIndex] = ~o, i = -1), MT(e, r, t.update[o], n, i);
} }
function NO(e, t, n, r) { let o = SO(t, r); if (Cc(t, n) !== o && (wT(e, t, n), n[t.currentCaseLViewIndex] = o === null ? null : ~o, o !== null)) {
    let s = n[t.anchorIdx];
    s && CT(e, t.create[o], n, s), RR(n, t.anchorIdx, o);
} }
function wT(e, t, n) { let r = Cc(t, n); if (r !== null) {
    let o = t.remove[r];
    for (let i = 0; i < o.length; i++) {
        let s = o[i];
        if (s > 0) {
            let a = bn(s, n);
            a !== null && Ui(n[S], a);
        }
        else
            wT(e, Jo(e, ~s), n);
    }
} }
function SO(e, t) { let n = e.cases.indexOf(t); if (n === -1)
    switch (e.type) {
        case 1: {
            let r = EO(t, DO());
            n = e.cases.indexOf(r), n === -1 && r !== "other" && (n = e.cases.indexOf("other"));
            break;
        }
        case 0: {
            n = e.cases.indexOf("other");
            break;
        }
    } return n === -1 ? null : n; }
var Fa = /�(\d+):?\d*�/gi, _O = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi, bO = /�(\d+)�/, NT = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/, ai = "\uFFFD", AO = /�\/?\*(\d+:\d+)�/gi, RO = /�(\/?[#*]\d+):?\d*�/gi, xO = /\uE500/g;
function kO(e) { return e.replace(xO, " "); }
function OO(e, t, n, r, o, i) { let s = mr(), a = [], c = [], l = [[]], u = [[]]; o = jO(o, i); let d = kO(o).split(RO); for (let f = 0; f < d.length; f++) {
    let p = d[f];
    if ((f & 1) === 0) {
        let h = Xd(p);
        for (let v = 0; v < h.length; v++) {
            let y = h[v];
            if ((v & 1) === 0) {
                let T = y;
                T !== "" && LO(u[0], e, s, l[0], a, c, n, T);
            }
            else {
                let T = y;
                if (typeof T != "object")
                    throw new Error(`Unable to parse ICU expression in "${o}" message.`);
                let ce = ST(e, s, l[0], n, a, "", !0).index;
                bT(u[0], e, n, c, t, T, ce);
            }
        }
    }
    else {
        let h = p.charCodeAt(0) === 47, v = p.charCodeAt(h ? 1 : 0), y = I + Number.parseInt(p.substring(h ? 2 : 1));
        if (h)
            l.shift(), u.shift(), pt(mr(), !1);
        else {
            let T = uR(e, l[0], y);
            l.unshift([]), pt(T, !0);
            let x = { kind: 2, index: y, children: [], type: v === 35 ? 0 : 1 };
            u[0].push(x), u.unshift(x.children);
        }
    }
} e.data[r] = { create: a, update: c, ast: u[0], parentTNodeIndex: t }; }
function ST(e, t, n, r, o, i, s) { let a = Wi(e, r, 1, null), c = a << kt.SHIFT, l = mr(); t === l && (l = null), l === null && (c |= kt.APPEND_EAGERLY), s && (c |= kt.COMMENT, Gb(hR)), o.push(c, i === null ? "" : i); let u = sp(e, a, s ? 32 : 1, i === null ? "" : i, null); zE(n, u); let d = u.index; return pt(u, !1), l !== null && t !== l && lR(l, d), u; }
function LO(e, t, n, r, o, i, s, a) { let c = a.match(Fa), u = ST(t, n, r, s, o, c ? null : a, !1).index; c && ja(i, a, u, null, 0, null), e.push({ kind: 0, index: u }); }
function PO(e, t, n) { let r = _(), o = r.index, i = []; if (e.firstCreatePass && e.data[t] === null) {
    for (let s = 0; s < n.length; s += 2) {
        let a = n[s], c = n[s + 1];
        if (c !== "") {
            if (_O.test(c))
                throw new Error(`ICU expressions are not supported in attributes. Message: "${c}".`);
            let l = r.namespace ? `:${r.namespace}:${r.value}` : r.value;
            ja(i, c, o, a, FO(i), ef(a, l));
        }
    }
    e.data[t] = i;
} }
function ja(e, t, n, r, o, i) { let s = e.length, a = s + 1; e.push(null, null); let c = s + 2, l = t.split(Fa), u = 0; for (let d = 0; d < l.length; d++) {
    let f = l[d];
    if (d & 1) {
        let p = o + parseInt(f, 10);
        e.push(-1 - p), u = u | _T(p);
    }
    else
        f !== "" && e.push(f);
} return e.push(n << 2 | (r ? 1 : 0)), r && e.push(r, i), e[s] = u, e[a] = e.length - c, u; }
function FO(e) { let t = 0; for (let n = 0; n < e.length; n++) {
    let r = e[n];
    typeof r == "number" && r < 0 && t++;
} return t; }
function _T(e) { return 1 << Math.min(e, 31); }
function cv(e) { let t, n = "", r = 0, o = !1, i; for (; (t = AO.exec(e)) !== null;)
    o ? t[0] === `${ai}/*${i}${ai}` && (r = t.index, o = !1) : (n += e.substring(r, t.index + t[0].length), i = t[1], o = !0); return n += e.slice(r), n; }
function jO(e, t) { if (ZE(t))
    return cv(e); {
    let n = e.indexOf(`:${t}${ai}`) + 2 + t.toString().length, r = e.search(new RegExp(`${ai}\\/\\*\\d+:${t}${ai}`));
    return cv(e.substring(n, r));
} }
function bT(e, t, n, r, o, i, s) { let a = 0, c = { type: i.type, currentCaseLViewIndex: Wi(t, n, 1, null), anchorIdx: s, cases: [], create: [], remove: [], update: [] }; UO(r, i, s), cR(t, s, c); let l = i.values, u = []; for (let d = 0; d < l.length; d++) {
    let f = l[d], p = [];
    for (let v = 0; v < f.length; v++) {
        let y = f[v];
        if (typeof y != "string") {
            let T = p.push(y) - 1;
            f[v] = `<!--\uFFFD${T}\uFFFD-->`;
        }
    }
    let h = [];
    u.push(h), a = HO(h, t, c, n, r, o, i.cases[d], f.join(""), p) | a;
} a && $O(r, a, s), e.push({ kind: 3, index: s, cases: u, currentCaseLViewIndex: c.currentCaseLViewIndex }); }
function VO(e) { let t = [], n = [], r = 1, o = 0; e = e.replace(NT, function (s, a, c) { return c === "select" ? r = 0 : r = 1, o = parseInt(a.slice(1), 10), ""; }); let i = Xd(e); for (let s = 0; s < i.length;) {
    let a = i[s++].trim();
    r === 1 && (a = a.replace(/\s*(?:=)?(\w+)\s*/, "$1")), a.length && t.push(a);
    let c = Xd(i[s++]);
    t.length > n.length && n.push(c);
} return { type: r, mainBinding: o, cases: t, values: n }; }
function Xd(e) { if (!e)
    return []; let t = 0, n = [], r = [], o = /[{}]/g; o.lastIndex = 0; let i; for (; i = o.exec(e);) {
    let a = i.index;
    if (i[0] == "}") {
        if (n.pop(), n.length == 0) {
            let c = e.substring(t, a);
            NT.test(c) ? r.push(VO(c)) : r.push(c), t = a + 1;
        }
    }
    else {
        if (n.length == 0) {
            let c = e.substring(t, a);
            r.push(c), t = a + 1;
        }
        n.push("{");
    }
} let s = e.substring(t); return r.push(s), r; }
function HO(e, t, n, r, o, i, s, a, c) { let l = [], u = [], d = []; n.cases.push(s), n.create.push(l), n.remove.push(u), n.update.push(d); let p = Vy(ki()).getInertBodyElement(a), h = Dd(p) || p; return h ? AT(e, t, n, r, o, l, u, d, h, i, c, 0) : 0; }
function AT(e, t, n, r, o, i, s, a, c, l, u, d) { let f = 0, p = c.firstChild; for (; p;) {
    let h = Wi(t, r, 1, null);
    switch (p.nodeType) {
        case Node.ELEMENT_NODE:
            let v = p, y = v.tagName.toLowerCase();
            if (yd.hasOwnProperty(y)) {
                Gu(i, vT, y, l, h), t.data[h] = y;
                let et = v.attributes;
                for (let Tt = 0; Tt < et.length; Tt++) {
                    let mn = et.item(Tt), as = mn.name.toLowerCase(), Gw = !!mn.value.match(Fa), Xh = v.namespaceURI, eg = Xh === "http://www.w3.org/2000/svg" ? `:svg:${y}` : Xh === "http://www.w3.org/1998/Math/MathML" ? `:math:${y}` : y;
                    if (Gw)
                        Ed.hasOwnProperty(as) && ja(a, mn.value, h, mn.name, 0, ef(as, eg));
                    else if (Ed[as]) {
                        let qw = mn.value;
                        ef(as, eg) ? uv(i, h, mn.name, "unsafe:blocked") : uv(i, h, mn.name, qw);
                    }
                }
                let Ue = { kind: 1, index: h, children: [] };
                e.push(Ue), f = AT(Ue.children, t, n, r, o, i, s, a, p, h, u, d + 1) | f, lv(s, h, d);
            }
            break;
        case Node.TEXT_NODE:
            let T = p.textContent || "", x = T.match(Fa);
            Gu(i, null, x ? "" : T, l, h), lv(s, h, d), x && (f = ja(a, T, h, null, 0, null) | f), e.push({ kind: 0, index: h });
            break;
        case Node.COMMENT_NODE:
            let ce = bO.exec(p.textContent || "");
            if (ce) {
                let et = parseInt(ce[1], 10), Ue = u[et];
                Gu(i, yT, "", l, h), bT(e, t, r, o, l, Ue, h), BO(s, h, d);
            }
            break;
    }
    p = p.nextSibling;
} return f; }
function lv(e, t, n) { n === 0 && e.push(t); }
function BO(e, t, n) { n === 0 && (e.push(~t), e.push(t)); }
function UO(e, t, n) { e.push(_T(t.mainBinding), 2, -1 - t.mainBinding, n << 2 | 2); }
function $O(e, t, n) { e.push(t, 1, n << 2 | 3); }
function Gu(e, t, n, r, o) { t !== null && e.push(t), e.push(n, o, pR(0, r, o)); }
function uv(e, t, n, r) { e.push(t << 1 | 1, n, r); }
function GO(e, t = !0) { if (e[0] != ":")
    return [null, e]; let n = e.indexOf(":", 1); if (n === -1) {
    if (t)
        throw new Error(`Unsupported format "${e}" expecting ":namespace:name"`);
    return [null, e];
} return [e.slice(1, n), e.slice(n + 1)]; }
function ef(e, t) { let n; if (t) {
    let [r, o] = GO(t, !1);
    n = Mm(o, e, r);
}
else
    n = Mm("*", e); switch (n) {
    case te.HTML: return kf;
    case te.STYLE: return Of;
    case te.SCRIPT: return Pf;
    case te.URL: return tc;
    case te.RESOURCE_URL: return rc;
    case te.ATTRIBUTE_NO_BINDING: return Ff;
    default: return null;
} }
var dv = 0, qO = /\[(�.+?�?)\]/, WO = /\[(�.+?�?)\]|(�\/?\*\d+:\d+�)/g, zO = /({\s*)(VAR_(PLURAL|SELECT)(_\d+)?)(\s*,)/g, QO = /{([A-Z0-9_]+)}/g, ZO = /�I18N_EXP_(ICU(_\d+)?)�/g, YO = /\/\*/, KO = /\d+\:(\d+)/;
function JO(e, t = {}) { let n = e; if (qO.test(e)) {
    let r = {}, o = [dv];
    n = n.replace(WO, (i, s, a) => { let c = s || a, l = r[c] || []; if (l.length || (c.split("|").forEach(v => { let y = v.match(KO), T = y ? parseInt(y[1], 10) : dv, x = YO.test(v); l.push([T, x, v]); }), r[c] = l), !l.length)
        throw new Error(`i18n postprocess: unmatched placeholder - ${c}`); let u = o[o.length - 1], d = 0; for (let v = 0; v < l.length; v++)
        if (l[v][0] === u) {
            d = v;
            break;
        } let [f, p, h] = l[d]; return p ? o.pop() : u !== f && o.push(f), l.splice(d, 1), h; });
} return Object.keys(t).length && (n = n.replace(zO, (r, o, i, s, a, c) => t.hasOwnProperty(i) ? `${o}${t[i]}${c}` : r), n = n.replace(QO, (r, o) => t.hasOwnProperty(o) ? t[o] : r), n = n.replace(ZO, (r, o) => { if (t.hasOwnProperty(o)) {
    let i = t[o];
    if (!i.length)
        throw new Error(`i18n postprocess: unmatched ICU - ${r} with key: ${o}`);
    return i.shift();
} return r; })), n; }
function Xp(e, t, n = -1) { let r = R(), o = g(), i = I + e, s = ye(r.consts, t), a = mr(); if (r.firstCreatePass && OO(r, a === null ? 0 : a.index, o, i, s, n), r.type === 2) {
    let f = o[se];
    f[N] |= 32;
}
else
    o[N] |= 32; let c = r.data[i], l = a === o[le] ? null : a, u = mE(r, l, o), d = a && a.type & 8 ? o[a.index] : null; wR(o, i, a, n), wO(o, c.create, u, d), hu(!0); }
function eh() { hu(!1); }
function RT(e, t, n) { Xp(e, t, n), eh(); }
function xT(e, t) { let n = R(), r = ye(n.consts, t); PO(n, e + I, r); }
function th(e) { let t = g(); return TO(Z(t, De(), e)), th; }
function kT(e) { CO(R(), g(), e + I); }
function OT(e, t = {}) { return JO(e, t); }
function nh(e, t, n) { let r = g(), o = R(), i = _(); return ih(o, r, r[S], i, e, t, n), nh; }
function rh(e, t) { let n = _(), r = g(), o = R(), i = Ls(o.data), s = AE(i, n, r); return ih(o, r, s, n, e, t), rh; }
function oh(e, t, n) { let r = g(), o = R(), i = _(); return (i.type & 3 || n) && fp(i, o, r, n, r[S], e, t, dn(i, r, t)), oh; }
function ih(e, t, n, r, o, i, s) { let a = !0, c = null; if ((r.type & 3 || s) && (c ??= dn(r, t, i), fp(r, e, t, s, n, o, i, c) && (a = !1)), a) {
    let l = r.outputs?.[o], u = r.hostDirectiveOutputs?.[o];
    if (u && u.length)
        for (let d = 0; d < u.length; d += 2) {
            let f = u[d], p = u[d + 1];
            c ??= dn(r, t, i), _a(r, t, f, p, o, c);
        }
    if (l && l.length)
        for (let d of l)
            c ??= dn(r, t, i), _a(r, t, d, o, o, c);
} }
function LT(e = 1) { return Wg(e); }
function XO(e, t) { let n = null, r = Fb(e); for (let o = 0; o < t.length; o++) {
    let i = t[o];
    if (i === "*") {
        n = o;
        continue;
    }
    if (r === null ? rE(e, i, !0) : Hb(r, i))
        return o;
} return n; }
function PT(e) { let t = g()[se][le]; if (!t.projection) {
    let n = e ? e.length : 1, r = t.projection = ko(n, null), o = r.slice(), i = t.child;
    for (; i !== null;) {
        if (i.type !== 128) {
            let s = e ? XO(i, e) : 0;
            s !== null && (o[s] ? o[s].projectionNext = i : r[s] = i, o[s] = i);
        }
        i = i.next;
    }
} }
function FT(e, t = 0, n, r, o, i) { let s = g(), a = R(), c = r ? e + 1 : null; c !== null && Wn(s, a, c, r, o, i, null, n); let l = Xn(a, I + e, 16, null, n || null); l.projection === null && (l.projection = t), uu(); let d = !s[pe] || Uo(); s[se][le].projection[l.projection] === null && c !== null ? eL(s, a, c) : d && !Zr(l) && hA(a, s, l); }
function eL(e, t, n) { let r = I + n, o = t.data[r], i = e[r], s = yi(i, o.tView.ssrId), a = Xr(e, o, void 0, { dehydratedView: s }); eo(i, a, 0, Bn(o, s)); }
function sh(e, t, n, r) { return HI(e, t, n, r), sh; }
function ah(e, t, n) { return VI(e, t, n), ah; }
function jT(e) { let t = g(), n = R(), r = Ps(); $o(r + 1); let o = vp(n, r); if (e.dirty && Og(t) === ((o.metadata.flags & 2) === 2)) {
    if (o.matches === null)
        e.reset([]);
    else {
        let i = UI(t, r);
        e.reset(i, Jv), e.notifyOnChanges();
    }
    return !0;
} return !1; }
function VT() { return mp(g(), Ps()); }
function ch(e, t, n, r, o) { return $I(t, HI(e, n, r, o)), ch; }
function lh(e, t, n, r) { return $I(e, VI(t, n, r)), lh; }
function HT(e = 1) { $o(Ps() + e); }
function BT(e) { let t = du(); return sn(t, I + e); }
function ea(e, t) { return e << 17 | t << 2; }
function zn(e) { return e >> 17 & 32767; }
function tL(e) { return (e & 2) == 2; }
function nL(e, t) { return e & 131071 | t << 17; }
function tf(e) { return e | 2; }
function Hr(e) { return (e & 131068) >> 2; }
function qu(e, t) { return e & -131069 | t << 2; }
function rL(e) { return (e & 1) === 1; }
function nf(e) { return e | 1; }
function oL(e, t, n, r, o, i) { let s = i ? t.classBindings : t.styleBindings, a = zn(s), c = Hr(s); e[r] = n; let l = !1, u; if (Array.isArray(n)) {
    let d = n;
    u = d[1], (u === null || dr(d, u) > 0) && (l = !0);
}
else
    u = n; if (o)
    if (c !== 0) {
        let f = zn(e[a + 1]);
        e[r + 1] = ea(f, a), f !== 0 && (e[f + 1] = qu(e[f + 1], r)), e[a + 1] = nL(e[a + 1], r);
    }
    else
        e[r + 1] = ea(a, 0), a !== 0 && (e[a + 1] = qu(e[a + 1], r)), a = r;
else
    e[r + 1] = ea(c, 0), a === 0 ? a = r : e[c + 1] = qu(e[c + 1], r), c = r; l && (e[r + 1] = tf(e[r + 1])), fv(e, u, r, !0), fv(e, u, r, !1), iL(t, u, e, r, i), s = ea(a, c), i ? t.classBindings = s : t.styleBindings = s; }
function iL(e, t, n, r, o) { let i = o ? e.residualClasses : e.residualStyles; i != null && typeof t == "string" && dr(i, t) >= 0 && (n[r + 1] = nf(n[r + 1])); }
function fv(e, t, n, r) { let o = e[n + 1], i = t === null, s = r ? zn(o) : Hr(o), a = !1; for (; s !== 0 && (a === !1 || i);) {
    let c = e[s], l = e[s + 1];
    sL(c, t) && (a = !0, e[s + 1] = r ? nf(l) : tf(l)), s = r ? zn(l) : Hr(l);
} a && (e[n + 1] = r ? tf(o) : nf(o)); }
function sL(e, t) { return e === null || t == null || (Array.isArray(e) ? e[1] : e) === t ? !0 : Array.isArray(e) && typeof t == "string" ? dr(e, t) >= 0 : !1; }
var fe = { textEnd: 0, key: 0, keyEnd: 0, value: 0, valueEnd: 0 };
function UT(e) { return e.substring(fe.key, fe.keyEnd); }
function aL(e) { return e.substring(fe.value, fe.valueEnd); }
function cL(e) { return qT(e), $T(e, Br(e, 0, fe.textEnd)); }
function $T(e, t) { let n = fe.textEnd; return n === t ? -1 : (t = fe.keyEnd = uL(e, fe.key = t, n), Br(e, t, n)); }
function lL(e) { return qT(e), GT(e, Br(e, 0, fe.textEnd)); }
function GT(e, t) { let n = fe.textEnd, r = fe.key = Br(e, t, n); return n === r ? -1 : (r = fe.keyEnd = dL(e, r, n), r = pv(e, r, n, 58), r = fe.value = Br(e, r, n), r = fe.valueEnd = fL(e, r, n), pv(e, r, n, 59)); }
function qT(e) { fe.key = 0, fe.keyEnd = 0, fe.value = 0, fe.valueEnd = 0, fe.textEnd = e.length; }
function Br(e, t, n) { for (; t < n && e.charCodeAt(t) <= 32;)
    t++; return t; }
function uL(e, t, n) { for (; t < n && e.charCodeAt(t) > 32;)
    t++; return t; }
function dL(e, t, n) { let r; for (; t < n && ((r = e.charCodeAt(t)) === 45 || r === 95 || (r & -33) >= 65 && (r & -33) <= 90 || r >= 48 && r <= 57);)
    t++; return t; }
function pv(e, t, n, r) { return t = Br(e, t, n), t < n && t++, t; }
function fL(e, t, n) { let r = -1, o = -1, i = -1, s = t, a = s; for (; s < n;) {
    let c = e.charCodeAt(s++);
    if (c === 59)
        return a;
    c === 34 || c === 39 ? a = s = hv(e, c, s, n) : t === s - 4 && i === 85 && o === 82 && r === 76 && c === 40 ? a = s = hv(e, 41, s, n) : c > 32 && (a = s), i = o, o = r, r = c & -33;
} return a; }
function hv(e, t, n, r) { let o = -1, i = n; for (; i < r;) {
    let s = e.charCodeAt(i++);
    if (s == t && o !== 92)
        return i;
    s == 92 && o === 92 ? o = 0 : o = s;
} throw new Error; }
function uh(e, t, n) { return QT(e, t, n, !1), uh; }
function dh(e, t) { return QT(e, t, null, !0), dh; }
function WT(e) { ZT(JT, pL, e, !1); }
function pL(e, t) { for (let n = lL(t); n >= 0; n = GT(t, n))
    JT(e, UT(t), aL(t)); }
function zT(e) { ZT(IL, hL, e, !0); }
function hL(e, t) { for (let n = cL(t); n >= 0; n = $T(t, n))
    Oo(e, UT(t), !0); }
function QT(e, t, n, r) { let o = g(), i = R(), s = gt(2); if (i.firstUpdatePass && KT(i, e, s, r), t !== $ && Z(o, s, t)) {
    let a = i.data[ue()];
    XT(i, a, o, o[S], e, o[s + 1] = TL(t, n), r, s);
} }
function ZT(e, t, n, r) { let o = R(), i = gt(2); o.firstUpdatePass && KT(o, null, i, r); let s = g(); if (n !== $ && Z(s, i, n)) {
    let a = o.data[ue()];
    if (eC(a, r) && !YT(o, i)) {
        let c = r ? a.classesWithoutHost : a.stylesWithoutHost;
        c !== null && (n = Es(c, n || "")), Jd(o, a, s, n, r);
    }
    else
        DL(o, a, s, s[S], s[i + 1], s[i + 1] = EL(e, t, n), r, i);
} }
function YT(e, t) { return t >= e.expandoStartIndex; }
function KT(e, t, n, r) { let o = e.data; if (o[n + 1] === null) {
    let i = o[ue()], s = YT(e, n);
    eC(i, r) && t === null && !s && (t = !1), t = gL(o, i, t, r), oL(o, i, t, n, s, r);
} }
function gL(e, t, n, r) { let o = Ls(e), i = r ? t.residualClasses : t.residualStyles; if (o === null)
    (r ? t.classBindings : t.styleBindings) === 0 && (n = Wu(null, e, t, n, r), n = Si(n, t.attrs, r), i = null);
else {
    let s = t.directiveStylingLast;
    if (s === -1 || e[s] !== o)
        if (n = Wu(o, e, t, n, r), i === null) {
            let c = mL(e, t, r);
            c !== void 0 && Array.isArray(c) && (c = Wu(null, e, t, c[1], r), c = Si(c, t.attrs, r), vL(e, t, r, c));
        }
        else
            i = yL(e, t, r);
} return i !== void 0 && (r ? t.residualClasses = i : t.residualStyles = i), n; }
function mL(e, t, n) { let r = n ? t.classBindings : t.styleBindings; if (Hr(r) !== 0)
    return e[zn(r)]; }
function vL(e, t, n, r) { let o = n ? t.classBindings : t.styleBindings; e[zn(o)] = r; }
function yL(e, t, n) { let r, o = t.directiveEnd; for (let i = 1 + t.directiveStylingLast; i < o; i++) {
    let s = e[i].hostAttrs;
    r = Si(r, s, n);
} return Si(r, t.attrs, n); }
function Wu(e, t, n, r, o) { let i = null, s = n.directiveEnd, a = n.directiveStylingLast; for (a === -1 ? a = n.directiveStart : a++; a < s && (i = t[a], r = Si(r, i.hostAttrs, o), i !== e);)
    a++; return e !== null && (n.directiveStylingLast = a), r; }
function Si(e, t, n) { let r = n ? 1 : 2, o = -1; if (t !== null)
    for (let i = 0; i < t.length; i++) {
        let s = t[i];
        typeof s == "number" ? o = s : o === r && (Array.isArray(e) || (e = e === void 0 ? [] : ["", e]), Oo(e, s, n ? !0 : t[++i]));
    } return e === void 0 ? null : e; }
function EL(e, t, n) { if (n == null || n === "")
    return j; let r = [], o = Bt(n); if (Array.isArray(o))
    for (let i = 0; i < o.length; i++)
        e(r, o[i], !0);
else if (o instanceof Set)
    for (let i of o)
        e(r, i, !0);
else if (typeof o == "object")
    for (let i in o)
        Object.hasOwn(o, i) && e(r, i, o[i]);
else
    typeof o == "string" && t(r, o); return r; }
function JT(e, t, n) { Oo(e, t, Bt(n)); }
function IL(e, t, n) { let r = String(t); r !== "" && !r.includes(" ") && Oo(e, r, n); }
function DL(e, t, n, r, o, i, s, a) { o === $ && (o = j); let c = 0, l = 0, u = 0 < o.length ? o[0] : null, d = 0 < i.length ? i[0] : null; for (; u !== null || d !== null;) {
    let f = c < o.length ? o[c + 1] : void 0, p = l < i.length ? i[l + 1] : void 0, h = null, v;
    u === d ? (c += 2, l += 2, f !== p && (h = d, v = p)) : d === null || u !== null && u < d ? (c += 2, h = u) : (l += 2, h = d, v = p), h !== null && XT(e, t, n, r, h, v, s, a), u = c < o.length ? o[c] : null, d = l < i.length ? i[l] : null;
} }
function XT(e, t, n, r, o, i, s, a) { if (!(t.type & 3))
    return; let c = e.data, l = c[a + 1], u = rL(l) ? gv(c, t, n, o, Hr(l), s) : void 0; if (!Va(u)) {
    Va(i) || tL(l) && (i = gv(c, null, n, o, a, s));
    let d = bn(ue(), n);
    mA(r, s, d, o, i);
} }
function gv(e, t, n, r, o, i) { let s = t === null, a; for (; o > 0;) {
    let c = e[o], l = Array.isArray(c), u = l ? c[1] : c, d = u === null, f = n[o + 1];
    f === $ && (f = d ? j : void 0);
    let p = d ? ws(f, r) : u === r ? f : void 0;
    if (l && !Va(p) && (p = ws(c, r)), Va(p) && (a = p, s))
        return a;
    let h = e[o + 1];
    o = s ? zn(h) : Hr(h);
} if (t !== null) {
    let c = i ? t.residualClasses : t.residualStyles;
    c != null && (a = ws(c, r));
} return a; }
function Va(e) { return e !== void 0; }
function TL(e, t) { return e == null || e === "" || (typeof t == "string" ? e = e + t : typeof e == "object" && (e = Co(Bt(e)))), e; }
function eC(e, t) { return (e.flags & (t ? 8 : 16)) !== 0; }
function tC(e, t = "") { let n = g(), r = R(), o = e + I, i = r.firstCreatePass ? Xn(r, o, 1, t, null) : r.data[o], s = nC(r, n, i, t); n[o] = s, Go() && Yf(r, n, s, i), pt(i, !1); }
var nC = (e, t, n, r) => (at(!0), Rf(t[S], r));
function CL(e, t, n, r) { let o = !ec(t, n); if (at(o), o)
    return Rf(t[S], r); let i = t[pe]; return zi(i, e, t, n); }
function rC() { nC = CL; }
function oC(e, t) { let n = !1, r = ht(); for (let i = 1; i < t.length; i += 2)
    n = Z(e, r++, t[i]) || n; if (pu(r), !n)
    return $; let o = t[0]; for (let i = 1; i < t.length; i += 2)
    o += A(t[i]) + (i + 1 !== t.length ? t[i + 1] : ""); return o; }
function iC(e, t, n, r = "") { return Z(e, De(), n) ? t + A(n) + r : $; }
function sC(e, t, n, r, o, i = "") { let s = ht(), a = Un(e, s, n, o); return gt(2), a ? t + A(n) + r + A(o) + i : $; }
function aC(e, t, n, r, o, i, s, a = "") { let c = ht(), l = bc(e, c, n, o, s); return gt(3), l ? t + A(n) + r + A(o) + i + A(s) + a : $; }
function cC(e, t, n, r, o, i, s, a, c, l = "") { let u = ht(), d = Xe(e, u, n, o, s, c); return gt(4), d ? t + A(n) + r + A(o) + i + A(s) + a + A(c) + l : $; }
function lC(e, t, n, r, o, i, s, a, c, l, u, d = "") { let f = ht(), p = Xe(e, f, n, o, s, c); return p = Z(e, f + 4, u) || p, gt(5), p ? t + A(n) + r + A(o) + i + A(s) + a + A(c) + l + A(u) + d : $; }
function uC(e, t, n, r, o, i, s, a, c, l, u, d, f, p = "") { let h = ht(), v = Xe(e, h, n, o, s, c); return v = Un(e, h + 4, u, f) || v, gt(6), v ? t + A(n) + r + A(o) + i + A(s) + a + A(c) + l + A(u) + d + A(f) + p : $; }
function dC(e, t, n, r, o, i, s, a, c, l, u, d, f, p, h, v = "") { let y = ht(), T = Xe(e, y, n, o, s, c); return T = bc(e, y + 4, u, f, h) || T, gt(7), T ? t + A(n) + r + A(o) + i + A(s) + a + A(c) + l + A(u) + d + A(f) + p + A(h) + v : $; }
function fC(e, t, n, r, o, i, s, a, c, l, u, d, f, p, h, v, y, T = "") { let x = ht(), ce = Xe(e, x, n, o, s, c); return ce = Xe(e, x + 4, u, f, h, y) || ce, gt(8), ce ? t + A(n) + r + A(o) + i + A(s) + a + A(c) + l + A(u) + d + A(f) + p + A(h) + v + A(y) + T : $; }
function fh(e) { return Bc("", e), fh; }
function Bc(e, t, n) { let r = g(), o = iC(r, e, t, n); return o !== $ && qt(r, ue(), o), Bc; }
function ph(e, t, n, r, o) { let i = g(), s = sC(i, e, t, n, r, o); return s !== $ && qt(i, ue(), s), ph; }
function hh(e, t, n, r, o, i, s) { let a = g(), c = aC(a, e, t, n, r, o, i, s); return c !== $ && qt(a, ue(), c), hh; }
function gh(e, t, n, r, o, i, s, a, c) { let l = g(), u = cC(l, e, t, n, r, o, i, s, a, c); return u !== $ && qt(l, ue(), u), gh; }
function mh(e, t, n, r, o, i, s, a, c, l, u) { let d = g(), f = lC(d, e, t, n, r, o, i, s, a, c, l, u); return f !== $ && qt(d, ue(), f), mh; }
function vh(e, t, n, r, o, i, s, a, c, l, u, d, f) { let p = g(), h = uC(p, e, t, n, r, o, i, s, a, c, l, u, d, f); return h !== $ && qt(p, ue(), h), vh; }
function yh(e, t, n, r, o, i, s, a, c, l, u, d, f, p, h) { let v = g(), y = dC(v, e, t, n, r, o, i, s, a, c, l, u, d, f, p, h); return y !== $ && qt(v, ue(), y), yh; }
function Eh(e, t, n, r, o, i, s, a, c, l, u, d, f, p, h, v, y) { let T = g(), x = fC(T, e, t, n, r, o, i, s, a, c, l, u, d, f, p, h, v, y); return x !== $ && qt(T, ue(), x), Eh; }
function Ih(e) { let t = g(), n = oC(t, e); return n !== $ && qt(t, ue(), n), Ih; }
function qt(e, t, n) { let r = bn(t, e); Wy(e[S], r, n); }
function Dh(e, t, n) { $s(t) && (t = t()); let r = g(), o = De(); if (Z(r, o, t)) {
    let i = R(), s = He();
    tp(s, r, e, t, r[S], n);
} return Dh; }
function pC(e, t) { let n = $s(e); return n && e.set(t), n; }
function Th(e, t) { let n = g(), r = R(), o = _(); return ih(r, n, n[S], o, e, t), Th; }
var hC = {};
function Ch(e) { re("NgLet"); let t = R(), n = g(), r = e + I, o = Xn(t, r, 128, null, null); return pt(o, !1), Ho(t, n, r, hC), Ch; }
function gC(e) { let t = R(), n = g(), r = ue(); return Ho(t, n, r, e), e; }
function mC(e) { let t = du(), n = sn(t, I + e); if (n === hC)
    throw new D(314, !1); return n; }
function vC(e, t) { let n = R(), r = g(), o = r[S], i = "data-ng-source-location"; for (let [s, a, c, l] of t) {
    let u = on(n, s + I), d = bn(s + I, r);
    if (!d.hasAttribute(i)) {
        let f = `${e}@o:${a},l:${c},c:${l}`;
        o.setAttribute(d, i, f);
    }
} }
function yC(e) { return Z(g(), De(), e) ? A(e) : $; }
function EC(e, t, n = "") { return iC(g(), e, t, n); }
function IC(e, t, n, r, o = "") { return sC(g(), e, t, n, r, o); }
function DC(e, t, n, r, o, i, s = "") { return aC(g(), e, t, n, r, o, i, s); }
function TC(e, t, n, r, o, i, s, a, c = "") { return cC(g(), e, t, n, r, o, i, s, a, c); }
function CC(e, t, n, r, o, i, s, a, c, l, u = "") { return lC(g(), e, t, n, r, o, i, s, a, c, l, u); }
function MC(e, t, n, r, o, i, s, a, c, l, u, d, f = "") { return uC(g(), e, t, n, r, o, i, s, a, c, l, u, d, f); }
function wC(e, t, n, r, o, i, s, a, c, l, u, d, f, p, h = "") { return dC(g(), e, t, n, r, o, i, s, a, c, l, u, d, f, p, h); }
function NC(e, t, n, r, o, i, s, a, c, l, u, d, f, p, h, v, y = "") { return fC(g(), e, t, n, r, o, i, s, a, c, l, u, d, f, p, h, v, y); }
function SC(e) { return oC(g(), e); }
function _C(e, t, n) { let r = Ee() + e, o = g(); return o[r] === $ ? lt(o, r, t(n, o)) : no(o, r); }
function mv(e, t, n) { let r = R(); r.firstCreatePass && bC(t, r.data, r.blueprint, Ye(e), n); }
function bC(e, t, n, r, o) { if (e = F(e), Array.isArray(e))
    for (let i = 0; i < e.length; i++)
        bC(e[i], t, n, r, o);
else {
    let i = R(), s = g(), a = _(), c = Cn(e) ? e : F(e.provide), l = $l(e), u = a.providerIndexes & 1048575, d = a.directiveStart, f = a.providerIndexes >> 20;
    if (Cn(e) || !e.multi) {
        let p = new Fn(l, o, ro, null), h = Qu(c, t, o ? u : u + f, d);
        h === -1 ? (td(ga(a, s), i, c), zu(i, e, t.length), t.push(c), a.directiveStart++, a.directiveEnd++, o && (a.providerIndexes += 1048576), n.push(p), s.push(p)) : (n[h] = p, s[h] = p);
    }
    else {
        let p = Qu(c, t, u + f, d), h = Qu(c, t, u, u + f), v = p >= 0 && n[p], y = h >= 0 && n[h];
        if (o && !y || !o && !v) {
            td(ga(a, s), i, c);
            let T = NL(o ? wL : ML, n.length, o, r, l, e);
            !o && y && (n[h].providerFactory = T), zu(i, e, t.length, 0), t.push(c), a.directiveStart++, a.directiveEnd++, o && (a.providerIndexes += 1048576), n.push(T), s.push(T);
        }
        else {
            let T = AC(n[o ? h : p], l, !o && r);
            zu(i, e, p > -1 ? p : h, T);
        }
        !o && r && y && n[h].componentProviders++;
    }
} }
function zu(e, t, n, r) { let o = Cn(t), i = bg(t); if (o || i) {
    let c = (i ? F(t.useClass) : t).prototype.ngOnDestroy;
    if (c) {
        let l = e.destroyHooks || (e.destroyHooks = []);
        if (!o && t.multi) {
            let u = l.indexOf(n);
            u === -1 ? l.push(n, [r, c]) : l[u + 1].push(r, c);
        }
        else
            l.push(n, c);
    }
} }
function AC(e, t, n) { return n && e.componentProviders++, e.multi.push(t) - 1; }
function Qu(e, t, n, r) { for (let o = n; o < r; o++)
    if (t[o] === e)
        return o; return -1; }
function ML(e, t, n, r, o) { return rf(this.multi, []); }
function wL(e, t, n, r, o) { let i = this.multi, s; if (this.providerFactory) {
    let a = this.providerFactory.componentProviders, c = li(r, r[m], this.providerFactory.index, o);
    s = c.slice(0, a), rf(i, s);
    for (let l = a; l < c.length; l++)
        s.push(c[l]);
}
else
    s = [], rf(i, s); return s; }
function rf(e, t) { for (let n = 0; n < e.length; n++) {
    let r = e[n];
    t.push(r());
} return t; }
function NL(e, t, n, r, o, i) { let s = new Fn(e, n, ro, null); return s.multi = [], s.index = t, s.componentProviders = 0, AC(s, o, r && !n), s; }
function RC(e, t) { return n => { n.providersResolver = (r, o) => mv(r, o ? o(e) : e, !1), t && (n.viewProvidersResolver = (r, o) => mv(r, o ? o(t) : t, !0)); }; }
function xC(e) { return t => { e.length < 1 || (t.getExternalStyles = n => e.map(o => o + "?ngcomp" + (n ? "=" + encodeURIComponent(n) : "") + "&e=" + t.encapsulation)); }; }
function kC(e, t, n) { let r = e.\u0275cmp; r.directiveDefs = ka(t, QI), r.pipeDefs = ka(n, rt); }
function OC(e, t) { return Dt(() => { let n = Ds(e); n.declarations = ta(t.declarations || j), n.imports = ta(t.imports || j), n.exports = ta(t.exports || j), t.bootstrap && (n.bootstrap = ta(t.bootstrap)), Fr.registerNgModule(e, t); }); }
function ta(e) { if (typeof e == "function")
    return e; let t = ot(e); return t.some(wo) ? () => t.map(F).map(vv) : t.map(vv); }
function vv(e) { return up(e) ? e.ngModule : e; }
var LC = () => null, PC = () => { }, yv = !1;
function FC() { return LC(); }
function jC(e, t) { PC(e, t); }
function VC() { yv || (yv = !0, j_(), re("NgIncrementalHydration"), LC = () => new M_, PC = (e, t) => { let n = G_(e), r = CR(t, t.body); Qk(e, n, r), P_(t, e); }); }
function HC(e, t) { let n = Ee() + e, r = g(); return r[n] === $ ? lt(r, n, t()) : no(r, n); }
function BC(e, t, n) { return YC(g(), Ee(), e, t, n); }
function UC(e, t, n, r) { return KC(g(), Ee(), e, t, n, r); }
function $C(e, t, n, r, o) { return JC(g(), Ee(), e, t, n, r, o); }
function GC(e, t, n, r, o, i, s) { return XC(g(), Ee(), e, t, n, r, o, i); }
function qC(e, t, n, r, o, i, s) { let a = Ee() + e, c = g(), l = Xe(c, a, n, r, o, i); return Z(c, a + 4, s) || l ? lt(c, a + 5, t(n, r, o, i, s)) : no(c, a + 5); }
function WC(e, t, n, r, o, i, s, a) { let c = Ee() + e, l = g(), u = Xe(l, c, n, r, o, i); return Un(l, c + 4, s, a) || u ? lt(l, c + 6, t(n, r, o, i, s, a)) : no(l, c + 6); }
function zC(e, t, n, r, o, i, s, a, c) { let l = Ee() + e, u = g(), d = Xe(u, l, n, r, o, i); return bc(u, l + 4, s, a, c) || d ? lt(u, l + 7, t(n, r, o, i, s, a, c)) : no(u, l + 7); }
function QC(e, t, n, r, o, i, s, a, c, l) { let u = Ee() + e, d = g(), f = Xe(d, u, n, r, o, i); return Xe(d, u + 4, s, a, c, l) || f ? lt(d, u + 8, t(n, r, o, i, s, a, c, l)) : no(d, u + 8); }
function ZC(e, t, n) { return eM(g(), Ee(), e, t, n); }
function es(e, t) { let n = e[t]; return n === $ ? void 0 : n; }
function YC(e, t, n, r, o, i) { let s = t + n; return Z(e, s, o) ? lt(e, s + 1, i ? r.call(i, o) : r(o)) : es(e, s + 1); }
function KC(e, t, n, r, o, i, s) { let a = t + n; return Un(e, a, o, i) ? lt(e, a + 2, s ? r.call(s, o, i) : r(o, i)) : es(e, a + 2); }
function JC(e, t, n, r, o, i, s, a) { let c = t + n; return bc(e, c, o, i, s) ? lt(e, c + 3, a ? r.call(a, o, i, s) : r(o, i, s)) : es(e, c + 3); }
function XC(e, t, n, r, o, i, s, a, c) { let l = t + n; return Xe(e, l, o, i, s, a) ? lt(e, l + 4, c ? r.call(c, o, i, s, a) : r(o, i, s, a)) : es(e, l + 4); }
function eM(e, t, n, r, o, i) { let s = t + n, a = !1; for (let c = 0; c < o.length; c++)
    Z(e, s++, o[c]) && (a = !0); return a ? lt(e, s, r.apply(i, o)) : es(e, s); }
function tM(e, t) { let n = R(), r, o = e + I; n.firstCreatePass ? (r = SL(t, n.pipeRegistry), n.data[o] = r, r.onDestroy && (n.destroyHooks ??= []).push(o, r.onDestroy)) : r = n.data[o]; let i = r.factory || (r.factory = Yt(r.type, !0)), s, a = Me(ro); try {
    let c = ha(!1), l = i();
    return ha(c), Ho(n, g(), o, l), l;
}
finally {
    Me(a);
} }
function SL(e, t) { if (t)
    for (let n = t.length - 1; n >= 0; n--) {
        let r = t[n];
        if (e === r.name)
            return r;
    } }
function nM(e, t, n) { let r = e + I, o = g(), i = sn(o, r); return ts(o, r) ? YC(o, Ee(), t, i.transform, n, i) : i.transform(n); }
function rM(e, t, n, r) { let o = e + I, i = g(), s = sn(i, o); return ts(i, o) ? KC(i, Ee(), t, s.transform, n, r, s) : s.transform(n, r); }
function oM(e, t, n, r, o) { let i = e + I, s = g(), a = sn(s, i); return ts(s, i) ? JC(s, Ee(), t, a.transform, n, r, o, a) : a.transform(n, r, o); }
function iM(e, t, n, r, o, i) { let s = e + I, a = g(), c = sn(a, s); return ts(a, s) ? XC(a, Ee(), t, c.transform, n, r, o, i, c) : c.transform(n, r, o, i); }
function sM(e, t, n) { let r = e + I, o = g(), i = sn(o, r); return ts(o, r) ? eM(o, Ee(), t, i.transform, n, i) : i.transform.apply(i, n); }
function ts(e, t) { return e[m].data[t].pure; }
function aM(e, t) { return Tc(e, t); }
function cM(e, t) { return () => { try {
    return Fr.getComponentDependencies(e, t).dependencies;
}
catch (n) {
    throw console.error(`Computing dependencies in local compilation mode for the component "${e.name}" failed with the exception:`, n), n;
} }; }
function lM(e, t) { let n = W(e); n !== null && (n.debugInfo = t); }
function uM(e, t, n) { let r = `./@ng/component?c=${e}&t=${encodeURIComponent(t)}`; return new URL(r, n).href; }
function dM(e, t, n, r, o = null, i = null) { let s = W(e); t.apply(null, [e, n, ...r]); let { newDef: a, oldDef: c } = _L(s, W(e)); if (e[Mn] = a, c.tView) {
    let l = KS().values();
    for (let u of l)
        st(u) && u[z] === null && la(o, i, a, c, u);
} }
function _L(e, t) { let n = O({}, e); return { newDef: Object.assign(e, t, { directiveDefs: n.directiveDefs, pipeDefs: n.pipeDefs, setInput: n.setInput, type: n.type }), oldDef: n }; }
function la(e, t, n, r, o) { let i = o[m]; if (i === r.tView) {
    AL(e, t, n, r, o);
    return;
} for (let s = I; s < i.bindingStartIndex; s++) {
    let a = o[s];
    if (J(a)) {
        ee(a[U]) && la(e, t, n, r, a[U]);
        for (let c = G; c < a.length; c++)
            la(e, t, n, r, a[c]);
    }
    else
        ee(a) && la(e, t, n, r, a);
} }
function bL(e, t) { e.componentReplaced?.(t.id); }
function AL(e, t, n, r, o) { let i = o[V], s = o[U], a = o[z], c = o[le], l = o[k].get(q, null), u = () => { if (r.encapsulation === Je.ShadowDom || r.encapsulation === Je.ExperimentalIsolatedShadowDom) {
    let h = s.cloneNode(!1);
    s.replaceWith(h), s = h;
} let d = CE(n), f = fc(a, d, i, Xf(n), s, c, null, null, null, null, null); RL(a, o, f, c.index), qi(o[m], o), vi(o); let p = o[Qe].rendererFactory; bL(p, r), f[S] = p.createRenderer(s, n), hE(o[m], o), xL(c), Ec(d, f, i), FE(d, f, d.template, i); }; l === null ? Ev(e, t, u) : l.run(() => Ev(e, t, u)); }
function Ev(e, t, n) {
    try {
        n();
    }
    catch (r) {
        let o = r;
        if (t !== null && o.message) {
            let i = o.message + (o.stack ? `
` + o.stack : "");
            e?.hot?.send?.("angular:invalidate", { id: t, message: i, error: !0 });
        }
        throw r;
    }
}
function RL(e, t, n, r) { for (let o = I; o < e[m].bindingStartIndex; o++) {
    let i = e[o];
    if ((ee(i) || J(i)) && i[me] === t) {
        i[me] = n;
        break;
    }
} e[tn] === t && (e[tn] = n), e[Fo] === t && (e[Fo] = n), n[me] = t[me], t[me] = null, e[r] = n; }
function xL(e) { if (e.projection !== null) {
    for (let t of e.projection)
        Ha(t) && (t.projectionNext = null, t.flags &= -3);
    e.projection = null;
} }
var Ie = { \u0275\u0275animateEnter: ni, \u0275\u0275animateEnterListener: ri, \u0275\u0275animateLeave: oi, \u0275\u0275animateLeaveListener: Oa, \u0275\u0275attribute: Bp, \u0275\u0275defineComponent: zI, \u0275\u0275defineDirective: ZI, \u0275\u0275defineInjectable: K, \u0275\u0275defineInjector: No, \u0275\u0275defineNgModule: Mp, \u0275\u0275defineService: Vt, \u0275\u0275definePipe: YI, \u0275\u0275directiveInject: ro, \u0275\u0275getInheritedFactory: Uv, \u0275\u0275inject: ge, \u0275\u0275injectAttribute: Ba, \u0275\u0275invalidFactory: NI, \u0275\u0275invalidFactoryDep: Ms, \u0275\u0275templateRefExtractor: aM, \u0275\u0275resetView: au, \u0275\u0275HostDirectivesFeature: aD, \u0275\u0275NgOnChangesFeature: _v, \u0275\u0275ControlFeature: sD, \u0275\u0275ProvidersFeature: RC, \u0275\u0275InheritDefinitionFeature: Ap, \u0275\u0275ExternalStylesFeature: xC, \u0275\u0275nextContext: LT, \u0275\u0275namespaceHTML: Eu, \u0275\u0275namespaceMathML: yu, \u0275\u0275namespaceSVG: vu, \u0275\u0275enableBindings: ru, \u0275\u0275disableBindings: ou, \u0275\u0275elementStart: Mi, \u0275\u0275elementEnd: Pc, \u0275\u0275element: $p, \u0275\u0275elementContainerStart: Vc, \u0275\u0275elementContainerEnd: Ji, \u0275\u0275domElement: Gp, \u0275\u0275domElementStart: Fc, \u0275\u0275domElementEnd: jc, \u0275\u0275domElementContainer: Qp, \u0275\u0275domElementContainerStart: Hc, \u0275\u0275domElementContainerEnd: zp, \u0275\u0275domTemplate: xp, \u0275\u0275domListener: oh, \u0275\u0275elementContainer: Wp, \u0275\u0275pureFunction0: HC, \u0275\u0275pureFunction1: BC, \u0275\u0275pureFunction2: UC, \u0275\u0275pureFunction3: $C, \u0275\u0275pureFunction4: GC, \u0275\u0275pureFunction5: qC, \u0275\u0275pureFunction6: WC, \u0275\u0275pureFunction7: zC, \u0275\u0275pureFunction8: QC, \u0275\u0275pureFunctionV: ZC, \u0275\u0275getCurrentView: gT, \u0275\u0275restoreView: su, \u0275\u0275listener: nh, \u0275\u0275projection: FT, \u0275\u0275syntheticHostProperty: Kp, \u0275\u0275syntheticHostListener: rh, \u0275\u0275pipeBind1: nM, \u0275\u0275pipeBind2: rM, \u0275\u0275pipeBind3: oM, \u0275\u0275pipeBind4: iM, \u0275\u0275pipeBindV: sM, \u0275\u0275projectionDef: PT, \u0275\u0275domProperty: Yp, \u0275\u0275ariaProperty: Hp, \u0275\u0275property: Up, \u0275\u0275control: DI, \u0275\u0275controlCreate: EI, \u0275\u0275pipe: tM, \u0275\u0275queryRefresh: jT, \u0275\u0275queryAdvance: HT, \u0275\u0275viewQuery: ah, \u0275\u0275viewQuerySignal: lh, \u0275\u0275loadQuery: VT, \u0275\u0275contentQuery: sh, \u0275\u0275contentQuerySignal: ch, \u0275\u0275reference: BT, \u0275\u0275classMap: zT, \u0275\u0275styleMap: WT, \u0275\u0275styleProp: uh, \u0275\u0275classProp: dh, \u0275\u0275advance: ME, \u0275\u0275template: Rp, \u0275\u0275conditional: cT, \u0275\u0275conditionalCreate: aT, \u0275\u0275conditionalBranchCreate: Lc, \u0275\u0275defer: FD, \u0275\u0275deferWhen: jD, \u0275\u0275deferOnIdle: UD, \u0275\u0275deferOnImmediate: qD, \u0275\u0275deferOnTimer: QD, \u0275\u0275deferOnHover: KD, \u0275\u0275deferOnInteraction: eT, \u0275\u0275deferOnViewport: rT, \u0275\u0275deferPrefetchWhen: VD, \u0275\u0275deferPrefetchOnIdle: $D, \u0275\u0275deferPrefetchOnImmediate: WD, \u0275\u0275deferPrefetchOnTimer: ZD, \u0275\u0275deferPrefetchOnHover: JD, \u0275\u0275deferPrefetchOnInteraction: tT, \u0275\u0275deferPrefetchOnViewport: oT, \u0275\u0275deferHydrateWhen: HD, \u0275\u0275deferHydrateNever: BD, \u0275\u0275deferHydrateOnIdle: GD, \u0275\u0275deferHydrateOnImmediate: zD, \u0275\u0275deferHydrateOnTimer: YD, \u0275\u0275deferHydrateOnHover: XD, \u0275\u0275deferHydrateOnInteraction: nT, \u0275\u0275deferHydrateOnViewport: iT, \u0275\u0275deferEnableTimerScheduling: TD, \u0275\u0275enableIncrementalHydrationRuntime: VC, \u0275\u0275repeater: fT, \u0275\u0275repeaterCreate: dT, \u0275\u0275repeaterTrackByIndex: lT, \u0275\u0275repeaterTrackByIdentity: uT, \u0275\u0275componentInstance: sT, \u0275\u0275text: tC, \u0275\u0275textInterpolate: fh, \u0275\u0275textInterpolate1: Bc, \u0275\u0275textInterpolate2: ph, \u0275\u0275textInterpolate3: hh, \u0275\u0275textInterpolate4: gh, \u0275\u0275textInterpolate5: mh, \u0275\u0275textInterpolate6: vh, \u0275\u0275textInterpolate7: yh, \u0275\u0275textInterpolate8: Eh, \u0275\u0275textInterpolateV: Ih, \u0275\u0275i18n: RT, \u0275\u0275i18nAttributes: xT, \u0275\u0275i18nExp: th, \u0275\u0275i18nStart: Xp, \u0275\u0275i18nEnd: eh, \u0275\u0275i18nApply: kT, \u0275\u0275i18nPostprocess: OT, \u0275\u0275resolveWindow: eE, \u0275\u0275resolveDocument: tE, \u0275\u0275resolveBody: jf, \u0275\u0275setComponentScope: kC, \u0275\u0275setNgModuleScope: OC, \u0275\u0275registerNgModuleType: _p, \u0275\u0275getComponentDepsFactory: cM, \u0275setClassDebugInfo: lM, \u0275\u0275declareLet: Ch, \u0275\u0275storeLet: gC, \u0275\u0275arrowFunction: _C, \u0275\u0275readContextLet: mC, \u0275\u0275attachSourceLocations: vC, \u0275\u0275interpolate: yC, \u0275\u0275interpolate1: EC, \u0275\u0275interpolate2: IC, \u0275\u0275interpolate3: DC, \u0275\u0275interpolate4: TC, \u0275\u0275interpolate5: CC, \u0275\u0275interpolate6: MC, \u0275\u0275interpolate7: wC, \u0275\u0275interpolate8: NC, \u0275\u0275interpolateV: SC, \u0275\u0275sanitizeHtml: kf, \u0275\u0275sanitizeStyle: Of, \u0275\u0275sanitizeResourceUrl: rc, \u0275\u0275sanitizeScript: Pf, \u0275\u0275validateAttribute: Ff, \u0275\u0275sanitizeUrl: Lf, \u0275\u0275sanitizeUrlOrResourceUrl: Xy, \u0275\u0275trustConstantHtml: Ky, \u0275\u0275trustConstantResourceUrl: Jy, forwardRef: Mo, resolveForwardRef: F, \u0275\u0275twoWayProperty: Dh, \u0275\u0275twoWayBindingSet: pC, \u0275\u0275twoWayListener: Th, \u0275\u0275replaceMetadata: dM, \u0275\u0275getReplaceMetadataURL: uM }, _r = null;
function fM(e) { _r !== null && (e.defaultEncapsulation !== _r.defaultEncapsulation || e.preserveWhitespaces !== _r.preserveWhitespaces) || (_r = e); }
function kL() { return _r; }
function OL() { _r = null; }
var ci = [];
function LL(e, t) { ci.push({ moduleType: e, ngModule: t }); }
var Zu = !1;
function pM() { if (!Zu) {
    Zu = !0;
    try {
        for (let e = ci.length - 1; e >= 0; e--) {
            let { moduleType: t, ngModule: n } = ci[e];
            n.declarations && n.declarations.every(hM) && (ci.splice(e, 1), HL(t, n));
        }
    }
    finally {
        Zu = !1;
    }
} }
function hM(e) { return Array.isArray(e) ? e.every(hM) : !!F(e); }
function gM(e, t = {}) { mM(e, t), t.id !== void 0 && _p(e, t.id), LL(e, t); }
function mM(e, t, n = !1) { let r = ot(t.declarations || j), o = null; Object.defineProperty(e, Is, { configurable: !0, get: () => (o === null && (o = ne({ usage: 0, kind: "NgModule", type: e }).compileNgModule(Ie, `ng:///${e.name}/\u0275mod.js`, { type: e, bootstrap: ot(t.bootstrap || j).map(F), declarations: r.map(F), imports: ot(t.imports || j).map(F).map(Iv), exports: ot(t.exports || j).map(F).map(Iv), schemas: t.schemas ? ot(t.schemas) : null, id: t.id || null }), o.schemas || (o.schemas = [])), o) }); let i = null; Object.defineProperty(e, $e, { get: () => { if (i === null) {
        let a = ne({ usage: 0, kind: "NgModule", type: e });
        i = a.compileFactory(Ie, `ng:///${e.name}/\u0275fac.js`, { name: e.name, type: e, deps: Ri(e), target: a.FactoryTarget.NgModule, typeArgumentCount: 0 });
    } return i; }, configurable: !1 }); let s = null; Object.defineProperty(e, mo, { get: () => { if (s === null) {
        let a = { name: e.name, type: e, providers: t.providers || j, imports: [(t.imports || j).map(F), (t.exports || j).map(F)] };
        s = ne({ usage: 0, kind: "NgModule", type: e }).compileInjector(Ie, `ng:///${e.name}/\u0275inj.js`, a);
    } return s; }, configurable: !1 }); }
function PL(e, t) { let n = `Unexpected "${We(e)}" found in the "declarations" array of the`, r = `"${We(e)}" is marked as standalone and can't be declared in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?`; return `${n} ${t}, ${r}`; }
var FL = new WeakMap, jL = new WeakMap;
function VL() { FL = new WeakMap, jL = new WeakMap, ci.length = 0, Fx.clear(); }
function HL(e, t) { let n = ot(t.declarations || j), r = wh(e); n.forEach(o => { if (o = F(o), o.hasOwnProperty(Mn)) {
    let s = W(o);
    Mh(s, r);
}
else
    !o.hasOwnProperty(_o) && !o.hasOwnProperty(bo) && (o.ngSelectorScope = e); }); }
function Mh(e, t) { e.directiveDefs = () => Array.from(t.compilation.directives).map(n => n.hasOwnProperty(Mn) ? W(n) : Le(n)).filter(n => !!n), e.pipeDefs = () => Array.from(t.compilation.pipes).map(n => rt(n)), e.schemas = t.schemas, e.tView = null; }
function wh(e) { if (xn(e)) {
    let t = Fr.getNgModuleScope(e), n = Ds(e);
    return O({ schemas: n.schemas || null }, t);
}
else if (Ao(e)) {
    if ((W(e) || Le(e)) !== null)
        return { schemas: null, compilation: { directives: new Set, pipes: new Set }, exported: { directives: new Set([e]), pipes: new Set } };
    if (rt(e) !== null)
        return { schemas: null, compilation: { directives: new Set, pipes: new Set }, exported: { directives: new Set, pipes: new Set([e]) } };
} throw new Error(`${e.name} does not have a module def (\u0275mod property)`); }
function Iv(e) { return up(e) ? e.ngModule : e; }
var Yu = 0;
function vM(e, t) {
    let n = null;
    Hx(e, t), EM(e, t), Object.defineProperty(e, Mn, { get: () => {
            if (n === null) {
                let r = ne({ usage: 0, kind: "component", type: e });
                if (rD(t)) {
                    let u = [`Component '${e.name}' is not resolved:`];
                    throw t.templateUrl && u.push(` - templateUrl: ${t.templateUrl}`), t.styleUrls && t.styleUrls.length && u.push(` - styleUrls: ${JSON.stringify(t.styleUrls)}`), t.styleUrl && u.push(` - styleUrl: ${t.styleUrl}`), u.push("Did you run and wait for 'resolveComponentResources()'?"), new Error(u.join(`
`));
                }
                let o = kL(), i = t.preserveWhitespaces;
                i === void 0 && (o !== null && o.preserveWhitespaces !== void 0 ? i = o.preserveWhitespaces : i = !1);
                let s = t.encapsulation;
                s === void 0 && (o !== null && o.defaultEncapsulation !== void 0 ? s = o.defaultEncapsulation : s = Je.Emulated);
                let a = t.templateUrl || `ng:///${e.name}/template.html`, c = IM(e, t), l = X(O({}, c), { typeSourceSpan: r.createParseSourceSpan("Component", e.name, a), template: t.template || "", preserveWhitespaces: i, styles: typeof t.styles == "string" ? [t.styles] : t.styles || j, animations: t.animations, declarations: [], changeDetection: t.changeDetection, encapsulation: s, viewProviders: t.viewProviders || null, hasDirectiveDependencies: !c.isStandalone || t.imports != null && t.imports.length > 0 });
                Yu++;
                try {
                    if (l.usesInheritance && DM(e), n = r.compileComponent(Ie, a, l), l.isStandalone) {
                        let u = ot(t.imports || j), { directiveDefs: d, pipeDefs: f } = BL(e, u);
                        n.directiveDefs = d, n.pipeDefs = f, n.dependencies = () => u.map(F);
                    }
                }
                finally {
                    Yu--;
                }
                if (Yu === 0 && pM(), UL(e)) {
                    let u = wh(e.ngSelectorScope);
                    Mh(n, u);
                }
                if (t.schemas)
                    if (l.isStandalone)
                        n.schemas = t.schemas;
                    else
                        throw new Error(`The 'schemas' was specified for the ${We(e)} but is only valid on a component that is standalone.`);
                else
                    l.isStandalone && (n.schemas = []);
            }
            return n;
        }, set: r => { n = r; }, configurable: !1 });
}
function BL(e, t) { return { directiveDefs: () => Xo(e) ? [...Fr.getStandaloneComponentScope(e, t).compilation.directives].map(i => W(i) || Le(i)).filter(i => i !== null) : [], pipeDefs: () => Xo(e) ? [...Fr.getStandaloneComponentScope(e, t).compilation.pipes].map(i => rt(i)).filter(i => i !== null) : [] }; }
function UL(e) { return e.ngSelectorScope !== void 0; }
function Nh(e, t) { let n = null; EM(e, t || {}), Object.defineProperty(e, _o, { get: () => { if (n === null) {
        let r = yM(e, t || {});
        n = ne({ usage: 0, kind: "directive", type: e }).compileDirective(Ie, r.sourceMapUrl, r.metadata);
    } return n; }, configurable: !1 }); }
function yM(e, t) { let n = e && e.name, r = `ng:///${n}/\u0275dir.js`, o = ne({ usage: 0, kind: "directive", type: e }), i = IM(e, t); return i.typeSourceSpan = o.createParseSourceSpan("Directive", n, r), i.usesInheritance && DM(e), { metadata: i, sourceMapUrl: r }; }
function EM(e, t) { let n = null; Object.defineProperty(e, $e, { get: () => { if (n === null) {
        let r = yM(e, t), o = ne({ usage: 0, kind: "directive", type: e });
        n = o.compileFactory(Ie, `ng:///${e.name}/\u0275fac.js`, { name: r.metadata.name, type: r.metadata.type, typeArgumentCount: 0, deps: Ri(e), target: o.FactoryTarget.Directive });
    } return n; }, configurable: !1 }); }
function $L(e) { return Object.getPrototypeOf(e.prototype) === Object.prototype; }
function IM(e, t) { let n = uf(), r = n.ownPropMetadata(e); return { name: e.name, legacyOptionalChaining: !1, type: e, selector: t.selector !== void 0 ? t.selector : null, host: t.host || bt, propMetadata: r, inputs: t.inputs || j, outputs: t.outputs || j, queries: Dv(e, r, TM), lifecycle: { usesOnChanges: n.hasLifecycleHook(e, "ngOnChanges") }, controlCreate: n.hasLifecycleHook(e, "\u0275ngControlCreate") ? { passThroughInput: null } : null, typeSourceSpan: null, usesInheritance: !$L(e), exportAs: WL(t.exportAs), providers: t.providers || null, viewQueries: Dv(e, r, CM), isStandalone: t.standalone === void 0 ? !0 : !!t.standalone, isSignal: !!t.signals, hostDirectives: t.hostDirectives?.map(o => typeof o == "function" ? { directive: o } : o) || null }; }
function DM(e) { let t = Object.prototype, n = Object.getPrototypeOf(e.prototype).constructor; for (; n && n !== t;)
    !Le(n) && !W(n) && QL(n) && Nh(n, null), n = Object.getPrototypeOf(n); }
function GL(e) { return typeof e == "string" ? wM(e) : F(e); }
function qL(e, t) { return { propertyName: e, predicate: GL(t.selector), descendants: t.descendants, first: t.first, read: t.read ? t.read : null, static: !!t.static, emitDistinctChangesOnly: !!t.emitDistinctChangesOnly, isSignal: !!t.isSignal }; }
function Dv(e, t, n) { let r = [], o = []; for (let i in t)
    if (t.hasOwnProperty(i)) {
        let s = t[i];
        s.forEach(a => { if (n(a)) {
            if (!a.selector)
                throw new Error(`Can't construct a query for the property "${i}" of "${We(e)}" since the query selector wasn't defined.`);
            if (s.some(MM))
                throw new Error("Cannot combine @Input decorators with query decorators");
            let c = qL(i, a);
            c.isSignal ? r.push(c) : o.push(c);
        } });
    } return [...r, ...o]; }
function WL(e) { return e === void 0 ? null : wM(e); }
function TM(e) { let t = e.ngMetadataName; return t === "ContentChild" || t === "ContentChildren"; }
function CM(e) { let t = e.ngMetadataName; return t === "ViewChild" || t === "ViewChildren"; }
function MM(e) { return e.ngMetadataName === "Input"; }
function wM(e) { return e.split(",").map(t => t.trim()); }
var zL = ["ngOnChanges", "ngOnInit", "ngOnDestroy", "ngDoCheck", "ngAfterViewInit", "ngAfterViewChecked", "ngAfterContentInit", "ngAfterContentChecked"];
function QL(e) { let t = uf(); if (zL.some(r => t.hasLifecycleHook(e, r)))
    return !0; let n = t.propMetadata(e); for (let r in n) {
    let o = n[r];
    for (let i = 0; i < o.length; i++) {
        let s = o[i], a = s.ngMetadataName;
        if (MM(s) || TM(s) || CM(s) || a === "Output" || a === "HostBinding" || a === "HostListener")
            return !0;
    }
} return !1; }
function NM(e, t) { let n = null, r = null; Object.defineProperty(e, $e, { get: () => { if (r === null) {
        let o = Tv(e, t), i = ne({ usage: 0, kind: "pipe", type: o.type });
        r = i.compileFactory(Ie, `ng:///${o.name}/\u0275fac.js`, { name: o.name, type: o.type, typeArgumentCount: 0, deps: Ri(e), target: i.FactoryTarget.Pipe });
    } return r; }, configurable: !1 }), Object.defineProperty(e, bo, { get: () => { if (n === null) {
        let o = Tv(e, t);
        n = ne({ usage: 0, kind: "pipe", type: o.type }).compilePipe(Ie, `ng:///${o.name}/\u0275pipe.js`, o);
    } return n; }, configurable: !1 }); }
function Tv(e, t) { return { type: e, name: e.name, pipeName: t.name, pure: t.pure !== void 0 ? t.pure : !0, isStandalone: t.standalone === void 0 ? !0 : !!t.standalone }; }
var SM = Ur("Directive", (e = {}) => e, void 0, void 0, (e, t) => Nh(e, t)), ZL = Ur("Component", (e = {}) => O({ changeDetection: $a.Eager }, e), SM, void 0, (e, t) => vM(e, t)), YL = Ur("Pipe", e => O({ pure: !0 }, e), void 0, void 0, (e, t) => NM(e, t)), KL = jt("Input", e => e ? typeof e == "string" ? { alias: e } : e : {}), JL = jt("Output", e => ({ alias: e })), XL = jt("HostBinding", e => ({ hostPropertyName: e })), eP = jt("HostListener", (e, t) => ({ eventName: e, args: t })), tP = Ur("NgModule", e => e, void 0, void 0, (e, t) => gM(e, t));
var _M = (() => { class e {
    applicationErrorHandler = E(Rt);
    appRef = E(Be);
    taskService = E(vt);
    ngZone = E(q);
    zonelessEnabled = E(Ir);
    tracing = E(Jn, { optional: !0 });
    zoneIsDefined = typeof Zone < "u" && !!Zone.root.run;
    schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }];
    subscriptions = new sS;
    angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(Eo) : null;
    scheduleInRootZone = !this.zonelessEnabled && this.zoneIsDefined && (E(Hs, { optional: !0 }) ?? !1);
    cancelScheduledCallback = null;
    useMicrotaskScheduler = !1;
    runningTick = !1;
    pendingRenderTaskId = null;
    constructor() { this.subscriptions.add(this.appRef.afterTick.subscribe(() => { let n = this.taskService.add(); if (!this.runningTick && (this.cleanup(), !this.zonelessEnabled || this.appRef.includeAllTestViews)) {
        this.taskService.remove(n);
        return;
    } this.switchToMicrotaskScheduler(), this.taskService.remove(n); })), this.subscriptions.add(this.ngZone.onUnstable.subscribe(() => { this.runningTick || this.cleanup(); })); }
    switchToMicrotaskScheduler() { this.ngZone.runOutsideAngular(() => { let n = this.taskService.add(); this.useMicrotaskScheduler = !0, queueMicrotask(() => { this.useMicrotaskScheduler = !1, this.taskService.remove(n); }); }); }
    notify(n) { if (!this.zonelessEnabled && n === 5)
        return; switch (n) {
        case 0:
        case 2: {
            this.appRef.dirtyFlags |= 2;
            break;
        }
        case 3:
        case 4:
        case 5:
        case 1: {
            this.appRef.dirtyFlags |= 4;
            break;
        }
        case 6: {
            this.appRef.dirtyFlags |= 2;
            break;
        }
        case 12: {
            this.appRef.dirtyFlags |= 16;
            break;
        }
        case 13: {
            this.appRef.dirtyFlags |= 2;
            break;
        }
        case 11: break;
        default: this.appRef.dirtyFlags |= 8;
    } if (this.appRef.tracingSnapshot = this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null, !this.shouldScheduleTick())
        return; let r = this.useMicrotaskScheduler ? Zg : Cu; this.pendingRenderTaskId = this.taskService.add(), this.scheduleInRootZone ? this.cancelScheduledCallback = Zone.root.run(() => r(() => this.tick())) : this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() => r(() => this.tick())); }
    shouldScheduleTick() { return !(this.appRef.destroyed || this.pendingRenderTaskId !== null || this.runningTick || this.appRef._runningTick || !this.zonelessEnabled && this.zoneIsDefined && Zone.current.get(Eo + this.angularZoneId)); }
    tick() { if (this.runningTick || this.appRef.destroyed)
        return; if (this.appRef.dirtyFlags === 0) {
        this.cleanup();
        return;
    } !this.zonelessEnabled && this.appRef.dirtyFlags & 7 && (this.appRef.dirtyFlags |= 1); let n = this.taskService.add(); try {
        this.ngZone.run(() => { this.runningTick = !0, this.appRef._tick(); }, void 0, this.schedulerTickApplyArgs);
    }
    catch (r) {
        this.applicationErrorHandler(r);
    }
    finally {
        this.taskService.remove(n), this.cleanup();
    } }
    ngOnDestroy() { this.subscriptions.unsubscribe(), this.cleanup(); }
    cleanup() { if (this.runningTick = !1, this.cancelScheduledCallback?.(), this.cancelScheduledCallback = null, this.pendingRenderTaskId !== null) {
        let n = this.pendingRenderTaskId;
        this.pendingRenderTaskId = null, this.taskService.remove(n);
    } }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = Vt({ token: e, factory: e.\u0275fac });
} return e; })();
function nP() { return re("NgZoneless"), Fe([...Uc(), []]); }
function Uc() { return [{ provide: qe, useExisting: _M }, { provide: q, useClass: Io }, { provide: Ir, useValue: !0 }]; }
var rP = (() => { class e {
    compileModuleSync(n) { return new Vr(n); }
    compileModuleAsync(n) { return Promise.resolve(this.compileModuleSync(n)); }
    clearCache() { }
    clearCacheFor(n) { }
    getModuleId(n) { }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = Vt({ token: e, factory: e.\u0275fac });
} return e; })(), bM = new M(""), of = class {
};
function oP() { return typeof ngI18nClosureMode < "u" && ngI18nClosureMode && typeof goog < "u" && goog.LOCALE !== "en" ? goog.LOCALE : typeof $localize < "u" && $localize.locale || Xi; }
var Sh = new M("", { factory: () => E(Sh, { optional: !0, skipSelf: !0 }) || oP() }), iP = new M("", { factory: () => IO }), sP = new M(""), aP = new M(""), AM = (function (e) { return e[e.Error = 0] = "Error", e[e.Warning = 1] = "Warning", e[e.Ignore = 2] = "Ignore", e; })(AM || {});
function ua(e, t) { let n = e[m]; for (let r = I; r < n.bindingStartIndex; r++)
    if (J(e[r])) {
        let o = e[r];
        if (!(r === n.bindingStartIndex - 1)) {
            let s = n.data[r], a = he(n, s);
            if (mD(a)) {
                t.push({ lContainer: o, lView: e, tNode: s, tDetails: a });
                continue;
            }
        }
        ee(o[U]) && ua(o[U], t);
        for (let s = G; s < o.length; s++)
            ua(o[s], t);
    }
    else
        ee(e[r]) && ua(e[r], t); }
var sf = class {
    name;
    callback;
    constructor(t, n) { this.name = t, this.callback = n; }
};
function cP(e) { return e.map(t => t.nativeElement); }
var _i = class {
    nativeNode;
    constructor(t) { this.nativeNode = t; }
    get parent() { let t = this.nativeNode.parentNode; return t ? new Qn(t) : null; }
    get injector() { return pf(this.nativeNode); }
    get componentInstance() { let t = this.nativeNode; return t && (fm(t) || c_(t)); }
    get context() { return fm(this.nativeNode) || a_(this.nativeNode); }
    get listeners() { return p_(this.nativeNode).filter(t => t.type === "dom"); }
    get references() { return d_(this.nativeNode); }
    get providerTokens() { return l_(this.nativeNode); }
}, Qn = class extends _i {
    constructor(t) { super(t); }
    get nativeElement() { return this.nativeNode.nodeType == Node.ELEMENT_NODE ? this.nativeNode : null; }
    get name() { let t = Se(this.nativeNode), n = t ? t.lView : null; return n !== null ? n[m].data[t.nodeIndex].value : this.nativeNode.nodeName; }
    get properties() { let t = Se(this.nativeNode), n = t ? t.lView : null; if (n === null)
        return {}; let r = n[m].data, o = r[t.nodeIndex], i = {}; return lP(this.nativeElement, i), dP(i, o, n, r), i; }
    get attributes() { let t = {}, n = this.nativeElement; if (!n)
        return t; let r = Se(n), o = r ? r.lView : null; if (o === null)
        return {}; let i = o[m].data[r.nodeIndex].attrs, s = []; if (i) {
        let a = 0;
        for (; a < i.length;) {
            let c = i[a];
            if (typeof c != "string")
                break;
            let l = i[a + 1];
            t[c] = l, s.push(c.toLowerCase()), a += 2;
        }
    } for (let a of n.attributes)
        s.includes(a.name) || (t[a.name] = a.value); return t; }
    get styles() { return this.nativeElement?.style ?? {}; }
    get classes() { let t = {}, r = this.nativeElement.className; return (typeof r != "string" ? r.baseVal.split(" ") : r.split(" ")).forEach(i => t[i] = !0), t; }
    get childNodes() { let t = this.nativeNode.childNodes, n = []; for (let r = 0; r < t.length; r++) {
        let o = t[r];
        n.push(bi(o));
    } return n; }
    get children() { let t = this.nativeElement; if (!t)
        return []; let n = t.children, r = []; for (let o = 0; o < n.length; o++) {
        let i = n[o];
        r.push(bi(i));
    } return r; }
    query(t) { return this.queryAll(t)[0] || null; }
    queryAll(t) { let n = []; return Cv(this, t, n, !0), n; }
    queryAllNodes(t) { let n = []; return Cv(this, t, n, !1), n; }
    triggerEventHandler(t, n) { let r = this.nativeNode, o = []; this.listeners.forEach(i => { if (i.name === t) {
        let s = i.callback;
        s.call(r, n), o.push(s);
    } }), typeof r.eventListeners == "function" && r.eventListeners(t).forEach(i => { if (i.toString().indexOf("__ngUnwrap__") !== -1) {
        let s = i("__ngUnwrap__");
        return o.indexOf(s) === -1 && s.call(r, n);
    } }); }
};
function lP(e, t) { if (e) {
    let n = Object.getPrototypeOf(e), r = Node.prototype;
    for (; n !== null && n !== r;) {
        let o = Object.getOwnPropertyDescriptors(n);
        for (let i in o)
            if (!i.startsWith("__") && !i.startsWith("on")) {
                let s = e[i];
                uP(s) && (t[i] = s);
            }
        n = Object.getPrototypeOf(n);
    }
} }
function uP(e) { return typeof e == "string" || typeof e == "boolean" || typeof e == "number" || e === null; }
function Cv(e, t, n, r) { let o = Se(e.nativeNode), i = o ? o.lView : null; if (i !== null) {
    let s = i[m].data[o.nodeIndex];
    kn(s, i, t, n, r, e.nativeNode);
}
else
    _h(e.nativeNode, t, n, r); }
function kn(e, t, n, r, o, i) { let s = kg(e, t); if (e.type & 11) {
    if (Ku(s, n, r, o, i), we(e)) {
        let c = ve(e.index, t);
        c && c[m].firstChild && kn(c[m].firstChild, c, n, r, o, i);
    }
    else
        e.child && kn(e.child, t, n, r, o, i), s && _h(s, n, r, o);
    let a = t[e.index];
    J(a) && Mv(a, n, r, o, i);
}
else if (e.type & 4) {
    let a = t[e.index];
    Ku(a[it], n, r, o, i), Mv(a, n, r, o, i);
}
else if (e.type & 16) {
    let a = t[se], l = a[le].projection[e.projection];
    if (Array.isArray(l))
        for (let u of l)
            Ku(u, n, r, o, i);
    else if (l) {
        let u = a[z], d = u[m].data[l.index];
        kn(d, u, n, r, o, i);
    }
}
else
    e.child && kn(e.child, t, n, r, o, i); if (i !== s) {
    let a = e.flags & 2 ? e.projectionNext : e.next;
    a && kn(a, t, n, r, o, i);
} }
function Mv(e, t, n, r, o) { for (let i = G; i < e.length; i++) {
    let s = e[i], a = s[m].firstChild;
    a && kn(a, s, t, n, r, o);
} }
function Ku(e, t, n, r, o) { if (o !== e) {
    let i = bi(e);
    if (!i)
        return;
    (r && i instanceof Qn && t(i) && n.indexOf(i) === -1 || !r && t(i) && n.indexOf(i) === -1) && n.push(i);
} }
function _h(e, t, n, r) { let o = e.childNodes, i = o.length; for (let s = 0; s < i; s++) {
    let a = o[s], c = bi(a);
    c && ((r && c instanceof Qn && t(c) && n.indexOf(c) === -1 || !r && t(c) && n.indexOf(c) === -1) && n.push(c), _h(a, t, n, r));
} }
function dP(e, t, n, r) { let o = t.propertyBindings; if (o !== null)
    for (let i = 0; i < o.length; i++) {
        let s = o[i], c = r[s].split(Rb), l = c[0];
        if (c.length > 1) {
            let u = c[1];
            for (let d = 1; d < c.length - 1; d++)
                u += A(n[s + d - 1]) + c[d + 1];
            e[l] = u;
        }
        else
            e[l] = n[s];
    } }
var Ju = "__ng_debug__";
function bi(e) { return e instanceof Node ? (e.hasOwnProperty(Ju) || (e[Ju] = e.nodeType == Node.ELEMENT_NODE ? new Qn(e) : new _i(e)), e[Ju]) : null; }
var ns = class {
    destroyed = !1;
    listeners = null;
    errorHandler = E(_t, { optional: !0 });
    isEmitting = !1;
    hasNullListeners = !1;
    destroyRef = E(xe);
    constructor() { this.destroyRef.onDestroy(() => { this.destroyed = !0, this.listeners = null; }); }
    subscribe(t) { if (this.destroyed)
        throw new D(953, !1); return (this.listeners ??= []).push(t), { unsubscribe: () => { let n = this.listeners ? this.listeners.indexOf(t) : -1; n > -1 && (this.isEmitting ? (this.hasNullListeners = !0, this.listeners[n] = null) : this.listeners.splice(n, 1)); } }; }
    emit(t) { if (this.destroyed) {
        console.warn(To(953, !1));
        return;
    } if (this.listeners === null)
        return; this.isEmitting = !0; let n = C(null); try {
        for (let r of this.listeners)
            try {
                r !== null && r(t);
            }
            catch (o) {
                this.errorHandler?.handleError(o);
            }
    }
    finally {
        this.hasNullListeners && (this.hasNullListeners = !1, this.listeners && fP(this.listeners)), C(n), this.isEmitting = !1;
    } }
};
function fP(e) { let t = e.length - 1; for (; t > -1;)
    e[t] === null && e.splice(t, 1), t--; }
function pP(e) { return e.destroyRef; }
var OM = new M("");
function Oe(e, t) { return fo(e, t?.equal); }
function ke(e) { return gg(e); }
var $c = class extends Error {
    dependency;
    constructor(t) { super("Dependency error", { cause: t.error() }), this.name = "ResourceDependencyError", this.dependency = t; }
}, er = class e extends Error {
    _brand;
    constructor(t) { super(t); }
    static IDLE = new e("IDLE");
    static LOADING = new e("LOADING");
}, hP = e => e;
function Gc(e, t) { if (typeof e == "function") {
    let n = El(e, hP, t?.equal);
    return RM(n, t?.debugName);
}
else {
    let n = El(e.source, e.computation, e.equal);
    return RM(n, e.debugName);
} }
function RM(e, t) { let n = e[Y], r = e; return r.set = o => pg(n, o), r.update = o => hg(n, o), r.asReadonly = yr.bind(e), r; }
function gP(e) { let t = e.request, n = e.params ?? t ?? (() => null); return new qc(n, vP(e), e.defaultValue, e.equal ? mP(e.equal) : void 0, e.debugName, e.injector ?? E(ie), e.id); }
var bh = class {
    value;
    isLoading;
    constructor(t, n) { this.value = t, this.value.set = this.set.bind(this), this.value.update = this.update.bind(this), this.value.asReadonly = yr, this.isLoading = Oe(() => this.status() === "loading" || this.status() === "reloading", void 0); }
    isError = Oe(() => this.status() === "error");
    update(t) { this.set(t(ke(this.value))); }
    isValueDefined = Oe(() => this.isError() ? !1 : this.value() !== void 0);
    _snapshot;
    get snapshot() { return this._snapshot ??= Oe(() => { let t = this.status(); return t === "error" ? { status: "error", error: this.error() } : { status: t, value: this.value() }; }); }
    hasValue() { return this.isValueDefined(); }
    asReadonly() { return this; }
}, qc = class extends bh {
    loaderFn;
    equal;
    debugName;
    transferCacheKey;
    pendingTasks;
    state;
    extRequest;
    effectRef;
    pendingController;
    resolvePendingTask = void 0;
    destroyed = !1;
    unregisterOnDestroy;
    status;
    error;
    transferState;
    constructor(t, n, r, o, i, s, a, c) { if (Rh())
        throw xh(); super(Oe(() => { let u = this.state().stream?.(); if (!u || this.state().status === "loading" && this.error())
        return r; if (!Wc(u))
        throw new rs(this.error()); return u.value; }, { equal: o }), i), this.loaderFn = n, this.equal = o, this.debugName = i, this.transferCacheKey = a; let l = s.get(OM, void 0, { optional: !0 }) ?? { isActive: !1 }; this.transferState = s.get(xt, void 0, { optional: !0 }) ?? void 0, this.extRequest = Gc(() => { try {
        return tr(!0), { request: t(IP), reload: 0 };
    }
    catch (u) {
        return os(u), u === er.IDLE ? { status: "idle", reload: 0 } : u === er.LOADING ? { status: "loading", reload: 0 } : { error: u, reload: 0 };
    }
    finally {
        tr(!1);
    } }, void 0), this.state = Gc({ source: this.extRequest, computation: (u, d) => { let { request: f, status: p, error: h } = u, v; if (h)
            p = "resolved", v = yt({ error: zc(h) }, void 0);
        else if (!p)
            if (d)
                p = f === void 0 ? "idle" : "loading", d.value.extRequest.request === f && (v = d.value.stream);
            else {
                let y = this.transferState, T = this.transferCacheKey;
                l.isActive && T && y && f !== void 0 && y.hasKey(T) && (v = yt({ value: y.get(T, r) }, void 0)), v || (v = c?.(u.request)), c = void 0, p = f === void 0 ? "idle" : v ? "resolved" : "loading";
            } return { extRequest: u, status: p, previousStatus: d ? kM(d.value) : "idle", stream: v }; } }), this.effectRef = Us(this.loadEffect.bind(this), { injector: s, manualCleanup: !0 }), this.pendingTasks = s.get(qo), this.unregisterOnDestroy = s.get(xe).onDestroy(() => this.destroy()), this.status = Oe(() => kM(this.state()), void 0), this.error = Oe(() => { let u = this.state().stream?.(); return u && !Wc(u) ? u.error : void 0; }, void 0); }
    set(t) { if (this.destroyed)
        return; let n = ke(this.error), r = ke(this.state); if (!n) {
        let o = ke(this.value);
        if (r.status === "local" && (this.equal ? this.equal(o, t) : o === t))
            return;
    } this.state.set({ extRequest: r.extRequest, status: "local", previousStatus: "local", stream: yt({ value: t }, void 0) }), this.abortInProgressLoad(); }
    reload() { let { status: t } = ke(this.state); return t === "idle" || t === "loading" ? !1 : (this.extRequest.update(({ request: n, reload: r }) => ({ request: n, reload: r + 1 })), !0); }
    destroy() { this.destroyed = !0, this.unregisterOnDestroy(), this.effectRef.destroy(), this.abortInProgressLoad(), this.state.set({ extRequest: { request: void 0, reload: 0 }, status: "idle", previousStatus: "idle", stream: void 0 }); }
    loadEffect() { return Te(this, null, function* () { let t = this.extRequest(), { status: n, previousStatus: r } = ke(this.state); if (t.request === void 0)
        return; if (n !== "loading")
        return; this.abortInProgressLoad(); let o = this.resolvePendingTask = this.pendingTasks.add(), { signal: i } = this.pendingController = new AbortController; try {
        let s = ke(() => this.loaderFn({ params: t.request, abortSignal: i, previous: { status: r } })), a = () => i.aborted || ke(this.extRequest) !== t;
        if (Dr(s)) {
            if (a())
                return;
            this.state.set({ extRequest: t, status: "resolved", previousStatus: "resolved", stream: s });
            let c = ke(s);
            typeof ngServerMode < "u" && ngServerMode && xM(c, this.transferCacheKey, this.transferState);
        }
        else {
            let c = yield s;
            if (a())
                return;
            this.state.set({ extRequest: t, status: "resolved", previousStatus: "resolved", stream: c });
            let l = c ? ke(c) : void 0;
            typeof ngServerMode < "u" && ngServerMode && xM(l, this.transferCacheKey, this.transferState);
        }
    }
    catch (s) {
        if (os(s), i.aborted || ke(this.extRequest) !== t)
            return;
        this.state.set({ extRequest: t, status: "resolved", previousStatus: "error", stream: yt({ error: zc(s) }, void 0) });
    }
    finally {
        o?.(), o = void 0;
    } }); }
    abortInProgressLoad() { ke(() => this.pendingController?.abort()), this.pendingController = void 0, this.resolvePendingTask?.(), this.resolvePendingTask = void 0; }
};
function xM(e, t, n) { t && n && e && Wc(e) && n.set(t, e.value); }
function mP(e) { return (t, n) => t === void 0 || n === void 0 ? t === n : e(t, n); }
function vP(e) { return yP(e) ? e.stream : t => Te(null, null, function* () { try {
    return yt({ value: yield e.loader(t) }, void 0);
}
catch (n) {
    return yt({ error: zc(n) }, void 0);
} }); }
function yP(e) { return !!e.stream; }
function kM(e) { switch (e.status) {
    case "loading": return e.extRequest.reload === 0 ? "loading" : "reloading";
    case "resolved": return Wc(e.stream()) ? "resolved" : "error";
    default: return e.status;
} }
function Wc(e) { return e.error === void 0; }
function zc(e) { return EP(e) ? e : new Ah(e); }
function EP(e) { return e instanceof Error || typeof e == "object" && typeof e.name == "string" && typeof e.message == "string"; }
var rs = class extends Error {
    constructor(t) { super(t.message, { cause: t }); }
}, Ah = class extends Error {
    constructor(t) { super(String(t), { cause: t }); }
};
function LM(e) { switch (e.status()) {
    case "idle": throw er.IDLE;
    case "error": throw new $c(e);
    case "loading":
    case "reloading": throw er.LOADING;
} return e.value(); }
var IP = { chain: LM }, PM = !1;
function Rh() { return PM; }
function tr(e) { PM = e; }
function xh() { return new D(992, !1); }
function os(e) { if (e instanceof D && e.code === 992)
    throw e; }
import { Subscription as eF } from "rxjs";
var Fh = { JSACTION: "__jsaction", OWNER: "__owner" }, HM = {};
function DP(e) { return e[Fh.JSACTION]; }
function FM(e, t) { e[Fh.JSACTION] = t; }
function TP(e) { return HM[e]; }
function CP(e, t) { HM[e] = t; }
var w = { CLICK: "click", CLICKMOD: "clickmod", DBLCLICK: "dblclick", FOCUS: "focus", FOCUSIN: "focusin", BLUR: "blur", FOCUSOUT: "focusout", SUBMIT: "submit", KEYDOWN: "keydown", KEYPRESS: "keypress", KEYUP: "keyup", MOUSEOVER: "mouseover", MOUSEOUT: "mouseout", MOUSEENTER: "mouseenter", MOUSELEAVE: "mouseleave", POINTEROVER: "pointerover", POINTEROUT: "pointerout", POINTERENTER: "pointerenter", POINTERLEAVE: "pointerleave", ERROR: "error", LOAD: "load", TOUCHSTART: "touchstart", TOUCHEND: "touchend", TOUCHMOVE: "touchmove", TOGGLE: "toggle" }, MP = [w.MOUSEENTER, w.MOUSELEAVE, "pointerenter", "pointerleave"], wP = [w.CLICK, w.DBLCLICK, w.FOCUSIN, w.FOCUSOUT, w.KEYDOWN, w.KEYUP, w.KEYPRESS, w.MOUSEOVER, w.MOUSEOUT, w.SUBMIT, w.TOUCHSTART, w.TOUCHEND, w.TOUCHMOVE, "touchcancel", "auxclick", "change", "compositionstart", "compositionupdate", "compositionend", "beforeinput", "input", "select", "copy", "cut", "paste", "mousedown", "mouseup", "wheel", "contextmenu", "dragover", "dragenter", "dragleave", "drop", "dragstart", "dragend", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout", "gotpointercapture", "lostpointercapture", "ended", "loadedmetadata", "pagehide", "pageshow", "visibilitychange", "beforematch"], BM = [w.FOCUS, w.BLUR, w.ERROR, w.LOAD, w.TOGGLE], Xc = e => BM.indexOf(e) >= 0, NP = wP.concat(BM), UM = e => NP.indexOf(e) >= 0;
function SP(e) { return e === w.MOUSEENTER ? w.MOUSEOVER : e === w.MOUSELEAVE ? w.MOUSEOUT : e === w.POINTERENTER ? w.POINTEROVER : e === w.POINTERLEAVE ? w.POINTEROUT : e; }
function _P(e, t, n, r) { let o = !1; Xc(t) && (o = !0); let i = typeof r == "boolean" ? { capture: o, passive: r } : o; return e.addEventListener(t, n, i), { eventType: t, handler: n, capture: o, passive: r }; }
function bP(e, t) { if (e.removeEventListener) {
    let n = typeof t.passive == "boolean" ? { capture: t.capture } : t.capture;
    e.removeEventListener(t.eventType, t.handler, n);
}
else
    e.detachEvent && e.detachEvent(`on${t.eventType}`, t.handler); }
function AP(e) { e.preventDefault ? e.preventDefault() : e.returnValue = !1; }
var jM = typeof navigator < "u" && /Macintosh/.test(navigator.userAgent);
function RP(e) { return e.which === 2 || e.which == null && e.button === 4; }
function xP(e) { return jM && e.metaKey || !jM && e.ctrlKey || RP(e) || e.shiftKey; }
function kP(e, t, n) { let r = e.relatedTarget; return (e.type === w.MOUSEOVER && t === w.MOUSEENTER || e.type === w.MOUSEOUT && t === w.MOUSELEAVE || e.type === w.POINTEROVER && t === w.POINTERENTER || e.type === w.POINTEROUT && t === w.POINTERLEAVE) && (!r || r !== n && !n.contains(r)); }
function OP(e, t) { let n = {}; for (let r in e) {
    if (r === "srcElement" || r === "target")
        continue;
    let o = r, i = e[o];
    typeof i != "function" && (n[o] = i);
} return e.type === w.MOUSEOVER ? n.type = w.MOUSEENTER : e.type === w.MOUSEOUT ? n.type = w.MOUSELEAVE : e.type === w.POINTEROVER ? n.type = w.POINTERENTER : n.type = w.POINTERLEAVE, n.target = n.srcElement = t, n.bubbles = !1, n._originalEvent = e, n; }
var Kc = class {
    element;
    handlerInfos = [];
    constructor(t) { this.element = t; }
    addEventListener(t, n, r) { this.handlerInfos.push(_P(this.element, t, n(this.element), r)); }
    cleanUp() { for (let t = 0; t < this.handlerInfos.length; t++)
        bP(this.element, this.handlerInfos[t]); this.handlerInfos = []; }
}, LP = { EVENT_ACTION_SEPARATOR: ":" };
function gn(e) { return e.eventType; }
function jh(e, t) { e.eventType = t; }
function Zc(e) { return e.event; }
function $M(e, t) { e.event = t; }
function GM(e) { return e.targetElement; }
function qM(e, t) { e.targetElement = t; }
function WM(e) { return e.eic; }
function PP(e, t) { e.eic = t; }
function FP(e) { return e.timeStamp; }
function jP(e, t) { e.timeStamp = t; }
function Yc(e) { return e.eia; }
function zM(e, t, n) { e.eia = [t, n]; }
function kh(e) { e.eia = void 0; }
function Qc(e) { return e[1]; }
function VP(e) { return e.eirp; }
function QM(e, t) { e.eirp = t; }
function ZM(e) { return e.eir; }
function YM(e, t) { e.eir = t; }
function KM(e) { return { eventType: e.eventType, event: e.event, targetElement: e.targetElement, eic: e.eic, eia: e.eia, timeStamp: e.timeStamp, eirp: e.eirp, eiack: e.eiack, eir: e.eir }; }
function HP(e, t, n, r, o, i, s, a) { return { eventType: e, event: t, targetElement: n, eic: r, timeStamp: o, eia: i, eirp: s, eiack: a }; }
var Oh = class e {
    eventInfo;
    constructor(t) { this.eventInfo = t; }
    getEventType() { return gn(this.eventInfo); }
    setEventType(t) { jh(this.eventInfo, t); }
    getEvent() { return Zc(this.eventInfo); }
    setEvent(t) { $M(this.eventInfo, t); }
    getTargetElement() { return GM(this.eventInfo); }
    setTargetElement(t) { qM(this.eventInfo, t); }
    getContainer() { return WM(this.eventInfo); }
    setContainer(t) { PP(this.eventInfo, t); }
    getTimestamp() { return FP(this.eventInfo); }
    setTimestamp(t) { jP(this.eventInfo, t); }
    getAction() { let t = Yc(this.eventInfo); if (t)
        return { name: t[0], element: t[1] }; }
    setAction(t) { if (!t) {
        kh(this.eventInfo);
        return;
    } zM(this.eventInfo, t.name, t.element); }
    getIsReplay() { return VP(this.eventInfo); }
    setIsReplay(t) { QM(this.eventInfo, t); }
    getResolved() { return ZM(this.eventInfo); }
    setResolved(t) { YM(this.eventInfo, t); }
    clone() { return new e(KM(this.eventInfo)); }
}, BP = {}, UP = /\s*;\s*/, $P = w.CLICK, Lh = class {
    a11yClickSupport = !1;
    clickModSupport = !0;
    syntheticMouseEventSupport;
    updateEventInfoForA11yClick = void 0;
    preventDefaultForA11yClick = void 0;
    populateClickOnlyAction = void 0;
    constructor({ syntheticMouseEventSupport: t = !1, clickModSupport: n = !0 } = {}) { this.syntheticMouseEventSupport = t, this.clickModSupport = n; }
    resolveEventType(t) { this.clickModSupport && gn(t) === w.CLICK && xP(Zc(t)) ? jh(t, w.CLICKMOD) : this.a11yClickSupport && this.updateEventInfoForA11yClick(t); }
    resolveAction(t) { ZM(t) || (this.populateAction(t, GM(t)), YM(t, !0)); }
    resolveParentAction(t) { let n = Yc(t), r = n && Qc(n); kh(t); let o = r && this.getParentNode(r); o && this.populateAction(t, o); }
    populateAction(t, n) { let r = n; for (; r && r !== WM(t) && (r.nodeType === Node.ELEMENT_NODE && this.populateActionOnElement(r, t), !Yc(t));)
        r = this.getParentNode(r); let o = Yc(t); if (o && (this.a11yClickSupport && this.preventDefaultForA11yClick(t), this.syntheticMouseEventSupport && (gn(t) === w.MOUSEENTER || gn(t) === w.MOUSELEAVE || gn(t) === w.POINTERENTER || gn(t) === w.POINTERLEAVE)))
        if (kP(Zc(t), gn(t), Qc(o))) {
            let i = OP(Zc(t), Qc(o));
            $M(t, i), qM(t, Qc(o));
        }
        else
            kh(t); }
    getParentNode(t) { let n = t[Fh.OWNER]; if (n)
        return n; let r = t.parentNode; return r?.nodeName === "#document-fragment" ? r?.host ?? null : r; }
    populateActionOnElement(t, n) { let r = this.parseActions(t), o = r[gn(n)]; o !== void 0 && zM(n, o, t), this.a11yClickSupport && this.populateClickOnlyAction(t, n, r); }
    parseActions(t) { let n = DP(t); if (!n) {
        let r = t.getAttribute(Tr.JSACTION);
        if (!r)
            n = BP, FM(t, n);
        else {
            if (n = TP(r), !n) {
                n = {};
                let o = r.split(UP);
                for (let i = 0; i < o.length; i++) {
                    let s = o[i];
                    if (!s)
                        continue;
                    let a = s.indexOf(LP.EVENT_ACTION_SEPARATOR), c = a !== -1, l = c ? s.substr(0, a).trim() : $P, u = c ? s.substr(a + 1).trim() : s;
                    n[l] = u;
                }
                CP(r, n);
            }
            FM(t, n);
        }
    } return n; }
    addA11yClickSupport(t, n, r) { this.a11yClickSupport = !0, this.updateEventInfoForA11yClick = t, this.preventDefaultForA11yClick = n, this.populateClickOnlyAction = r; }
}, JM = (function (e) { return e[e.I_AM_THE_JSACTION_FRAMEWORK = 0] = "I_AM_THE_JSACTION_FRAMEWORK", e; })(JM || {}), Ph = class {
    dispatchDelegate;
    actionResolver;
    eventReplayer;
    eventReplayScheduled = !1;
    replayEventInfoWrappers = [];
    constructor(t, { actionResolver: n, eventReplayer: r } = {}) { this.dispatchDelegate = t, this.actionResolver = n, this.eventReplayer = r; }
    dispatch(t) { let n = new Oh(t); this.actionResolver?.resolveEventType(t), this.actionResolver?.resolveAction(t); let r = n.getAction(); if (r && GP(r.element, n) && AP(n.getEvent()), this.eventReplayer && n.getIsReplay()) {
        this.scheduleEventInfoWrapperReplay(n);
        return;
    } this.dispatchDelegate(n); }
    scheduleEventInfoWrapperReplay(t) { this.replayEventInfoWrappers.push(t), !this.eventReplayScheduled && (this.eventReplayScheduled = !0, Promise.resolve().then(() => { this.eventReplayScheduled = !1, this.eventReplayer(this.replayEventInfoWrappers); })); }
};
function GP(e, t) { return e.tagName === "A" && (t.getEventType() === w.CLICK || t.getEventType() === w.CLICKMOD); }
var XM = Symbol.for("propagationStopped"), Vh = { REPLAY: 101 };
var qP = "`preventDefault` called during event replay.";
var WP = "`composedPath` called during event replay.", Jc = class {
    dispatchDelegate;
    clickModSupport;
    actionResolver;
    dispatcher;
    constructor(t, n = !0) { this.dispatchDelegate = t, this.clickModSupport = n, this.actionResolver = new Lh({ clickModSupport: n }), this.dispatcher = new Ph(r => { this.dispatchToDelegate(r); }, { actionResolver: this.actionResolver }); }
    dispatch(t) { this.dispatcher.dispatch(t); }
    dispatchToDelegate(t) { for (t.getIsReplay() && ZP(t), zP(t); t.getAction();) {
        if (YP(t), Xc(t.getEventType()) && t.getAction().element !== t.getTargetElement() || (this.dispatchDelegate(t.getEvent(), t.getAction().name), QP(t)))
            return;
        this.actionResolver.resolveParentAction(t.eventInfo);
    } }
};
function zP(e) { let t = e.getEvent(), n = e.getEvent().stopPropagation.bind(t), r = () => { t[XM] = !0, n(); }; nr(t, "stopPropagation", r), nr(t, "stopImmediatePropagation", r); }
function QP(e) { return !!e.getEvent()[XM]; }
function ZP(e) { let t = e.getEvent(), n = e.getTargetElement(), r = t.preventDefault.bind(t); nr(t, "target", n), nr(t, "eventPhase", Vh.REPLAY), nr(t, "preventDefault", () => { throw r(), new Error(qP + ""); }), nr(t, "composedPath", () => { throw new Error(WP + ""); }); }
function YP(e) { let t = e.getEvent(), n = e.getAction()?.element; n && nr(t, "currentTarget", n, { configurable: !0 }); }
function nr(e, t, n, { configurable: r = !1 } = {}) { Object.defineProperty(e, t, { value: n, configurable: r }); }
function ew(e, t) { e.ecrd(n => { t.dispatch(n); }, JM.I_AM_THE_JSACTION_FRAMEWORK); }
function KP(e) { return e?.q ?? []; }
function JP(e) { e && (VM(e.c, e.et, e.h), VM(e.c, e.etc, e.h, !0)); }
function VM(e, t, n, r) { for (let o = 0; o < t.length; o++)
    e.removeEventListener(t[o], n, r); }
var XP = !1, tw = (() => { class e {
    static MOUSE_SPECIAL_SUPPORT = XP;
    containerManager;
    eventHandlers = {};
    browserEventTypeToExtraEventTypes = {};
    dispatcher = null;
    queuedEventInfos = [];
    constructor(n) { this.containerManager = n; }
    handleEvent(n, r, o) { let i = HP(n, r, r.target, o, Date.now()); this.handleEventInfo(i); }
    handleEventInfo(n) { if (!this.dispatcher) {
        QM(n, !0), this.queuedEventInfos?.push(n);
        return;
    } this.dispatcher(n); }
    addEvent(n, r, o) { if (n in this.eventHandlers || !this.containerManager || !e.MOUSE_SPECIAL_SUPPORT && MP.indexOf(n) >= 0)
        return; let i = (a, c, l) => { this.handleEvent(a, c, l); }; this.eventHandlers[n] = i; let s = SP(r || n); if (s !== n) {
        let a = this.browserEventTypeToExtraEventTypes[s] || [];
        a.push(n), this.browserEventTypeToExtraEventTypes[s] = a;
    } this.containerManager.addEventListener(s, a => c => { i(n, c, a); }, o); }
    replayEarlyEvents(n = window._ejsa) { n && (this.replayEarlyEventInfos(n.q), JP(n), delete window._ejsa); }
    replayEarlyEventInfos(n) { for (let r = 0; r < n.length; r++) {
        let o = n[r], i = this.getEventTypesForBrowserEventType(o.eventType);
        for (let s = 0; s < i.length; s++) {
            let a = KM(o);
            jh(a, i[s]), this.handleEventInfo(a);
        }
    } }
    getEventTypesForBrowserEventType(n) { let r = []; return this.eventHandlers[n] && r.push(n), this.browserEventTypeToExtraEventTypes[n] && r.push(...this.browserEventTypeToExtraEventTypes[n]), r; }
    handler(n) { return this.eventHandlers[n]; }
    cleanUp() { this.containerManager?.cleanUp(), this.containerManager = null, this.eventHandlers = {}, this.browserEventTypeToExtraEventTypes = {}, this.dispatcher = null, this.queuedEventInfos = []; }
    registerDispatcher(n, r) { this.ecrd(n, r); }
    ecrd(n, r) { if (this.dispatcher = n, this.queuedEventInfos?.length) {
        for (let o = 0; o < this.queuedEventInfos.length; o++)
            this.handleEventInfo(this.queuedEventInfos[o]);
        this.queuedEventInfos = null;
    } }
} return e; })();
function nw(e, t = window) { return KP(t._ejsas?.[e]); }
function Hh(e, t = window) { t._ejsas && (t._ejsas[e] = void 0); }
import "rxjs/operators";
typeof globalThis.ngServerMode > "u" && (globalThis.ngServerMode = typeof window > "u");
var sl = Symbol("InputSignalNode#UNSET"), Tw = X(O({}, po), { transformFn: void 0, applyValueToInputSignal(e, t) { Zt(e, t); } }), uj = Symbol();
function Cw(e, t) { let n = Object.create(Tw); n.value = e, n.transformFn = t?.transform; function r() { if (Ct(n), n.value === sl) {
    let o = null;
    throw new D(-950, o);
} return n.value; } return r[Y] = n, r; }
var tF = (function (e) { return e.Angular = "angular", e.ACX = "acx", e.Wiz = "wiz", e; })(tF || {}), rw = class {
    attributeName;
    constructor(t) { this.attributeName = t; }
    __NG_ELEMENT_ID__ = () => Ba(this.attributeName);
    toString() { return `HostAttributeToken ${this.attributeName}`; }
}, dj = (() => { let e = new M(""); return e.__NG_ELEMENT_ID__ = t => { let n = _(); if (n === null)
    throw new D(-204, !1); if (n.type & 2)
    return n.value; if (t & 8)
    return null; throw new D(-204, !1); }, e; })();
function nF(e) { return rF(e) ? e.default : e; }
function rF(e) { return e && typeof e == "object" && "default" in e; }
function fj(e, t) { let n = E(ie), r = null, o = () => (r || (r = e()), r); return t?.prefetch && t.prefetch().then(() => o()).catch(() => { }), () => o().then(i => n.get(nF(i))); }
function pj(e) { let t = E(Ua), { promise: n, resolve: r } = vr(); return t.requestOnIdle(() => r(), e), n; }
var rr = (function (e) { return e[e.Directive = 0] = "Directive", e[e.Component = 1] = "Component", e[e.Injectable = 2] = "Injectable", e[e.Pipe = 3] = "Pipe", e[e.NgModule = 4] = "NgModule", e[e.Service = 5] = "Service", e; })(rr || {});
function hj(e) { return new ns; }
function ow(e, t) { return Cw(e, t); }
function oF(e) { return Cw(sl, e); }
var gj = (ow.required = oF, ow);
function Mw(e, t) { let n = Object.create(Tw), r = new ns; n.value = e; function o() { return Ct(n), iw(n.value), n.value; } return o[Y] = n, o.asReadonly = yr.bind(o), o.set = i => { n.equal(n.value, i) || (Zt(n, i), r.emit(i)); }, o.update = i => { iw(n.value), o.set(i(n.value)); }, o.subscribe = r.subscribe.bind(r), o.destroyRef = r.destroyRef, o; }
function iw(e) { if (e === sl)
    throw new D(952, !1); }
function sw(e, t) { return Mw(e, t); }
function iF(e) { return Mw(sl, e); }
var mj = (sw.required = iF, sw);
function aw(e, t) { return Ep(t); }
function sF(e, t) { return Ip(t); }
var vj = (aw.required = sF, aw);
function yj(e, t) { return Dp(t); }
function cw(e, t) { return Ep(t); }
function aF(e, t) { return Ip(t); }
var Ej = (cw.required = aF, cw);
function Ij(e, t) { return Dp(t); }
function Dj(...e) { return e.reduce((t, n) => Object.assign(t, n, { providers: [...t.providers, ...n.providers] }), { providers: [] }); }
var ww = !0, ao = class {
}, Tj = jt("ContentChildren", (e, t = {}) => O({ selector: e, first: !1, isViewQuery: !1, descendants: !1, emitDistinctChangesOnly: ww }, t), ao), Cj = jt("ContentChild", (e, t = {}) => O({ selector: e, first: !0, isViewQuery: !1, descendants: !0 }, t), ao), Mj = jt("ViewChildren", (e, t = {}) => O({ selector: e, first: !1, isViewQuery: !0, descendants: !0, emitDistinctChangesOnly: ww }, t), ao), wj = jt("ViewChild", (e, t) => O({ selector: e, first: !0, isViewQuery: !0, descendants: !0 }, t), ao), Nj = (() => { class e {
    constructor(n) { }
    static \u0275fac = function (r) { return new (r || e)(ge(Be)); };
    static \u0275mod = Mp({ type: e });
    static \u0275inj = No({});
} return e; })(), Sj = new M("", { providedIn: "platform", factory: () => null }), _j = new M("", { providedIn: "platform", factory: () => null }), bj = new M("", { providedIn: "platform", factory: () => null }), el = new WeakSet, lw = "";
function uw(e) { return e.get(Za, Ef); }
function cF() { let e = [{ provide: Za, useFactory: () => { let t = !0; if (typeof ngServerMode > "u" || !ngServerMode) {
            let n = E(Et);
            t = !!window._ejsas?.[n];
        } return t && re("NgEventReplay"), t; } }]; return (typeof ngServerMode > "u" || !ngServerMode) && e.push({ provide: ze, useValue: () => { let t = E(Be), { injector: n } = t; if (!el.has(t)) {
        let r = E(Vi);
        if (uw(n)) {
            Iy();
            let o = n.get(Et), i = yy(o, (s, a, c) => { s.nodeType === Node.ELEMENT_NODE && (vy(s, a, c), Tf(s, r)); });
            t.onDestroy(i);
        }
    } }, multi: !0 }, { provide: Yi, useFactory: () => { let t = E(Be), { injector: n } = t; return () => { if (!uw(n) || el.has(t))
        return; el.add(t); let r = n.get(Et); t.onDestroy(() => { el.delete(t), typeof ngServerMode < "u" && !ngServerMode && Hh(r); }), t.whenStable().then(() => { if (t.destroyed)
        return; let o = n.get(Mf); lF(o, n); let i = n.get(Vi); i.get(lw)?.forEach(Cf), i.delete(lw); let s = o.instance; Hi(n) ? t.onDestroy(() => s.cleanUp()) : s.cleanUp(); }); }; }, multi: !0 }), e; }
var lF = (e, t) => { let n = t.get(Et), r = window._ejsas[n], o = e.instance = new tw(new Kc(r.c)); for (let a of r.et)
    o.addEvent(a); for (let a of r.etc)
    o.addEvent(a); let i = nw(n); o.replayEarlyEventInfos(i), Hh(n); let s = new Jc(a => { dF(t, a, a.currentTarget); }); ew(o, s); };
function uF(e, t, n) { let r = new Map, o = t[en], i = e.cleanup; if (!i || !o)
    return r; for (let s = 0; s < i.length;) {
    let a = i[s++], c = i[s++];
    if (typeof a != "string")
        continue;
    let l = a;
    if (!UM(l))
        continue;
    Xc(l) ? n.capture.add(l) : n.regular.add(l);
    let u = L(t[c]);
    s++;
    let d = i[s++];
    (typeof d == "boolean" || d >= 0) && (r.has(u) ? r.get(u).push(l) : r.set(u, [l]));
} return r; }
function dF(e, t, n) { let r = (n && n.getAttribute(Qr)) ?? ""; /d\d+/.test(r) ? fF(r, e, t, n) : t.eventPhase === Vh.REPLAY && wf(t, n); }
function fF(e, t, n, r) { let o = t.get(py); o.push({ event: n, currentTarget: r }), Gt(t, e, pF(o)); }
function pF(e) { return t => { let n = new Set(t), r = []; for (let { event: o, currentTarget: i } of e) {
    let s = i.getAttribute(Qr);
    n.has(s) ? wf(o, i) : r.push({ event: o, currentTarget: i });
} e.length = 0, e.push(...r); }; }
var dw = !1, fw = !1, hF = 1e4;
function gF() { dw || (dw = !0, wy(), pT(), rC(), hT(), fD(), PI(), dI(), _E()); }
function mF() { fw || (fw = !0, TT(), nI(), aI()); }
function vF(e) { return e.whenStable(); }
var Aj = "ngcm";
function Rj() { let e = [{ provide: Yn, useFactory: () => { let t = !0; return (typeof ngServerMode > "u" || !ngServerMode) && (t = !!E(xt, { optional: !0 })?.get(Ya, null)), t && re("NgHydration"), t; } }, { provide: ze, useValue: () => { if (cp(!1), typeof ngServerMode < "u" && ngServerMode)
            return; let t = E(At); E(Yn) && (ky(t), gF()); }, multi: !0 }]; return (typeof ngServerMode > "u" || !ngServerMode) && e.push({ provide: vf, useFactory: () => E(Yn) }, { provide: Yi, useFactory: () => { let t = E(qe); if (E(Yn)) {
        let n = E(Be);
        return () => { vF(n).then(() => { n.destroyed || (lp(n), t.notify(7)); }); };
    } return () => { }; }, multi: !0 }), Fe(e); }
function xj() { return [{ provide: yf, useFactory: () => E(Yn) }, { provide: ze, useValue: () => { E(Yn) && (mF(), cp(!0), re("NgI18nHydration")); }, multi: !0 }]; }
function kj() { let e = [cF(), { provide: If, useValue: !0 }, { provide: Ht, useFactory: FC }]; return (typeof ngServerMode > "u" || !ngServerMode) && e.push({ provide: Yi, useFactory: () => { let t = E(ie), n = E(At); return () => { jC(t, n); }; }, multi: !0 }), e; }
var pw = hF - 1e3, $h = class {
    openTasks = new Map;
    add(t) { this.openTasks.set(t, new Error("Task stack tracking error")); }
    remove(t) { this.openTasks.delete(t); }
};
function Oj() { let e = new $h, { openTasks: t } = e; return Fe([{ provide: Tu, useValue: e }, tD(() => { console.warn("Stability debugging utility was provided in production mode. This will cause debug code to be included in production bundles. If this is intentional because you are debugging stability issues in a production environment, you can ignore this warning."); let n = E(q), r = E(Be), o = null; typeof Zone < "u" && n.run(() => { o = Zone.current.get("TaskTrackingZone"); }), n.runOutsideAngular(() => { let i = setTimeout(() => { if (console.debug(`---- Application did not stabilize within ${pw / 1e3} seconds ----`), typeof Zone < "u" && !o && console.info('Zone.js is present but no TaskTrackingZone found. To enable better debugging of tasks in the Angular Zone, import "zone.js/plugins/task-tracking" in your application.'), o?.macroTasks?.length) {
        console.group("Macrotasks keeping Angular Zone unstable:");
        for (let s of o?.macroTasks ?? [])
            console.debug(s.creationLocation.stack);
        console.groupEnd();
    } console.group("PendingTasks keeping application unstable:"); for (let s of t.values())
        console.debug(s.stack); console.groupEnd(); }, pw); r.whenStable().then(() => { clearTimeout(i); }); }); })]); }
var tl = class {
    supports(t) { return Ii(t); }
    create(t) { return new Gh(t); }
}, yF = (e, t) => t, Gh = class {
    length = 0;
    collection;
    _linkedRecords = null;
    _unlinkedRecords = null;
    _previousItHead = null;
    _itHead = null;
    _itTail = null;
    _additionsHead = null;
    _additionsTail = null;
    _movesHead = null;
    _movesTail = null;
    _removalsHead = null;
    _removalsTail = null;
    _identityChangesHead = null;
    _identityChangesTail = null;
    _trackByFn;
    constructor(t) { this._trackByFn = t || yF; }
    forEachItem(t) { let n; for (n = this._itHead; n !== null; n = n._next)
        t(n); }
    forEachOperation(t) { let n = this._itHead, r = this._removalsHead, o = 0, i = null; for (; n || r;) {
        let s = !r || n && n.currentIndex < hw(r, o, i) ? n : r, a = hw(s, o, i), c = s.currentIndex;
        if (s === r)
            o--, r = r._nextRemoved;
        else if (n = n._next, s.previousIndex == null)
            o++;
        else {
            i || (i = []);
            let l = a - o, u = c - o;
            if (l != u) {
                for (let f = 0; f < l; f++) {
                    let p = f < i.length ? i[f] : i[f] = 0, h = p + f;
                    u <= h && h < l && (i[f] = p + 1);
                }
                let d = s.previousIndex;
                i[d] = u - l;
            }
        }
        a !== c && t(s, a, c);
    } }
    forEachPreviousItem(t) { let n; for (n = this._previousItHead; n !== null; n = n._nextPrevious)
        t(n); }
    forEachAddedItem(t) { let n; for (n = this._additionsHead; n !== null; n = n._nextAdded)
        t(n); }
    forEachMovedItem(t) { let n; for (n = this._movesHead; n !== null; n = n._nextMoved)
        t(n); }
    forEachRemovedItem(t) { let n; for (n = this._removalsHead; n !== null; n = n._nextRemoved)
        t(n); }
    forEachIdentityChange(t) { let n; for (n = this._identityChangesHead; n !== null; n = n._nextIdentityChange)
        t(n); }
    diff(t) { if (t == null && (t = []), !Ii(t))
        throw new D(900, !1); return this.check(t) ? this : null; }
    onDestroy() { }
    check(t) { this._reset(); let n = this._itHead, r = !1, o, i, s; if (Array.isArray(t)) {
        this.length = t.length;
        for (let a = 0; a < this.length; a++)
            i = t[a], s = this._trackByFn(a, i), n === null || !Object.is(n.trackById, s) ? (n = this._mismatch(n, i, s, a), r = !0) : (r && (n = this._verifyReinsertion(n, i, s, a)), Object.is(n.item, i) || this._addIdentityChange(n, i)), n = n._next;
    }
    else
        o = 0, mI(t, a => { s = this._trackByFn(o, a), n === null || !Object.is(n.trackById, s) ? (n = this._mismatch(n, a, s, o), r = !0) : (r && (n = this._verifyReinsertion(n, a, s, o)), Object.is(n.item, a) || this._addIdentityChange(n, a)), n = n._next, o++; }), this.length = o; return this._truncate(n), this.collection = t, this.isDirty; }
    get isDirty() { return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null || this._identityChangesHead !== null; }
    _reset() { if (this.isDirty) {
        let t;
        for (t = this._previousItHead = this._itHead; t !== null; t = t._next)
            t._nextPrevious = t._next;
        for (t = this._additionsHead; t !== null; t = t._nextAdded)
            t.previousIndex = t.currentIndex;
        for (this._additionsHead = this._additionsTail = null, t = this._movesHead; t !== null; t = t._nextMoved)
            t.previousIndex = t.currentIndex;
        this._movesHead = this._movesTail = null, this._removalsHead = this._removalsTail = null, this._identityChangesHead = this._identityChangesTail = null;
    } }
    _mismatch(t, n, r, o) { let i; return t === null ? i = this._itTail : (i = t._prev, this._remove(t)), t = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(r, null), t !== null ? (Object.is(t.item, n) || this._addIdentityChange(t, n), this._reinsertAfter(t, i, o)) : (t = this._linkedRecords === null ? null : this._linkedRecords.get(r, o), t !== null ? (Object.is(t.item, n) || this._addIdentityChange(t, n), this._moveAfter(t, i, o)) : t = this._addAfter(new qh(n, r), i, o)), t; }
    _verifyReinsertion(t, n, r, o) { let i = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(r, null); return i !== null ? t = this._reinsertAfter(i, t._prev, o) : t.currentIndex != o && (t.currentIndex = o, this._addToMoves(t, o)), t; }
    _truncate(t) { for (; t !== null;) {
        let n = t._next;
        this._addToRemovals(this._unlink(t)), t = n;
    } this._unlinkedRecords !== null && this._unlinkedRecords.clear(), this._additionsTail !== null && (this._additionsTail._nextAdded = null), this._movesTail !== null && (this._movesTail._nextMoved = null), this._itTail !== null && (this._itTail._next = null), this._removalsTail !== null && (this._removalsTail._nextRemoved = null), this._identityChangesTail !== null && (this._identityChangesTail._nextIdentityChange = null); }
    _reinsertAfter(t, n, r) { this._unlinkedRecords !== null && this._unlinkedRecords.remove(t); let o = t._prevRemoved, i = t._nextRemoved; return o === null ? this._removalsHead = i : o._nextRemoved = i, i === null ? this._removalsTail = o : i._prevRemoved = o, this._insertAfter(t, n, r), this._addToMoves(t, r), t; }
    _moveAfter(t, n, r) { return this._unlink(t), this._insertAfter(t, n, r), this._addToMoves(t, r), t; }
    _addAfter(t, n, r) { return this._insertAfter(t, n, r), this._additionsTail === null ? this._additionsTail = this._additionsHead = t : this._additionsTail = this._additionsTail._nextAdded = t, t; }
    _insertAfter(t, n, r) { let o = n === null ? this._itHead : n._next; return t._next = o, t._prev = n, o === null ? this._itTail = t : o._prev = t, n === null ? this._itHead = t : n._next = t, this._linkedRecords === null && (this._linkedRecords = new nl), this._linkedRecords.put(t), t.currentIndex = r, t; }
    _remove(t) { return this._addToRemovals(this._unlink(t)); }
    _unlink(t) { this._linkedRecords !== null && this._linkedRecords.remove(t); let n = t._prev, r = t._next; return n === null ? this._itHead = r : n._next = r, r === null ? this._itTail = n : r._prev = n, t; }
    _addToMoves(t, n) { return t.previousIndex === n || (this._movesTail === null ? this._movesTail = this._movesHead = t : this._movesTail = this._movesTail._nextMoved = t), t; }
    _addToRemovals(t) { return this._unlinkedRecords === null && (this._unlinkedRecords = new nl), this._unlinkedRecords.put(t), t.currentIndex = null, t._nextRemoved = null, this._removalsTail === null ? (this._removalsTail = this._removalsHead = t, t._prevRemoved = null) : (t._prevRemoved = this._removalsTail, this._removalsTail = this._removalsTail._nextRemoved = t), t; }
    _addIdentityChange(t, n) { return t.item = n, this._identityChangesTail === null ? this._identityChangesTail = this._identityChangesHead = t : this._identityChangesTail = this._identityChangesTail._nextIdentityChange = t, t; }
}, qh = class {
    item;
    trackById;
    currentIndex = null;
    previousIndex = null;
    _nextPrevious = null;
    _prev = null;
    _next = null;
    _prevDup = null;
    _nextDup = null;
    _prevRemoved = null;
    _nextRemoved = null;
    _nextAdded = null;
    _nextMoved = null;
    _nextIdentityChange = null;
    constructor(t, n) { this.item = t, this.trackById = n; }
}, Wh = class {
    _head = null;
    _tail = null;
    add(t) { this._head === null ? (this._head = this._tail = t, t._nextDup = null, t._prevDup = null) : (this._tail._nextDup = t, t._prevDup = this._tail, t._nextDup = null, this._tail = t); }
    get(t, n) { let r; for (r = this._head; r !== null; r = r._nextDup)
        if ((n === null || n <= r.currentIndex) && Object.is(r.trackById, t))
            return r; return null; }
    remove(t) { let n = t._prevDup, r = t._nextDup; return n === null ? this._head = r : n._nextDup = r, r === null ? this._tail = n : r._prevDup = n, this._head === null; }
}, nl = class {
    map = new Map;
    put(t) { let n = t.trackById, r = this.map.get(n); r || (r = new Wh, this.map.set(n, r)), r.add(t); }
    get(t, n) { let r = t, o = this.map.get(r); return o ? o.get(t, n) : null; }
    remove(t) { let n = t.trackById; return this.map.get(n).remove(t) && this.map.delete(n), t; }
    get isEmpty() { return this.map.size === 0; }
    clear() { this.map.clear(); }
};
function hw(e, t, n) { let r = e.previousIndex; if (r === null)
    return r; let o = 0; return n && r < n.length && (o = n[r]), r + t + o; }
var rl = class {
    supports(t) { return t instanceof Map || _c(t); }
    create() { return new zh; }
}, zh = class {
    _records = new Map;
    _mapHead = null;
    _appendAfter = null;
    _previousMapHead = null;
    _changesHead = null;
    _changesTail = null;
    _additionsHead = null;
    _additionsTail = null;
    _removalsHead = null;
    get isDirty() { return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null; }
    forEachItem(t) { let n; for (n = this._mapHead; n !== null; n = n._next)
        t(n); }
    forEachPreviousItem(t) { let n; for (n = this._previousMapHead; n !== null; n = n._nextPrevious)
        t(n); }
    forEachChangedItem(t) { let n; for (n = this._changesHead; n !== null; n = n._nextChanged)
        t(n); }
    forEachAddedItem(t) { let n; for (n = this._additionsHead; n !== null; n = n._nextAdded)
        t(n); }
    forEachRemovedItem(t) { let n; for (n = this._removalsHead; n !== null; n = n._nextRemoved)
        t(n); }
    diff(t) { if (!t)
        t = new Map;
    else if (!(t instanceof Map || _c(t)))
        throw new D(900, !1); return this.check(t) ? this : null; }
    check(t) { this._reset(); let n = this._mapHead; if (this._appendAfter = null, this._forEach(t, (r, o) => { if (n && n.key === o)
        this._maybeAddToChanges(n, r), this._appendAfter = n, n = n._next;
    else {
        let i = this._getOrCreateRecordForKey(o, r);
        n = this._insertBeforeOrAppend(n, i);
    } }), n) {
        n._prev && (n._prev._next = null), this._removalsHead = n;
        for (let r = n; r !== null; r = r._nextRemoved)
            r === this._mapHead && (this._mapHead = null), this._records.delete(r.key), r._nextRemoved = r._next, r.previousValue = r.currentValue, r.currentValue = null, r._prev = null, r._next = null;
    } return this._changesTail && (this._changesTail._nextChanged = null), this._additionsTail && (this._additionsTail._nextAdded = null), this.isDirty; }
    _insertBeforeOrAppend(t, n) { if (t) {
        let r = t._prev;
        return n._next = t, n._prev = r, t._prev = n, r && (r._next = n), t === this._mapHead && (this._mapHead = n), this._appendAfter = t, t;
    } return this._appendAfter ? (this._appendAfter._next = n, n._prev = this._appendAfter) : this._mapHead = n, this._appendAfter = n, null; }
    _getOrCreateRecordForKey(t, n) { if (this._records.has(t)) {
        let o = this._records.get(t);
        this._maybeAddToChanges(o, n);
        let i = o._prev, s = o._next;
        return i && (i._next = s), s && (s._prev = i), o._next = null, o._prev = null, o;
    } let r = new Qh(t); return this._records.set(t, r), r.currentValue = n, this._addToAdditions(r), r; }
    _reset() { if (this.isDirty) {
        let t;
        for (this._previousMapHead = this._mapHead, t = this._previousMapHead; t !== null; t = t._next)
            t._nextPrevious = t._next;
        for (t = this._changesHead; t !== null; t = t._nextChanged)
            t.previousValue = t.currentValue;
        for (t = this._additionsHead; t != null; t = t._nextAdded)
            t.previousValue = t.currentValue;
        this._changesHead = this._changesTail = null, this._additionsHead = this._additionsTail = null, this._removalsHead = null;
    } }
    _maybeAddToChanges(t, n) { Object.is(n, t.currentValue) || (t.previousValue = t.currentValue, t.currentValue = n, this._addToChanges(t)); }
    _addToAdditions(t) { this._additionsHead === null ? this._additionsHead = this._additionsTail = t : (this._additionsTail._nextAdded = t, this._additionsTail = t); }
    _addToChanges(t) { this._changesHead === null ? this._changesHead = this._changesTail = t : (this._changesTail._nextChanged = t, this._changesTail = t); }
    _forEach(t, n) { t instanceof Map ? t.forEach(n) : Object.keys(t).forEach(r => n(t[r], r)); }
}, Qh = class {
    key;
    previousValue = null;
    currentValue = null;
    _nextPrevious = null;
    _next = null;
    _prev = null;
    _nextAdded = null;
    _nextRemoved = null;
    _nextChanged = null;
    constructor(t) { this.key = t; }
};
function gw() { return new Nw([new tl]); }
var Nw = (() => { class e {
    factories;
    static \u0275prov = K({ token: e, providedIn: "root", factory: gw });
    constructor(n) { this.factories = n; }
    static create(n, r) { if (r != null) {
        let o = r.factories.slice();
        n = n.concat(o);
    } return new e(n); }
    static extend(n) { return { provide: e, useFactory: () => { let r = E(e, { optional: !0, skipSelf: !0 }); return e.create(n, r || gw()); } }; }
    find(n) { let r = this.factories.find(o => o.supports(n)); if (r != null)
        return r; throw new D(901, !1); }
} return e; })();
function mw() { return new Sw([new rl]); }
var Sw = (() => { class e {
    static \u0275prov = K({ token: e, providedIn: "root", factory: mw });
    factories;
    constructor(n) { this.factories = n; }
    static create(n, r) { if (r) {
        let o = r.factories.slice();
        n = n.concat(o);
    } return new e(n); }
    static extend(n) { return { provide: e, useFactory: () => { let r = E(e, { optional: !0, skipSelf: !0 }); return e.create(n, r || mw()); } }; }
    find(n) { let r = this.factories.find(o => o.supports(n)); if (r)
        return r; throw new D(901, !1); }
} return e; })(), EF = (() => { class e {
    static __NG_ELEMENT_ID__ = IF;
} return e; })();
function IF(e) { return DF(_(), g(), (e & 16) === 16); }
function DF(e, t, n) { if (we(e) && !n) {
    let r = ve(e.index, t);
    return new pn(r, r);
}
else if (e.type & 175) {
    let r = t[se];
    return new pn(r, t);
} return null; }
var TF = [new rl], CF = [new tl], Lj = new Nw(CF), Pj = new Sw(TF);
function Fj(e) { return Fe([]); }
var MF = (() => { class e {
    zone = E(q);
    changeDetectionScheduler = E(qe);
    applicationRef = E(Be);
    applicationErrorHandler = E(Rt);
    _onMicrotaskEmptySubscription;
    initialize() { this._onMicrotaskEmptySubscription || (this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({ next: () => { this.changeDetectionScheduler.runningTick || this.zone.run(() => { try {
            this.applicationRef.dirtyFlags |= 1, this.applicationRef._tick();
        }
        catch (n) {
            this.applicationErrorHandler(n);
        } }); } })); }
    ngOnDestroy() { this._onMicrotaskEmptySubscription?.unsubscribe(); }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = Vt({ token: e, factory: e.\u0275fac });
} return e; })(), wF = new M("", { factory: () => !1 });
function NF({ ngZoneFactory: e, scheduleInRootZone: t }) { return e ??= () => new q(X(O({}, _w()), { scheduleInRootZone: t })), [{ provide: Ir, useValue: !1 }, { provide: q, useFactory: e }, { provide: ze, multi: !0, useFactory: () => { let n = E(MF, { optional: !0 }); return () => n.initialize(); } }, { provide: ze, multi: !0, useFactory: () => { let n = E(SF); return () => { n.initialize(); }; } }, { provide: Hs, useValue: t ?? Du }]; }
function jj(e) { let t = e?.scheduleInRootZone, n = NF({ ngZoneFactory: () => { let r = _w(e); return r.scheduleInRootZone = t, r.shouldCoalesceEventChangeDetection && re("NgZone_CoalesceEvent"), new q(r); }, scheduleInRootZone: t }); return Fe([{ provide: wF, useValue: !0 }, n]); }
function _w(e) { return { enableLongStackTrace: !1, shouldCoalesceEventChangeDetection: e?.eventCoalescing ?? !1, shouldCoalesceRunChangeDetection: e?.runCoalescing ?? !1 }; }
var SF = (() => { class e {
    subscription = new eF;
    initialized = !1;
    zone = E(q);
    pendingTasks = E(vt);
    initialize() { if (this.initialized)
        return; this.initialized = !0; let n = null; !this.zone.isStable && !this.zone.hasPendingMacrotasks && !this.zone.hasPendingMicrotasks && (n = this.pendingTasks.add()), this.zone.runOutsideAngular(() => { this.subscription.add(this.zone.onStable.subscribe(() => { q.assertNotInAngularZone(), queueMicrotask(() => { n !== null && !this.zone.hasPendingMacrotasks && !this.zone.hasPendingMicrotasks && (this.pendingTasks.remove(n), n = null); }); })); }), this.subscription.add(this.zone.onUnstable.subscribe(() => { q.assertInAngularZone(), n ??= this.pendingTasks.add(); })); }
    ngOnDestroy() { this.subscription.unsubscribe(); }
    static \u0275fac = function (r) { return new (r || e); };
    static \u0275prov = Vt({ token: e, factory: e.\u0275fac });
} return e; })();
function _F(e, t, n) { let r = new Vr(n); return Promise.resolve(r); }
function vw(e) { for (let t = e.length - 1; t >= 0; t--)
    if (e[t] !== void 0)
        return e[t]; }
var ol = new M(""), bF = new M("");
function is(e) { return !e.moduleRef; }
function bw(e) { let t = is(e) ? e.r3Injector : e.moduleRef.injector, n = t.get(q); return n.run(() => { is(e) ? e.r3Injector.resolveInjectorInitializers() : e.moduleRef.resolveInjectorInitializers(); let r = t.get(Rt), o; if (n.runOutsideAngular(() => { o = n.onError.subscribe({ next: r }); }), is(e)) {
    let i = () => t.destroy(), s = e.platformInjector.get(ol);
    s.add(i), t.onDestroy(() => { o.unsubscribe(), s.delete(i); });
}
else {
    let i = () => e.moduleRef.destroy(), s = e.platformInjector.get(ol);
    s.add(i), e.moduleRef.onDestroy(() => { ti(e.allPlatformModules, e.moduleRef), o.unsubscribe(), s.delete(i); });
} return RF(r, n, () => { let i = t.get(vt), s = i.add(), a = t.get(Sp); return a.runInitializers(), a.donePromise.then(() => { let c = t.get(Sh, Xi); if (IT(c || Xi), !t.get(bF, !0))
    return is(e) ? t.get(Be) : (e.allPlatformModules.push(e.moduleRef), e.moduleRef); if (is(e)) {
    let u = t.get(Be);
    return e.rootComponent !== void 0 && u.bootstrap(e.rootComponent), u;
}
else
    return Aw?.(e.moduleRef, e.allPlatformModules), e.moduleRef; }).finally(() => { i.remove(s); }); }); }); }
var Aw;
function yw() { Aw = AF; }
function AF(e, t) { let n = e.injector.get(Be); if (e._bootstrapComponents.length > 0)
    e._bootstrapComponents.forEach(r => n.bootstrap(r));
else if (e.instance.ngDoBootstrap)
    e.instance.ngDoBootstrap(n);
else
    throw new D(-403, !1); t.push(e); }
function RF(e, t, n) { try {
    let r = n();
    return Tp(r) ? r.catch(o => { throw t.runOutsideAngular(() => e(o)), o; }) : r;
}
catch (r) {
    throw t.runOutsideAngular(() => e(r)), r;
} }
var Rw = (() => { class e {
    _injector;
    _modules = [];
    _destroyListeners = [];
    _destroyed = !1;
    constructor(n) { this._injector = n; }
    bootstrapModuleFactory(n, r) { let o = [Uc(), ...r?.applicationProviders ?? [], Nu], i = WI(n.moduleType, this.injector, o); return yw(), bw({ moduleRef: i, allPlatformModules: this._modules, platformInjector: this.injector }); }
    bootstrapModule(n, r = []) { let o = jp({}, r); return yw(), _F(this.injector, o, n).then(i => this.bootstrapModuleFactory(i, o)); }
    onDestroy(n) { this._destroyListeners.push(n); }
    get injector() { return this._injector; }
    destroy() { if (this._destroyed)
        throw new D(404, !1); this._modules.slice().forEach(r => r.destroy()), this._destroyListeners.forEach(r => r()); let n = this._injector.get(ol, null); n && (n.forEach(r => r()), n.clear()), this._destroyed = !0; }
    get destroyed() { return this._destroyed; }
    static \u0275fac = function (r) { return new (r || e)(ge(ie)); };
    static \u0275prov = K({ token: e, factory: e.\u0275fac, providedIn: "platform" });
} return e; })();
function xw(e) { let t = wD(e); if (t?.type === "null")
    return { name: "Null Injector", type: "null", providers: [], children: [] }; let n = []; if ((t?.type === "element" || t?.type === "environment") && (n = MD(e).map(r => ({ token: r.token, value: e.get(r.token, null, { optional: !0, self: !0 }) }))), t?.type === "element") {
    let r = Ai(e), o = r ? r.providerIndexes >> 20 : 0, i = n.slice(0, o), s = n.slice(o);
    return { name: e.constructor.name, type: "element", providers: s, viewProviders: i, children: [], hostElement: t.source };
} return { name: t?.source ?? e.constructor.name ?? "Unknown Injector", type: "environment", providers: n, children: [] }; }
var Vj = { name: "angular:di_graph", description: "\nExposes the Angular Dependency Injection (DI) graph of the application.\n\nThis tool extracts both the element injector tree (associated with DOM elements and components)\nand the environment injector tree (associated with modules and standalone application roots).\nIt captures the relationship structure and the providers resolved at each level.\n\nReturns:\n- `elementInjectorRoots`: An array of root element injectors (one for each Angular application\n  root found). Each node forms a tree hierarchy:\n  - `name`: The constructor name of this injector.\n  - `type`: 'element'.\n  - `providers`: Array of providers configured on this injector.\n    - `token`: The DI token.\n    - `value`: The resolved value of that provider if it was instantiated.\n  - `hostElement`: The DOM element that this injector is associated with.\n  - `children`: Array of child element injectors.\n- `environmentInjectorRoot`: The root environment injector. It forms a tree hierarchy of nodes\n  representing all environment injectors:\n  - `name`: The identifier for the environment injector.\n  - `type`: 'environment' or 'null'.\n  - `providers`: Array of providers configured on this injector.\n    - `token`: The DI token.\n    - `value`: The resolved value of that provider if it was instantiated.\n  - `children`: Array of child environment injectors.\n  ".trim(), inputSchema: { type: "object", properties: {} }, execute: () => Te(null, null, function* () { let e = Array.from(document.querySelectorAll("[ng-version]")); if (e.length === 0)
        throw new Error("Could not find Angular root element ([ng-version]) on the page."); return xF(e); }) };
function xF(e) { let t = e.map(n => { let r = Se(n); if (!r?.lView)
    throw new Error(`Could not find an \`LView\` for root \`<${n.tagName.toLowerCase()}>\`, is it an Angular component?`); return r.lView; }); return { elementInjectorRoots: t.map(n => kF(n)), environmentInjectorRoot: OF(t) }; }
function kF(e) { if (e[m].type !== 0)
    throw new Error(`Expected a root LView but got type: \`${e[m].type}\`.`); let t = []; for (let [r, o] of ff(e)) {
    let i = new Ne(r, o), s = xw(i);
    for (; t.length > 0;) {
        let [a, c, l] = t[t.length - 1], u = kw(r, a), d = LF(o, c, a);
        if (u || d) {
            l.children.push(s);
            break;
        }
        else
            t.pop();
    }
    t.push([r, o, s]);
} if (t.length === 0)
    throw new Error("Expected at least one component/directive in the root `LView`."); let [, , n] = t[0]; return n; }
function OF(e) { let t = new Map, n; function r(o) { let i = t.get(o); if (i)
    return i; let s = xw(o); t.set(o, s); let a = PF(o); if (a)
    r(a).children.push(s);
else if (!n)
    n = s;
else if (n !== s)
    throw new Error("Expected only one root environment injector, but found multiple.", { cause: { firstRoot: n, secondRoot: s } }); return s; } for (let o of e)
    for (let [, i] of ff(o))
        r(i[k]); if (!n)
    throw new Error("Expected a root environment injector but did not find one."); return n; }
function kw(e, t) { let n = e; for (; n;) {
    if (n === t)
        return !0;
    n = n.parent;
} return !1; }
function LF(e, t, n) { let r = e, o = null; for (; r && r !== t;)
    o = r[le], r = Ge(r); return r === t && o !== null && kw(o, n); }
function PF(e) { if (e instanceof un)
    return e.parentInjector; if (e instanceof nt)
    return e.parent; if (e instanceof St)
    return; throw new Error(`Unknown injector type: "${e.constructor.name}".`); }
var Hj = { name: "angular:signal_graph", description: "\nExposes the Angular signal dependency graph for a given DOM element.\n\nThis tool extracts the reactive dependency graph (signals, computeds, and effects) that\nare transitive dependencies of the effects of that element. It will include signals\nauthored in other components/services and depended upon by the target component, but\nwill *not* include signals only used in descendant components effects.\n\nParams:\n- `target`: The element to get the signal graph for. Must be the host element of an\n  Angular component.\n\nReturns:\n- `nodes`: An array of reactive nodes discovered in the context. Each node contains:\n  - `kind`: The type of reactive node ('signal', 'computed', 'effect', or 'template'\n    for component template effects).\n  - `value`: The current evaluated value of the node (if applicable).\n  - `label`: The symbol name of the associated signal if available (ex.\n    `const foo = signal(0);` has `label: 'foo'`).\n  - `epoch`: The internal version number of the node's value.\n- `edges`: An array of dependency links representing which nodes read from which other\n  nodes.\n  - `consumer`: The index in the `nodes` array of the node that depends on the value.\n  - `producer`: The index in the `nodes` array of the node that provides the value.\n\nExample: An edge with `{consumer: 2, producer: 0}` means that `nodes[2]` (e.g. an\n`effect`) reads the value of `nodes[0]` (e.g. a `signal`).\n  ".trim(), inputSchema: { type: "object", properties: { target: { type: "object", description: "The element to get the signal graph for.", "x-mcp-type": "HTMLElement" } }, required: ["target"] }, execute: t => Te(null, [t], function* ({ target: e }) { if (!(e instanceof HTMLElement))
        throw new Error('Invalid input: "target" must be an HTMLElement.'); let n = pf(e); if (n instanceof St)
        throw new Error('Invalid input: "target" is not the host element of an Angular component.'); let r = SD(n); return { nodes: r.nodes.map(a => { var c = a, { id: o, debuggableFn: i } = c, s = og(c, ["id", "debuggableFn"]); return s; }), edges: r.edges }; }) };
var so = null;
function FF(e) { if (al())
    throw new D(400, !1); Fp(), so = typeof ngServerMode > "u" || !ngServerMode ? e : null; let t = e.get(Rw); return Lw(e), t; }
function jF(e, t, n = []) { let r = `Platform: ${t}`, o = new M(r); return (i = []) => { let s = al(); if (!s) {
    let a = [...n, ...i, { provide: o, useValue: !0 }];
    s = e?.(a) ?? FF(Ow(a, r));
} return typeof ngServerMode < "u" && ngServerMode ? s : VF(o); }; }
function Ow(e = [], t) { return ie.create({ name: t, providers: [{ provide: Ul, useValue: "platform" }, { provide: ol, useValue: new Set([() => so = null]) }, ...e] }); }
function VF(e) { let t = al(); if (!t)
    throw new D(-401, !1); return t; }
function al() { return typeof ngServerMode < "u" && ngServerMode ? null : so?.get(Rw) ?? null; }
function Bj() { al()?.destroy(); }
function HF(e = []) { if (so)
    return so; let t = Ow(e); return (typeof ngServerMode > "u" || !ngServerMode) && (so = t), Fp(), Lw(t), t; }
function Uj(e) { return { provide: Su, useValue: e, multi: !0 }; }
function Lw(e) { let t = e.get(Su, null); Po(e, () => { t?.forEach(n => n()); }); }
function $j(e) { let { rootComponent: t, appProviders: n, platformProviders: r, platformRef: o } = e; if (B(P.BootstrapApplicationStart), typeof ngServerMode < "u" && ngServerMode && !o)
    throw new D(-401, !1); try {
    let i = o?.injector ?? HF(r), s = [Uc(), Nu, ...n || []], a = new Di({ providers: s, parent: i, debugName: "", runEnvironmentInitializers: !1 });
    return bw({ r3Injector: a.injector, platformInjector: i, rootComponent: t });
}
catch (i) {
    return Promise.reject(i);
}
finally {
    B(P.BootstrapApplicationEnd);
} }
var Zh = class {
    views = [];
    indexByContent = new Map;
    add(t) { let n = JSON.stringify(t); if (!this.indexByContent.has(n)) {
        let r = this.views.length;
        return this.views.push(t), this.indexByContent.set(n, r), r;
    } return this.indexByContent.get(n); }
    getAll() { return this.views; }
}, BF = 0;
function Pw(e) { return e.ssrId || (e.ssrId = `t${BF++}`), e.ssrId; }
function Fw(e, t, n) { let r = []; return Pr(e, t, n, r), r.length; }
function UF(e) { let t = []; return Ic(e, t), t.length; }
function jw(e, t) { let n = e[U]; return n && !n.hasAttribute(Zn) ? il(n, e, null, t) : null; }
function Vw(e, t) { let n = Vo(e[U]), r = jw(n, t); if (r === null)
    return; let o = L(n[U]), i = e[z], s = il(o, i, null, t), a = n[S], c = `${r}|${s}`; a.setAttribute(o, Ar, c); }
function Gj(e, t) { let n = e.injector, r = rI(n), o = Hi(n), i = new Zh, s = new Map, a = e._views, c = n.get(Za, Ef), l = { regular: new Set, capture: new Set }, u = new Map; e.injector.get(Et); for (let p of a) {
    let h = Nf(p);
    if (h !== null) {
        let v = { serializedViewCollection: i, corruptedTextNodes: s, isI18nHydrationEnabled: r, isIncrementalHydrationEnabled: o, i18nChildren: new Map, eventTypesToReplay: l, shouldReplayEvents: c, deferBlocks: u };
        J(h) ? Vw(h, v) : jw(h, v), zF(s, t);
    }
} let d = i.getAll(), f = n.get(xt); if (f.set(Ya, d), u.size > 0) {
    let p = {};
    for (let [h, v] of u.entries())
        p[h] = v;
    f.set(Ka, p);
} return l; }
function $F(e, t, n, r, o) { let i = [], s = ""; for (let a = G; a < e.length; a++) {
    let c = e[a], l, u, d;
    if (st(c) && (c = c[I], J(c))) {
        u = UF(c) + 1, Vw(c, o);
        let p = Vo(c[U]);
        d = { [Wa]: p[m].ssrId, [Pt]: u };
    }
    if (!d) {
        let p = c[m];
        p.type === 1 ? (l = p.ssrId, u = 1) : (l = Pw(p), u = Fw(p, c, p.firstChild)), d = { [Wa]: l, [Pt]: u };
        let h = !1;
        if (vD(n[m], t)) {
            let v = _e(n, t), y = he(n[m], t);
            if (o.isIncrementalHydrationEnabled && y.hydrateTriggers !== null) {
                let T = `d${o.deferBlocks.size}`;
                y.hydrateTriggers.has(7) && (h = !0);
                let x = [];
                Ic(e, x);
                let ce = { [Pt]: x.length, [Fi]: v[$t] }, et = GF(y.hydrateTriggers);
                et.length > 0 && (ce[ji] = et), r !== null && (ce[mf] = r), o.deferBlocks.set(T, ce);
                let Ue = L(e);
                Ue !== void 0 ? Ue.nodeType === Node.COMMENT_NODE && Ew(Ue, T) : Ew(Ue, T), h || ZF(y, x, T, o), r = T, d[Qa] = T;
            }
            d[Fi] = v[$t];
        }
        if (!h) {
            let v = L(c[U]);
            (c[m].type !== 1 || v === null || !v.hasAttribute(Zn)) && Object.assign(d, Hw(e[a], r, o));
        }
    }
    let f = JSON.stringify(d);
    if (i.length > 0 && f === s) {
        let p = i[i.length - 1];
        p[Li] ??= 1, p[Li]++;
    }
    else
        s = f, i.push(d);
} return i; }
function GF(e) { let t = new Set([0, 1, 2, 5]), n = []; for (let [r, o] of e)
    t.has(r) && (o === null ? n.push(r) : o.type === 5 ? n.push({ trigger: r, delay: o.delay }) : n.push({ trigger: r, intersectionObserverOptions: o.intersectionObserverOptions })); return n; }
function ss(e, t, n, r) { let o = t.index - I; e[Pi] ??= {}, e[Pi][o] ??= XE(t, n, r); }
function Bh(e, t) { let n = typeof t == "number" ? t : t.index - I; e[zr] ??= [], e[zr].includes(n) || e[zr].push(n); }
function Hw(e, t = null, n) { let r = {}, o = e[m], i = oI(o, n), s = n.shouldReplayEvents ? uF(o, e, n.eventTypesToReplay) : null; for (let a = I; a < o.bindingStartIndex; a++) {
    let c = o.data[a], l = a - I, u = iI(e, a, n);
    if (u) {
        r[za] ??= {}, r[za][l] = u.caseQueue;
        for (let d of u.disconnectedNodes)
            Bh(r, d);
        for (let d of u.disjointNodes) {
            let f = o.data[d + I];
            ss(r, f, e, i);
        }
        continue;
    }
    if (Ha(c) && !Zr(c)) {
        if (J(e[a]) && c.tView && (r[qa] ??= {}, r[qa][l] = Pw(c.tView)), to(c, e) && QF(c)) {
            Bh(r, c);
            continue;
        }
        if (Array.isArray(c.projection)) {
            for (let d of c.projection)
                if (d)
                    if (!Array.isArray(d))
                        !zl(d) && !qr(d) && (to(d, e) ? Bh(r, d) : ss(r, d, e, i));
                    else
                        throw GE(L(e[a]));
        }
        if (qF(r, c, e, i), J(e[a])) {
            let d = e[a][U];
            if (Array.isArray(d)) {
                let f = L(d);
                f.hasAttribute(Zn) || il(f, d, t, n);
            }
            r[Wr] ??= {}, r[Wr][l] = $F(e[a], c, e, t, n);
        }
        else if (Array.isArray(e[a]) && !xv(c)) {
            let d = L(e[a][U]);
            d.hasAttribute(Zn) || il(d, e[a], t, n);
        }
        else if (c.type & 8)
            r[Oi] ??= {}, r[Oi][l] = Fw(o, e, c.child);
        else if (c.type & 144) {
            let d = c.next;
            for (; d !== null && d.type & 144;)
                d = d.next;
            d && !qr(d) && ss(r, d, e, i);
        }
        else if (c.type & 1) {
            let d = L(e[a]);
            _f(n, d);
        }
        if (s && c.type & 2) {
            let d = L(e[a]);
            s.has(d) && Df(d, s.get(d), t);
        }
    }
} return r; }
function qF(e, t, n, r) { zl(t) || (t.projectionNext && t.projectionNext !== t.next && !qr(t.projectionNext) && ss(e, t.projectionNext, n, r), t.prev === null && t.parent !== null && to(t.parent, n) && !to(t, n) && ss(e, t, n, r)); }
function WF(e) { let t = e[V]; if (!t?.constructor)
    return !1; let n = W(t.constructor); return n?.encapsulation === Je.ShadowDom || n?.encapsulation === Je.ExperimentalIsolatedShadowDom; }
function il(e, t, n, r) { let o = t[S]; if (Ag(t) && !wc() || WF(t))
    return o.setAttribute(e, Zn, ""), null; {
    let i = Hw(t, n, r), s = r.serializedViewCollection.add(i);
    return o.setAttribute(e, Ar, s.toString()), s;
} }
function Ew(e, t) { e.textContent = `ngh=${t}`; }
function zF(e, t) { for (let [n, r] of e)
    n.after(t.createComment(r)); }
function QF(e) { let t = e; for (; t != null;) {
    if (we(t))
        return !0;
    t = t.parent;
} return !1; }
function ZF(e, t, n, r) { let o = Ry(e.hydrateTriggers); for (let i of o)
    r.eventTypesToReplay.regular.add(i); if (o.length > 0) {
    let i = t.filter(s => s.nodeType === Node.ELEMENT_NODE);
    for (let s of i)
        Df(s, o, n);
} }
function qj(e) { let t = g(); for (; t;) {
    if (t[m].type === 1 && e(t[V]))
        return t[V];
    if (st(t))
        break;
    t = Ge(t);
} return null; }
var YF = "\u{1F170}\uFE0F", cl = !1;
function Wj(e) { if (!cl)
    return; let { startLabel: t } = Bw(e); performance.mark(t); }
function zj(e) { if (!cl)
    return; let { startLabel: t, labelName: n, endLabel: r } = Bw(e); performance.mark(r), performance.measure(n, t, r), performance.clearMarks(t), performance.clearMarks(r); }
function Bw(e) { let t = `${YF}:${e}`; return { labelName: t, startLabel: `start:${t}`, endLabel: `end:${t}` }; }
var Iw = !1;
function Qj() { if (!Iw && (typeof performance > "u" || !performance.mark || !performance.measure)) {
    Iw = !0, console.warn("Performance API is not supported on this platform");
    return;
} cl = !0; }
function Zj() { cl = !1; }
function Yj(e) { }
function Kj(e) { return typeof e == "boolean" ? e : e != null && e !== "false"; }
function Jj(e, t = NaN) { return !isNaN(parseFloat(e)) && !isNaN(Number(e)) ? Number(e) : t; }
var Uh = Symbol("NOT_SET"), Uw = new Set, KF = X(O({}, po), { kind: "afterRenderEffectPhase", consumerIsAlwaysLive: !0, consumerAllowSignalWrites: !0, value: Uh, cleanup: null, consumerMarkedDirty() { if (this.sequence.impl.executing) {
        if (this.sequence.lastPhase === null || this.sequence.lastPhase < this.phase)
            return;
        this.sequence.erroredOrDestroyed = !0;
    } this.sequence.scheduler.notify(7); }, phaseFn(e) { if (this.sequence.lastPhase = this.phase, !this.dirty)
        return this.signal; if (this.dirty = !1, this.value !== Uh && !ir(this))
        return this.signal; try {
        for (let o of this.cleanup ?? Uw)
            o();
    }
    finally {
        this.cleanup?.clear();
    } let t = []; e !== void 0 && t.push(e), t.push(this.registerCleanupFn); let n = Mt(this), r; try {
        r = this.userFn.apply(null, t);
    }
    finally {
        zt(this, n);
    } return (this.value === Uh || !this.equal(this.value, r)) && (this.value = r, this.version++), this.signal; } }), Yh = class extends hi {
    scheduler;
    lastPhase = null;
    nodes = [void 0, void 0, void 0, void 0];
    onDestroyFns = null;
    constructor(t, n, r, o, i, s = null) { super(t, [void 0, void 0, void 0, void 0], r, !1, i.get(xe), s), this.scheduler = o; for (let a of Gf) {
        let c = n[a];
        if (c === void 0)
            continue;
        let l = Object.create(KF);
        l.sequence = this, l.phase = a, l.userFn = c, l.dirty = !0, l.signal = () => (Ct(l), l.value), l.signal[Y] = l, l.registerCleanupFn = u => (l.cleanup ??= new Set).add(u), this.nodes[a] = l, this.hooks[a] = u => l.phaseFn(u);
    } }
    afterRun() { super.afterRun(), this.lastPhase = null; }
    destroy() { if (this.onDestroyFns !== null)
        for (let t of this.onDestroyFns)
            t(); super.destroy(); for (let t of this.nodes)
        if (t)
            try {
                for (let n of t.cleanup ?? Uw)
                    n();
            }
            finally {
                Qt(t);
            } }
};
function Xj(e, t) { if (typeof ngServerMode < "u" && ngServerMode)
    return cc; let n = t?.injector ?? E(ie), r = n.get(qe), o = n.get(ac), i = n.get(Jn, null, { optional: !0 }); o.impl ??= n.get(qf); let s = e; typeof s == "function" && (s = { mixedReadWrite: e }); let a = n.get(Er, null, { optional: !0 }), c = new Yh(o.impl, [s.earlyRead, s.write, s.mixedReadWrite, s.read], a?.view, r, n, i?.snapshot(null)); return o.impl.register(c), c; }
function eV(e) { return ne({ usage: 1, kind: "directive", type: e.type }).compileDirectiveDeclaration(Ie, `ng:///${e.type.name}/\u0275fac.js`, e); }
function tV(e) { wp(e.type, e.decorators, e.ctorParameters ?? null, e.propDecorators ?? null); }
function nV(e) { eD(e.type, e.resolveDeferredDeps, (...t) => { let n = e.resolveMetadata(...t); wp(e.type, n.decorators, n.ctorParameters, n.propDecorators); }); }
function rV(e) { return ne({ usage: 1, kind: "component", type: e.type }).compileComponentDeclaration(Ie, `ng:///${e.type.name}/\u0275cmp.js`, e); }
function oV(e) { return ne({ usage: 1, kind: JF(e.target), type: e.type }).compileFactoryDeclaration(Ie, `ng:///${e.type.name}/\u0275fac.js`, e); }
function JF(e) { switch (e) {
    case rr.Directive: return "directive";
    case rr.Component: return "component";
    case rr.Injectable: return "injectable";
    case rr.Pipe: return "pipe";
    case rr.NgModule: return "NgModule";
    case rr.Service: return "service";
} }
function iV(e) { return ne({ usage: 1, kind: "injectable", type: e.type }).compileInjectableDeclaration(Ie, `ng:///${e.type.name}/\u0275prov.js`, e); }
function sV(e) { return ne({ usage: 1, kind: "NgModule", type: e.type }).compileInjectorDeclaration(Ie, `ng:///${e.type.name}/\u0275inj.js`, e); }
function aV(e) { return ne({ usage: 1, kind: "NgModule", type: e.type }).compileNgModuleDeclaration(Ie, `ng:///${e.type.name}/\u0275mod.js`, e); }
function cV(e) { return ne({ usage: 1, kind: "pipe", type: e.type }).compilePipeDeclaration(Ie, `ng:///${e.type.name}/\u0275pipe.js`, e); }
function lV(e) { return ne({ usage: 1, kind: "service", type: e.type }).compileServiceDeclaration(Ie, `ng:///${e.type.name}/\u0275prov.js`, e); }
function uV(e) { let t = bp(e); if (!t)
    throw $w(e); return new Vr(t); }
function dV(e) { let t = bp(e); if (!t)
    throw $w(e); return t; }
function $w(e) { return new D(920, !1); }
var Kh = class extends EF {
}, Dw = class extends Kh {
}, fV = jF(null, "core", []);
function pV(e, t) { let n = W(e), r = t.elementInjector || fr(); return new $n(n).create(r, t.projectableNodes, t.hostElement, t.environmentInjector, t.directives, t.bindings); }
function hV(e) { let t = W(e); if (!t)
    return null; let n = new $n(t); return { get selector() { return n.selector; }, get type() { return n.componentType; }, get inputs() { return n.inputs; }, get outputs() { return n.outputs; }, get ngContentSelectors() { return n.ngContentSelectors; }, get isStandalone() { return t.standalone; }, get isSignal() { return t.signals; } }; }
function XF(e) { return new Jh(Dr(e) ? e : Oe(e)); }
var Jh = class {
    snapshot;
    constructor(t) { this.snapshot = t; }
    get state() { return this.snapshot(); }
    value = Oe(() => { if (this.state.status === "error")
        throw new rs(this.state.error); return this.state.value; });
    status = Oe(() => this.state.status);
    error = Oe(() => this.state.status === "error" ? this.state.error : void 0);
    isLoading = Oe(() => this.state.status === "loading" || this.state.status === "reloading");
    isValueDefined = Oe(() => this.state.status !== "error" && this.state.value !== void 0);
    hasValue() { return this.isValueDefined(); }
};
function gV(e, t, n) { if (Rh())
    throw xh(); let r = n?.injector ?? E(ie), o, i; r.get(xe).onDestroy(() => { o = void 0; }); let s = Gc({ source: () => { try {
        return tr(!0), { value: e(), thrown: !1 };
    }
    catch (a) {
        return os(a), { error: a, thrown: !0 };
    }
    finally {
        tr(!1);
    } }, computation: (a, c) => c !== void 0 ? c.value : a.thrown ? { status: "error", error: a.error } : { status: "resolved", value: a.value } }); return Us(() => { let a; try {
    tr(!0), a = e();
}
catch (f) {
    os(f), s.set({ status: "error", error: f }), o = i = void 0;
    return;
}
finally {
    tr(!1);
} let c = ke(s), l = n?.equal ?? Object.is; if (c.status === "reloading" || c.status === "loading") {
    if (l(a, i))
        return;
}
else if (c.status === "resolved" && l(a, c.value))
    return; let d = (typeof t == "number" ? () => new Promise(f => setTimeout(f, t)) : t)(a, c); d === void 0 ? (s.set({ status: "resolved", value: a }), o = i = void 0) : (c.status !== "loading" && c.status !== "error" && s.set({ status: "loading", value: c.value }), o = d, i = a, d.then(() => { o === d && (s.set({ status: "resolved", value: a }), o = i = void 0); })); }, { injector: r }), XF(s); }
function mV() { return !1; }
function vV() { }
function e1(e, t) { return Te(this, null, function* () { if (typeof ngServerMode < "u" && ngServerMode)
    return; let n = globalThis.document.modelContext ?? globalThis.navigator.modelContext; if (!n || typeof n.registerTool != "function")
    return; let r = t ?? E(ie), o = r.get(xe), i = new AbortController, s = X(O({}, e), { execute: (a, c) => Po(r, () => e.execute(a, X(O({}, c), { signal: i.signal }))) }); o.onDestroy(() => { i.abort(); }), yield n.registerTool(s, { signal: i.signal }); }); }
function yV(e) { return Fe([Hl(() => { for (let t of e)
        e1(t); })]); }
export { YN as ANIMATION_MODULE_TYPE, Yi as APP_BOOTSTRAP_LISTENER, Et as APP_ID, Np as APP_INITIALIZER, Sp as ApplicationInitStatus, Nj as ApplicationModule, Be as ApplicationRef, Yv as Attribute, bM as COMPILER_OPTIONS, KN as CSP_NONCE, q_ as CUSTOM_ELEMENTS_SCHEMA, $a as ChangeDetectionStrategy, EF as ChangeDetectorRef, rP as Compiler, of as CompilerFactory, ZL as Component, hI as ComponentRef, Cj as ContentChild, Tj as ContentChildren, iP as DEFAULT_CURRENCY_CODE, At as DOCUMENT, Qn as DebugElement, sf as DebugEventListener, _i as DebugNode, Gh as DefaultIterableDiffer, xe as DestroyRef, SM as Directive, ze as ENVIRONMENT_INITIALIZER, xi as ElementRef, Dw as EmbeddedViewRef, Ae as EnvironmentInjector, _t as ErrorHandler, wt as EventEmitter, dj as HOST_TAG_NAME, Zv as Host, rw as HostAttributeToken, XL as HostBinding, eP as HostListener, Lo as INJECTOR, qv as Inject, BS as Injectable, M as InjectionToken, ie as Injector, KL as Input, Nw as IterableDiffers, Sw as KeyValueDiffers, Sh as LOCALE_ID, iE as MAX_ANIMATION_TIMEOUT, AM as MissingTranslationStrategy, W_ as NO_ERRORS_SCHEMA, tP as NgModule, qI as NgModuleFactory, Gn as NgModuleRef, q as NgZone, Wv as Optional, JL as Output, ns as OutputEmitterRef, ZN as PLATFORM_ID, Su as PLATFORM_INITIALIZER, qo as PendingTasks, YL as Pipe, Rw as PlatformRef, ao as Query, ya as QueryList, Sj as REQUEST, bj as REQUEST_CONTEXT, _j as RESPONSE_INIT, BR as Renderer2, Ei as RendererFactory2, Ca as RendererStyleFlags2, $c as ResourceDependencyError, er as ResourceParamsStatus, gI as Sanitizer, te as SecurityContext, zv as Self, GS as Service, da as SimpleChange, Qv as SkipSelf, sP as TRANSLATIONS, aP as TRANSLATIONS_FORMAT, mi as TemplateRef, Fk as Testability, RD as TestabilityRegistry, xt as TransferState, Gv as Type, hs as VERSION, ps as Version, wj as ViewChild, Mj as ViewChildren, Ac as ViewContainerRef, Je as ViewEncapsulation, Kh as ViewRef, dE as afterEveryRender, Wf as afterNextRender, Xj as afterRenderEffect, cP as asNativeElements, kN as assertInInjectionContext, XN as assertNotInReactiveContext, VF as assertPlatform, Kj as booleanAttribute, Oe as computed, Ej as contentChild, Ij as contentChildren, pV as createComponent, Cp as createEnvironmentInjector, kx as createNgModule, FF as createPlatform, jF as createPlatformFactory, gV as debounced, e1 as declareExperimentalWebMcpTool, Bj as destroyPlatform, Us as effect, vV as enableProdMode, kk as enableProfiling, Mo as forwardRef, bi as getDebugNode, uV as getModuleFactory, dV as getNgModuleById, al as getPlatform, Ng as importProvidersFrom, E as inject, fj as injectAsync, gj as input, CI as inputBinding, mV as isDevMode, Dr as isSignal, Ao as isStandalone, $s as isWritableSignal, Gc as linkedSignal, Fe as makeEnvironmentProviders, Jg as makeStateKey, Dj as mergeApplicationConfig, mj as model, Jj as numberAttribute, pj as onIdle, hj as output, MI as outputBinding, fV as platformCore, tD as provideAppInitializer, WN as provideBrowserGlobalErrorListeners, Fj as provideCheckNoChangesConfig, Hl as provideEnvironmentInitializer, yV as provideExperimentalWebMcpTools, bS as provideIdleServiceWith, Ab as provideNgReflectAttributes, Uj as providePlatformInitializer, Oj as provideStabilityDebugging, jj as provideZoneChangeDetection, nP as provideZonelessChangeDetection, hV as reflectComponentType, F as resolveForwardRef, gP as resource, XF as resourceFromSnapshots, Po as runInInjectionContext, xD as setTestabilityGetter, yt as signal, tx as twoWayBinding, ke as untracked, vj as viewChild, yj as viewChildren, oE as \u0275ANIMATIONS_DISABLED, cy as \u0275AcxChangeDetectionStrategy, ly as \u0275AcxViewEncapsulation, ac as \u0275AfterRenderManager, OM as \u0275CACHE_ACTIVE, Aj as \u0275CLIENT_RENDER_MODE_FLAG, G as \u0275CONTAINER_HEADER_OFFSET, qe as \u0275ChangeDetectionScheduler, Ek as \u0275Console, CD as \u0275ControlFlowBlockType, Xi as \u0275DEFAULT_LOCALE_ID, ID as \u0275DEFER_BLOCK_CONFIG, pk as \u0275DEFER_BLOCK_DEPENDENCY_INTERCEPTOR, Ht as \u0275DEHYDRATED_BLOCK_REGISTRY, kp as \u0275DeferBlockBehavior, Q as \u0275DeferBlockState, bF as \u0275ENABLE_ROOT_COMPONENT_BOOTSTRAP, py as \u0275EVENT_REPLAY_QUEUE, Bs as \u0275EffectScheduler, tF as \u0275Framework, Sy as \u0275HydrationStatus, JN as \u0275IMAGE_CONFIG, Kg as \u0275IMAGE_CONFIG_DEFAULTS, Ul as \u0275INJECTOR_SCOPE, uj as \u0275INPUT_SIGNAL_BRAND_WRITE_TYPE, Rt as \u0275INTERNAL_APPLICATION_ERROR_HANDLER, y_ as \u0275IS_ENABLED_BLOCKING_INITIAL_NAVIGATION, Yn as \u0275IS_HYDRATION_DOM_REUSE_ENABLED, If as \u0275IS_INCREMENTAL_HYDRATION_ENABLED, Vi as \u0275JSACTION_BLOCK_ELEMENT_MAP, Mf as \u0275JSACTION_EVENT_CONTRACT, Ea as \u0275LContext, wi as \u0275LocaleDataIndex, Mn as \u0275NG_COMP_DEF, _o as \u0275NG_DIR_DEF, wn as \u0275NG_ELEMENT_ID, mo as \u0275NG_INJ_DEF, Is as \u0275NG_MOD_DEF, bo as \u0275NG_PIPE_DEF, Xt as \u0275NG_PROV_DEF, aa as \u0275NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, $ as \u0275NO_CHANGE, Vr as \u0275NgModuleFactory, Io as \u0275NoopNgZone, YF as \u0275PERFORMANCE_MARK_PREFIX, wF as \u0275PROVIDED_NG_ZONE, tS as \u0275PROVIDED_ZONELESS, vt as \u0275PendingTasksInternal, P as \u0275ProfilerEvent, nt as \u0275R3Injector, va as \u0275ReflectionCapabilities, $n as \u0275Render3ComponentFactory, Ra as \u0275Render3ComponentRef, jr as \u0275Render3NgModuleRef, qc as \u0275ResourceImpl, D as \u0275RuntimeError, wI as \u0275SHARED_STYLES_HOST, Y as \u0275SIGNAL, Cy as \u0275SSR_CONTENT_INTEGRITY_MARKER, _D as \u0275TESTABILITY, bD as \u0275TESTABILITY_GETTER, ED as \u0275TimerScheduler, sc as \u0275TracingAction, Jn as \u0275TracingService, AD as \u0275USE_PENDING_TASKS, pn as \u0275ViewRef, ys as \u0275XSS_SECURITY_URL, Ir as \u0275ZONELESS_ENABLED, qy as \u0275_sanitizeHtml, tc as \u0275_sanitizeUrl, fn as \u0275allLeavingAnimations, Kr as \u0275allowSanitizationBypassAndThrow, Gj as \u0275annotateForHydration, Yj as \u0275assertType, J_ as \u0275bypassSanitizationTrustHtml, nb as \u0275bypassSanitizationTrustResourceUrl, eb as \u0275bypassSanitizationTrustScript, X_ as \u0275bypassSanitizationTrustStyle, tb as \u0275bypassSanitizationTrustUrl, LM as \u0275chain, Ux as \u0275clearResolutionOfComponentResourcesQueue, vM as \u0275compileComponent, Nh as \u0275compileDirective, gM as \u0275compileNgModule, mM as \u0275compileNgModuleDefs, _F as \u0275compileNgModuleFactory, NM as \u0275compilePipe, Tn as \u0275convertToBitFlags, _l as \u0275createInjector, HF as \u0275createOrReusePlatformInjector, Lj as \u0275defaultIterableDiffers, Pj as \u0275defaultKeyValueDiffers, Fr as \u0275depsTracker, vI as \u0275devModeEqual, Zj as \u0275disableProfiling, Qj as \u0275enableProfiling, zc as \u0275encapsulateResourceError, Jp as \u0275findLocaleData, pM as \u0275flushModuleScopingQueueAsMuchAsPossible, To as \u0275formatRuntimeError, PL as \u0275generateStandaloneInDeclarationsError, Vx as \u0275getAsyncClassMetadataFn, qR as \u0275getClosestComponentName, W as \u0275getComponentDef, qj as \u0275getCurrentClosestComponentInstance, ua as \u0275getDeferBlocks, u_ as \u0275getDirectives, ki as \u0275getDocument, f_ as \u0275getHostElement, So as \u0275getInjectableDef, Se as \u0275getLContext, gO as \u0275getLocaleCurrencyCode, mT as \u0275getLocalePluralCase, pP as \u0275getOutputDestroyRef, jy as \u0275getSanitizationBypassType, Ok as \u0275getTransferState, Q_ as \u0275getUnknownElementStrictMode, Y_ as \u0275getUnknownPropertyStrictMode, Pe as \u0275global, RI as \u0275inferTagNameFromDefinition, IF as \u0275injectChangeDetectorRef, $j as \u0275internalCreateApplication, NF as \u0275internalProvideZoneChangeDetection, Bx as \u0275isComponentDefPendingResolution, Ol as \u0275isEnvironmentProviders, Rh as \u0275isInParamsFunction, pN as \u0275isInjectable, xn as \u0275isNgModule, Tp as \u0275isPromise, GI as \u0275isSubscribable, $A as \u0275isViewDirty, GA as \u0275markForRefresh, nF as \u0275maybeUnwrapDefaultExport, Dt as \u0275noSideEffects, Mh as \u0275patchComponentDefWithScope, re as \u0275performanceMarkFeature, vr as \u0275promiseWithResolvers, Uc as \u0275provideZonelessChangeDetectionInternal, Lk as \u0275publishNonCoreGlobalUtil, A_ as \u0275readHydrationInfo, hO as \u0275registerLocaleData, Ot as \u0275renderDeferBlockState, VL as \u0275resetCompiledComponents, x_ as \u0275resetIncrementalHydrationEnabledWarnedForTests, OL as \u0275resetJitOptions, nD as \u0275resolveComponentResources, $x as \u0275restoreComponentResolutionQueue, Wx as \u0275setAllowDuplicateNgModuleIdsForTest, oN as \u0275setAlternateWeakRefImpl, lM as \u0275setClassDebugInfo, wp as \u0275setClassMetadata, eD as \u0275setClassMetadataAsync, tt as \u0275setCurrentInjector, v_ as \u0275setDocument, tr as \u0275setInParamsFunction, mN as \u0275setInjectorProfilerContext, IT as \u0275setLocaleId, z_ as \u0275setUnknownElementStrictMode, Z_ as \u0275setUnknownPropertyStrictMode, Wj as \u0275startMeasuring, zj as \u0275stopMeasuring, Ho as \u0275store, Co as \u0275stringify, wh as \u0275transitiveScopesFor, Oc as \u0275triggerResourceLoading, dN as \u0275truncateMiddle, mO as \u0275unregisterLocaleData, Bt as \u0275unwrapSafeValue, zN as \u0275unwrapWritableSignal, Rj as \u0275withDomHydration, cF as \u0275withEventReplay, xj as \u0275withI18nSupport, kj as \u0275withIncrementalHydration, sD as \u0275\u0275ControlFeature, xC as \u0275\u0275ExternalStylesFeature, rr as \u0275\u0275FactoryTarget, aD as \u0275\u0275HostDirectivesFeature, Ap as \u0275\u0275InheritDefinitionFeature, _v as \u0275\u0275NgOnChangesFeature, RC as \u0275\u0275ProvidersFeature, ME as \u0275\u0275advance, ni as \u0275\u0275animateEnter, ri as \u0275\u0275animateEnterListener, oi as \u0275\u0275animateLeave, Oa as \u0275\u0275animateLeaveListener, Hp as \u0275\u0275ariaProperty, _C as \u0275\u0275arrowFunction, vC as \u0275\u0275attachSourceLocations, Bp as \u0275\u0275attribute, zT as \u0275\u0275classMap, dh as \u0275\u0275classProp, sT as \u0275\u0275componentInstance, cT as \u0275\u0275conditional, Lc as \u0275\u0275conditionalBranchCreate, aT as \u0275\u0275conditionalCreate, sh as \u0275\u0275contentQuery, ch as \u0275\u0275contentQuerySignal, DI as \u0275\u0275control, EI as \u0275\u0275controlCreate, Ch as \u0275\u0275declareLet, FD as \u0275\u0275defer, TD as \u0275\u0275deferEnableTimerScheduling, BD as \u0275\u0275deferHydrateNever, XD as \u0275\u0275deferHydrateOnHover, GD as \u0275\u0275deferHydrateOnIdle, zD as \u0275\u0275deferHydrateOnImmediate, nT as \u0275\u0275deferHydrateOnInteraction, YD as \u0275\u0275deferHydrateOnTimer, iT as \u0275\u0275deferHydrateOnViewport, HD as \u0275\u0275deferHydrateWhen, KD as \u0275\u0275deferOnHover, UD as \u0275\u0275deferOnIdle, qD as \u0275\u0275deferOnImmediate, eT as \u0275\u0275deferOnInteraction, QD as \u0275\u0275deferOnTimer, rT as \u0275\u0275deferOnViewport, JD as \u0275\u0275deferPrefetchOnHover, $D as \u0275\u0275deferPrefetchOnIdle, WD as \u0275\u0275deferPrefetchOnImmediate, tT as \u0275\u0275deferPrefetchOnInteraction, ZD as \u0275\u0275deferPrefetchOnTimer, oT as \u0275\u0275deferPrefetchOnViewport, VD as \u0275\u0275deferPrefetchWhen, jD as \u0275\u0275deferWhen, zI as \u0275\u0275defineComponent, ZI as \u0275\u0275defineDirective, K as \u0275\u0275defineInjectable, No as \u0275\u0275defineInjector, Mp as \u0275\u0275defineNgModule, YI as \u0275\u0275definePipe, Vt as \u0275\u0275defineService, ro as \u0275\u0275directiveInject, ou as \u0275\u0275disableBindings, Gp as \u0275\u0275domElement, Qp as \u0275\u0275domElementContainer, zp as \u0275\u0275domElementContainerEnd, Hc as \u0275\u0275domElementContainerStart, jc as \u0275\u0275domElementEnd, Fc as \u0275\u0275domElementStart, oh as \u0275\u0275domListener, Yp as \u0275\u0275domProperty, xp as \u0275\u0275domTemplate, $p as \u0275\u0275element, Wp as \u0275\u0275elementContainer, Ji as \u0275\u0275elementContainerEnd, Vc as \u0275\u0275elementContainerStart, Pc as \u0275\u0275elementEnd, Mi as \u0275\u0275elementStart, ru as \u0275\u0275enableBindings, VC as \u0275\u0275enableIncrementalHydrationRuntime, cM as \u0275\u0275getComponentDepsFactory, gT as \u0275\u0275getCurrentView, Uv as \u0275\u0275getInheritedFactory, uM as \u0275\u0275getReplaceMetadataURL, RT as \u0275\u0275i18n, kT as \u0275\u0275i18nApply, xT as \u0275\u0275i18nAttributes, eh as \u0275\u0275i18nEnd, th as \u0275\u0275i18nExp, OT as \u0275\u0275i18nPostprocess, Xp as \u0275\u0275i18nStart, ge as \u0275\u0275inject, Ba as \u0275\u0275injectAttribute, yC as \u0275\u0275interpolate, EC as \u0275\u0275interpolate1, IC as \u0275\u0275interpolate2, DC as \u0275\u0275interpolate3, TC as \u0275\u0275interpolate4, CC as \u0275\u0275interpolate5, MC as \u0275\u0275interpolate6, wC as \u0275\u0275interpolate7, NC as \u0275\u0275interpolate8, SC as \u0275\u0275interpolateV, NI as \u0275\u0275invalidFactory, Ms as \u0275\u0275invalidFactoryDep, nh as \u0275\u0275listener, VT as \u0275\u0275loadQuery, Eu as \u0275\u0275namespaceHTML, yu as \u0275\u0275namespaceMathML, vu as \u0275\u0275namespaceSVG, LT as \u0275\u0275nextContext, tV as \u0275\u0275ngDeclareClassMetadata, nV as \u0275\u0275ngDeclareClassMetadataAsync, rV as \u0275\u0275ngDeclareComponent, eV as \u0275\u0275ngDeclareDirective, oV as \u0275\u0275ngDeclareFactory, iV as \u0275\u0275ngDeclareInjectable, sV as \u0275\u0275ngDeclareInjector, aV as \u0275\u0275ngDeclareNgModule, cV as \u0275\u0275ngDeclarePipe, lV as \u0275\u0275ngDeclareService, tM as \u0275\u0275pipe, nM as \u0275\u0275pipeBind1, rM as \u0275\u0275pipeBind2, oM as \u0275\u0275pipeBind3, iM as \u0275\u0275pipeBind4, sM as \u0275\u0275pipeBindV, FT as \u0275\u0275projection, PT as \u0275\u0275projectionDef, Up as \u0275\u0275property, HC as \u0275\u0275pureFunction0, BC as \u0275\u0275pureFunction1, UC as \u0275\u0275pureFunction2, $C as \u0275\u0275pureFunction3, GC as \u0275\u0275pureFunction4, qC as \u0275\u0275pureFunction5, WC as \u0275\u0275pureFunction6, zC as \u0275\u0275pureFunction7, QC as \u0275\u0275pureFunction8, ZC as \u0275\u0275pureFunctionV, HT as \u0275\u0275queryAdvance, jT as \u0275\u0275queryRefresh, mC as \u0275\u0275readContextLet, BT as \u0275\u0275reference, _p as \u0275\u0275registerNgModuleType, fT as \u0275\u0275repeater, dT as \u0275\u0275repeaterCreate, uT as \u0275\u0275repeaterTrackByIdentity, lT as \u0275\u0275repeaterTrackByIndex, dM as \u0275\u0275replaceMetadata, au as \u0275\u0275resetView, jf as \u0275\u0275resolveBody, tE as \u0275\u0275resolveDocument, eE as \u0275\u0275resolveWindow, su as \u0275\u0275restoreView, kf as \u0275\u0275sanitizeHtml, rc as \u0275\u0275sanitizeResourceUrl, Pf as \u0275\u0275sanitizeScript, Of as \u0275\u0275sanitizeStyle, Lf as \u0275\u0275sanitizeUrl, Xy as \u0275\u0275sanitizeUrlOrResourceUrl, kC as \u0275\u0275setComponentScope, OC as \u0275\u0275setNgModuleScope, gC as \u0275\u0275storeLet, WT as \u0275\u0275styleMap, uh as \u0275\u0275styleProp, rh as \u0275\u0275syntheticHostListener, Kp as \u0275\u0275syntheticHostProperty, Rp as \u0275\u0275template, aM as \u0275\u0275templateRefExtractor, tC as \u0275\u0275text, fh as \u0275\u0275textInterpolate, Bc as \u0275\u0275textInterpolate1, ph as \u0275\u0275textInterpolate2, hh as \u0275\u0275textInterpolate3, gh as \u0275\u0275textInterpolate4, mh as \u0275\u0275textInterpolate5, vh as \u0275\u0275textInterpolate6, yh as \u0275\u0275textInterpolate7, Eh as \u0275\u0275textInterpolate8, Ih as \u0275\u0275textInterpolateV, Ky as \u0275\u0275trustConstantHtml, Jy as \u0275\u0275trustConstantResourceUrl, pC as \u0275\u0275twoWayBindingSet, Th as \u0275\u0275twoWayListener, Dh as \u0275\u0275twoWayProperty, Ff as \u0275\u0275validateAttribute, ah as \u0275\u0275viewQuery, lh as \u0275\u0275viewQuerySignal };
/*! Bundled license information:

@angular/core/fesm2022/_effect-chunk.mjs:
@angular/core/fesm2022/_not_found-chunk.mjs:
@angular/core/fesm2022/_untracked-chunk.mjs:
@angular/core/fesm2022/_weak_ref-chunk.mjs:
@angular/core/fesm2022/primitives-signals.mjs:
@angular/core/fesm2022/primitives-di.mjs:
@angular/core/fesm2022/_pending_tasks-chunk.mjs:
@angular/core/fesm2022/_attribute-chunk.mjs:
@angular/core/fesm2022/_debug_node-chunk.mjs:
@angular/core/fesm2022/_resource-chunk.mjs:
@angular/core/fesm2022/primitives-event-dispatch.mjs:
@angular/core/fesm2022/core.mjs:
  (**
   * @license Angular v22.0.8
   * (c) 2010-2026 Google LLC. https://angular.dev/
   * License: MIT
   *)
*/
