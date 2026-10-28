import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';

const CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCode(length = 5) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}

export default function CaptchaBox({
  value = '',
  onChange,
  onCodeChange,
  isDark = false,
  error = '',
}) {
  const canvasRef = useRef(null);
  const [code, setCode] = useState(() => generateRandomCode(5));
  const [isRotating, setIsRotating] = useState(false);

  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#171717' : '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Random background noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with rotation and colors
    const colors = isDark
      ? ['#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa', '#f87171']
      : ['#0284c7', '#d97706', '#059669', '#db2777', '#7c3aed', '#dc2626'];

    const charSpacing = width / (text.length + 1);

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const x = charSpacing * (i + 1);
      const y = height / 2 + Math.random() * 4 - 2;

      ctx.translate(x, y);
      const angle = (Math.random() - 0.5) * 0.45; // -13deg to +13deg
      ctx.rotate(angle);

      ctx.font = 'bold 22px "Courier New", monospace, sans-serif';
      ctx.fillStyle = colors[i % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text[i], 0, 0);

      ctx.restore();
    }
  }, [isDark]);

  const refreshCaptcha = useCallback(() => {
    setIsRotating(true);
    const newCode = generateRandomCode(5);
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
    setTimeout(() => setIsRotating(false), 400);
  }, [onCodeChange]);

  useEffect(() => {
    drawCaptcha(code);
    if (onCodeChange) onCodeChange(code);
  }, [code, drawCaptcha, onCodeChange]);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          Security Verification
        </label>
        <span className="text-[10px] text-neutral-400 font-medium">Case-insensitive</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Canvas Display with border */}
        <div className={`relative flex items-center rounded-lg border overflow-hidden shrink-0 select-none ${isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-300 bg-neutral-100'}`}>
          <canvas
            ref={canvasRef}
            width={130}
            height={42}
            className="block"
            title="Captcha Challenge"
          />
          <button
            type="button"
            onClick={refreshCaptcha}
            className={`flex h-10 w-9 items-center justify-center transition border-l cursor-pointer ${
              isDark
                ? 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'border-neutral-300 text-neutral-600 hover:text-black hover:bg-neutral-200'
            }`}
            title="Refresh Captcha"
            aria-label="Refresh Captcha"
          >
            <RotateCw className={`h-4 w-4 transition-transform duration-300 ${isRotating ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={value}
          maxLength={6}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Enter code"
          required
          autoComplete="off"
          spellCheck="false"
          className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 text-xs font-black tracking-widest uppercase transition outline-none ${
            isDark
              ? 'bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:border-white focus:ring-1 focus:ring-white'
              : 'bg-white border border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'
          } ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`}
        />
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
