/* ==========================================================================
   WeTalksy - Progress Dashboard & Animated Counters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. ANIMATED NUMERIC COUNTERS ON SCROLL
       ---------------------------------------------------------------------- */
    const statWords = document.getElementById('statWords');
    const statTime = document.getElementById('statTime');
    const statScore = document.getElementById('statScore');
    const statStreak = document.getElementById('statStreak');

    let animated = false;

    function animateValue(obj, start, end, duration, suffix = "") {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.innerHTML = value.toLocaleString() + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const progressSection = document.getElementById('progress');

    if (progressSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    animateValue(statWords, 0, 1280, 1600);
                    animateValue(statTime, 0, 42, 1400, "h");
                    animateValue(statScore, 0, 94, 1500, "%");
                    animateValue(statStreak, 0, 14, 1200);

                    // Animate progress bar widths
                    document.querySelectorAll('.progress-bar-inner').forEach(bar => {
                        const targetWidth = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 100);
                    });
                }
            });
        }, { threshold: 0.2 });

        observer.observe(progressSection);
    }
});
