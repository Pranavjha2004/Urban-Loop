import { useEffect, useState } from "react";

function StarBackground() {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  // ⭐ Generate Dynamic Twinkling Stars
  useEffect(() => {
    const starArray = [];
    for (let i = 0; i < 180; i++) {
      starArray.push({
        id: i,
        size: Math.random() * 2 + 0.5,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      });
    }
    setStars(starArray);
  }, []);

  // 🌠 More Frequent Shooting Stars
  useEffect(() => {
    const interval = setInterval(() => {
      const newStar = {
        id: Date.now() + Math.random(),
        top: Math.random() * 60,
        left: Math.random() * 100,
        duration: Math.random() * 0.8 + 0.6,
      };

      setShootingStars((prev) => [...prev, newStar]);

      setTimeout(() => {
        setShootingStars((prev) =>
          prev.filter((star) => star.id !== newStar.id)
        );
      }, 1500);
    }, 1200); // 🔥 increased frequency

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* ✨ Dynamic Twinkling Stars */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute bg-white rounded-full star"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* 🌠 Shooting Streaks */}
      {shootingStars.map((star) => (
        <span
          key={star.id}
          className="absolute shooting-star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default StarBackground;