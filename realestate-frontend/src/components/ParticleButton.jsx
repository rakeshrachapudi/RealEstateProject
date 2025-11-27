import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ParticleButton = ({
  children,
  onClick,
  className = "",
  particleColor = "#1a1a1a",
}) => {
  const [particles, setParticles] = useState([]);
  const [key, setKey] = useState(0);

  const createParticles = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 10 }, (_, i) => {
      const angle = (360 / 10) * i;
      const velocity = 40 + Math.random() * 20;

      return {
        id: `${Date.now()}-${i}`,
        x,
        y,
        angle,
        velocity,
      };
    });

    setParticles(newParticles);
    setKey((prev) => prev + 1);

    setTimeout(() => setParticles([]), 600);

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={createParticles}
      whileTap={{ scale: 0.96 }}
    >
      {children}

      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={`${key}-${particle.id}`}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particleColor,
            }}
            initial={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: 0,
              scale: 0,
              x: Math.cos((particle.angle * Math.PI) / 180) * particle.velocity,
              y: Math.sin((particle.angle * Math.PI) / 180) * particle.velocity,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

export default ParticleButton;
