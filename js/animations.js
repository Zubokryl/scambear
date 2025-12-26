/**
 * Animations Manager
 * Handles Tentacles, TV Interaction, and other visual effects
 */

class Animations {
    constructor() {
        this.initTentacles();
        this.initTVEyes();
        this.initCounters();
        this.initGlitchEffect();
    }

    initTentacles() {
        // Target ALL tentacle images, both foreground and background
        const tentacles = document.querySelectorAll('.tentacle-img');
        let time = 0;

        const animate = () => {
            time += 0.008; // Faster speed ("move a bit faster")

            tentacles.forEach((tentacle, index) => {
                const baseRot = index === 0 ? -10 : (index === 1 ? 10 : 0);
                const phase = index * 2;

                // Organic movement
                const wiggle = Math.sin(time + phase) * 4;
                const breathe = Math.cos(time * 0.4 + phase) * 8;

                // Continuous rotation component
                const drift = Math.sin(time * 0.3) * 5;

                tentacle.style.transform = `rotate(${baseRot + wiggle + drift}deg) translateY(${breathe}px) ${index === 1 ? 'scaleX(-1)' : ''}`;
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    initTVEyes() {
        // Disabled per user request (removed TV/eyes from focus)
        // Leaving logic commented if needed later
    }

    initCounters() {
        // Disabled stats per request, but keeping method in case of re-addition or other counters
        const counters = document.querySelectorAll('.counters');
        if (counters.length === 0) return;

        const speed = 200;

        // Intersection Observer to start animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');

                    const updateCount = () => {
                        const count = +counter.innerText;
                        const inc = target / speed;

                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 20);
                        } else {
                            counter.innerText = target;
                        }
                    }
                    updateCount();
                    observer.unobserve(counter);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    initGlitchEffect() {
        // Random glitch on title text occasionally (if class exists)
        // TV screen was removed, but we can glitch text if we want
        const glitchText = document.querySelector('.glitch');
        if (!glitchText) return;

        setInterval(() => {
            if (Math.random() > 0.9) {
                glitchText.style.textShadow = `2px 0 ${Math.random() > 0.5 ? 'red' : 'blue'}, -2px 0 yellow`;
                setTimeout(() => {
                    glitchText.style.textShadow = 'none';
                }, 100);
            }
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Animations();
});
