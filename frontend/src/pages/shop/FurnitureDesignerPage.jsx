import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Trash2, RotateCcw, ZoomIn, ZoomOut,
  Download, ShoppingCart, Layers, Info, X, ChevronRight,
  Ruler, Package, FileText, CheckCircle, AlertCircle, Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

/* ─────────────────────────────────────────────────────────────────
   MODULE CATALOG — mỗi module là một "khối" 2D nhìn từ trên xuống
   w/h tính theo đơn vị cm → scale lên canvas px
   ───────────────────────────────────────────────────────────────── */
const MODULE_CATALOG = [
  // TỦ
  { id: 'cabinet_single',   label: 'Tủ đơn',          category: 'Tủ kệ',   w: 60,  h: 50,  color: '#D4A574', pricePerUnit: 1_800_000,  icon: '🗄️',
    bom: [{ name: 'Tấm gỗ MDF 18mm', qty: 2, unit: 'tấm' }, { name: 'Bản lề giảm chấn', qty: 2, unit: 'cái' }, { name: 'Tay nắm tủ', qty: 1, unit: 'cái' }] },
  { id: 'cabinet_double',   label: 'Tủ đôi',          category: 'Tủ kệ',   w: 120, h: 50,  color: '#C4956A', pricePerUnit: 3_200_000,  icon: '🗄️',
    bom: [{ name: 'Tấm gỗ MDF 18mm', qty: 4, unit: 'tấm' }, { name: 'Bản lề giảm chấn', qty: 4, unit: 'cái' }, { name: 'Tay nắm tủ', qty: 2, unit: 'cái' }] },
  { id: 'drawer_unit',      label: 'Hộc kéo 3 tầng', category: 'Tủ kệ',   w: 40,  h: 50,  color: '#B8835A', pricePerUnit: 1_200_000,  icon: '🗄️',
    bom: [{ name: 'Ray trượt hộc kéo', qty: 3, unit: 'bộ' }, { name: 'Tấm gỗ MDF 18mm', qty: 2, unit: 'tấm' }, { name: 'Tay nắm', qty: 3, unit: 'cái' }] },
  { id: 'shelf_unit',       label: 'Kệ mở',           category: 'Tủ kệ',   w: 80,  h: 30,  color: '#D4B896', pricePerUnit: 800_000,    icon: '📚',
    bom: [{ name: 'Tấm gỗ MDF 18mm', qty: 1, unit: 'tấm' }, { name: 'Thanh đỡ kệ', qty: 4, unit: 'cái' }] },
  // BẾP
  { id: 'kitchen_base',     label: 'Tủ bếp dưới',    category: 'Bếp',     w: 60,  h: 60,  color: '#7CB9A0', pricePerUnit: 2_500_000,  icon: '🍳',
    bom: [{ name: 'Tấm gỗ MDF chống ẩm', qty: 3, unit: 'tấm' }, { name: 'Bản lề giảm chấn', qty: 2, unit: 'cái' }, { name: 'Chân tủ nhựa', qty: 4, unit: 'cái' }] },
  { id: 'kitchen_upper',    label: 'Tủ bếp trên',    category: 'Bếp',     w: 60,  h: 35,  color: '#6AA898', pricePerUnit: 1_800_000,  icon: '🍳',
    bom: [{ name: 'Tấm gỗ MDF chống ẩm', qty: 2, unit: 'tấm' }, { name: 'Bản lề giảm chấn', qty: 2, unit: 'cái' }] },
  { id: 'kitchen_corner',   label: 'Tủ góc bếp',     category: 'Bếp',     w: 90,  h: 90,  color: '#5B9B8A', pricePerUnit: 4_200_000,  icon: '🍳',
    bom: [{ name: 'Tấm gỗ MDF chống ẩm', qty: 5, unit: 'tấm' }, { name: 'Lazy Susan xoay', qty: 1, unit: 'bộ' }] },
  { id: 'island',           label: 'Đảo bếp',         category: 'Bếp',     w: 120, h: 80,  color: '#4A8A7A', pricePerUnit: 6_000_000,  icon: '🏝️',
    bom: [{ name: 'Tấm gỗ MDF chống ẩm', qty: 6, unit: 'tấm' }, { name: 'Mặt đá granite', qty: 1, unit: 'm²' }, { name: 'Chân sắt hộp', qty: 4, unit: 'cái' }] },
  // PHÒNG NGỦ
  { id: 'bed_single',       label: 'Giường đơn 1m',  category: 'Phòng ngủ',w: 100, h: 200, color: '#9B7EC8', pricePerUnit: 4_500_000,  icon: '🛏️',
    bom: [{ name: 'Thanh gỗ sồi 4x6cm', qty: 8, unit: 'm' }, { name: 'Tấm gỗ MDF 18mm', qty: 3, unit: 'tấm' }, { name: 'Chân giường sắt', qty: 4, unit: 'cái' }] },
  { id: 'bed_double',       label: 'Giường đôi 1.6m',category: 'Phòng ngủ',w: 160, h: 200, color: '#8B6EB8', pricePerUnit: 7_500_000,  icon: '🛏️',
    bom: [{ name: 'Thanh gỗ sồi 4x6cm', qty: 12, unit: 'm' }, { name: 'Tấm gỗ MDF 18mm', qty: 4, unit: 'tấm' }, { name: 'Chân giường sắt', qty: 4, unit: 'cái' }] },
  { id: 'wardrobe_2d',      label: 'Tủ quần áo 2 cánh',category:'Phòng ngủ',w:100,h:60, color:'#A07BC0',pricePerUnit:5_000_000,icon:'👗',
    bom:[{name:'Tấm gỗ MDF 18mm',qty:6,unit:'tấm'},{name:'Cánh gương',qty:1,unit:'cánh'},{name:'Thanh treo quần áo',qty:2,unit:'cái'},{name:'Bản lề giảm chấn',qty:4,unit:'cái'}]},
  { id: 'nightstand',       label: 'Tủ đầu giường',  category: 'Phòng ngủ',w: 45,  h: 40,  color: '#B08BD0', pricePerUnit: 900_000,    icon: '🛏️',
    bom: [{ name: 'Tấm gỗ MDF 18mm', qty: 1, unit: 'tấm' }, { name: 'Chân gỗ', qty: 4, unit: 'cái' }] },
  // PHÒNG KHÁCH
  { id: 'sofa_2seat',       label: 'Sofa 2 chỗ',     category: 'Phòng khách',w:150, h: 85,  color: '#E8A87C', pricePerUnit: 5_500_000,  icon: '🛋️',
    bom: [{ name: 'Khung gỗ sồi', qty: 1, unit: 'bộ' }, { name: 'Đệm mút D40', qty: 2, unit: 'cái' }, { name: 'Vải bọc nỉ', qty: 3, unit: 'm²' }] },
  { id: 'sofa_3seat',       label: 'Sofa 3 chỗ',     category: 'Phòng khách',w:210, h: 85,  color: '#D89868', pricePerUnit: 8_000_000,  icon: '🛋️',
    bom: [{ name: 'Khung gỗ sồi', qty: 1, unit: 'bộ' }, { name: 'Đệm mút D40', qty: 3, unit: 'cái' }, { name: 'Vải bọc nỉ', qty: 4.5, unit: 'm²' }] },
  { id: 'coffee_table',     label: 'Bàn cà phê',     category: 'Phòng khách',w: 90, h: 60,  color: '#C4845A', pricePerUnit: 2_200_000,  icon: '☕',
    bom: [{ name: 'Mặt kính cường lực 10mm', qty: 1, unit: 'tấm' }, { name: 'Chân sắt hộp 4x4', qty: 4, unit: 'cái' }] },
  { id: 'tv_cabinet',       label: 'Tủ tivi',         category: 'Phòng khách',w:160, h: 45,  color: '#B87048', pricePerUnit: 3_500_000,  icon: '📺',
    bom: [{ name: 'Tấm gỗ MDF 18mm', qty: 4, unit: 'tấm' }, { name: 'Chân kim loại', qty: 4, unit: 'cái' }] },
];

const CATEGORIES = [...new Set(MODULE_CATALOG.map(m => m.category))];

const SCALE = 2.5; // 1cm = 2.5px ở zoom 100%
const GRID = 10;   // lưới 10cm

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

/* ─── helpers ─────────────────────────────────────────────────── */
const snap = (v, grid) => Math.round(v / grid) * grid;

export default function FurnitureDesignerPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Room config
  const [room, setRoom] = useState({ w: 500, h: 400 }); // cm
  const [roomInputs, setRoomInputs] = useState({ w: '500', h: '400' });

  // Placed modules on canvas
  const [placed, setPlaced] = useState([]);

  // Interaction state
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null); // { id, offsetX, offsetY }
  const [resizing, setResizing] = useState(null); // { id, origW, origH, startX, startY }
  const [zoom, setZoom] = useState(1);

  // UI state
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [showBOM, setShowBOM] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ address: user?.address || '', phone: user?.phoneNumber || '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showRoomConfig, setShowRoomConfig] = useState(false);

  // Drag from palette
  const dragFrom = useRef(null);

  /* ─── computed ─────────────────────────────────────────────── */
  const totalPrice = placed.reduce((s, p) => s + p.module.pricePerUnit * (p.w / p.module.w) * (p.h / p.module.h), 0);

  const bom = (() => {
    const map = {};
    placed.forEach(p => {
      const scaleW = p.w / p.module.w;
      const scaleH = p.h / p.module.h;
      const scale = (scaleW + scaleH) / 2;
      (p.module.bom || []).forEach(b => {
        const qty = Math.ceil(b.qty * scale * ((p.w * p.h) / (p.module.w * p.module.h)));
        const key = `${b.name}__${b.unit}`;
        if (!map[key]) map[key] = { name: b.name, unit: b.unit, qty: 0 };
        map[key].qty += qty;
      });
    });
    return Object.values(map).map(m => ({ ...m, qty: Math.ceil(m.qty) }));
  })();

  /* ─── canvas draw ──────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = SCALE * zoom;
    const W = room.w * scale;
    const H = room.h * scale;

    canvas.width = W + 40;
    canvas.height = H + 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(20, 20);

    // Room background
    ctx.fillStyle = '#f8faf9';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#e0ece5';
    ctx.lineWidth = 0.5;
    const gridPx = GRID * scale;
    for (let x = 0; x <= W; x += gridPx) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridPx) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Dimension labels
    ctx.fillStyle = '#6b7280';
    ctx.font = `${11 * zoom}px "Be Vietnam Pro", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${room.w} cm`, W / 2, H + 16);
    ctx.save();
    ctx.translate(-14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${room.h} cm`, 0, 0);
    ctx.restore();

    // Room border
    ctx.strokeStyle = '#1a4f3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, W, H);

    // Wall thickness marks
    ctx.strokeStyle = '#1a4f3a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'butt';
    [[0,0,W,0],[W,0,W,H],[W,H,0,H],[0,H,0,0]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    // Placed modules
    placed.forEach((p) => {
      const x = p.x * scale;
      const y = p.y * scale;
      const w = p.w * scale;
      const h = p.h * scale;
      const isSelected = selected === p.id;

      // Shadow
      if (isSelected) {
        ctx.shadowColor = 'rgba(26,79,58,0.35)';
        ctx.shadowBlur = 12;
      }

      // Fill
      ctx.fillStyle = p.module.color;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = isSelected ? '#1a4f3a' : '#00000030';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(9, 11 * zoom)}px "Be Vietnam Pro", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Clip text to module
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, w - 4, h - 4);
      ctx.clip();
      const lines = p.label.split(' ');
      if (h * zoom > 40) {
        lines.forEach((line, i) => {
          ctx.fillText(line, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * 14 * zoom);
        });
      } else {
        ctx.fillText(p.label, x + w / 2, y + h / 2);
      }
      // Dimension text
      if (isSelected) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `${9 * zoom}px monospace`;
        ctx.fillText(`${p.w}×${p.h}cm`, x + w / 2, y + h - 8 * zoom);
      }
      ctx.restore();

      // Resize handle (bottom-right)
      if (isSelected) {
        const rx = x + w - 8;
        const ry = y + h - 8;
        ctx.fillStyle = '#1a4f3a';
        ctx.beginPath();
        ctx.roundRect(rx, ry, 8, 8, 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }, [placed, selected, zoom, room]);

  useEffect(() => { draw(); }, [draw]);

  /* ─── canvas mouse utils ────────────────────────────────────── */
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = SCALE * zoom;
    return {
      x: (e.clientX - rect.left - 20) / scale,
      y: (e.clientY - rect.top - 20) / scale,
    };
  };

  const hitTest = (pos) => {
    for (let i = placed.length - 1; i >= 0; i--) {
      const p = placed[i];
      if (pos.x >= p.x && pos.x <= p.x + p.w && pos.y >= p.y && pos.y <= p.y + p.h) {
        return p;
      }
    }
    return null;
  };

  const isResizeHandle = (pos, p) => {
    return pos.x >= p.x + p.w - 8 / (SCALE * zoom) &&
           pos.y >= p.y + p.h - 8 / (SCALE * zoom);
  };

  /* ─── mouse events ──────────────────────────────────────────── */
  const onMouseDown = (e) => {
    const pos = getCanvasPos(e);
    const hit = hitTest(pos);
    if (!hit) { setSelected(null); return; }

    setSelected(hit.id);

    if (isResizeHandle(pos, hit)) {
      setResizing({ id: hit.id, origW: hit.w, origH: hit.h, startX: pos.x, startY: pos.y });
    } else {
      setDragging({ id: hit.id, offsetX: pos.x - hit.x, offsetY: pos.y - hit.y });
    }
  };

  const onMouseMove = (e) => {
    if (!dragging && !resizing) return;
    const pos = getCanvasPos(e);

    if (dragging) {
      const nx = snap(pos.x - dragging.offsetX, GRID);
      const ny = snap(pos.y - dragging.offsetY, GRID);
      setPlaced(prev => prev.map(p => {
        if (p.id !== dragging.id) return p;
        return {
          ...p,
          x: Math.max(0, Math.min(nx, room.w - p.w)),
          y: Math.max(0, Math.min(ny, room.h - p.h)),
        };
      }));
    }

    if (resizing) {
      const item = placed.find(p => p.id === resizing.id);
      if (!item) return;
      const dw = snap(pos.x - resizing.startX, GRID);
      const dh = snap(pos.y - resizing.startY, GRID);
      const nw = Math.max(GRID * 2, resizing.origW + dw);
      const nh = Math.max(GRID * 2, resizing.origH + dh);
      setPlaced(prev => prev.map(p => {
        if (p.id !== resizing.id) return p;
        const newPrice = p.module.pricePerUnit * (nw / p.module.w) * (nh / p.module.h);
        return { ...p, w: nw, h: nh, price: newPrice };
      }));
    }
  };

  const onMouseUp = () => { setDragging(null); setResizing(null); };

  /* ─── drop from palette ─────────────────────────────────────── */
  const onDragStartPalette = (e, mod) => {
    dragFrom.current = mod;
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDropCanvas = (e) => {
    e.preventDefault();
    if (!dragFrom.current) return;
    const mod = dragFrom.current;
    const pos = getCanvasPos(e);
    const x = snap(Math.max(0, Math.min(pos.x - mod.w / 2, room.w - mod.w)), GRID);
    const y = snap(Math.max(0, Math.min(pos.y - mod.h / 2, room.h - mod.h)), GRID);
    const newItem = {
      id: Date.now(),
      module: mod,
      label: mod.label,
      x, y,
      w: mod.w, h: mod.h,
      price: mod.pricePerUnit,
    };
    setPlaced(prev => [...prev, newItem]);
    setSelected(newItem.id);
    dragFrom.current = null;
  };

  /* ─── keyboard delete ────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          setPlaced(prev => prev.filter(p => p.id !== selected));
          setSelected(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  /* ─── checkout ──────────────────────────────────────────────── */
  const handleCheckout = async () => {
    if (!token) { navigate('/login?redirect=/shop/designer'); return; }
    if (placed.length === 0) { toast.error('Chưa có sản phẩm nào trong thiết kế'); return; }
    if (!checkoutForm.address.trim()) { toast.error('Vui lòng nhập địa chỉ'); return; }
    if (!checkoutForm.phone.trim()) { toast.error('Vui lòng nhập số điện thoại'); return; }

    setSubmitting(true);
    try {
      const customReqs = placed.map(p =>
        `• ${p.label} (${p.w}×${p.h}cm) × 1 khối`
      ).join('\n');

      const bomText = bom.map(b => `  - ${b.name}: ${b.qty} ${b.unit}`).join('\n');

      const payload = {
        type: 'CUSTOM',
        deliveryAddress: checkoutForm.address,
        contactPhone: checkoutForm.phone,
        customerNote: checkoutForm.note,
        customRequirements: `THIẾT KẾ 2D - ${room.w}x${room.h}cm\n\nMÔ-ĐUN:\n${customReqs}\n\nBOM:\n${bomText}`,
        referenceImageUrl: '',
        items: placed.map(p => ({
          productId: null,
          customItemName: `${p.label} (${p.w}×${p.h}cm)`,
          customImageUrl: '',
          quantity: 1,
          unitPrice: Math.round(p.module.pricePerUnit * (p.w / p.module.w) * (p.h / p.module.h)),
          customNote: `Kích thước: ${p.w}×${p.h}cm`,
        })),
      };
      const res = await api.post('/orders', payload);
      setSuccess(res.data.data);
      setShowCheckout(false);
      toast.success('Đặt hàng thiết kế thành công!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = placed.find(p => p.id === selected);

  /* ─── room config apply ─────────────────────────────────────── */
  const applyRoomConfig = () => {
    const w = parseInt(roomInputs.w) || 400;
    const h = parseInt(roomInputs.h) || 300;
    setRoom({ w: Math.min(2000, Math.max(100, w)), h: Math.min(2000, Math.max(100, h)) });
    setPlaced([]);
    setSelected(null);
    setShowRoomConfig(false);
    toast.success('Đã đặt lại không gian');
  };

  /* ─── success screen ─────────────────────────────────────────── */
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 text-sm mb-1">Mã đơn hàng của bạn:</p>
        <p className="text-xl font-mono font-bold text-[#1a4f3a] mb-6">{success.orderCode}</p>
        <p className="text-sm text-gray-500 mb-6">Nhà xưởng sẽ xem xét thiết kế và xác nhận trong vòng 24 giờ.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')}
            className="flex-1 bg-[#1a4f3a] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#2d7a5a]">
            Xem đơn hàng
          </button>
          <button onClick={() => { setSuccess(null); setPlaced([]); }}
            className="flex-1 border border-gray-200 py-3 rounded-xl font-medium text-sm hover:bg-gray-50">
            Thiết kế mới
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans overflow-hidden">

      {/* ── TOPBAR ── */}
      <header className="bg-[#1a4f3a] text-white px-4 h-14 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Shop
          </button>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-white/70" />
            <span className="font-display font-bold text-base">Thiết kế 2D</span>
            <span className="text-white/50 text-xs hidden sm:block">— Kéo thả module vào phòng</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room size */}
          <button onClick={() => setShowRoomConfig(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            <Ruler size={13}/> {room.w}×{room.h}cm
          </button>
          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><ZoomOut size={16}/></button>
          <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><ZoomIn size={16}/></button>
          <button onClick={() => setZoom(1)} className="text-xs text-white/60 hover:text-white px-2">Reset</button>

          <div className="w-px h-4 bg-white/20" />

          {/* BOM */}
          <button onClick={() => setShowBOM(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            <FileText size={14}/> BOM
          </button>
          {/* Clear */}
          <button onClick={() => { if (window.confirm('Xóa tất cả?')) { setPlaced([]); setSelected(null); } }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500/50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
            <RotateCcw size={14}/> Xóa hết
          </button>

          {/* Checkout */}
          <button onClick={() => token ? setShowCheckout(true) : navigate('/login?redirect=/shop/designer')}
            disabled={placed.length === 0}
            className="flex items-center gap-1.5 bg-white text-[#1a4f3a] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
            <ShoppingCart size={15}/> Đặt hàng ({fmt(totalPrice)})
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT PANEL: Module palette ── */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mô-đun nội thất</p>
            <p className="text-[10px] text-gray-300 mt-0.5">Kéo vào phòng để đặt</p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-col gap-0.5 px-2 py-2 border-b border-gray-100">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  activeCategory === cat ? 'bg-[#e8f5ee] text-[#1a4f3a]' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Module items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {MODULE_CATALOG.filter(m => m.category === activeCategory).map(mod => (
              <div key={mod.id}
                draggable
                onDragStart={e => onDragStartPalette(e, mod)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 cursor-grab active:cursor-grabbing hover:border-[#1a4f3a] hover:shadow-sm transition-all bg-white select-none"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: mod.color + '30' }}>
                  {mod.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{mod.label}</p>
                  <p className="text-[10px] text-gray-400">{mod.w}×{mod.h}cm</p>
                  <p className="text-[10px] font-bold text-[#1a4f3a]">{fmt(mod.pricePerUnit)}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CANVAS ── */}
        <main className="flex-1 overflow-auto bg-gray-100 flex items-start justify-start p-6 relative"
          ref={containerRef}
          onDragOver={e => e.preventDefault()}
          onDrop={onDropCanvas}
        >
          {placed.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-300">
                <Layers size={48} className="mx-auto mb-3" />
                <p className="text-lg font-display font-bold">Kéo thả module vào đây</p>
                <p className="text-sm">để bắt đầu thiết kế không gian</p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="cursor-crosshair shadow-xl rounded-xl"
            style={{ imageRendering: 'crisp-edges' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </main>

        {/* ── RIGHT PANEL: Selected item properties ── */}
        <aside className="w-52 bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
          {/* Summary */}
          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tóm tắt</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Số mô-đun:</span>
                <span className="font-bold text-gray-800">{placed.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Phòng:</span>
                <span className="font-bold text-gray-800">{room.w}×{room.h}cm</span>
              </div>
              <div className="flex justify-between text-xs border-t border-gray-100 pt-1.5">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-bold text-[#1a4f3a] text-sm">{fmt(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Selected item */}
          {selectedItem ? (
            <div className="p-3 flex-1 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Chọn: {selectedItem.label}</p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Rộng (cm)</label>
                  <input type="number" min={GRID * 2} step={GRID}
                    value={selectedItem.w}
                    onChange={e => setPlaced(prev => prev.map(p =>
                      p.id === selected ? { ...p, w: snap(Number(e.target.value), GRID) || p.module.w } : p
                    ))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#1a4f3a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Sâu (cm)</label>
                  <input type="number" min={GRID * 2} step={GRID}
                    value={selectedItem.h}
                    onChange={e => setPlaced(prev => prev.map(p =>
                      p.id === selected ? { ...p, h: snap(Number(e.target.value), GRID) || p.module.h } : p
                    ))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#1a4f3a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tên hiển thị</label>
                  <input type="text"
                    value={selectedItem.label}
                    onChange={e => setPlaced(prev => prev.map(p =>
                      p.id === selected ? { ...p, label: e.target.value } : p
                    ))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#1a4f3a]"
                  />
                </div>

                {/* Auto price */}
                <div className="bg-[#e8f5ee] rounded-xl p-3">
                  <p className="text-[10px] text-[#1a4f3a] font-bold uppercase mb-1">Giá tự động</p>
                  <p className="text-lg font-bold text-[#1a4f3a]">
                    {fmt(selectedItem.module.pricePerUnit * (selectedItem.w / selectedItem.module.w) * (selectedItem.h / selectedItem.module.h))}
                  </p>
                  <p className="text-[10px] text-[#1a4f3a]/70 mt-0.5">
                    Tính theo kích thước {selectedItem.w}×{selectedItem.h}cm
                  </p>
                </div>

                <button onClick={() => { setPlaced(prev => prev.filter(p => p.id !== selected)); setSelected(null); }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 py-2 rounded-xl hover:bg-red-50 transition-colors">
                  <Trash2 size={13}/> Xóa module
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <div>
                <Package size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">Click vào module để chỉnh sửa</p>
                <p className="text-[10px] text-gray-300 mt-1">Delete để xóa</p>
              </div>
            </div>
          )}

          {/* Placed list */}
          {placed.length > 0 && (
            <div className="border-t border-gray-100 max-h-48 overflow-y-auto">
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Danh sách ({placed.length})</p>
              {placed.map(p => (
                <div key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors text-xs ${
                    selected === p.id ? 'bg-[#e8f5ee] text-[#1a4f3a]' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate flex-1">{p.label}</span>
                  <span className="text-[10px] font-mono text-gray-400 ml-1">{p.w}×{p.h}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* ── ROOM CONFIG MODAL ── */}
      {showRoomConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Cấu hình không gian</h3>
              <button onClick={() => setShowRoomConfig(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Chiều rộng (cm)</label>
                <input type="number" value={roomInputs.w} onChange={e => setRoomInputs(r => ({...r, w: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Chiều sâu (cm)</label>
                <input type="number" value={roomInputs.h} onChange={e => setRoomInputs(r => ({...r, h: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
              <AlertCircle size={13} className="mt-0.5 shrink-0"/>
              <span>Thay đổi kích thước phòng sẽ xóa toàn bộ thiết kế hiện tại.</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRoomConfig(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={applyRoomConfig}
                className="flex-1 py-2.5 rounded-xl bg-[#1a4f3a] text-white text-sm font-bold hover:bg-[#2d7a5a]">Áp dụng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOM MODAL ── */}
      {showBOM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">BOM — Bảng bóc tách vật tư</h3>
                <p className="text-xs text-gray-400 mt-0.5">Bill of Materials tự động từ thiết kế</p>
              </div>
              <button onClick={() => setShowBOM(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {bom.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Thêm module vào thiết kế để xem BOM</p>
              ) : (
                <>
                  {/* Module summary */}
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Mô-đun đã đặt</p>
                    <div className="space-y-1.5">
                      {placed.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span>{p.module.icon}</span>
                            <span className="font-medium text-gray-800">{p.label}</span>
                            <span className="text-xs text-gray-400">{p.w}×{p.h}cm</span>
                          </div>
                          <span className="font-bold text-[#1a4f3a]">
                            {fmt(p.module.pricePerUnit * (p.w / p.module.w) * (p.h / p.module.h))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Materials table */}
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vật tư cần thiết</p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Vật tư</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-gray-500 text-xs">Số lượng</th>
                          <th className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs">Đơn vị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bom.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 text-gray-800 font-medium">{item.name}</td>
                            <td className="px-3 py-2.5 text-center font-bold text-[#1a4f3a]">{item.qty}</td>
                            <td className="px-3 py-2.5 text-gray-500">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex items-center justify-between p-4 bg-[#e8f5ee] rounded-xl">
                    <span className="font-bold text-gray-700">Tổng chi phí ước tính:</span>
                    <span className="text-xl font-bold text-[#1a4f3a]">{fmt(totalPrice)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowBOM(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Đóng</button>
              <button
                onClick={() => { setShowBOM(false); token ? setShowCheckout(true) : navigate('/login?redirect=/shop/designer'); }}
                disabled={placed.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a4f3a] text-white text-sm font-bold hover:bg-[#2d7a5a] disabled:opacity-40">
                <ShoppingCart size={15}/> Đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ── */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Xác nhận đặt hàng</h3>
              <button onClick={() => setShowCheckout(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-700 mb-2">{placed.length} mô-đun thiết kế — {room.w}×{room.h}cm</p>
              <div className="space-y-1">
                {placed.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600">
                    <span>{p.label} ({p.w}×{p.h}cm)</span>
                    <span className="font-medium">{fmt(p.module.pricePerUnit * (p.w / p.module.w) * (p.h / p.module.h))}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-1.5 pt-1.5 flex justify-between font-bold text-gray-900">
                  <span>Tổng ước tính:</span>
                  <span className="text-[#1a4f3a]">{fmt(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Địa chỉ giao hàng *</label>
                <textarea rows={2} value={checkoutForm.address}
                  onChange={e => setCheckoutForm(f => ({...f, address: e.target.value}))}
                  placeholder="Số nhà, đường, quận, thành phố..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1a4f3a] resize-none"/>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Số điện thoại *</label>
                <input value={checkoutForm.phone}
                  onChange={e => setCheckoutForm(f => ({...f, phone: e.target.value}))}
                  placeholder="0901 234 567"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Ghi chú</label>
                <input value={checkoutForm.note}
                  onChange={e => setCheckoutForm(f => ({...f, note: e.target.value}))}
                  placeholder="Yêu cầu đặc biệt..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-800">
              <Info size={13} className="mt-0.5 shrink-0"/>
              <span>BOM và thiết kế sẽ được gửi cho nhà xưởng. Giá cuối sẽ được xác nhận sau khi xem xét.</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={handleCheckout} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a4f3a] text-white text-sm font-bold hover:bg-[#2d7a5a] disabled:opacity-60">
                {submitting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Đang xử lý...</>
                  : <><CheckCircle size={15}/>Xác nhận đặt hàng</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
