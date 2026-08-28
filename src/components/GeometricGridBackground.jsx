import React, { useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../context/ThemeProvider';

const GRADIENT_PALETTES = [
  ['#3B82F6', '#06B6D4'], // Blue -> Cyan
  ['#EC4899', '#F43F5E'], // Pink -> Rose
  ['#F59E0B', '#EAB308'], // Amber -> Yellow
  ['#10B981', '#34D399'], // Emerald -> Mint
  ['#8B5CF6', '#C084FC'], // Purple -> Violet
  ['#6366F1', '#3B82F6'], // Indigo -> Blue
  ['#F43F5E', '#FB923C'], // Rose -> Orange
  ['#06B6D4', '#67E8F9'], // Cyan -> Light Cyan
  ['#EAB308', '#F59E0B'], // Yellow -> Amber
];

// Draw crisp, sharp geometric shapes without fuzzy shadows
function drawShape(ctx, shapeType, x, y, size, rotation, gradientColors, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  const half = size / 2;

  // Create gradient
  const grad = ctx.createLinearGradient(-half, -half, half, half);
  grad.addColorStop(0, gradientColors[0]);
  grad.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = grad;

  switch (shapeType) {
    case 0: // Crisp Circle
      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 1: // Crisp Rounded Square
      ctx.beginPath();
      const r = size * 0.16;
      if (ctx.roundRect) {
        ctx.roundRect(-half, -half, size, size, r);
      } else {
        ctx.rect(-half, -half, size, size);
      }
      ctx.fill();
      break;

    case 2: // Crisp Triangle
      ctx.beginPath();
      const radius = half * 1.1;
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const px = radius * Math.cos(angle);
        const py = radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;

    case 3: // Crisp Diamond
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      const dR = size * 0.16;
      if (ctx.roundRect) {
        ctx.roundRect(-half * 0.85, -half * 0.85, size * 0.85, size * 0.85, dR);
      } else {
        ctx.rect(-half * 0.85, -half * 0.85, size * 0.85, size * 0.85);
      }
      ctx.fill();
      ctx.restore();
      break;

    case 4: // Crisp Hexagon
      ctx.beginPath();
      const hexRadius = half;
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const px = hexRadius * Math.cos(angle);
        const py = hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;

    default:
      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

export default function GeometricGridBackground({
  gridSpacing = 40,
  proximityRadius = 183,
  maxShapeSize = 27,
  dotSize = 3.5,
  className = '',
  backgroundColor,
}) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  // Auto-detect dark or light mode based on theme state
  const isDark = useMemo(() => {
    if (typeof window === 'undefined') return true;
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  const computedBgColor = backgroundColor || (isDark ? '#000000' : '#FAFAFA');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;
    let width = 0;
    let height = 0;

    // Mouse tracking
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
    };

    let nodes = [];

    const initGrid = () => {
      // Use devicePixelRatio for razor-sharp vector rendering
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      const cols = Math.ceil(width / gridSpacing) + 1;
      const rows = Math.ceil(height / gridSpacing) + 1;

      nodes = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSpacing;
          const y = j * gridSpacing;

          const paletteIndex = (i * 7 + j * 13) % GRADIENT_PALETTES.length;
          const shapeType = (i * 3 + j * 5) % 5;
          const initialAngle = ((i * 2 + j * 3) * Math.PI) / 8;

          nodes.push({
            x,
            y,
            currentX: x,
            currentY: y,
            gradientColors: GRADIENT_PALETTES[paletteIndex],
            shapeType,
            initialAngle,
            currentSize: dotSize,
            targetSize: dotSize,
            currentOpacity: 0.5,
            targetOpacity: 0.5,
            currentRotation: initialAngle,
            dist: 9999,
            phaseOffset: (i * 0.2 + j * 0.3) % (Math.PI * 2),
          });
        }
      }
    };

    initGrid();

    const handleResize = () => {
      initGrid();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchEnd = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    let time = 0;

    const render = () => {
      time += 0.02;

      // Smooth lerp mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      // Clear canvas with theme background color
      ctx.fillStyle = computedBgColor;
      ctx.fillRect(0, 0, width, height);

      // 1. Calculate proximity and animation targets for all nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        node.dist = dist;

        let proximityFactor = 0;
        if (dist < proximityRadius) {
          const normDist = 1 - dist / proximityRadius;
          proximityFactor = normDist * normDist * (3 - 2 * normDist);
        }

        // Idle pulse
        const idlePulse = Math.sin(time + node.phaseOffset) * 0.5 + 0.5;
        const baseDotSize = dotSize + idlePulse * 0.4;
        const baseDotOpacity = isDark ? 0.45 + idlePulse * 0.15 : 0.55 + idlePulse * 0.15;

        // Position shift towards cursor
        const pushForce = proximityFactor * 6;
        const angleToMouse = Math.atan2(dy, dx);
        const targetX = node.x - Math.cos(angleToMouse) * pushForce;
        const targetY = node.y - Math.sin(angleToMouse) * pushForce;

        node.targetSize = baseDotSize + proximityFactor * (maxShapeSize - baseDotSize);
        node.targetOpacity = baseDotOpacity + proximityFactor * (1 - baseDotOpacity);
        node.targetRotation = node.initialAngle + proximityFactor * (Math.PI * 0.7) + time * 0.3;

        // Lerp positions and sizes
        node.currentX += (targetX - node.currentX) * 0.15;
        node.currentY += (targetY - node.currentY) * 0.15;
        node.currentSize += (node.targetSize - node.currentSize) * 0.15;
        node.currentOpacity += (node.targetOpacity - node.currentOpacity) * 0.15;
        node.currentRotation += (node.targetRotation - node.currentRotation) * 0.15;
      }

      // 2. Sort nodes by distance DESCENDING so nodes closest to the cursor draw LAST (ON TOP!)
      const sortedNodes = [...nodes].sort((a, b) => b.dist - a.dist);

      // 3. Render all sorted nodes
      for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];

        if (node.dist < proximityRadius * 1.1) {
          drawShape(
            ctx,
            node.shapeType,
            node.currentX,
            node.currentY,
            node.currentSize,
            node.currentRotation,
            node.gradientColors,
            node.currentOpacity
          );
        } else {
          // Inactive background grid dot
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.currentX, node.currentY, node.currentSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = node.gradientColors[0];
          ctx.globalAlpha = node.currentOpacity;
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gridSpacing, proximityRadius, maxShapeSize, dotSize, computedBgColor, isDark]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
