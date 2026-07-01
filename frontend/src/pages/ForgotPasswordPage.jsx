import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import {
  Mail, Lock, ArrowLeft, KeyRound, ShieldCheck,
  Eye, EyeOff, CheckCircle, Loader2, RefreshCw,
} from 'lucide-react';

/**
 * Trang quên mật khẩu — 3 bước:
 *  1. Nhập email → nhận OTP
 *  2. Nhập OTP + mật khẩu mới
 *  3. Thành công → về trang đăng nhập
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // ── Bước hiện tại: 'email' | 'otp' | 'done'
  const [step, setStep] = useState('email');

  // ── Step 1: email
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // ── Dev mode: hiển thị OTP trực tiếp khi chưa cấu hình SMTP
  const [devToken, setDevToken] = useState('');
  const [serverMsg, setServerMsg] = useState('');

  // ── Step 2: OTP + mật khẩu mới
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ── Đếm ngược resend
  const [countdown, setCountdown] = useState(0);

  // ────────────────────────────────────────────────────────────────
  // Bước 1: Gửi OTP
  // ────────────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSendingOtp(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      const data = res.data.data || {};
      const msg = res.data.message || data.message || 'OTP đã được gửi';
      setServerMsg(msg);

      // Dev fallback: server trả token về khi chưa cài SMTP
      if (data.devToken) {
        setDevToken(data.devToken);
        toast('📋 Mã OTP (dev): ' + data.devToken, { duration: 8000, icon: '🔑' });
      } else {
        toast.success(msg);
      }

      setStep('otp');
      startCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // Gửi lại OTP
  // ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setSendingOtp(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      const data = res.data.data || {};
      const msg = res.data.message || data.message || '';
      setServerMsg(msg);
      if (data.devToken) {
        setDevToken(data.devToken);
        toast('📋 Mã OTP mới (dev): ' + data.devToken, { duration: 8000, icon: '🔑' });
      } else {
        toast.success('Đã gửi lại OTP');
      }
      startCountdown(60);
    } catch (err) {
      toast.error('Không thể gửi lại OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ────────────────────────────────────────────────────────────────
  // Bước 2: Đặt lại mật khẩu
  // ────────────────────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { toast.error('Vui lòng nhập mã OTP'); return; }
    if (newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirmPassword) { toast.error('Xác nhận mật khẩu không khớp'); return; }

    setResetting(true);
    try {
      await api.post('/auth/reset-password', {
        token: otp.trim(),
        newPassword,
      });
      toast.success('Đặt lại mật khẩu thành công!');
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setResetting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-[#1a4f3a] font-black text-2xl font-display">
            ConstructX
          </Link>
          <p className="text-gray-400 text-sm mt-1">Khôi phục quyền truy cập tài khoản</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Progress steps */}
          <div className="flex border-b border-gray-100">
            {[
              { key: 'email', label: 'Nhập email',    num: 1 },
              { key: 'otp',   label: 'Xác nhận OTP',  num: 2 },
              { key: 'done',  label: 'Hoàn tất',       num: 3 },
            ].map((s, idx, arr) => {
              const isActive   = s.key === step;
              const isDone     = arr.findIndex(x => x.key === step) > idx;
              return (
                <div key={s.key} className={`flex-1 flex flex-col items-center py-3 text-xs font-bold transition-colors ${
                  isActive ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : isDone  ? 'text-teal-500'
                  : 'text-gray-300'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] font-black ${
                    isDone  ? 'bg-teal-100 text-teal-600'
                    : isActive ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? <CheckCircle size={13}/> : s.num}
                  </div>
                  {s.label}
                </div>
              );
            })}
          </div>

          <div className="p-7">

            {/* ── BƯỚC 1: Nhập email ── */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Mail size={26} className="text-primary"/>
                  </div>
                  <h2 className="text-lg font-black text-gray-900">Quên mật khẩu?</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Nhập email đăng ký để nhận mã OTP khôi phục.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Email tài khoản
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400"/>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      autoFocus
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp || !email.trim()}
                  className="w-full py-3 rounded-xl bg-[#1a4f3a] text-white font-bold text-sm hover:bg-[#2d7a5a] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {sendingOtp
                    ? <><Loader2 size={16} className="animate-spin"/>Đang gửi...</>
                    : <><KeyRound size={16}/>Gửi mã OTP</>}
                </button>

                <div className="text-center">
                  <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors">
                    <ArrowLeft size={14}/> Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}

            {/* ── BƯỚC 2: OTP + mật khẩu mới ── */}
            {step === 'otp' && (
              <form onSubmit={handleReset} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck size={26} className="text-amber-500"/>
                  </div>
                  <h2 className="text-lg font-black text-gray-900">Nhập mã OTP</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Mã đã được gửi đến <span className="font-semibold text-gray-600">{email}</span>
                  </p>
                </div>

                {/* Dev mode banner */}
                {devToken && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                    <p className="font-bold text-amber-700 mb-1 flex items-center gap-1.5">
                      <KeyRound size={12}/> Chế độ phát triển — SMTP chưa cấu hình
                    </p>
                    <p className="text-amber-600">
                      Mã OTP của bạn:{' '}
                      <button
                        type="button"
                        onClick={() => { setOtp(devToken); toast.success('Đã điền mã OTP'); }}
                        className="font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg hover:bg-amber-200 transition-colors tracking-widest"
                      >
                        {devToken}
                      </button>
                      <span className="ml-1 text-amber-500">(click để tự điền)</span>
                    </p>
                  </div>
                )}

                {/* OTP input */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Mã OTP (6 chữ số)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    required
                    autoFocus
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-primary focus:bg-white transition-all"
                  />
                  {/* Resend */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">Mã có hiệu lực 15 phút</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0 || sendingOtp}
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:text-gray-300 disabled:no-underline transition-colors"
                    >
                      <RefreshCw size={11}/>
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPassword && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= i * 3
                            ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : 'bg-green-500'
                            : 'bg-gray-100'
                        }`}/>
                      ))}
                      <span className="text-[10px] text-gray-400 self-center ml-1">
                        {newPassword.length < 6 ? 'Yếu' : newPassword.length < 9 ? 'Trung bình' : 'Mạnh'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none focus:bg-white transition-all ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      ✗ Mật khẩu không khớp
                    </p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={11}/> Mật khẩu khớp
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetting || otp.length < 6 || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full py-3 rounded-xl bg-[#1a4f3a] text-white font-bold text-sm hover:bg-[#2d7a5a] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {resetting
                    ? <><Loader2 size={16} className="animate-spin"/>Đang xử lý...</>
                    : <><ShieldCheck size={16}/>Đặt lại mật khẩu</>}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setDevToken(''); setNewPassword(''); setConfirmPassword(''); }}
                  className="w-full text-sm text-gray-400 hover:text-primary flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={14}/> Dùng email khác
                </button>
              </form>
            )}

            {/* ── BƯỚC 3: Thành công ── */}
            {step === 'done' && (
              <div className="text-center space-y-5 py-4">
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto">
                  <CheckCircle size={42} className="text-teal-500"/>
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Đặt lại thành công!</h2>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl bg-[#1a4f3a] text-white font-bold text-sm hover:bg-[#2d7a5a] flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Đăng nhập ngay →
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Nhớ mật khẩu rồi?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
