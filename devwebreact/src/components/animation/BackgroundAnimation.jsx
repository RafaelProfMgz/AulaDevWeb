import React, { useRef, useEffect, useCallback } from "react";
// Verifique se o caminho para o CSS está correto
import "../../assets/BackgroundAnimation.css";

// --- Constantes Configuráveis ---
const SHOOTING_STAR_FREQUENCY = 0.0035;
const ASTEROID_FREQUENCY = 0.0008;
const SHOOTING_STAR_COLOR = "rgba(255, 255, 255, 0.9)";
const SHOOTING_STAR_TAIL_COLOR = "rgba(255, 255, 255, 0.4)";
const ASTEROID_COLOR = "rgba(200, 180, 160, 0.95)"; // Ajustado para mais 'pedra'
const ASTEROID_TAIL_COLOR = "rgba(200, 180, 160, 0.3)"; // Cor do rastro mais sutil
const ASTEROID_VERTICES = 10; // Número de vértices para a forma irregular
const ASTEROID_JAGGEDNESS = 0.4; // Quão irregular (0 = círculo, 1 = muito pontudo)
const ASTEROID_TRAIL_LENGTH_FACTOR = 2.5; // Comprimento do rastro (multiplica o raio)

export default function BackgroundAnimation({
  starCount = 1000,
  starColor = "rgba(255, 255, 255, 0.8)",
  backgroundColor = "linear-gradient(to bottom, #00000c, #0f0f2e, #1a1a4a)",
}) {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const asteroidsRef = useRef([]);

  const createStaticStars = useCallback(
    /* ...código anterior sem alterações... */
    (canvas) => {
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 0.015 + 0.002,
          twinkleDirection: Math.random() < 0.5 ? 1 : -1,
        });
      }
      starsRef.current = newStars;
    },
    [starCount],
  );

  const spawnShootingStar = useCallback(
    /* ...código anterior sem alterações... */
    (canvas) => {
      const speed = Math.random() * 5 + 5; // Velocidade relativamente alta
      const angle = Math.PI / 4 + (Math.random() * Math.PI) / 6; // Ângulo (diagonal p/ baixo)
      const startX = Math.random() * canvas.width * 0.8; // Começa mais à esquerda
      const startY = -10; // Começa fora da tela (em cima)
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      shootingStarsRef.current.push({
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        length: Math.random() * 80 + 50, // Comprimento do rastro
        lineWidth: Math.random() * 1.5 + 0.5, // Espessura
      });
    },
    [],
  );

  // Atualizado para gerar a forma irregular e o comprimento do rastro
  const spawnAsteroid = useCallback((canvas) => {
    const speed = Math.random() * 0.8 + 0.3;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + 6; // Tamanho ligeiramente maior em média
    const shapeOffsets = []; // Armazenar as variações de raio para cada vértice
    for (let i = 0; i < ASTEROID_VERTICES; i++) {
      // Gera um fator entre (1 - jaggedness) e (1 + jaggedness)
      const offsetFactor =
        1 - ASTEROID_JAGGEDNESS + Math.random() * ASTEROID_JAGGEDNESS * 2;
      shapeOffsets.push(offsetFactor);
    }

    let startX, startY;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      startX = Math.random() * canvas.width;
      startY = -radius * (1 + ASTEROID_JAGGEDNESS);
    } else if (edge === 1) {
      startX = canvas.width + radius * (1 + ASTEROID_JAGGEDNESS);
      startY = Math.random() * canvas.height;
    } else if (edge === 2) {
      startX = Math.random() * canvas.width;
      startY = canvas.height + radius * (1 + ASTEROID_JAGGEDNESS);
    } else {
      startX = -radius * (1 + ASTEROID_JAGGEDNESS);
      startY = Math.random() * canvas.height;
    }

    asteroidsRef.current.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: radius,
      shapeOffsets: shapeOffsets, // Salva os offsets da forma
      trailLength: radius * ASTEROID_TRAIL_LENGTH_FACTOR, // Comprimento do rastro
      // Poderia adicionar rotação aqui: angle: Math.random() * Math.PI * 2, rotateSpeed: (Math.random() - 0.5) * 0.02
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let isMounted = true;

    const resizeCanvas = () => {
      /* ...código anterior sem alterações... */
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStaticStars(canvas);
      shootingStarsRef.current = [];
      asteroidsRef.current = [];
    };

    const animate = () => {
      if (!isMounted || !ctx || !canvas) return;

      // 1. Limpar Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. Desenhar Estrelas Estáticas
      // (...código anterior sem alterações...)
      const baseStarColor = starColor.substring(0, starColor.lastIndexOf(","));
      starsRef.current.forEach((star) => {
        star.alpha += star.twinkleSpeed * star.twinkleDirection;
        if (star.alpha >= 0.9 || star.alpha <= 0.1) {
          star.alpha = Math.max(0.1, Math.min(0.9, star.alpha));
          star.twinkleDirection *= -1;
        }
        ctx.fillStyle = `${baseStarColor}, ${star.alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Spawn Ocasional
      if (Math.random() < SHOOTING_STAR_FREQUENCY) spawnShootingStar(canvas);
      if (Math.random() < ASTEROID_FREQUENCY) spawnAsteroid(canvas);

      // 4. Atualizar e Desenhar Estrelas Cadentes
      // (...código anterior sem alterações...)
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.x += ss.vx;
        ss.y += ss.vy;
        return (
          ss.y < canvas.height + ss.length &&
          ss.x < canvas.width + ss.length &&
          ss.x > -ss.length
        );
      });
      shootingStarsRef.current.forEach((ss) => {
        const tailX =
          ss.x - (ss.vx * ss.length) / (Math.hypot(ss.vx, ss.vy) || 1); // Usar hypot para normalizar
        const tailY =
          ss.y - (ss.vy * ss.length) / (Math.hypot(ss.vx, ss.vy) || 1);
        const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.3, SHOOTING_STAR_TAIL_COLOR);
        gradient.addColorStop(1, SHOOTING_STAR_COLOR);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = ss.lineWidth;
        ctx.stroke();
        ctx.fillStyle = SHOOTING_STAR_COLOR;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.lineWidth * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Atualizar e Desenhar Asteroides (Atualizado)
      asteroidsRef.current = asteroidsRef.current.filter((ast) => {
        ast.x += ast.vx;
        ast.y += ast.vy;
        // ast.angle += ast.rotateSpeed; // Se adicionar rotação
        // Usa o maior raio possível para checar limites
        const maxRadius = ast.radius * (1 + ASTEROID_JAGGEDNESS);
        return (
          ast.x > -maxRadius - ast.trailLength &&
          ast.x < canvas.width + maxRadius + ast.trailLength &&
          ast.y > -maxRadius - ast.trailLength &&
          ast.y < canvas.height + maxRadius + ast.trailLength
        );
      });

      asteroidsRef.current.forEach((ast) => {
        // --- Desenhar Rastro do Asteroide (ANTES do corpo) ---
        const speedMagnitude = Math.hypot(ast.vx, ast.vy) || 1; // Evita divisão por zero
        const trailStartX = ast.x - (ast.vx * ast.trailLength) / speedMagnitude;
        const trailStartY = ast.y - (ast.vy * ast.trailLength) / speedMagnitude;

        const trailGradient = ctx.createLinearGradient(
          trailStartX,
          trailStartY,
          ast.x,
          ast.y,
        );
        trailGradient.addColorStop(0, "rgba(0,0,0,0)"); // Começa totalmente transparente
        trailGradient.addColorStop(0.8, ASTEROID_TAIL_COLOR); // Cor do rastro aparece mais perto

        ctx.beginPath();
        ctx.moveTo(trailStartX, trailStartY);
        ctx.lineTo(ast.x, ast.y); // Linha simples para o rastro
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = ast.radius * 0.3; // Rastro mais fino que o asteroide
        ctx.stroke();

        // --- Desenhar Corpo Irregular do Asteroide ---
        ctx.beginPath();
        // ctx.save(); // Necessário se for adicionar rotação
        // ctx.translate(ast.x, ast.y);
        // ctx.rotate(ast.angle);

        for (let i = 0; i < ASTEROID_VERTICES; i++) {
          const angle = (i / ASTEROID_VERTICES) * Math.PI * 2;
          // Calcula o raio para este vértice usando o offset salvo
          const currentRadius = ast.radius * ast.shapeOffsets[i];
          // Calcula a posição do vértice (relativa ao centro se usasse translate/rotate)
          const vertexX = ast.x + Math.cos(angle) * currentRadius;
          const vertexY = ast.y + Math.sin(angle) * currentRadius;
          // const vertexX = Math.cos(angle) * currentRadius; // Se usasse translate/rotate
          // const vertexY = Math.sin(angle) * currentRadius; // Se usasse translate/rotate

          if (i === 0) {
            ctx.moveTo(vertexX, vertexY);
          } else {
            ctx.lineTo(vertexX, vertexY);
          }
        }
        ctx.closePath(); // Fecha o polígono
        // ctx.restore(); // Necessário se usasse save/translate/rotate

        ctx.fillStyle = ASTEROID_COLOR;
        ctx.fill();
        // Opcional: adicionar uma borda sutil
        // ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        // ctx.lineWidth = 1;
        // ctx.stroke();
      });

      // 6. Agendar Próximo Quadro
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // --- Inicialização e Limpeza ---
    // (...código anterior sem alterações...)
    resizeCanvas();
    animate();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      isMounted = false;
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    starCount,
    starColor,
    backgroundColor,
    createStaticStars,
    spawnShootingStar,
    spawnAsteroid,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="background-canvas"
      style={{ background: backgroundColor }}
    />
  );
}
