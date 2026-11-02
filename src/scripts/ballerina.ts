// a ballerina made of signed distance shapes, raymarched into a grid of characters.
// nothing but text reaches the page.

const RAMP = '.,:;irsXA253hMHGS#9B&@';
const TURN_SECONDS = 8;
const FPS = 30;

// world units: toe tip at y = 0, raised hand near y = 1.95.
const VIEW_TOP = 2.02;
const VIEW_BOTTOM = -0.06;
const VIEW_WIDTH = 1.5;
const CAM_Y = (VIEW_TOP + VIEW_BOTTOM) / 2;
const CAM_Z = 7;
const BOUND_R = 0.72; // every part of the figure fits inside this cylinder.

// pose, refreshed each frame for the small arm and skirt motion.
let time = 0;
const P = new Float64Array(64);

function setPose(t: number) {
  time = t;
  const breathe = Math.sin(t * 1.6) * 0.012;
  // raised arm (right): shoulder, elbow, wrist, curving above the head.
  P.set([-0.15, 1.34, 0.0, -0.27, 1.62 + breathe, 0.05, -0.08, 1.87 + breathe, 0.07], 0);
  // extended arm (left): shoulder, elbow, wrist, out to the side and a little forward.
  P.set([0.15, 1.34, 0.0, 0.4, 1.31 - breathe, 0.12, 0.61, 1.21 - breathe, 0.25], 9);
}

function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// capsule whose radius changes from r1 at a to r2 at b.
function cone(
  px: number, py: number, pz: number,
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  r1: number, r2: number,
) {
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const pax = px - ax, pay = py - ay, paz = pz - az;
  let h = (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz);
  h = h < 0 ? 0 : h > 1 ? 1 : h;
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r1 + (r2 - r1) * h);
}

function sphere(px: number, py: number, pz: number, cx: number, cy: number, cz: number, r: number) {
  const dx = px - cx, dy = py - cy, dz = pz - cz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
}

// the figure in her own space, facing +z.
function body(x: number, y: number, z: number): number {
  // head, bun at the back, neck
  let head = sphere(x, y * 0.94, z, 0, 1.56 * 0.94, 0.01, 0.094);
  head = smin(head, sphere(x, y, z, 0, 1.64, -0.088, 0.052), 0.03);
  const neck = cone(x, y, z, 0, 1.34, 0, 0, 1.49, 0.01, 0.042, 0.036);
  let d = smin(head, neck, 0.03);

  // torso: slim waist widening to the chest, slightly flattened front to back
  const tz = z * 1.25;
  const torso = cone(x, y, tz, 0, 0.98, 0, 0, 1.27, 0.01, 0.072, 0.115) * 0.85;
  const shoulders = cone(x, y, z, -0.15, 1.33, 0, 0.15, 1.33, 0, 0.048, 0.048);
  d = smin(d, smin(torso, shoulders, 0.07), 0.04);
  const pelvis = sphere(x, y * 1.35, z * 1.15, 0, 0.94 * 1.35, 0, 0.13) * 0.72;
  d = smin(d, pelvis, 0.05);

  // arms: shoulder to elbow to wrist, tapering
  for (let i = 0; i < 18; i += 9) {
    const upper = cone(x, y, z, P[i], P[i + 1], P[i + 2], P[i + 3], P[i + 4], P[i + 5], 0.044, 0.036);
    const fore = cone(x, y, z, P[i + 3], P[i + 4], P[i + 5], P[i + 6], P[i + 7], P[i + 8], 0.04, 0.032);
    d = smin(d, Math.min(upper, fore), 0.03);
  }

  // standing leg, en pointe
  const sThigh = cone(x, y, z, 0.05, 0.9, 0, 0.02, 0.5, 0.01, 0.078, 0.052);
  const sShin = cone(x, y, z, 0.02, 0.5, 0.01, 0.0, 0.12, 0.0, 0.05, 0.032);
  const sFoot = cone(x, y, z, 0.0, 0.12, 0.0, 0.0, 0.01, 0.02, 0.03, 0.02);
  d = smin(d, smin(smin(sThigh, sShin, 0.03), sFoot, 0.02), 0.03);

  // working leg in retire: knee turned out, toe resting at the standing knee
  const wThigh = cone(x, y, z, -0.06, 0.9, 0, -0.38, 0.72, 0.1, 0.076, 0.052);
  const wShin = cone(x, y, z, -0.38, 0.72, 0.1, -0.06, 0.53, 0.07, 0.05, 0.03);
  const wFoot = cone(x, y, z, -0.06, 0.53, 0.07, 0.0, 0.5, 0.06, 0.028, 0.019);
  d = smin(d, smin(smin(wThigh, wShin, 0.03), wFoot, 0.02), 0.03);

  // tutu: a flat disc that dips a little at the edge, with a rippling ruffle
  const rxz = Math.sqrt(x * x + z * z);
  const phi = Math.atan2(z, x);
  const edge = 0.45 + 0.022 * Math.sin(9 * phi + time * 1.3) + 0.012 * Math.sin(17 * phi - time * 2.1);
  const u = Math.min(rxz / edge, 1.2);
  const yc = 1.0 - 0.07 * u * u + 0.012 * Math.sin(7 * phi - time * 1.7) * u;
  const thick = 0.046 - 0.018 * u;
  const tutu = Math.max(rxz - edge, Math.abs(y - yc) - thick) * 0.8;
  d = smin(d, tutu, 0.05);

  return d;
}

// rotate the sample point into her space, so she turns and the light stays put.
let cosA = 1, sinA = 0;
function scene(x: number, y: number, z: number) {
  return body(cosA * x - sinA * z, y, sinA * x + cosA * z);
}

type Grid = { cols: number; rows: number; cellW: number; cellH: number };

// light from the upper left, in front of her.
const L = (() => { const l = [-0.55, 0.6, 0.6]; const n = Math.hypot(l[0], l[1], l[2]); return l.map((v) => v / n); })();

function render(g: Grid, angle: number): string {
  cosA = Math.cos(angle);
  sinA = Math.sin(angle);
  const scale = (VIEW_TOP - VIEW_BOTTOM) / (g.rows * g.cellH); // world units per pixel
  const lines: string[] = [];
  const e = 0.003;
  for (let r = 0; r < g.rows; r++) {
    let line = '';
    const wy = (g.rows / 2 - r - 0.5) * g.cellH * scale;
    for (let c = 0; c < g.cols; c++) {
      const wx = (c + 0.5 - g.cols / 2) * g.cellW * scale;
      // ray from the camera through this cell, with a little perspective
      let dx = wx, dy = wy, dz = -CAM_Z;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + dz * dz);
      dx *= inv; dy *= inv; dz *= inv;
      const ox = 0, oy = CAM_Y, oz = CAM_Z;
      // clip the ray to the bounding cylinder before marching
      const a = dx * dx + dz * dz;
      const b = 2 * (ox * dx + oz * dz);
      const cc = ox * ox + oz * oz - BOUND_R * BOUND_R;
      const disc = b * b - 4 * a * cc;
      if (disc < 0) { line += ' '; continue; }
      const sq = Math.sqrt(disc);
      let t = (-b - sq) / (2 * a);
      const tEnd = (-b + sq) / (2 * a);
      let hit = false;
      let px = 0, py = 0, pz = 0;
      for (let i = 0; i < 64 && t < tEnd; i++) {
        px = ox + dx * t; py = oy + dy * t; pz = oz + dz * t;
        const d = scene(px, py, pz);
        if (d < 0.0025) { hit = true; break; }
        t += d;
      }
      if (!hit || py < VIEW_BOTTOM) { line += ' '; continue; }
      // surface normal from four nearby samples
      const k1 = scene(px + e, py - e, pz - e);
      const k2 = scene(px - e, py - e, pz + e);
      const k3 = scene(px - e, py + e, pz - e);
      const k4 = scene(px + e, py + e, pz + e);
      let nx = k1 - k2 - k3 + k4, ny = -k1 - k2 + k3 + k4, nz = -k1 + k2 - k3 + k4;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      const diffuse = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      const facing = Math.max(0, -(nx * dx + ny * dy + nz * dz));
      const rim = Math.pow(1 - facing, 3);
      // parts nearer the viewer read a little brighter
      const near = 0.78 + 0.22 * (pz / BOUND_R + 1) / 2;
      let lum = (0.1 + 0.72 * diffuse + 0.32 * rim) * near;
      lum = Math.min(1, Math.max(0, lum));
      line += RAMP[Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length))];
    }
    // lines keep their trailing spaces, so the frame stays the same width as she turns.
    lines.push(line);
  }
  return lines.join('\n');
}

// a pirouette that eases a little within each turn, but never stops or reverses.
function angleAt(seconds: number) {
  const phase = (seconds / TURN_SECONDS) * Math.PI * 2;
  return phase + 0.14 * Math.sin(phase);
}

function measure(pre: HTMLElement) {
  const probe = document.createElement('span');
  probe.textContent = 'M'.repeat(40);
  probe.style.visibility = 'hidden';
  pre.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  pre.removeChild(probe);
  const lh = parseFloat(getComputedStyle(pre).lineHeight) || rect.height;
  return { cellW: rect.width / 40 || 6, cellH: lh || 10 };
}

function gridFor(pre: HTMLElement, available: number): Grid {
  const { cellW, cellH } = measure(pre);
  let rows = 56;
  const colsFor = (r: number) => Math.ceil((VIEW_WIDTH / ((VIEW_TOP - VIEW_BOTTOM) / (r * cellH))) / cellW);
  while (rows > 22 && colsFor(rows) * cellW > available) rows -= 2;
  return { rows, cols: colsFor(rows), cellW, cellH };
}

// renders into pre and returns a function that stops the animation.
// width() reports how much horizontal room the figure may use.
export function startBallerina(pre: HTMLElement, still: boolean, width: () => number): () => void {
  let grid = gridFor(pre, width());
  let raf = 0;
  let last = 0;
  let clock = 0;
  let visible = true;
  let stopped = false;

  const draw = () => {
    pre.style.width = `${grid.cols * grid.cellW}px`;
    pre.style.height = `${grid.rows * grid.cellH}px`;
    setPose(clock);
    pre.textContent = render(grid, still ? -0.6 : angleAt(clock));
  };

  const loop = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) { last = now; return; }
    // a little slack so a 60hz screen lands on every second frame.
    if (now - last < 1000 / FPS - 4) return;
    clock += last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    draw();
  };

  const seen = new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; });
  seen.observe(pre);
  const onResize = () => { grid = gridFor(pre, width()); draw(); };
  addEventListener('resize', onResize);

  draw();
  if (!still) raf = requestAnimationFrame(loop);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    seen.disconnect();
    removeEventListener('resize', onResize);
  };
}

