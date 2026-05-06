import { ToolType } from './AnnotationTools';

export interface DrawAction {
  tool: ToolType;
  color: string;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  text?: string;
  fontSize?: number;
}

export const drawLine = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], color: string, lineWidth = 3) => {
  if (points.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();
};

export const drawCircle = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: string) => {
  const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

export const drawRectangle = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(startX, startY, endX - startX, endY - startY);
};

export const drawArrow = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: string) => {
  const headlen = 20;
  const angle = Math.atan2(endY - startY, endX - startX);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(endX, endY);
  ctx.fill();
};

export const drawText = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, fontSize = 24) => {
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(text, x, y);
};
