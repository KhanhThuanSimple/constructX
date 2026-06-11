import React, { useRef, useEffect } from 'react';

/**
 * Biểu đồ cột thuần Canvas.
 * Props: labels[], datasets[{label, data[], color}], height, stacked
 */
export default function BarChart({ labels = [], datasets = [], height = 200, title, horizontal }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !labels.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = height;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const PAD = { top: 20, right: 20, bottom: 36, left: 60 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    const allVals = datasets.flatMap(d => d.data || []);
    const maxVal = Math.max(...allVals, 1);

    const gridCount = 4;
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridCount; i++) {
      const y = PAD.top + chartH - (i / gridCount) * chartH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + chartW, y); ctx.stroke();
      ctx.fillText(fmtShort((i / gridCount) * maxVal), PAD.left - 6, y + 3.5);
    }

    const groupW = chartW / labels.length;
    const barW = Math.min(28, (groupW * 0.7) / datasets.length);
    const groupPad = (groupW - barW * datasets.length) / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';

    labels.forEach((label, gi) => {
      const gx = PAD.left + gi * groupW;
      ctx.fillText(label, gx + groupW / 2, PAD.top + chartH + 16);

      datasets.forEach(({ data = [], color = '#1a4f3a' }, di) => {
        const val = data[gi] || 0;
        const barH = (val / maxVal) * chartH;
        const bx = gx + groupPad + di * barW;
        const by = PAD.top + chartH - barH;

        // Rounded top bar
        const r = Math.min(4, barW / 2);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + barW - r, by);
        ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
        ctx.lineTo(bx + barW, by + barH);
        ctx.lineTo(bx, by + barH);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
      });
    });

    // Legend
    if (datasets.length > 1) {
      let lx = PAD.left;
      datasets.forEach(({ color, label: dsLabel }) => {
        ctx.fillStyle = color;
        ctx.fillRect(lx, 6, 12, 8);
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(dsLabel || '', lx + 16, 13);
        lx += (ctx.measureText(dsLabel || '').width || 0) + 36;
      });
    }
  }, [labels, datasets, height]);

  return (
    <div className="w-full">
      {title && <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>}
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}

function fmtShort(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'T';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'tr';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
  return Math.round(n).toString();
}
