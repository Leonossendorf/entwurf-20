(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function mk(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  var TYPEN = {
    schrank: { name: 'Schrank / Einbauschrank', b: 240, h: 250, t: 60 },
    moebel: { name: 'Möbelstück', b: 180, h: 85, t: 45 },
    innenausbau: { name: 'Regalwand / Innenausbau', b: 320, h: 250, t: 35 },
    innentuer: { name: 'Innentür', b: 86, h: 199, t: '' },
    haustuer: { name: 'Haustür', b: 110, h: 210, t: '' },
    fenster: { name: 'Fenster', b: 120, h: 135, t: '' },
    anderes: { name: 'Etwas anderes', b: 150, h: 100, t: '' }
  };
  var HOLZ = {
    eiche: { c: '#D3A46A', k: '#8C6236', name: 'Eiche' }, buche: { c: '#E4BC8E', k: '#9C7148', name: 'Buche' },
    kirsche: { c: '#B26A43', k: '#6E3A20', name: 'Kirschbaum' }, nuss: { c: '#6A4A33', k: '#33221A', name: 'Nussbaum' },
    weiss: { c: '#F6F3EC', k: '#9A9486', name: 'weiß lackiert' }, offen: { c: '#EFE7DA', k: '#8F8270', name: 'noch offen' }
  };
  var uid = 0;

  // Skizze zeichnen
  function zeichne(svg, d, lay) {
    lay = lay || { ax: 46, ay: 46, aw: 290, ah: 252 };
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var id = 'sk' + (++uid), holz = HOLZ[d.holz] || HOLZ.eiche, ink = '#2A221C', klein = !!lay.klein;
    var lw = klein ? 1.3 : 1.6;
    var defs = mk('defs', {}, svg);
    var f = mk('filter', { id: id + 'm', x: 0, y: 0, width: '100%', height: '100%' }, defs);
    mk('feTurbulence', { type: 'fractalNoise', baseFrequency: d.typ === 'fenster' ? '0.5 0.02' : '0.02 0.6', numOctaves: 3, seed: 4 }, f);
    mk('feColorMatrix', { values: '0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.07  0 0 0 1.6 -0.75' }, f);
    var pat = mk('pattern', { id: id + 'o', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    mk('rect', { width: 6, height: 6, fill: '#FBF6EE' }, pat); mk('rect', { width: 1.6, height: 6, fill: '#D6C8B2' }, pat);

    var b = Math.max(10, d.b), h = Math.max(10, d.h);
    var s = Math.min(lay.aw / b, lay.ah / h);
    var W = b * s, H = h * s, x0 = lay.ax + (lay.aw - W) / 2, y0 = lay.ay + lay.ah - H;
    if (d.typ === 'fenster') y0 = lay.ay + (lay.ah - H) / 2;
    var g = mk('g', { 'stroke-linejoin': 'round' }, svg);
    var fuell = d.holz === 'offen' ? 'url(#' + id + 'o)' : holz.c;

    function flaeche(x, y, w, hh, extra) {
      var r = mk('rect', { x: x, y: y, width: w, height: hh, fill: fuell, stroke: ink, 'stroke-width': lw }, g);
      if (d.holz !== 'offen' && d.holz !== 'weiss') {
        var cp = mk('clipPath', { id: id + 'c' + (++uid) }, defs);
        mk('rect', { x: x, y: y, width: w, height: hh }, cp);
        mk('rect', { x: x, y: y, width: w, height: hh, filter: 'url(#' + id + 'm)', 'clip-path': 'url(#' + cp.id + ')', opacity: .55 }, g);
        mk('rect', { x: x, y: y, width: w, height: hh, fill: 'none', stroke: ink, 'stroke-width': lw }, g);
      }
      return r;
    }
    function linie(x1, y1, x2, y2, w, c) { return mk('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c || ink, 'stroke-width': w || lw * .8, 'stroke-linecap': 'round' }, g); }
    function griff(x, y, w, hh) { mk('rect', { x: x, y: y, width: w, height: hh, rx: Math.min(w, hh) / 2, fill: '#3E3A34' }, g); }
    function glas(x, y, w, hh) { mk('rect', { x: x, y: y, width: w, height: hh, fill: '#DCE8EC', stroke: ink, 'stroke-width': lw * .8 }, g); linie(x + w * .2, y + hh * .15, x + w * .45, y + hh * .05, lw * .7, '#FFFFFF'); }
    var cm = function (v) { return v * s; };

    // Boden
    if (d.typ !== 'fenster') {
      var by = lay.ay + lay.ah;
      linie(lay.ax - 16, by, lay.ax + lay.aw + 16, by, lw);
      var hatch = '';
      for (var hx = lay.ax - 12; hx < lay.ax + lay.aw + 16; hx += 9) hatch += 'M' + hx + ' ' + (by + 1) + 'l-6 7';
      mk('path', { d: hatch, stroke: '#9C8F7D', 'stroke-width': .8, fill: 'none' }, g);
    }

    var n, i, bx;
    switch (d.typ) {
      case 'schrank':
        flaeche(x0, y0, W, H);
        var sock = Math.min(cm(8), H * .12);
        mk('rect', { x: x0 + cm(2), y: y0 + H - sock, width: W - cm(4), height: sock, fill: '#3E3328', opacity: .82 }, g);
        n = Math.max(1, Math.min(10, Math.round(b / 55)));
        for (i = 1; i < n; i++) linie(x0 + W * i / n, y0 + cm(1.5), x0 + W * i / n, y0 + H - sock);
        if (h > 215 && H > 60) linie(x0, y0 + H * .16, x0 + W, y0 + H * .16, lw * .8);
        for (i = 0; i < n; i++) {
          var gx = (i % 2 === 0) ? x0 + W * (i + 1) / n - Math.max(4, cm(5)) : x0 + W * i / n + Math.max(2.4, cm(3.6));
          if (n === 1) gx = x0 + W - Math.max(5, cm(6));
          griff(gx, y0 + H * .48, Math.max(1.8, cm(1.4)), Math.max(10, cm(22)));
        }
        break;
      case 'moebel':
        var bein = Math.min(cm(12), H * .2), kh = H - bein;
        flaeche(x0, y0, W, kh);
        [x0 + cm(6), x0 + W - cm(6) - Math.max(3, cm(3))].forEach(function (lx) { mk('rect', { x: lx, y: y0 + kh, width: Math.max(3, cm(3)), height: bein, fill: '#3E3328' }, g); });
        n = Math.max(1, Math.min(6, Math.round(b / 60)));
        for (i = 1; i < n; i++) linie(x0 + W * i / n, y0, x0 + W * i / n, y0 + kh);
        for (i = 0; i < n; i++) {
          linie(x0 + W * i / n, y0 + kh * .4, x0 + W * (i + 1) / n, y0 + kh * .4);
          var mx = x0 + W * (i + .5) / n, gw = Math.max(10, cm(16));
          griff(mx - gw / 2, y0 + kh * .18, gw, Math.max(2, cm(1.4)));
          griff(mx - gw / 2, y0 + kh * .66, gw, Math.max(2, cm(1.4)));
        }
        break;
      case 'innenausbau':
        flaeche(x0, y0, W, H);
        var unter = Math.min(cm(80), H * .36), spalten = Math.max(1, Math.min(8, Math.round(b / 75)));
        var fach = H - unter, boeden = Math.max(1, Math.round((h - 80) / 38));
        for (i = 1; i < spalten; i++) linie(x0 + W * i / spalten, y0, x0 + W * i / spalten, y0 + H);
        linie(x0, y0 + fach, x0 + W, y0 + fach, lw);
        for (i = 1; i < boeden; i++) linie(x0, y0 + fach * i / boeden, x0 + W, y0 + fach * i / boeden);
        for (i = 0; i < spalten; i++) {
          mk('rect', { x: x0 + W * i / spalten + 1.5, y: y0 + 1.5, width: W / spalten - 3, height: fach - 3, fill: 'rgba(42,34,28,.08)' }, g);
          griff(x0 + W * (i + .5) / spalten - Math.max(5, cm(8)), y0 + fach + unter * .2, Math.max(10, cm(16)), Math.max(2, cm(1.4)));
        }
        break;
      case 'innentuer':
      case 'haustuer':
        var z = Math.max(3, cm(d.typ === 'haustuer' ? 8 : 5));
        mk('rect', { x: x0 - z, y: y0 - z, width: W + 2 * z, height: H + z, fill: d.typ === 'haustuer' ? '#E9E1D3' : '#F4EFE6', stroke: ink, 'stroke-width': lw }, g);
        flaeche(x0, y0, W, H);
        if (d.typ === 'haustuer') {
          glas(x0 + W * .18, y0 + H * .1, W * .16, H * .74);
          griff(x0 + W * .8, y0 + H * .3, Math.max(2.4, cm(3)), H * .4);
          [.3, .55].forEach(function (p) { mk('rect', { x: x0 + W * .45, y: y0 + H * p, width: W * .4, height: H * .18, fill: 'none', stroke: ink, 'stroke-width': lw * .7, opacity: .6 }, g); });
        } else {
          mk('rect', { x: x0 + W * .14, y: y0 + H * .07, width: W * .72, height: H * .38, fill: 'none', stroke: ink, 'stroke-width': lw * .7, opacity: .55 }, g);
          mk('rect', { x: x0 + W * .14, y: y0 + H * .52, width: W * .72, height: H * .4, fill: 'none', stroke: ink, 'stroke-width': lw * .7, opacity: .55 }, g);
          var hy = y0 + H - cm(105);
          mk('rect', { x: x0 + W - Math.max(5, cm(7)) - Math.max(6, cm(12)), y: hy, width: Math.max(6, cm(12)), height: Math.max(2, cm(2)), rx: 1, fill: '#3E3A34' }, g);
          mk('circle', { cx: x0 + W - Math.max(5, cm(7)), cy: hy + Math.max(1, cm(1)), r: Math.max(2.2, cm(2.6)), fill: '#3E3A34' }, g);
        }
        break;
      case 'fenster':
        flaeche(x0, y0, W, H);
        var rahmen = Math.max(4, cm(7));
        n = b >= 110 ? 2 : 1;
        var fw = (W - 2 * rahmen) / n;
        for (i = 0; i < n; i++) {
          bx = x0 + rahmen + i * fw;
          mk('rect', { x: bx, y: y0 + rahmen, width: fw, height: H - 2 * rahmen, fill: 'none', stroke: ink, 'stroke-width': lw * .8 }, g);
          glas(bx + rahmen * .8, y0 + rahmen * 1.8, fw - rahmen * 1.6, H - rahmen * 3.6);
          var gxx = (n === 2 && i === 0) ? bx + fw - rahmen * .55 : bx + rahmen * .3;
          griff(gxx, y0 + H * .46, Math.max(2, cm(1.6)), Math.max(8, cm(12)));
        }
        linie(x0 - cm(5), y0 + H + 3, x0 + W + cm(5), y0 + H + 3, lw * 1.6);
        break;
      default:
        mk('rect', { x: x0, y: y0, width: W, height: H, fill: 'url(#' + id + 'o)', stroke: ink, 'stroke-width': lw, 'stroke-dasharray': '6 5' }, g);
        var q = mk('text', { x: x0 + W / 2, y: y0 + H / 2 + 14, 'text-anchor': 'middle', 'font-family': 'Caveat, cursive', 'font-size': klein ? 30 : 44, 'font-weight': 700, fill: '#8F8270' }, g);
        q.textContent = '?';
    }

    // Bemaßung
    function mass(x1, y1, x2, y2, txt, senkrecht) {
      var mg = mk('g', {}, svg);
      mk('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: ink, 'stroke-width': 1 }, mg);
      [[x1, y1], [x2, y2]].forEach(function (p) { mk('line', { x1: p[0] - 4, y1: p[1] + 4, x2: p[0] + 4, y2: p[1] - 4, stroke: ink, 'stroke-width': 1.3 }, mg); });
      var fs = klein ? 12 : 15, tw = txt.length * fs * .52 + 12, th = fs + 8;
      var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      var tg = mk('g', { transform: senkrecht ? 'translate(' + cx + ' ' + cy + ') rotate(-90)' : 'translate(' + cx + ' ' + cy + ')' }, mg);
      mk('rect', { x: -tw / 2, y: -th / 2, width: tw, height: th, rx: 3, fill: '#F2C12E', stroke: '#C9940F', 'stroke-width': .8 }, tg);
      var t = mk('text', { x: 0, y: fs * .36, 'text-anchor': 'middle', 'font-family': 'Source Sans 3, Arial, sans-serif', 'font-weight': 700, 'font-size': fs, fill: '#1E1A14' }, tg);
      t.textContent = txt;
    }
    var off = klein ? 16 : 24, unten = d.typ === 'fenster' ? y0 + H + off + 4 : lay.ay + lay.ah + off;
    var zext = (d.typ === 'innentuer' || d.typ === 'haustuer') ? Math.max(3, cm(d.typ === 'haustuer' ? 8 : 5)) : 0;
    linie(x0, y0 + H + 2, x0, unten + 4, .6, '#7A6E60'); linie(x0 + W, y0 + H + 2, x0 + W, unten + 4, .6, '#7A6E60');
    mass(x0, unten, x0 + W, unten, (d.beispiel ? 'ca. ' : '') + fmt(d.b) + ' cm');
    var rx = x0 + W + zext + off;
    linie(x0 + W + zext + 2, y0, rx + 4, y0, .6, '#7A6E60'); linie(x0 + W + zext + 2, y0 + H, rx + 4, y0 + H, .6, '#7A6E60');
    mass(rx, y0, rx, y0 + H, (d.beispiel ? 'ca. ' : '') + fmt(d.h) + ' cm', true);
    if (d.t && !klein) {
      var tt = mk('text', { x: 6, y: 26, 'text-anchor': 'start', 'font-family': 'Caveat, cursive', 'font-weight': 700, 'font-size': 22, fill: '#5A4232' }, svg);
      tt.textContent = 'Tiefe ' + fmt(d.t) + ' cm';
    }
  }
  function fmt(v) { return String(Math.round(v * 10) / 10).replace('.', ','); }

  // Formular
  var form = document.getElementById('anfrageForm');
  var svg = document.getElementById('skizze');
  var mb = document.getElementById('mb'), mh = document.getElementById('mh'), mt = document.getElementById('mt');
  function wert(inp, def) { var v = parseFloat(String(inp.value).replace(',', '.')); return isFinite(v) && v > 0 ? v : def; }
  function daten() {
    var typ = form.typ.value, T = TYPEN[typ];
    var eigen = !!(mb.value || mh.value);
    return { typ: typ, b: wert(mb, T.b), h: wert(mh, T.h), t: mt.value ? wert(mt, '') : (eigen ? '' : T.t), holz: form.holz.value, beispiel: !eigen };
  }
  function update() {
    var d = daten(), T = TYPEN[d.typ];
    mb.placeholder = T.b; mh.placeholder = T.h; mt.placeholder = T.t || '–';
    zeichne(svg, d);
    document.getElementById('skTitel').textContent = T.name;
    document.getElementById('skFuss').textContent = d.beispiel ? 'Beispielmaße, tragen Sie Ihre eigenen ein.' : 'Ihre Maße: ' + fmt(d.b) + ' × ' + fmt(d.h) + (d.t ? ' × ' + fmt(d.t) : '') + ' cm';
  }
  if (form) {
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['name', 'tel'].forEach(function (n) { var el = form[n]; var leer = !el.value.trim(); el.classList.toggle('is-fehler', leer); if (leer) ok = false; });
      if (!ok) { form.querySelector('.is-fehler').focus(); return; }
      var d = daten(), T = TYPEN[d.typ], erg = document.getElementById('ergebnis');
      var box = document.getElementById('ergSkizze'); box.innerHTML = '';
      var s2 = mk('svg', { viewBox: '0 0 420 380', role: 'img', 'aria-label': 'Skizze' }, box); zeichne(s2, d);
      var rows = [['Was', T.name], ['Maße', (d.beispiel ? 'noch keine (Beispiel)' : fmt(d.b) + ' × ' + fmt(d.h) + (d.t ? ' × ' + fmt(d.t) : '') + ' cm')], ['Holz', HOLZ[d.holz].name], ['Wann', form.wann.value], ['Name', form.name.value], ['Telefon', form.tel.value]];
      if (form.ort.value.trim()) rows.push(['Ort', form.ort.value]);
      if (form.text.value.trim()) rows.push(['Hinweis', form.text.value]);
      if (form.foto.files && form.foto.files.length) rows.push(['Foto', form.foto.files[0].name + ' (im Entwurf nicht hochgeladen)']);
      var dl = document.getElementById('ergDaten'); dl.innerHTML = '';
      rows.forEach(function (r) { var dt = document.createElement('dt'); dt.textContent = r[0]; var dd = document.createElement('dd'); dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd); });
      erg.hidden = false; erg.focus({ preventScroll: true }); erg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  document.querySelectorAll('.l-link').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var r = form.querySelector('input[name=typ][value=' + btn.dataset.typ + ']');
      if (r) { r.checked = true; update(); }
      document.getElementById('anfrage').scrollIntoView({ behavior: 'smooth' });
    });
  });
  document.querySelectorAll('svg.mini').forEach(function (m) {
    var typ = m.dataset.mini, T = TYPEN[typ];
    zeichne(m, { typ: typ, b: T.b, h: T.h, t: '', holz: typ === 'fenster' ? 'weiss' : 'eiche' }, { ax: 30, ay: 16, aw: 140, ah: 158, klein: true });
  });

  // Zollstock
  var hz = document.getElementById('heroZs');
  if (hz && window.zollstock) zollstock(hz, { glieder: 6, winkel: [0, 0, 0, -16, 166], animiert: true, label: 'Zollstock' });
  document.querySelectorAll('.s-zs').forEach(function (el) { zollstock(el, { glieder: 1, start: +el.dataset.start, links: true }); });
})();
