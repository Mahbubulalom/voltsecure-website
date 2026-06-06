/* ==========================================================
   VoltSecure - Coverage section orthographic globe
   D3 + TopoJSON rendering for the "Operating across the
   continent" map. Replaces the previous hand-drawn SVG with
   a 3D-style sphere projection, animated connection lines
   from Caerphilly HQ, pulsing pins and HUD overlay.
   ========================================================== */
(function() {
  'use strict';

  // ============== DATA: cities + country labels =============
  const cities = [
    { name: 'CAERPHILLY', lat: 51.578, lon: -3.22, hq: true, country: 'GB' },
    { name: 'LONDON',     lat: 51.507, lon: -0.128,         country: 'GB' },
    { name: 'MANCHESTER', lat: 53.480, lon: -2.244,         country: 'GB' },
    { name: 'EDINBURGH',  lat: 55.953, lon: -3.188,         country: 'GB' },
    { name: 'DUBLIN',     lat: 53.349, lon: -6.260,         country: 'IE' },
    { name: 'AMSTERDAM',  lat: 52.370, lon:  4.895,         country: 'NL' },
    { name: 'BRUSSELS',   lat: 50.851, lon:  4.351,         country: 'BE' },
    { name: 'PARIS',      lat: 48.857, lon:  2.351,         country: 'FR' },
    { name: 'LYON',       lat: 45.764, lon:  4.835,         country: 'FR' },
    { name: 'MARSEILLE',  lat: 43.296, lon:  5.370,         country: 'FR' },
    { name: 'HAMBURG',    lat: 53.551, lon:  9.993,         country: 'DE' },
    { name: 'FRANKFURT',  lat: 50.110, lon:  8.682,         country: 'DE' },
    { name: 'BERLIN',     lat: 52.520, lon: 13.405,         country: 'DE' },
    { name: 'MUNICH',     lat: 48.137, lon: 11.575,         country: 'DE' },
    { name: 'ZURICH',     lat: 47.376, lon:  8.541,         country: 'CH' },
    { name: 'VIENNA',     lat: 48.208, lon: 16.373,         country: 'AT' },
    { name: 'SALZBURG',   lat: 47.811, lon: 13.033,         country: 'AT' }
  ];

  const countryLabels = [
    { name: 'UNITED KINGDOM', lat: 53.5, lon: -2.5,  size: 12 },
    { name: 'IRELAND',        lat: 53.3, lon: -8.0,  size: 11 },
    { name: 'FRANCE',         lat: 46.5, lon:  2.5,  size: 14 },
    { name: 'GERMANY',        lat: 51.0, lon: 10.5,  size: 13 },
    { name: 'AUSTRIA',        lat: 47.4, lon: 14.0,  size: 11 },
    { name: 'SWITZERLAND',    lat: 46.8, lon:  8.2,  size:  9 },
    { name: 'NETHERLANDS',    lat: 52.4, lon:  5.6,  size:  9 },
    { name: 'BELGIUM',        lat: 50.5, lon:  4.4,  size:  9 },
    { name: 'DENMARK',        lat: 55.8, lon: 10.0,  size:  9 },
    { name: 'CZECHIA',        lat: 49.8, lon: 15.5,  size:  9 },
    { name: 'ITALY',          lat: 44.5, lon: 11.5,  size: 11 },
    { name: 'SPAIN',          lat: 41.0, lon: -3.5,  size: 11 }
  ];

  // ISO 3166-1 numeric codes of countries we highlight as operational
  const operationalISO = new Set(['826','372','250','276','040','528','056','756']);

  // Label offsets per city (radial nudges so labels don't sit on top of pins)
  const labelOffsets = {
    CAERPHILLY: { dx:  14, dy: -10, dyl: 4,  anchor: 'start' },
    LONDON:     { dx: -12, dy:  16,           anchor: 'end' },
    MANCHESTER: { dx: -12, dy:  -2,           anchor: 'end' },
    EDINBURGH:  { dx: -12, dy:  -2,           anchor: 'end' },
    DUBLIN:     { dx: -12, dy:   2,           anchor: 'end' },
    AMSTERDAM:  { dx:  14, dy:  -2,           anchor: 'start' },
    BRUSSELS:   { dx:  14, dy:  12,           anchor: 'start' },
    PARIS:      { dx:  14, dy:  -2,           anchor: 'start' },
    LYON:       { dx:  14, dy:   4,           anchor: 'start' },
    MARSEILLE:  { dx:  14, dy:   4,           anchor: 'start' },
    HAMBURG:    { dx: -12, dy:  -2,           anchor: 'end' },
    FRANKFURT:  { dx: -12, dy:  16,           anchor: 'end' },
    BERLIN:     { dx:  14, dy:  -2,           anchor: 'start' },
    MUNICH:     { dx: -12, dy:  16,           anchor: 'end' },
    ZURICH:     { dx:  14, dy:  -2,           anchor: 'start' },
    VIENNA:     { dx:  14, dy:   4,           anchor: 'start' },
    SALZBURG:   { dx: -12, dy:  -2,           anchor: 'end' }
  };

  // ============== ENTRY POINT ==============
  // Wait until D3, topojson-client and DOM are all ready before rendering.
  function ready() {
    return window.d3 && window.topojson && document.getElementById('coverage-globe-svg');
  }

  function loadTopoAndRender() {
    // world-atlas@2 is the standard D3-community Natural Earth topojson at 50m
    // resolution. ISO 3166-1 numeric codes line up with our operationalISO set.
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(function(r) { return r.json(); })
      .then(function(topo) { render(topo); })
      .catch(function(e) { console.warn('[coverage-globe] topo load failed', e); });
  }

  function tryStart() {
    if (ready()) {
      loadTopoAndRender();
    } else {
      setTimeout(tryStart, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStart);
  } else {
    tryStart();
  }

  // ============== RENDER ==============
  function render(europeTopo) {
    const d3 = window.d3;
    const topojson = window.topojson;
    const svg = d3.select('#coverage-globe-svg');
    if (svg.empty()) return;

    const W = 1600, H = 1000;

    // Orthographic projection centred on Volt operational area
    const projection = d3.geoOrthographic()
      .rotate([-6, -50, 0])
      .scale(3800)
      .translate([W / 2, H / 2 + 40])
      .clipAngle(90);

    const path = d3.geoPath(projection);
    const sphere = { type: 'Sphere' };
    const defs = svg.append('defs');

    // Atmospheric outer glow
    defs.append('radialGradient')
      .attr('id', 'cg-atmosphere')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '60%')
      .selectAll('stop')
      .data([
        { o: 0,   c: '#0d1119' },
        { o: 0.7, c: '#0a0d18' },
        { o: 1,   c: '#000000' }
      ]).join('stop')
      .attr('offset', function(d) { return d.o; })
      .attr('stop-color', function(d) { return d.c; });

    // Operational fill gradient
    const opFill = defs.append('radialGradient')
      .attr('id', 'cg-operationalFill')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    opFill.append('stop').attr('offset', '0%').attr('stop-color', '#c9a961').attr('stop-opacity', 0.28);
    opFill.append('stop').attr('offset', '100%').attr('stop-color', '#c9a961').attr('stop-opacity', 0.10);

    // Pin radial gradient (3D sphere look)
    const pinGrad = defs.append('radialGradient')
      .attr('id', 'cg-pinGrad')
      .attr('cx', '35%').attr('cy', '30%').attr('r', '70%');
    pinGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fff5d6');
    pinGrad.append('stop').attr('offset', '40%').attr('stop-color', '#f3d488');
    pinGrad.append('stop').attr('offset', '100%').attr('stop-color', '#7a5d28');

    const hqGrad = defs.append('radialGradient')
      .attr('id', 'cg-hqGrad')
      .attr('cx', '35%').attr('cy', '30%').attr('r', '70%');
    hqGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff');
    hqGrad.append('stop').attr('offset', '30%').attr('stop-color', '#fff5d6');
    hqGrad.append('stop').attr('offset', '70%').attr('stop-color', '#e8c87a');
    hqGrad.append('stop').attr('offset', '100%').attr('stop-color', '#8a6f30');

    // Glow filters
    const glow = defs.append('filter')
      .attr('id', 'cg-softGlow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const strongGlow = defs.append('filter')
      .attr('id', 'cg-strongGlow')
      .attr('x', '-100%').attr('y', '-100%')
      .attr('width', '300%').attr('height', '300%');
    strongGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    const merge2 = strongGlow.append('feMerge');
    merge2.append('feMergeNode').attr('in', 'blur');
    merge2.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background
    svg.append('rect')
      .attr('width', W).attr('height', H)
      .attr('fill', 'url(#cg-atmosphere)');

    // Outer atmosphere glow rings
    svg.append('circle')
      .attr('cx', W / 2).attr('cy', H / 2 + 40)
      .attr('r', 3800)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(201,169,97,0.05)')
      .attr('stroke-width', 60);
    svg.append('circle')
      .attr('cx', W / 2).attr('cy', H / 2 + 40)
      .attr('r', 3800)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(201,169,97,0.08)')
      .attr('stroke-width', 8);

    // Graticule
    const graticule = d3.geoGraticule().step([5, 5]);
    svg.append('path')
      .datum(graticule())
      .attr('fill', 'none')
      .attr('stroke', '#c9a961')
      .attr('stroke-width', 0.4)
      .attr('opacity', 0.10)
      .attr('d', path);

    // Countries
    const countries = topojson.feature(europeTopo, europeTopo.objects.countries);

    // Country fills
    svg.append('g').attr('class', 'countries-fill')
      .selectAll('path')
      .data(countries.features)
      .join('path')
      .attr('d', path)
      .attr('fill', function(d) {
        const id = String(d.id).padStart(3, '0');
        return operationalISO.has(id) ? 'url(#cg-operationalFill)' : 'rgba(201,169,97,0.10)';
      });

    // Country borders
    svg.append('g').attr('class', 'countries-stroke')
      .selectAll('path')
      .data(countries.features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', function(d) {
        const id = String(d.id).padStart(3, '0');
        return operationalISO.has(id) ? 'rgba(243,212,136,0.65)' : 'rgba(201,169,97,0.32)';
      })
      .attr('stroke-width', function(d) {
        const id = String(d.id).padStart(3, '0');
        return operationalISO.has(id) ? 1.1 : 0.5;
      })
      .attr('opacity', function(d) {
        const id = String(d.id).padStart(3, '0');
        return operationalISO.has(id) ? 0.9 : 0.55;
      });

    // Sphere outline
    svg.append('path')
      .datum(sphere)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(201,169,97,0.18)')
      .attr('stroke-width', 1);

    // Country labels
    svg.append('g')
      .selectAll('text')
      .data(countryLabels)
      .join('text')
      .attr('class', 'cg-country-label')
      .attr('transform', function(d) {
        const p = projection([d.lon, d.lat]);
        return p ? 'translate(' + p[0] + ',' + p[1] + ')' : 'translate(-9999,-9999)';
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', function(d) { return d.size; })
      .text(function(d) { return d.name; });

    // Connection lines (HQ -> each city as great circles)
    const hq = cities.find(function(c) { return c.hq; });
    const hqPoint = [hq.lon, hq.lat];
    const connectionLines = cities.filter(function(c) { return !c.hq; }).map(function(c) {
      return { type: 'LineString', coordinates: [hqPoint, [c.lon, c.lat]] };
    });

    svg.append('g').attr('class', 'cg-connections')
      .selectAll('path')
      .data(connectionLines)
      .join('path')
      .attr('class', 'cg-connection')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#c9a961')
      .attr('stroke-width', 0.7)
      .attr('opacity', 0.45)
      .attr('filter', 'url(#cg-softGlow)');

    // Pins
    const pinGroup = svg.append('g').attr('class', 'cg-pins');
    cities.forEach(function(c) {
      const p = projection([c.lon, c.lat]);
      if (!p) return;
      const g = pinGroup.append('g').attr('transform', 'translate(' + p[0] + ',' + p[1] + ')');

      // Cast shadow
      g.append('ellipse')
        .attr('cx', 2).attr('cy', 4)
        .attr('rx', c.hq ? 14 : 8).attr('ry', c.hq ? 4 : 2.5)
        .attr('fill', '#000000')
        .attr('opacity', 0.6)
        .attr('filter', 'url(#cg-softGlow)');

      if (c.hq) {
        g.append('circle').attr('class', 'cg-hq-pulse')
          .attr('r', 8).attr('fill', 'none')
          .attr('stroke', '#fff5d6').attr('stroke-width', 1.5);
        g.append('circle').attr('class', 'cg-hq-pulse-delay')
          .attr('r', 8).attr('fill', 'none')
          .attr('stroke', '#fff5d6').attr('stroke-width', 1.5);
        g.append('circle')
          .attr('r', 16).attr('fill', 'none')
          .attr('stroke', '#f3d488').attr('stroke-width', 0.8)
          .attr('opacity', 0.7).attr('stroke-dasharray', '2 3');
        g.append('circle')
          .attr('r', 14).attr('fill', '#fff5d6')
          .attr('opacity', 0.18).attr('filter', 'url(#cg-strongGlow)');
        g.append('circle')
          .attr('r', 9).attr('fill', 'url(#cg-hqGrad)')
          .attr('filter', 'url(#cg-softGlow)');
        g.append('circle')
          .attr('cx', -2.5).attr('cy', -3).attr('r', 2)
          .attr('fill', '#ffffff').attr('opacity', 0.85);
      } else {
        g.append('circle')
          .attr('r', 8).attr('fill', '#f3d488')
          .attr('opacity', 0.20).attr('filter', 'url(#cg-softGlow)');
        g.append('circle')
          .attr('r', 5).attr('fill', 'url(#cg-pinGrad)');
        g.append('circle')
          .attr('cx', -1.4).attr('cy', -1.8).attr('r', 1.1)
          .attr('fill', '#ffffff').attr('opacity', 0.75);
      }
    });

    // City labels
    const labelGroup = svg.append('g').attr('class', 'cg-city-labels');
    cities.forEach(function(c) {
      const p = projection([c.lon, c.lat]);
      if (!p) return;
      const off = labelOffsets[c.name] || { dx: 12, dy: 4, anchor: 'start' };

      if (c.hq) {
        labelGroup.append('text')
          .attr('class', 'cg-city-label-hq')
          .attr('x', p[0] + off.dx).attr('y', p[1] + off.dy)
          .attr('text-anchor', off.anchor)
          .text(c.name + ' · HQ');
        labelGroup.append('text')
          .attr('class', 'cg-city-label-sub')
          .attr('x', p[0] + off.dx).attr('y', p[1] + off.dy + (off.dyl || 14))
          .attr('text-anchor', off.anchor)
          .text('51.58°N · 3.22°W');
      } else {
        labelGroup.append('text')
          .attr('class', 'cg-city-label')
          .attr('x', p[0] + off.dx).attr('y', p[1] + off.dy)
          .attr('text-anchor', off.anchor)
          .text(c.name);
      }
    });
  }
})();
