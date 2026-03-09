import { useEffect } from 'react';

export function useTimeLighting() {
  useEffect(() => {
    const updateLighting = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInHours = hours + minutes / 60;

      let angle = 0;
      let intensity = 0.08;
      let elevation = 10; 

      // Simulate sun path from 6 AM to 6 PM
      if (timeInHours >= 6 && timeInHours <= 18) {
        const progress = (timeInHours - 6) / 12; 
        angle = (progress * 180) - 90; // -90 (left) to 90 (right)
        intensity = 0.04 + Math.sin(progress * Math.PI) * 0.06; // Peak at noon
        elevation = 5 + Math.sin(progress * Math.PI) * 20; // Higher at noon
      } else {
        // Night time lighting (ambient, top-down)
        angle = 0;
        intensity = 0.03;
        elevation = 5;
      }

      const radians = angle * (Math.PI / 180);
      const distance = 25 - elevation; 
      
      const x = Math.sin(radians) * distance;
      const y = Math.cos(radians) * distance;
      const blur = Math.abs(x) + Math.abs(y) + 12;

      const root = document.documentElement;
      root.style.setProperty('--light-x', `${x.toFixed(2)}px`);
      root.style.setProperty('--light-y', `${y.toFixed(2)}px`);
      root.style.setProperty('--shadow-blur', `${blur.toFixed(2)}px`);
      root.style.setProperty('--shadow-opacity', `${intensity.toFixed(3)}`);
      
      // Dynamic color temperature based on time
      let lightColor = '255, 255, 255';
      if (timeInHours >= 6 && timeInHours <= 9) {
        lightColor = '255, 240, 220'; // Morning sun (warm)
      } else if (timeInHours > 9 && timeInHours <= 15) {
        lightColor = '245, 250, 255'; // Noon sun (cool/white)
      } else if (timeInHours > 15 && timeInHours <= 18) {
        lightColor = '255, 225, 190'; // Evening sun (warm/orange)
      } else {
        lightColor = '220, 230, 255'; // Moonlight (cool/blue)
      }
      root.style.setProperty('--light-color', lightColor);
    };

    updateLighting();
    const interval = setInterval(updateLighting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
}
