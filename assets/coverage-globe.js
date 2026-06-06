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
  // 51 operational cities across UK, Ireland, Belgium, Netherlands,
  // Germany and Austria. label:true = name shown on the map (17 most
  // distinctive); the rest render as unlabelled dots so the network
  // reads dense without overloading the small map area.
  const cities = [
    // UK (16) - Caerphilly is HQ
    { name: 'CAERPHILLY',      lat: 51.578, lon: -3.220, hq: true,    country: 'GB' },
    { name: 'CARDIFF',         lat: 51.481, lon: -3.179, label: true, country: 'GB' },
    { name: 'SWANSEA',         lat: 51.621, lon: -3.943,              country: 'GB' },
    { name: 'BRISTOL',         lat: 51.454, lon: -2.587, label: true, country: 'GB' },
    { name: 'LONDON',          lat: 51.507, lon: -0.128, label: true, country: 'GB' },
    { name: 'WREXHAM',         lat: 53.043, lon: -2.992,              country: 'GB' },
    { name: 'LIVERPOOL',       lat: 53.408, lon: -2.991, label: true, country: 'GB' },
    { name: 'CHESTERFIELD',    lat: 53.235, lon: -1.426,              country: 'GB' },
    { name: 'BIRMINGHAM',      lat: 52.486, lon: -1.890, label: true, country: 'GB' },
    { name: 'BRIDGEND',        lat: 51.504, lon: -3.578,              country: 'GB' },
    { name: 'NEATH',           lat: 51.660, lon: -3.806,              country: 'GB' },
    { name: 'SAUNDERSFOOT',    lat: 51.708, lon: -4.706,              country: 'GB' },
    { name: 'CARMARTHEN',      lat: 51.857, lon: -4.310,              country: 'GB' },
    { name: 'PEMBROKE',        lat: 51.674, lon: -4.911,              country: 'GB' },
    { name: 'MERTHYR TYDFIL',  lat: 51.744, lon: -3.380,              country: 'GB' },
    { name: 'NEWPORT',         lat: 51.588, lon: -2.998,              country: 'GB' },
    // Ireland (7)
    { name: 'DUBLIN',          lat: 53.349, lon: -6.260, label: true, country: 'IE' },
    { name: 'WATERFORD',       lat: 52.259, lon: -7.110,              country: 'IE' },
    { name: 'LIMERICK',        lat: 52.668, lon: -8.630,              country: 'IE' },
    { name: 'GALWAY',          lat: 53.270, lon: -9.057,              country: 'IE' },
    { name: 'CORK',            lat: 51.898, lon: -8.475, label: true, country: 'IE' },
    { name: 'SLIGO',           lat: 54.270, lon: -8.476,              country: 'IE' },
    { name: 'CASTLEBAR',       lat: 53.854, lon: -9.298,              country: 'IE' },
    // Belgium (3)
    { name: 'BRUSSELS',        lat: 50.851, lon:  4.351, label: true, country: 'BE' },
    { name: 'ANTWERP',         lat: 51.219, lon:  4.402,              country: 'BE' },
    { name: 'LIEGE',           lat: 50.633, lon:  5.567,              country: 'BE' },
    // Netherlands (3)
    { name: 'ROTTERDAM',       lat: 51.924, lon:  4.477, label: true, country: 'NL' },
    { name: 'AMSTERDAM',       lat: 52.370, lon:  4.895, label: true, country: 'NL' },
    { name: 'TILBURG',         lat: 51.586, lon:  5.094,              country: 'NL' },
    // Germany (17)
    { name: 'HAMBURG',         lat: 53.551, lon:  9.993, label: true, country: 'DE' },
    { name: 'HANNOVER',        lat: 52.375, lon:  9.732,              country: 'DE' },
    { name: 'BREMEN',          lat: 53.080, lon:  8.804,              country: 'DE' },
    { name: 'DUSSELDORF',      lat: 51.227, lon:  6.773,              country: 'DE' },
    { name: 'COLOGNE',         lat: 50.937, lon:  6.960,              country: 'DE' },
    { name: 'FRANKFURT',       lat: 50.110, lon:  8.682, label: true, country: 'DE' },
    { name: 'STUTTGART',       lat: 48.775, lon:  9.182,              country: 'DE' },
    { name: 'HEIDELBERG',      lat: 49.398, lon:  8.673,              country: 'DE' },
    { name: 'TRIER',           lat: 49.749, lon:  6.638,              country: 'DE' },
    { name: 'HALLE',           lat: 51.482, lon: 11.969,              country: 'DE' },
    { name: 'REUTLINGEN',      lat: 48.491, lon:  9.214,              country: 'DE' },
    { name: 'SINGEN',          lat: 47.760, lon:  8.840,              country: 'DE' },
    { name: 'BOEBLINGEN',      lat: 48.685, lon:  9.013,              country: 'DE' },
    { name: 'WILHELMSHAVEN',   lat: 53.529, lon:  8.110,              country: 'DE' },
    { name: 'MUNICH',          lat: 48.137, lon: 11.575, label: true, country: 'DE' },
    { name: 'LEIPZIG',         lat: 51.339, lon: 12.378,              country: 'DE' },
    { name: 'BERLIN',          lat: 52.520, lon: 13.405, label: true, country: 'DE' },
    // Austria (5)
    { name: 'VIENNA',          lat: 48.208, lon: 16.373, label: true, country: 'AT' },
    { name: 'SALZBURG',        lat: 47.811, lon: 13.033, label: true, country: 'AT' },
    { name: 'GRAZ',            lat: 47.071, lon: 15.439,              country: 'AT' },
    { name: 'LINZ',            lat: 48.306, lon: 14.286,              country: 'AT' },
    { name: 'INNSBRUCK',       lat: 47.269, lon: 11.404,              country: 'AT' }
  ];

  const countryLabels = [
    { name: 'UNITED KINGDOM', lat: 53.5, lon: -2.5,  size: 12 },
    { name: 'IRELAND',        lat: 53.3, lon: -8.0,  size: 11 },
    { name: 'NETHERLANDS',    lat: 52.4, lon:  5.6,  size:  9 },
    { name: 'BELGIUM',        lat: 50.5, lon:  4.4,  size:  9 },
    { name: 'GERMANY',        lat: 51.0, lon: 10.5,  size: 13 },
    { name: 'AUSTRIA',        lat: 47.4, lon: 14.0,  size: 11 }
  ];

  // ISO 3166-1 numeric codes of countries we highlight as operational
  // GB (826), Ireland (372), Belgium (056), Netherlands (528),
  // Germany (276), Austria (040)
  const operationalISO = new Set(['826','372','056','528','276','040']);

  // Label offsets per labeled city (radial nudges so labels don't sit on top
  // of pins). Unlabeled cities fall through to the default offset.
  const labelOffsets = {
    CAERPHILLY: { dx: -14, dy: -10, dyl: 4,  anchor: 'end' },
    CARDIFF:    { dx: -12, dy:  16,           anchor: 'end' },
    BRISTOL:    { dx:  14, dy:  16,           anchor: 'start' },
    LONDON:     { dx:  14, dy:  16,           anchor: 'start' },
    LIVERPOOL:  { dx: -12, dy:  -2,           anchor: 'end' },
    BIRMINGHAM: { dx:  14, dy:   2,           anchor: 'start' },
    DUBLIN:     { dx: -12, dy:   2,           anchor: 'end' },
    CORK:       { dx: -12, dy:   2,           anchor: 'end' },
    BRUSSELS:   { dx: -12, dy:  16,           anchor: 'end' },
    AMSTERDAM:  { dx:  14, dy:  -2,           anchor: 'start' },
    ROTTERDAM:  { dx: -12, dy:  16,           anchor: 'end' },
    HAMBURG:    { dx: -12, dy:  -2,           anchor: 'end' },
    FRANKFURT:  { dx: -12, dy:  16,           anchor: 'end' },
    BERLIN:     { dx:  14, dy:  -2,           anchor: 'start' },
    MUNICH:     { dx: -12, dy:  16,           anchor: 'end' },
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

    // Connection lines (HQ -> labeled cities only as great circles).
    // Skipping unlabeled cities keeps the radial pattern legible at 51 nodes.
    const hq = cities.find(function(c) { return c.hq; });
    const hqPoint = [hq.lon, hq.lat];
    const connectionLines = cities.filter(function(c) { return !c.hq && c.label; }).map(function(c) {
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
        // Labeled cities get a bigger, brighter pin; unlabeled secondary
        // cities get a smaller dot so the network reads without crowding.
        const isMajor = c.label === true;
        g.append('circle')
          .attr('r', isMajor ? 8 : 5).attr('fill', '#f3d488')
          .attr('opacity', isMajor ? 0.20 : 0.14).attr('filter', 'url(#cg-softGlow)');
        g.append('circle')
          .attr('r', isMajor ? 5 : 3).attr('fill', 'url(#cg-pinGrad)');
        g.append('circle')
          .attr('cx', isMajor ? -1.4 : -1).attr('cy', isMajor ? -1.8 : -1.2)
          .attr('r', isMajor ? 1.1 : 0.7)
          .attr('fill', '#ffffff').attr('opacity', 0.75);
      }
    });

    // City labels - only HQ + cities with label:true (~17 of 51 nodes)
    const labelGroup = svg.append('g').attr('class', 'cg-city-labels');
    cities.forEach(function(c) {
      if (!c.hq && !c.label) return;
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
