import { useEffect, useRef } from "react";

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    
    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 150
    };

    const resize = () => {
      // Set canvas size to window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Listen for mouse movement on the window to track everywhere
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    
    // Reset mouse when it leaves window
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      baseSize: number;
      size: number;
      density: number;
      vx: number;
      vy: number;
      breathePhase: number;
      breatheSpeed: number;

      constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.baseSize = size;
        this.size = size;
        this.density = (Math.random() * 30) + 1;
        // Random velocity for slow drifting
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        
        // Breathing animation properties
        this.breathePhase = Math.random() * Math.PI * 2;
        this.breatheSpeed = (Math.random() * 0.02) + 0.01;
      }

      draw() {
        if (!ctx) return;
        
        // Calculate breathing opacity (0.2 to 0.6)
        const opacity = 0.4 + Math.sin(this.breathePhase) * 0.2;
        
        ctx.fillStyle = `rgba(94, 106, 210, ${opacity})`; // Brand indigo #5e6ad2
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        if (!canvas) return;
        
        // Calculate breathing size (varies by +/- 30% of base size)
        this.breathePhase += this.breatheSpeed;
        this.size = this.baseSize + Math.sin(this.breathePhase) * (this.baseSize * 0.3);
        
        // Drift
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges smoothly
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse interaction (dodging effect like antigravity)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          // Calculate push vector
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;
          
          this.x -= directionX;
          this.y -= directionY;
        }

        this.draw();
      }
    }

    const init = () => {
      particles = [];
      // Calculate amount of particles based on screen size
      let numberOfParticles = (canvas.width * canvas.height) / 7000; 
      // Cap particles to prevent performance issues
      if (numberOfParticles > 200) numberOfParticles = 200; 
      
      for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 2.5) + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y, size));
      }
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };



    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
