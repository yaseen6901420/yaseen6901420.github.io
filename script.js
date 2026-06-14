document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Generic Slider / Carousel Controller
    // ==========================================
    function createSlider({ trackId, prevId, nextId, dotsId, filterSelector = null }) {
        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        const dotsContainer = document.getElementById(dotsId);

        if (!track || !prevBtn || !nextBtn || !dotsContainer) return null;

        let currentIndex = 0;
        let slides = [];

        function getVisibleSlides() {
            const allSlides = Array.from(track.querySelectorAll('.slider-slide'));
            if (filterSelector) {
                return allSlides.filter(slide => !slide.classList.contains('hide'));
            }
            return allSlides;
        }

        function updateSliderPosition() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        }

        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function setupSlider() {
            slides = getVisibleSlides();
            currentIndex = 0;
            
            // Clear existing dots
            dotsContainer.innerHTML = '';

            // If 1 or 0 slides are visible, hide navigation
            const wrapper = track.closest('.slider-outer-wrapper');
            if (slides.length <= 1) {
                if (wrapper) wrapper.classList.add('no-nav');
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                dotsContainer.style.display = 'none';
            } else {
                if (wrapper) wrapper.classList.remove('no-nav');
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
                dotsContainer.style.display = 'flex';

                // Generate dots
                slides.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'slider-dot';
                    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                    dot.addEventListener('click', () => {
                        currentIndex = index;
                        updateSliderPosition();
                    });
                    dotsContainer.appendChild(dot);
                });
            }

            // Adjust width of all slides to be 100% of the viewport container
            slides.forEach((slide, idx) => {
                slide.style.width = `${track.clientWidth}px`;
            });

            updateSliderPosition();
        }

        // Event listeners
        nextBtn.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // wrap around
            }
            updateSliderPosition();
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - 1; // wrap around
            }
            updateSliderPosition();
        });

        // Initialize
        setupSlider();

        // Handle resize events
        window.addEventListener('resize', () => {
            setupSlider();
        });

        return {
            refresh: setupSlider
        };
    }

    // Initialize Awards Slider (unfiltered)
    createSlider({
        trackId: 'awards-slider-track',
        prevId: 'awards-prev',
        nextId: 'awards-next',
        dotsId: 'awards-slider-dots'
    });

    // Initialize Projects Slider (filtered)
    const projectsSlider = createSlider({
        trackId: 'projects-slider-track',
        prevId: 'projects-prev',
        nextId: 'projects-next',
        dotsId: 'projects-slider-dots',
        filterSelector: '.project-card-wrapper'
    });

    // ==========================================
    // Project Filtering Logic
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectSlides = document.querySelectorAll('.project-card-wrapper');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectSlides.forEach(slide => {
                const categories = slide.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    slide.classList.remove('hide');
                    slide.style.display = 'block';
                } else {
                    slide.classList.add('hide');
                    slide.style.display = 'none';
                }
            });

            // Refresh the slider dimensions and pagination dots for visible slides
            if (projectsSlider) {
                projectsSlider.refresh();
            }
        });
    });

    // ==========================================
    // Scroll Animation Observer (Fade-In)
    // ==========================================
    const animElements = document.querySelectorAll('.scroll-anim');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.01
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animElements.forEach(el => observer.observe(el));
    } else {
        animElements.forEach(el => el.classList.add('active'));
    }

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.style.opacity = '1';
    }

    // ==========================================
    // Interactive Canvas Background
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let dpr = window.devicePixelRatio || 1;
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        
        // Track pointer globally (mouse + touch)
        const mouse = { x: null, y: null };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        // Touch support for mobile — owl reacts to finger position
        window.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            mouse.x = t.clientX;
            mouse.y = t.clientY;
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            mouse.x = t.clientX;
            mouse.y = t.clientY;
        }, { passive: true });
        window.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        }, { passive: true });

        // Responsive position definitions
        let atom1 = { baseX: width * 0.82, baseY: height * 0.22, x: width * 0.82, y: height * 0.22, rx: 75, ry: 26, hover: false };
        let atom2 = { baseX: width * 0.15, baseY: height * 0.72, x: width * 0.15, y: height * 0.72, rx: 65, ry: 22, hover: false };
        let computer = { baseX: width * 0.86, baseY: height * 0.78, x: width * 0.86, y: height * 0.78, w: 90, h: 65, hover: false };

        let snowSparkles = [];
        let owl = {
            x: Math.max(95, width * 0.10),
            y: height * 0.65,
            baseX: Math.max(95, width * 0.10),
            baseY: height * 0.65,
            eyesOpen: false,
            blinkTimer: Math.random() * 4000 + 2000,
            blinkDuration: 0,
            headTilt: 0,
            targetHeadTilt: 0,
            pupilX: 0,
            pupilY: 0,
            wingFlare: 0,
            targetWingFlare: 0,
            dialogueOpacity: 0
        };

        // Track stars for cosmic background
        let stars = [];
        function initStars() {
            stars = [];
            for (let i = 0; i < 45; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 1.6 + 0.4,
                    opacity: Math.random() * 0.5 + 0.1,
                    speed: Math.random() * 0.015 + 0.005
                });
            }
        }
        initStars();

        function updateDimensions() {
            dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(dpr, dpr);
            
            // active flag removed — animations run on all screen sizes

            atom1.baseX = width * 0.82;
            atom1.baseY = height * 0.22;
            atom2.baseX = width * 0.15;
            atom2.baseY = height * 0.72;
            
            computer.baseX = width * 0.86;
            computer.baseY = height * 0.78;

            owl.baseX = Math.max(95, width * 0.10);
            owl.baseY = height * 0.65;

            isMobile = width <= 768;
            initStars();
        }

        window.addEventListener('resize', updateDimensions);

        let codeLines = [
            { w: 30, maxW: 50 },
            { w: 15, maxW: 40 },
            { w: 45, maxW: 65 },
            { w: 20, maxW: 35 }
        ];

        let isMobile = width <= 768;

        function animate(time) {

            ctx.clearRect(0, 0, width, height);

            // Draw twinkling stars for the cosmic universe feel
            stars.forEach(star => {
                star.opacity += star.speed;
                if (star.opacity > 0.8 || star.opacity < 0.15) {
                    star.speed = -star.speed;
                }
                ctx.fillStyle = `rgba(245, 166, 35, ${star.opacity * 0.45})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });



            // Update & Draw Majestic Perched Owl (Hedwig) on the left branch
            // On mobile: draw at 45% scale in the top-left corner, dialogue hidden
            let owlScale = isMobile ? 0.45 : 1.0;
            let scaledBaseX = isMobile ? Math.max(40, width * 0.08) : owl.baseX;
            let scaledBaseY = isMobile ? height * 0.22 : owl.baseY;
            owl.x = scaledBaseX;
            owl.y = scaledBaseY;

            let owlDist = 9999;
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - owl.x;
                let dy = mouse.y - owl.y;
                owlDist = Math.sqrt(dx * dx + dy * dy);
            }

            // Blink state logic
            owl.blinkTimer -= 16.67;
            if (owl.blinkTimer <= 0) {
                owl.blinkDuration = 10; // Blink lasts 10 frames
                owl.blinkTimer = Math.random() * 5000 + 3000;
            }
            if (owl.blinkDuration > 0) {
                owl.blinkDuration--;
            }

            let isBlinking = owl.blinkDuration > 0;

            if (owlDist < 180) {
                owl.eyesOpen = true;
                let dx = mouse.x - owl.x;
                let dy = mouse.y - (owl.y - 36); // Head center is at y - 36
                let angle = Math.atan2(dy, dx);
                owl.targetHeadTilt = Math.max(-0.45, Math.min(0.45, angle));
                
                // Pupils track mouse
                let pDist = Math.min(2.8, owlDist * 0.022);
                owl.pupilX = Math.cos(angle) * pDist;
                owl.pupilY = Math.sin(angle) * pDist;
                owl.targetWingFlare = 0.32; // flare wings
            } else {
                owl.eyesOpen = false;
                owl.targetHeadTilt = 0;
                owl.pupilX = 0;
                owl.pupilY = 0;
                owl.targetWingFlare = 0.05; // close wings
            }

            owl.headTilt += (owl.targetHeadTilt - owl.headTilt) * 0.08;
            owl.wingFlare += (owl.targetWingFlare - owl.wingFlare) * 0.08;

            // Spawn magical snowy sparkles around Hedwig when active
            if (owl.eyesOpen && !isBlinking && Math.random() < 0.12) {
                snowSparkles.push({
                    x: owl.x + (Math.random() - 0.5) * 60,
                    y: owl.y - 60 + Math.random() * 90,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: Math.random() * 0.7 + 0.3, // drifts down
                    size: Math.random() * 2 + 1,
                    opacity: 1.0,
                    life: Math.random() * 40 + 40
                });
            }

            // Update & Draw snowSparkles
            for (let i = snowSparkles.length - 1; i >= 0; i--) {
                let s = snowSparkles[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life--;
                s.opacity = s.life / 80;
                ctx.fillStyle = `rgba(246, 238, 227, ${s.opacity * 0.45})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                if (s.life <= 0) {
                    snowSparkles.splice(i, 1);
                }
            }

            ctx.lineWidth = 1;
            ctx.setLineDash([]);

            // Scale owl drawing for mobile: pivot around owl position
            ctx.save();
            ctx.translate(owl.x, owl.y);
            ctx.scale(owlScale, owlScale);
            ctx.translate(-owl.x, -owl.y);

            // 1. Tree branch extending from the left edge (detailed woodcut style)
            ctx.strokeStyle = 'rgba(211, 84, 0, 0.14)'; // warm orange border
            ctx.lineWidth = 5.2;
            ctx.beginPath();
            ctx.moveTo(0, owl.y + 44);
            ctx.lineTo(owl.x + 45, owl.y + 44);
            ctx.stroke();

            // Inner wood grain detail lines on branch
            ctx.strokeStyle = 'rgba(159, 140, 125, 0.08)'; // --text-muted
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(0, owl.y + 41);
            ctx.lineTo(owl.x + 45, owl.y + 41);
            ctx.moveTo(0, owl.y + 47);
            ctx.lineTo(owl.x + 42, owl.y + 47);
            ctx.stroke();

            // Side twigs branching off
            ctx.strokeStyle = 'rgba(211, 84, 0, 0.14)';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            // Down-left twig
            ctx.moveTo(owl.x - 18, owl.y + 44);
            ctx.quadraticCurveTo(owl.x - 30, owl.y + 56, owl.x - 46, owl.y + 54);
            // Up-right twig
            ctx.moveTo(owl.x + 20, owl.y + 44);
            ctx.quadraticCurveTo(owl.x + 36, owl.y + 32, owl.x + 58, owl.y + 35);
            ctx.stroke();

            // Leaves helper
            let drawCaricatureLeaf = (lx, ly, rot, size) => {
                ctx.save();
                ctx.translate(lx, ly);
                ctx.rotate(rot);
                ctx.scale(size, size);
                ctx.fillStyle = 'rgba(211, 84, 0, 0.04)'; // warm orange highlight
                ctx.strokeStyle = 'rgba(211, 84, 0, 0.2)';
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-5, -8, 0, -16);
                ctx.quadraticCurveTo(5, -8, 0, 0);
                ctx.fill();
                ctx.stroke();
                // vein
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -14);
                ctx.stroke();
                ctx.restore();
            };

            // Draw branch leaves
            drawCaricatureLeaf(owl.x - 32, owl.y + 52, -1.8, 0.85);
            drawCaricatureLeaf(owl.x - 43, owl.y + 54, -2.4, 0.75);
            drawCaricatureLeaf(owl.x + 36, owl.y + 36, 0.8, 0.85);
            drawCaricatureLeaf(owl.x + 50, owl.y + 34, 1.2, 0.75);

            // 2. Claws (charcoal grey claws clutching the branch)
            ctx.fillStyle = 'rgba(21, 13, 10, 0.45)'; // dark coffee
            ctx.strokeStyle = 'rgba(211, 84, 0, 0.3)'; // orange outline
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Left foot: 2 toes
            ctx.ellipse(owl.x - 11, owl.y + 42, 3.8, 7.5, 0, 0, Math.PI * 2);
            ctx.ellipse(owl.x - 5, owl.y + 42, 3.8, 7.5, 0, 0, Math.PI * 2);
            // Right foot: 2 toes
            ctx.ellipse(owl.x + 5, owl.y + 42, 3.8, 7.5, 0, 0, Math.PI * 2);
            ctx.ellipse(owl.x + 11, owl.y + 42, 3.8, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 3. Tail feathers (cozy cream tail swaying gently)
            let tailSway = Math.sin(time * 0.0025) * 4;
            ctx.save();
            ctx.translate(owl.x, owl.y + 42);
            for (let i = -1; i <= 1; i++) {
                let rot = i * 0.25 + tailSway * 0.02;
                let tx = i * 7.5;
                let ty = Math.abs(i) * 2.5;
                ctx.save();
                ctx.translate(tx, ty);
                ctx.rotate(rot);
                ctx.fillStyle = 'rgba(246, 238, 227, 0.22)';
                ctx.strokeStyle = 'rgba(211, 84, 0, 0.2)';
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-5, 6, 0, 18);
                ctx.quadraticCurveTo(5, 6, 0, 0);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();

            // 4. Body (large round Snowy Owl body shape)
            ctx.fillStyle = 'rgba(246, 238, 227, 0.28)'; // cream white base
            ctx.strokeStyle = 'rgba(246, 238, 227, 0.14)'; // soft border
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.ellipse(owl.x, owl.y + 10, 28, 38, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 4b. Body breast markings (Hedwig chevrons in deep coffee brown)
            ctx.strokeStyle = 'rgba(21, 13, 10, 0.25)'; // --bg-primary
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            let drawChevron = (cx, cy) => {
                ctx.moveTo(cx - 3.5, cy - 2); ctx.lineTo(cx, cy); ctx.lineTo(cx + 3.5, cy - 2);
            };
            drawChevron(owl.x - 14, owl.y - 6);
            drawChevron(owl.x - 5, owl.y - 9);
            drawChevron(owl.x + 5, owl.y - 9);
            drawChevron(owl.x + 14, owl.y - 6);
            
            drawChevron(owl.x - 19, owl.y + 6);
            drawChevron(owl.x - 9, owl.y + 5);
            drawChevron(owl.x + 9, owl.y + 5);
            drawChevron(owl.x + 19, owl.y + 6);
            
            drawChevron(owl.x - 14, owl.y + 20);
            drawChevron(owl.x - 4, owl.y + 19);
            drawChevron(owl.x + 4, owl.y + 19);
            drawChevron(owl.x + 14, owl.y + 20);

            drawChevron(owl.x - 6, owl.y + 31);
            drawChevron(owl.x + 6, owl.y + 31);
            ctx.stroke();

            // 5. Wings (rotated dynamically for flaring effect)
            // Left Wing
            ctx.save();
            ctx.translate(owl.x - 26, owl.y + 10);
            ctx.rotate(-owl.wingFlare);
            ctx.fillStyle = 'rgba(220, 208, 192, 0.24)';
            ctx.strokeStyle = 'rgba(246, 238, 227, 0.14)';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.ellipse(0, 16, 8, 28, -0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Wing spots
            ctx.fillStyle = 'rgba(21, 13, 10, 0.2)';
            ctx.fillRect(-2.5, 8, 1.8, 1.8);
            ctx.fillRect(-1.5, 18, 1.8, 1.8);
            ctx.restore();

            // Right Wing
            ctx.save();
            ctx.translate(owl.x + 26, owl.y + 10);
            ctx.rotate(owl.wingFlare);
            ctx.fillStyle = 'rgba(220, 208, 192, 0.24)';
            ctx.strokeStyle = 'rgba(246, 238, 227, 0.14)';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.ellipse(0, 16, 8, 28, 0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Wing spots
            ctx.fillStyle = 'rgba(21, 13, 10, 0.2)';
            ctx.fillRect(1.5, 8, 1.8, 1.8);
            ctx.fillRect(0.5, 18, 1.8, 1.8);
            ctx.restore();

            // 6. Head (Rotated for tilt - Snowy Owl chubby round head)
            ctx.save();
            ctx.translate(owl.x, owl.y - 36);
            ctx.rotate(owl.headTilt);

            // Head shape (large round circle)
            ctx.fillStyle = 'rgba(246, 238, 227, 0.3)'; // cream white
            ctx.strokeStyle = 'rgba(246, 238, 227, 0.16)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Facial disks (Two large overlapping circles for character)
            ctx.strokeStyle = 'rgba(159, 140, 125, 0.18)'; // --text-muted
            ctx.lineWidth = 1;
            ctx.fillStyle = 'rgba(251, 249, 246, 0.12)'; // frothy milk
            
            ctx.beginPath();
            ctx.arc(-10, -4, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(10, -4, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Eyes
            if (owl.eyesOpen && !isBlinking) {
                // Striking yellow/amber irises
                ctx.fillStyle = 'rgba(245, 166, 35, 0.62)'; // --accent-gold
                ctx.beginPath();
                ctx.arc(-10, -4, 7, 0, Math.PI * 2);
                ctx.arc(10, -4, 7, 0, Math.PI * 2);
                ctx.fill();

                // Pupils (large black pupils)
                ctx.fillStyle = 'rgba(21, 13, 10, 0.9)'; // --bg-primary
                ctx.beginPath();
                ctx.arc(-10 + owl.pupilX, -4 + owl.pupilY, 3.8, 0, Math.PI * 2);
                ctx.arc(10 + owl.pupilX, -4 + owl.pupilY, 3.8, 0, Math.PI * 2);
                ctx.fill();

                // Sparkle eye highlights (double white reflection dots)
                ctx.fillStyle = 'rgba(251, 249, 246, 0.85)';
                ctx.beginPath();
                // Left eye highlights
                ctx.arc(-11.5 + owl.pupilX * 0.7, -5.5 + owl.pupilY * 0.7, 1.3, 0, Math.PI * 2);
                ctx.arc(-8.5 + owl.pupilX * 0.7, -2.5 + owl.pupilY * 0.7, 0.6, 0, Math.PI * 2);
                // Right eye highlights
                ctx.arc(8.5 + owl.pupilX * 0.7, -5.5 + owl.pupilY * 0.7, 1.3, 0, Math.PI * 2);
                ctx.arc(11.5 + owl.pupilX * 0.7, -2.5 + owl.pupilY * 0.7, 0.6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Closed sleeping eyes / blinking slits
                ctx.strokeStyle = 'rgba(21, 13, 10, 0.45)'; // charcoal
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(-10, -4, 5, 0.08 * Math.PI, 0.92 * Math.PI, false);
                ctx.arc(10, -4, 5, 0.08 * Math.PI, 0.92 * Math.PI, false);
                ctx.stroke();
            }

            // 7. Thick horn-rimmed square nerd glasses (drawn first so beak sits on top)
            ctx.strokeStyle = 'rgba(21, 13, 10, 0.88)'; // dark espresso horn-rimmed
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'miter';

            // Arched bridge
            ctx.beginPath();
            ctx.moveTo(-3, -5);
            ctx.quadraticCurveTo(0, -7, 3, -5);
            ctx.stroke();

            // Helper to draw rounded square lenses
            let drawNerdLens = (lx, ly, size, radius) => {
                let half = size / 2;
                ctx.beginPath();
                ctx.moveTo(lx - half + radius, ly - half);
                ctx.lineTo(lx + half - radius, ly - half);
                ctx.quadraticCurveTo(lx + half, ly - half, lx + half, ly - half + radius);
                ctx.lineTo(lx + half, ly + half - radius);
                ctx.quadraticCurveTo(lx + half, ly + half, lx + half - radius, ly + half);
                ctx.lineTo(lx - half + radius, ly + half);
                ctx.quadraticCurveTo(lx - half, ly + half, lx - half, ly + half - radius);
                ctx.lineTo(lx - half, ly - half + radius);
                ctx.quadraticCurveTo(lx - half, ly - half, lx - half + radius, ly - half);
                ctx.closePath();
                ctx.stroke();
            };

            // Two large square rims
            drawNerdLens(-10.5, -4, 19, 3.5);
            drawNerdLens(10.5, -4, 19, 3.5);

            // Left and right side temples
            ctx.beginPath();
            ctx.moveTo(-20, -5);
            ctx.lineTo(-25, -6);
            ctx.moveTo(20, -5);
            ctx.lineTo(25, -6);
            ctx.stroke();

            // 8. Beak (drawn on top of the glasses so it sits over the bridge!)
            ctx.fillStyle = 'rgba(21, 13, 10, 0.78)';
            ctx.beginPath();
            ctx.moveTo(-2, -2);
            ctx.lineTo(2, -2);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();

            // Warm candlelight gold highlight along the beak ridge for 3D contrast
            ctx.strokeStyle = 'rgba(245, 166, 35, 0.55)'; // --accent-gold
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-0.8, -1);
            ctx.lineTo(0, 2.5);
            ctx.stroke();

            // Cozy Hogwarts Scarf around the neck
            // 1. Scarf neck wrap (ellipse overlapping the neck)
            ctx.fillStyle = 'rgba(211, 84, 0, 0.5)'; // --accent-red (stripes red base)
            ctx.beginPath();
            ctx.ellipse(0, 22, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Scarf gold stripes
            ctx.strokeStyle = 'rgba(245, 166, 35, 0.5)'; // --accent-gold
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-11, 20); ctx.lineTo(-11, 24);
            ctx.moveTo(-5, 21);  ctx.lineTo(-5, 25);
            ctx.moveTo(5, 21);   ctx.lineTo(5, 25);
            ctx.moveTo(11, 20);  ctx.lineTo(11, 24);
            ctx.stroke();

            // 2. Scarf tail hanging down blowing in breeze
            ctx.save();
            ctx.translate(-8, 22);
            ctx.rotate(0.25 + Math.sin(time * 0.0035) * 0.12);
            // Red tail cloth
            ctx.fillStyle = 'rgba(211, 84, 0, 0.5)';
            ctx.beginPath();
            ctx.moveTo(-3.5, 0);
            ctx.lineTo(3.5, 0);
            ctx.lineTo(3, 16);
            ctx.lineTo(-3, 16);
            ctx.closePath();
            ctx.fill();
            // Gold stripe on tail
            ctx.fillStyle = 'rgba(245, 166, 35, 0.5)';
            ctx.fillRect(-3, 5, 6, 3);
            // Scarf fringes
            ctx.strokeStyle = 'rgba(245, 166, 35, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-2, 16); ctx.lineTo(-2, 19);
            ctx.moveTo(0, 16);    ctx.lineTo(0, 19);
            ctx.moveTo(2, 16);  ctx.lineTo(2, 19);
            ctx.stroke();
            ctx.restore();

            ctx.restore();

            ctx.restore(); // end owlScale transform

            // Update dialogue bubble opacity based on mouse hover
            if (owlDist < 180) {
                owl.dialogueOpacity += (1.0 - owl.dialogueOpacity) * 0.1;
            } else {
                owl.dialogueOpacity += (0 - owl.dialogueOpacity) * 0.15;
            }

            // Dialogue cloud: only show on desktop (hidden on mobile to avoid covering text)
            if (!isMobile && owl.dialogueOpacity > 0.015) {
                let bw = 220;
                let bh = 220;
                let bx = Math.max(12, owl.x - bw / 2);
                let by = owl.y - 302;
                let op = owl.dialogueOpacity;

                // Cartoon cloud speech bubble helper (unified path for circular cloud bumps + tail)
                let drawCloudBubble = (x, y, w, h) => {
                    let cx = x + w / 2;
                    let cy = y + h / 2;
                    let r = w / 2;
                    let numBumps = 8;
                    let bumpH = 8; // puffiness height

                    ctx.beginPath();
                    let startAngle = -Math.PI / 8;
                    
                    for (let i = 0; i < numBumps; i++) {
                        let a1 = startAngle + i * (Math.PI / 4);
                        let a2 = a1 + (Math.PI / 4);
                        
                        // Replace segment 2 (centered at PI/2, i.e. 90 degrees) with the downward pointer tail
                        if (i === 2) {
                            let tx1 = cx + r * Math.cos(a1);
                            let ty1 = cy + r * Math.sin(a1);
                            let tx2 = cx + r * Math.cos(a2);
                            let ty2 = cy + r * Math.sin(a2);
                            
                            ctx.lineTo(tx1, ty1);
                            // Tail tip lands exactly on top of Hedwig's head at y + h + 20
                            ctx.quadraticCurveTo(owl.x + 10, y + h + 8, owl.x, y + h + 20);
                            ctx.quadraticCurveTo(owl.x - 10, y + h + 8, tx2, ty2);
                        } else {
                            let midA = a1 + (Math.PI / 8);
                            let cpX = cx + (r + bumpH) * Math.cos(midA);
                            let cpY = cy + (r + bumpH) * Math.sin(midA);
                            let endX = cx + r * Math.cos(a2);
                            let endY = cy + r * Math.sin(a2);
                            
                            if (i === 0) {
                                ctx.moveTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
                            }
                            ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                        }
                    }
                    ctx.closePath();
                };

                // 1. Draw bubble shadow
                ctx.save();
                ctx.shadowColor = `rgba(12, 7, 5, ${0.3 * op})`;
                ctx.shadowBlur = 14;
                ctx.shadowOffsetY = 6;
                
                // 2. Draw bubble background (semi-transparent dark coffee matching --bg-primary)
                ctx.fillStyle = `rgba(21, 13, 10, ${0.76 * op})`; 
                drawCloudBubble(bx, by, bw, bh);
                ctx.fill();
                ctx.restore();

                // 3. Draw bubble border (warm fireplace ember orange matching --accent-red)
                ctx.strokeStyle = `rgba(211, 84, 0, ${0.65 * op})`;
                ctx.lineWidth = 1.8;
                drawCloudBubble(bx, by, bw, bh);
                ctx.stroke();

                // 4. Draw dialogue text
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.textRendering = 'geometricPrecision';
                
                // Set high-quality text drop shadow for crisp visual pop
                ctx.shadowColor = `rgba(12, 7, 5, ${0.85 * op})`;
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1.2;
                
                // Autumn gold text color matching --accent-gold for high contrast & visibility
                ctx.fillStyle = `rgba(245, 166, 35, ${0.98 * op})`; 
                ctx.font = `600 italic 14px var(--font-sans)`;
                
                let lines = [
                    "Did you know?",
                    "I love experimenting",
                    "around with different",
                    "sorts of tea in",
                    "my spare time:",
                    "white tea, green tea,",
                    "black tea yellow tea,",
                    "fruit teas, matcha-",
                    "you name it!",
                    "Whoot fun!"
                ];
                
                // Draw text centered vertically and horizontally inside the cloud
                let startY = by + bh / 2 - ((lines.length - 1) * 17) / 2;
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], bx + bw / 2, startY + i * 17);
                }
                ctx.restore();
            } // end dialogue cloud (desktop only)

            // Update interactive states & positions (smooth interpolation)
            [atom1].forEach(atom => {
                let targetX = atom.baseX;
                let targetY = atom.baseY;
                atom.hover = false;

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - atom.baseX;
                    let dy = mouse.y - atom.baseY;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180) {
                        atom.hover = true;
                        // Pull atom subtly towards mouse
                        targetX = atom.baseX + dx * 0.15;
                        targetY = atom.baseY + dy * 0.15;
                    }
                }

                atom.x += (targetX - atom.x) * 0.08;
                atom.y += (targetY - atom.y) * 0.08;
            });

            // Update computer hover state
            computer.hover = false;
            let compTargetX = computer.baseX;
            let compTargetY = computer.baseY;
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - (computer.baseX + computer.w / 2);
                let dy = mouse.y - (computer.baseY + computer.h / 2);
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    computer.hover = true;
                    compTargetX = computer.baseX + dx * 0.08;
                    compTargetY = computer.baseY + dy * 0.08;
                }
            }
            computer.x += (compTargetX - computer.x) * 0.08;
            computer.y += (compTargetY - computer.y) * 0.08;

            // Draw Atoms with a subtle flickering candlelight effect
            let flickerOffset = Math.sin(time * 0.004) * 0.04;
            [atom1].forEach(atom => {
                let baseOpacity = Math.max(0.06, (atom.hover ? 0.28 : 0.14) + flickerOffset);
                let electronOpacity = Math.max(0.15, (atom.hover ? 0.75 : 0.45) + flickerOffset * 2.5);
                let nucleusOpacity = Math.max(0.12, (atom.hover ? 0.55 : 0.28) + flickerOffset * 1.8);

                // Draw central nucleus particles
                ctx.fillStyle = `rgba(212, 157, 59, ${nucleusOpacity})`;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(200, 90, 23, ${nucleusOpacity * 0.8})`;
                ctx.beginPath();
                ctx.arc(atom.x + 3.5, atom.y - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(atom.x - 2.5, atom.y + 3, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Draw 3 orbits
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 4]);

                for (let i = 0; i < 3; i++) {
                    let angleOffset = (i * Math.PI) / 3;
                    let rot = time * 0.00015 + angleOffset;

                    ctx.strokeStyle = `rgba(212, 157, 59, ${baseOpacity})`;
                    ctx.beginPath();
                    ctx.ellipse(atom.x, atom.y, atom.rx, atom.ry, rot, 0, Math.PI * 2);
                    ctx.stroke();

                    // Draw electron along orbit
                    let speedMult = atom.hover ? 1.6 : 1.0;
                    let electronTheta = time * 0.0018 * speedMult * (1 + i * 0.15) + i * Math.PI * 0.4;
                    let ex = atom.x + atom.rx * Math.cos(electronTheta) * Math.cos(rot) - atom.ry * Math.sin(electronTheta) * Math.sin(rot);
                    let ey = atom.y + atom.rx * Math.cos(electronTheta) * Math.sin(rot) + atom.ry * Math.sin(electronTheta) * Math.cos(rot);

                    ctx.fillStyle = `rgba(200, 90, 23, ${electronOpacity})`;
                    ctx.beginPath();
                    ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // ------------------------------------------
            // Draw Computer Wireframe
            // ------------------------------------------
            ctx.setLineDash([]);
            let compOpacity = computer.hover ? 0.24 : 0.14;
            let compGoldOpacity = computer.hover ? 0.20 : 0.10;
            ctx.strokeStyle = `rgba(212, 157, 59, ${compOpacity})`;
            ctx.lineWidth = 1;

            let cx = computer.x;
            let cy = computer.y;
            let cw = computer.w;
            let ch = computer.h;

            // Monitor stand
            ctx.beginPath();
            ctx.moveTo(cx + cw / 2 - 12, cy + ch - 5);
            ctx.lineTo(cx + cw / 2 - 8, cy + ch + 10);
            ctx.lineTo(cx + cw / 2 + 8, cy + ch + 10);
            ctx.lineTo(cx + cw / 2 + 12, cy + ch - 5);
            ctx.stroke();

            // Bottom stand plate
            ctx.beginPath();
            ctx.moveTo(cx + cw / 2 - 25, cy + ch + 10);
            ctx.lineTo(cx + cw / 2 + 25, cy + ch + 10);
            ctx.stroke();

            // Monitor bezel (rounded box)
            ctx.strokeRect(cx, cy, cw, ch - 5);

            // Inner screen
            ctx.strokeStyle = `rgba(200, 90, 23, ${compGoldOpacity * 1.5})`;
            ctx.strokeRect(cx + 6, cy + 6, cw - 12, ch - 18);

            // Draw simplified text lines
            ctx.fillStyle = `rgba(212, 157, 59, ${compOpacity * 1.4})`;
            for (let i = 0; i < codeLines.length; i++) {
                let line = codeLines[i];
                if (computer.hover && Math.random() < 0.08) {
                    // simulate typing/scrolling
                    line.w = Math.random() * (line.maxW - 10) + 10;
                }
                ctx.fillRect(cx + 12, cy + 12 + i * 8, line.w, 2);
            }

            // Blinking cursor
            let cursorBlink = Math.floor(time / 300) % 2 === 0;
            if (cursorBlink) {
                let lastLine = codeLines[codeLines.length - 1];
                ctx.fillRect(cx + 14 + lastLine.w, cy + 10 + (codeLines.length - 1) * 8, 3, 5);
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }


});
