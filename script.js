(() => {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ctx || reduce) return;

  const state = {
    w: 0, h: 0, dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    mouse: {x: -9999, y: -9999},
    target: {x: -9999, y: -9999},
    flow: {x: 1, y: 0},
    motion: 0,
    pointerInside: false,
    nodes: [],
    t: 0
  };

  function resize() {
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    canvas.style.width = state.w + 'px';
    canvas.style.height = state.h + 'px';

    const density = Math.max(18, Math.min(34, Math.floor(state.w / 42)));
    state.nodes = [];
    for (let y = 0; y < density; y++) {
      for (let x = 0; x < density; x++) {
        const nx = (x + 0.5) / density;
        const ny = (y + 0.5) / density;
        state.nodes.push({
          x: nx * state.w,
          y: ny * state.h,
          ox: nx * state.w,
          oy: ny * state.h,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function draw() {
    state.t += 0.004;
    state.motion *= 0.985;
    state.mouse.x += (state.target.x - state.mouse.x) * 0.035;
    state.mouse.y += (state.target.y - state.mouse.y) * 0.035;

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.clearRect(0, 0, state.w, state.h);

    const maxDist = 115;
    const mouseRadius = 220;

    for (const n of state.nodes) {
      const dxm = n.ox - state.mouse.x;
      const dym = n.oy - state.mouse.y;
      const md = Math.hypot(dxm, dym);
      let influence = Math.max(0, 1 - md / mouseRadius);
      const drift = Math.sin(state.t + n.phase) * 0.55;
      n.x = n.ox + drift + (-dxm / Math.max(md, 1)) * influence * 8;
      n.y = n.oy + Math.cos(state.t * 0.9 + n.phase) * 0.55 + (-dym / Math.max(md, 1)) * influence * 8;
    }

    for (let i = 0; i < state.nodes.length; i++) {
      const a = state.nodes[i];
      for (let j = i + 1; j < state.nodes.length; j++) {
        const b = state.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < maxDist) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const cursorDistance = Math.hypot(midX - state.target.x, midY - state.target.y);
          const current = state.motion * Math.max(0, 1 - cursorDistance / 220);
          const alpha = (1 - d / maxDist) * (0.07 + current * 0.2);
          ctx.strokeStyle = `rgba(52, 56, 50, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          if (current > 0.015 && (i * 31 + j * 17) % 11 === 0) {
            const phase = ((i * 37 + j * 13) % 100) / 100;
            const direction = dx * state.flow.x + dy * state.flow.y <= 0 ? 1 : -1;
            const progress = (state.t * (0.5 + state.motion * 2.5) * direction + phase + 1) % 1;
            ctx.fillStyle = `rgba(101, 128, 65, ${0.35 + current * 0.65})`;
            ctx.beginPath();
            ctx.arc(a.x + dx * progress, a.y + dy * progress, 2 + current * 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    for (const n of state.nodes) {
      const md = Math.hypot(n.x - state.mouse.x, n.y - state.mouse.y);
      const near = Math.max(0, 1 - md / mouseRadius);
      ctx.fillStyle = `rgba(67, 71, 64, ${0.02 + near * 0.09})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.15 + near * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('pointermove', (e) => {
    if (state.pointerInside) {
      const dx = e.clientX - state.target.x;
      const dy = e.clientY - state.target.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0) {
        state.flow.x = dx / distance;
        state.flow.y = dy / distance;
        state.motion = Math.min(1, state.motion + Math.min(distance / 45, 0.3));
      }
    } else {
      state.pointerInside = true;
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
    }
    state.target.x = e.clientX;
    state.target.y = e.clientY;
  }, {passive:true});
  window.addEventListener('pointerleave', () => {
    state.pointerInside = false;
    state.target.x = -9999;
    state.target.y = -9999;
  }, {passive:true});

  resize();
  draw();
})();
