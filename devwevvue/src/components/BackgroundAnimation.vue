<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

// --- Props com Valores Padrão ---
// Usando defineProps e withDefaults para definir props e seus valores padrão
const props = defineProps({
    starCount: {
        type: Number,
        default: 1000,
    },
    starColor: {
        type: String,
        default: "rgba(255, 255, 255, 0.8)",
    },
    backgroundColor: {
        type: String,
        default: "linear-gradient(to bottom, #00000c, #0f0f2e, #1a1a4a)",
    },
    // Poderíamos adicionar as outras constantes como props também se quiséssemos
});

// --- Constantes Configuráveis Internas ---
const SHOOTING_STAR_FREQUENCY = 0.0055;
const ASTEROID_FREQUENCY = 0.0012;
const SHOOTING_STAR_COLOR = "rgba(255, 255, 255, 0.9)";
const SHOOTING_STAR_TAIL_COLOR = "rgba(255, 255, 255, 0.4)";
const ASTEROID_COLOR = "rgba(200, 180, 160, 0.95)";
const ASTEROID_TAIL_COLOR = "rgba(200, 180, 160, 0.3)";
const ASTEROID_VERTICES = 10;
const ASTEROID_JAGGEDNESS = 0.4;
const ASTEROID_TRAIL_LENGTH_FACTOR = 2.5;

// --- Refs ---
const canvasRef = ref(null); // Ref para o elemento canvas no template
const animationFrameId = ref(null); // Para guardar o ID da animação
const stars = ref([]); // Array reativo para estrelas estáticas
const shootingStars = ref([]); // Array reativo para estrelas cadentes
const asteroids = ref([]); // Array reativo para asteróides

// --- Funções de Lógica (definidas dentro do setup) ---

const createStaticStars = (canvas) => {
    const newStars = [];
    for (let i = 0; i < props.starCount; i++) {
        // Usa props.starCount
        newStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.5 + 0.2,
            twinkleSpeed: Math.random() * 0.015 + 0.002,
            twinkleDirection: Math.random() < 0.5 ? 1 : -1,
        });
    }
    stars.value = newStars; // Atualiza o valor do ref
};

const spawnShootingStar = (canvas) => {
    const speed = Math.random() * 5 + 5;
    const angle = Math.PI / 4 + (Math.random() * Math.PI) / 6;
    const startX = Math.random() * canvas.width * 0.8;
    const startY = -10;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    // Adiciona ao array usando .value
    shootingStars.value.push({
        x: startX,
        y: startY,
        vx,
        vy,
        length: Math.random() * 80 + 50,
        lineWidth: Math.random() * 1.5 + 0.5,
    });
};

const spawnAsteroid = (canvas) => {
    const speed = Math.random() * 0.8 + 0.3;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + 6;
    const shapeOffsets = [];
    for (let i = 0; i < ASTEROID_VERTICES; i++) {
        const offsetFactor =
            1 - ASTEROID_JAGGEDNESS + Math.random() * ASTEROID_JAGGEDNESS * 2;
        shapeOffsets.push(offsetFactor);
    }
    let startX, startY;
    const edge = Math.floor(Math.random() * 4);
    const maxOffsetRadius = radius * (1 + ASTEROID_JAGGEDNESS);
    if (edge === 0) {
        startX = Math.random() * canvas.width;
        startY = -maxOffsetRadius;
    } else if (edge === 1) {
        startX = canvas.width + maxOffsetRadius;
        startY = Math.random() * canvas.height;
    } else if (edge === 2) {
        startX = Math.random() * canvas.width;
        startY = canvas.height + maxOffsetRadius;
    } else {
        startX = -maxOffsetRadius;
        startY = Math.random() * canvas.height;
    }

    // Adiciona ao array usando .value
    asteroids.value.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: radius,
        shapeOffsets: shapeOffsets,
        trailLength: radius * ASTEROID_TRAIL_LENGTH_FACTOR,
    });
};

// --- Animação e Ciclo de Vida ---

let ctx = null; // Variável para o contexto fora do loop principal

const animate = () => {
    if (!ctx || !canvasRef.value) return; // Verifica se o contexto e o canvas existem

    const canvas = canvasRef.value;
    // 1. Limpar Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Desenhar Estrelas Estáticas
    const baseStarColor = props.starColor.substring(
        0,
        props.starColor.lastIndexOf(","),
    );
    stars.value.forEach((star) => {
        // Acessa via .value
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
    shootingStars.value = shootingStars.value.filter((ss) => {
        // Reatribui o resultado do filter a .value
        ss.x += ss.vx;
        ss.y += ss.vy;
        return (
            ss.y < canvas.height + ss.length &&
            ss.x < canvas.width + ss.length &&
            ss.x > -ss.length
        );
    });
    shootingStars.value.forEach((ss) => {
        const speedMagnitude = Math.hypot(ss.vx, ss.vy) || 1;
        const tailX = ss.x - (ss.vx * ss.length) / speedMagnitude;
        const tailY = ss.y - (ss.vy * ss.length) / speedMagnitude;
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

    // 5. Atualizar e Desenhar Asteroides
    asteroids.value = asteroids.value.filter((ast) => {
        // Reatribui o resultado do filter a .value
        ast.x += ast.vx;
        ast.y += ast.vy;
        const maxRadius = ast.radius * (1 + ASTEROID_JAGGEDNESS);
        return (
            ast.x > -maxRadius - ast.trailLength &&
            ast.x < canvas.width + maxRadius + ast.trailLength &&
            ast.y > -maxRadius - ast.trailLength &&
            ast.y < canvas.height + maxRadius + ast.trailLength
        );
    });
    asteroids.value.forEach((ast) => {
        // Rastro
        const speedMagnitude = Math.hypot(ast.vx, ast.vy) || 1;
        const trailStartX = ast.x - (ast.vx * ast.trailLength) / speedMagnitude;
        const trailStartY = ast.y - (ast.vy * ast.trailLength) / speedMagnitude;
        const trailGradient = ctx.createLinearGradient(
            trailStartX,
            trailStartY,
            ast.x,
            ast.y,
        );
        trailGradient.addColorStop(0, "rgba(0,0,0,0)");
        trailGradient.addColorStop(0.8, ASTEROID_TAIL_COLOR);
        ctx.beginPath();
        ctx.moveTo(trailStartX, trailStartY);
        ctx.lineTo(ast.x, ast.y);
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = ast.radius * 0.3;
        ctx.stroke();
        // Corpo
        ctx.beginPath();
        for (let i = 0; i < ASTEROID_VERTICES; i++) {
            const angle = (i / ASTEROID_VERTICES) * Math.PI * 2;
            const currentRadius = ast.radius * ast.shapeOffsets[i];
            const vertexX = ast.x + Math.cos(angle) * currentRadius;
            const vertexY = ast.y + Math.sin(angle) * currentRadius;
            if (i === 0) {
                ctx.moveTo(vertexX, vertexY);
            } else {
                ctx.lineTo(vertexX, vertexY);
            }
        }
        ctx.closePath();
        ctx.fillStyle = ASTEROID_COLOR;
        ctx.fill();
    });

    // 6. Agendar Próximo Quadro
    animationFrameId.value = requestAnimationFrame(animate);
};

const resizeCanvas = () => {
    if (!canvasRef.value) return;
    const canvas = canvasRef.value;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Limpa/recria
    if (canvas && ctx) {
        // Garante que o contexto existe antes de recriar
        createStaticStars(canvas);
        shootingStars.value = [];
        asteroids.value = [];
    }
};

// --- Hooks de Ciclo de Vida ---
onMounted(() => {
    if (canvasRef.value) {
        ctx = canvasRef.value.getContext("2d"); // Obtém o contexto aqui
        if (ctx) {
            resizeCanvas(); // Configura tamanho e estrelas iniciais
            animate(); // Inicia a animação
            window.addEventListener("resize", resizeCanvas);
        } else {
            console.error("Não foi possível obter o contexto 2D do canvas.");
        }
    } else {
        console.error("Elemento Canvas não encontrado.");
    }
});

onUnmounted(() => {
    // Limpeza
    window.removeEventListener("resize", resizeCanvas);
    if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
    }
    // Limpa referências se necessário (boa prática)
    stars.value = [];
    shootingStars.value = [];
    asteroids.value = [];
    ctx = null;
});

// Opcional: Observar a prop starCount para recriar as estrelas se ela mudar
// watch(() => props.starCount, (newCount, oldCount) => {
//   if (canvasRef.value && ctx) {
//     createStaticStars(canvasRef.value);
//   }
// });
</script>

<template>
    <canvas
        ref="canvasRef"
        class="background-canvas"
        :style="{ background: backgroundColor }"
    ></canvas>
</template>

<style scoped>
/* Copie ou importe os estilos CSS do .background-canvas aqui */
.background-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1; /* Coloca atrás de todo o conteúdo */
    display: block; /* Evita espaços extras */
    /* O background pode ser definido aqui ou via prop/style inline */
}
</style>
