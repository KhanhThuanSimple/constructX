import React, { useRef, useEffect } from 'react';

/**
 * Biểu đồ donut thuần Canvas.
 * Props: data[{label, value, color}], size, title
 */
export default function DonutChart({ data = [], size = 160, title }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    canvas.width = size * DPR;
    canvas.height = size * DPR;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(DPR, DPR);

    const cx = size / 2, cy = size / 2;
    const outerR = size / 2 - 8;
    const innerR = outerR * 0.6;
    const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    data.forEach(({ value = 0, color = '#1a4f3a' }) => {
      const sweep = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      startAngle += sweep;
    });

    // Center text
    const pct = data[0] ? Math.round((data[0].value / total) * 100) : 0;
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${Math.round(size * 0.18)}px "Lexend", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pct + '%', cx, cy - 6);
    ctx.fillStyle = '#6b7280';
    ctx.font = `${Math.round(size * 0.09)}px sans-serif`;
    ctx.fillText(data[0]?.label || '', cx, cy + 14);
  }, [data, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      {title && <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>}
      <canvas ref={canvasRef} />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            {d.label} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
