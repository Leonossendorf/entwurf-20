/* Zollstock als SVG: Glieder à 20 cm, Gelenke mit Niet, Skala durchgehend.
   zollstock(el, {start, glieder, winkel, animiert}) */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var L = 200, B = 18, P = 9; // 10 Einheiten = 1 cm, Gelenk bei x = 9 und x = 209
  var uid = 0;

  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function defs(svg, id) {
    var d = mk('defs', {}, svg);
    var g = mk('linearGradient', { id: id + 'g', x1: 0, y1: 0, x2: 0, y2: 1 }, d);
    mk('stop', { offset: 0, 'stop-color': '#FBDB6A' }, g);
    mk('stop', { offset: .18, 'stop-color': '#F4C632' }, g);
    mk('stop', { offset: .82, 'stop-color': '#EDB91F' }, g);
    mk('stop', { offset: 1, 'stop-color': '#C9940F' }, g);
    var r = mk('radialGradient', { id: id + 'n', cx: .35, cy: .3, r: .8 }, d);
    mk('stop', { offset: 0, 'stop-color': '#F7F4EC' }, r);
    mk('stop', { offset: .4, 'stop-color': '#B9B4A8' }, r);
    mk('stop', { offset: .8, 'stop-color': '#6E6A60' }, r);
    mk('stop', { offset: 1, 'stop-color': '#45423B' }, r);
    var f = mk('filter', { id: id + 's', x: '-10%', y: '-40%', width: '120%', height: '200%' }, d);
    mk('feDropShadow', { dx: 0, dy: 1.6, stdDeviation: 1.4, 'flood-color': '#3A2A14', 'flood-opacity': .28 }, f);
    return id;
  }

  function glied(parent, id, startCm) {
    var g = mk('g', {}, parent);
    mk('rect', { x: 0, y: 0, width: L + 2 * P, height: B, rx: 3, fill: 'url(#' + id + 'g)', filter: 'url(#' + id + 's)' }, g);
    mk('rect', { x: .5, y: .5, width: L + 2 * P - 1, height: B - 1, rx: 2.6, fill: 'none', stroke: '#B4830B', 'stroke-width': .6, opacity: .7 }, g);
    var t = '';
    for (var i = 0; i <= 200; i++) {
      var x = P + i, h = i % 10 === 0 ? 6.2 : (i % 5 === 0 ? 4.4 : 2.6);
      if (i === 0 || i === 200) continue;
      t += 'M' + x + ' 0.6v' + h;
    }
    mk('path', { d: t, stroke: '#1E1A14', 'stroke-width': .42, fill: 'none' }, g);
    for (var c = 1; c < 20; c++) {
      var n = startCm + c, red = n % 10 === 0;
      var tx = mk('text', { x: P + c * 10, y: 14.6, 'text-anchor': 'middle', 'font-size': red ? 6.4 : 5.4, 'font-weight': red ? 700 : 600, fill: red ? '#C4372C' : '#1E1A14', 'font-family': 'Source Sans 3, Arial, sans-serif' }, g);
      tx.textContent = n;
    }
    return g;
  }

  function niet(parent, id) {
    mk('circle', { cx: P, cy: B / 2, r: 3.3, fill: '#8A857A' }, parent);
    mk('circle', { cx: P, cy: B / 2, r: 2.7, fill: 'url(#' + id + 'n)' }, parent);
  }

  window.zollstock = function (el, o) {
    o = o || {};
    var n = o.glieder || 5, start = o.start || 0, w = o.winkel || [], id = 'zs' + (++uid);
    var svg = mk('svg', { role: 'img', 'aria-label': o.label || 'Zollstock', class: 'zs' });
    defs(svg, id);
    var root = mk('g', {}, svg), parent = root, joints = [];
    for (var i = 0; i < n; i++) {
      var holder = mk('g', {}, parent);
      if (i > 0) joints.push(holder);
      glied(holder, id, start + i * 20);
      if (i > 0) niet(holder, id);
      parent = mk('g', {}, holder);
    }
    // Gelenke: jedes folgende Glied hängt am Ende des vorigen
    function setze(ang) {
      joints.forEach(function (j, k) {
        j.setAttribute('transform', 'translate(' + L + ' 0) rotate(' + ang[k] + ' ' + P + ' ' + B / 2 + ')');
      });
    }
    var ziel = joints.map(function (_, k) { return w[k] || 0; });
    el.appendChild(svg);
    setze(ziel);
    var bb = root.getBBox(), pad = 6;
    svg.setAttribute('viewBox', [bb.x - pad, bb.y - pad, bb.width + 2 * pad, bb.height + 2 * pad].join(' '));
    if (o.links) svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
    if (o.rotate) root.setAttribute('transform', 'rotate(' + o.rotate + ')');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (o.animiert && !reduce) {
      var von = ziel.map(function (z, k) { return (k % 2 ? -1 : 1) * 179.5; });
      setze(von);
      var dauer = 1500, versatz = 260, t0 = null, ganz = dauer + versatz * (joints.length - 1);
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var lauf = function (ts) {
        if (!t0) t0 = ts;
        var dt = ts - t0;
        setze(ziel.map(function (z, k) {
          var p = Math.min(1, Math.max(0, (dt - k * versatz) / dauer));
          return von[k] + (z - von[k]) * ease(p);
        }));
        if (dt < ganz) requestAnimationFrame(lauf);
      };
      var start2 = function () { requestAnimationFrame(lauf); };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(start2, 250); } }, { threshold: .15 });
        io.observe(el);
      } else start2();
    }
    return svg;
  };
})();
