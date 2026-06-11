import React, { useRef, useEffect } from 'react';

/**
 * Biểu đồ đường thuần Canvas — không dùng thư viện ngoài.
 * Props: labels[], datasets[{label, data[], color}], height
 */
export default function LineChart({ labels = [], datasets = [], height = 200, title }) {
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

    // All values
    const allVals = datasets.flatMap(d => d.data || []);
    const maxVal = Math.max(...allVals, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    // Y grid lines (5 levels)
    const gridCount = 5;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridCount; i++) {
      const y = PAD.top + chartH - (i / gridCount) * chartH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + chartW, y); ctx.stroke();
      const val = minVal + (i / gridCount) * range;
      ctx.fillText(fmtShort(val), PAD.left - 6, y + 3.5);
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    labels.forEach((label, i) => {
      const x = PAD.left + (i / (labels.length - 1)) * chartW;
      ctx.fillText(label, x, PAD.top + chartH + 16);
    });

    // Draw each dataset
    datasets.forEach(({ data = [], color = '#1a4f3a', label: dsLabel }) => {
      if (!data.length) return;

      const pts = data.map((v, i) => ({
        x: PAD.left + (i / Math.max(data.length - 1, 1)) * chartW,
        y: PAD.top + chartH - ((v - minVal) / range) * chartH,
      }));

      // Area fill
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
      grad.addColorStop(0, color + '30');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, PAD.top + chartH);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, PAD.top + chartH);
      ctx.closePath();
      ctx.fill();

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Dots
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // Legend
    if (datasets.length > 1) {
      let lx = PAD.left;
      datasets.forEach(({ color = '#1a4f3a', label: dsLabel }) => {
        ctx.fillStyle = color;
        ctx.fillRect(lx, 6, 12, 4);
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(dsLabel || '', lx + 16, 12);
        lx += ctx.measureText(dsLabel || '').width + 36;
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
