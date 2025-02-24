"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ResizableDividerProps {
  onResize: (leftWidth: number) => void;
  initialLeftWidth?: number;
}

export function ResizableDivider({
  onResize,
  initialLeftWidth = 50,
}: ResizableDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const container = dividerRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const leftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // 限制最小宽度为20%
      const clampedWidth = Math.max(20, Math.min(80, leftWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize]);

  return (
    <div
      ref={dividerRef}
      className={`group relative h-full w-px bg-border transition-colors ${
        isHovering || isDragging.current ? "bg-primary" : ""
      }`}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 cursor-col-resize" />
    </div>
  );
}
