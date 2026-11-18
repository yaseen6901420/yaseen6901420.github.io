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
        let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let width = window.innerWidth;
        let height = window.innerHeight;
        const touchViewport = window.matchMedia('(hover: none) and (pointer: coarse)');
        const phoneLayout = () => width <= 768 || (width <= 1024 && touchViewport.matches);
        let isMobile = phoneLayout();
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        
        // Track pointer globally (mouse + touch)
        const mouse = { x: null, y: null };
        window.addEventListener('mousemove', (e) => {
            if (isMobile) return;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            // Spawn magic sparkles at wand tip
            if (!reducedMotion.matches && Math.random() < 0.40) {
                wandSparkles.push({
                    x: e.clientX + 5,
                    y: e.clientY + 5,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: Math.random() * 0.4 + 0.1, // slowly falls
                    size: Math.random() * 2.0 + 1.2,
                    life: 1.0,
                    decay: Math.random() * 0.025 + 0.015,
                    color: Math.random() > 0.5 ? 'rgba(245, 166, 35, ' : 'rgba(255, 230, 160, ' // gold / warm cream
                });
            }
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        const mobileSkyStage = document.querySelector('.mobile-sky-stage');
        const mobileOwlToggle = document.querySelector('.mobile-owl-toggle');
        const mobileOwlPanel = document.querySelector('.mobile-owl-panel');
        const mobileOwlMessage = document.querySelector('.mobile-owl-message');
        const mobileOwlHint = document.querySelector('.mobile-owl-hint');
        let mobileOwlOpen = false;
        let mobileSceneDirty = true;
        let mobileSceneBounds = null;
        let mobileMessage = '';
        const defaultOwlWhisper = 'Did you know?\nI love experimenting around with different sorts of tea in my spare time: white tea, green tea, black tea, yellow tea, fruit teas, matcha—you name it!\nWhoot fun!';
        function syncMobileOwlText() {
            const text = window.owlDialogueText || defaultOwlWhisper;
            if (mobileOwlMessage && text !== mobileMessage) {
                mobileOwlMessage.textContent = text;
                mobileMessage = text;
                mobileSceneDirty = true;
            }
        }
        function setMobileOwlOpen(open) {
            mobileOwlOpen = Boolean(open && isMobile);
            if (!mobileOwlToggle || !mobileOwlPanel) return;
            if (mobileOwlOpen) syncMobileOwlText();
            mobileOwlPanel.hidden = !mobileOwlOpen;
            mobileOwlToggle.setAttribute('aria-expanded', String(mobileOwlOpen));
            mobileOwlToggle.setAttribute('aria-label', mobileOwlOpen ? 'Let the owl rest' : 'Wake the owl and read its whisper');
            if (mobileOwlHint) mobileOwlHint.textContent = mobileOwlOpen ? 'Tap outside to close' : 'Tap the owl for a fun fact about me.';
            mobileSceneDirty = true;
        }
        if (mobileOwlToggle) mobileOwlToggle.addEventListener('click', () => setMobileOwlOpen(!mobileOwlOpen));
        document.addEventListener('click', event => {
            if (mobileOwlOpen && !mobileOwlToggle.contains(event.target) && !mobileOwlPanel.contains(event.target)) {
                setMobileOwlOpen(false);
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && mobileOwlOpen) {
                setMobileOwlOpen(false);
                mobileOwlToggle.focus({preventScroll:true});
            }
        });
        if (mobileSkyStage && 'ResizeObserver' in window) {
            new ResizeObserver(() => { mobileSceneDirty = true; }).observe(mobileSkyStage);
        }
        if (document.fonts) document.fonts.addEventListener('loadingdone', () => { mobileSceneDirty = true; });
        function mobileOwlPosition() {
            if (!mobileSkyStage) return {x:width/2,y:Math.max(240,height*0.35)};
            if (mobileSceneDirty || !mobileSceneBounds) {
                const rect = mobileSkyStage.getBoundingClientRect();
                mobileSceneBounds = {x:rect.left+rect.width/2,bottom:rect.bottom+window.scrollY};
                mobileSceneDirty = false;
            }
            return {x:mobileSceneBounds.x,y:mobileSceneBounds.bottom-window.scrollY-65};
        }
        function broomDisplayScale() {
            return isMobile ? Math.min(0.78,Math.max(0.53,width/640)) :
                Math.min(0.95,Math.max(0.53,width/1500));
        }

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



        // Decode lunar artwork once and cache a small, transparent rendering surface.
        let moonSprite = null;
        const moonImage = new Image();
        moonImage.decoding = 'async';
        moonImage.onload = () => {
            const sprite = document.createElement('canvas');
            sprite.width = sprite.height = 320;
            sprite.getContext('2d').drawImage(moonImage, 0, 0, 320, 320);
            moonSprite = sprite;
        };
        moonImage.src = new URL('assets/dream-moon.webp', document.baseURI).href;

        // Cache two feathered auras; animation only changes opacity and scale.
        const moonAuras = ['120, 190, 255', '166, 139, 240'].map(rgb => {
            const sprite = document.createElement('canvas');
            sprite.width = sprite.height = 256;
            const paint = sprite.getContext('2d');
            const glow = paint.createRadialGradient(128, 128, 20, 128, 128, 128);
            glow.addColorStop(0, `rgba(${rgb}, 0.34)`);
            glow.addColorStop(0.32, `rgba(${rgb}, 0.26)`);
            glow.addColorStop(0.58, `rgba(${rgb}, 0.12)`);
            glow.addColorStop(1, `rgba(${rgb}, 0)`);
            paint.fillStyle = glow;
            paint.fillRect(0, 0, 256, 256);
            return sprite;
        });

        // Rasterize glow and sparkle shapes once, rather than blur every star every frame.
        const starSprites = new Map();
        function getStarSprite(warm, glint) {
            const key = `${warm}-${glint}`;
            if (starSprites.has(key)) return starSprites.get(key);
            const sprite = document.createElement('canvas');
            sprite.width = sprite.height = 64;
            const paint = sprite.getContext('2d');
            const rgb = warm ? '255, 222, 163' : '214, 233, 255';
            const glow = paint.createRadialGradient(32, 32, 0, 32, 32, 30);
            glow.addColorStop(0, `rgba(${rgb}, 1)`);
            glow.addColorStop(0.12, `rgba(${rgb}, 0.85)`);
            glow.addColorStop(0.3, `rgba(${rgb}, 0.16)`);
            glow.addColorStop(1, `rgba(${rgb}, 0)`);
            paint.fillStyle = glow;
            paint.fillRect(0, 0, 64, 64);
            if (glint) {
                paint.fillStyle = `rgba(${rgb}, 0.7)`;
                paint.beginPath();
                paint.moveTo(32, 4); paint.lineTo(34, 30);
                paint.lineTo(60, 32); paint.lineTo(34, 34);
                paint.lineTo(32, 60); paint.lineTo(30, 34);
                paint.lineTo(4, 32); paint.lineTo(30, 30);
                paint.closePath(); paint.fill();
            }
            starSprites.set(key, sprite);
            return sprite;
        }

        // Independent, time-based twinkles over the enchanted sky artwork.
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let stars = [];
        function initStars() {
            const count = Math.min(950, Math.max(240, Math.round(width * height / 1900)));
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 0.35 + Math.pow(Math.random(), 2.6) * 1.7,
                phase: Math.random() * Math.PI * 2,
                period: 1800 + Math.random() * 4800,
                warm: Math.random() < 0.22
            }));
            stars.forEach(star => {
                star.sprite = getStarSprite(star.warm, false);
                star.glintSprite = star.size > 1.6 ? getStarSprite(star.warm, true) : null;
            });
        }
        initStars();

        // Keep the identical star renderer off the scrolling/input thread when supported.
        let starWorker = null;
        let starWorkerReady = false;
        let starLayer = null;
        let starWorkerTimer = 0;
        const starWorkerData = () => ({width, height, density:dpr,
            stars: stars.map(({x,y,size,phase,period,warm}) => ({x,y,size,phase,period,warm}))});
        function stopStarWorker() {
            starWorkerReady = false;
            clearTimeout(starWorkerTimer);
            if (starWorker) starWorker.terminate();
            starWorker = null;
            if (starLayer) starLayer.remove();
            starLayer = null;
        }
        async function startStarWorker() {
            if (!('Worker' in window) || !('OffscreenCanvas' in window) ||
                !canvas.transferControlToOffscreen || !window.createImageBitmap) return;
            try {
                starWorker = new Worker(new URL('assets/starfield-worker.js', document.baseURI));
                starWorker.onerror = stopStarWorker;
                starWorker.onmessage = async ({data}) => {
                    if (data.type === 'failed') { stopStarWorker(); return; }
                    if (data.type === 'ready') {
                        clearTimeout(starWorkerTimer);
                        starWorkerReady = true;
                        // Reveal only after the main canvas has cleared its old stars.
                        requestAnimationFrame(() => requestAnimationFrame(() => {
                            if (starLayer && starWorkerReady) starLayer.style.visibility = '';
                        }));
                        return;
                    }
                    if (data.type !== 'supported') return;
                    if (!data.supported) { stopStarWorker(); return; }
                    try {
                        const keys = ['false-false','false-true','true-false','true-true'];
                        const images = await Promise.all(keys.map(key => {
                            const [warm,glint] = key.split('-');
                            return createImageBitmap(getStarSprite(warm === 'true', glint === 'true'));
                        }));
                        if (!starWorker) { images.forEach(image => image.close()); return; }
                        starLayer = document.createElement('canvas');
                        starLayer.id = 'starfield-canvas';
                        starLayer.style.width = width + 'px';
                        starLayer.style.height = height + 'px';
                        starLayer.setAttribute('aria-hidden','true');
                        starLayer.style.visibility = 'hidden';
                        canvas.before(starLayer);
                        const offscreen = starLayer.transferControlToOffscreen();
                        const sprites = Object.fromEntries(keys.map((key,i) => [key,images[i]]));
                        starWorker.postMessage({type:'init', canvas:offscreen, sprites,
                            ...starWorkerData(), reducedMotion:reducedMotion.matches,
                            documentTimeOrigin:performance.timeOrigin}, [offscreen,...images]);
                    } catch (_) { stopStarWorker(); }
                };
                // File previews and browsers that reject workers retain the original renderer.
                starWorkerTimer = setTimeout(stopStarWorker, 8000);
                starWorker.postMessage({type:'probe'});
            } catch (_) { stopStarWorker(); }
        }
        reducedMotion.addEventListener('change', () => {
            if (starWorkerReady) starWorker.postMessage({type:'motion', reducedMotion:reducedMotion.matches});
        });
        document.addEventListener('visibilitychange', () => {
            if (starWorkerReady) starWorker.postMessage({type:'visibility', visible:!document.hidden});
        });
        startStarWorker();

        // Track wind-blown silhouette leaves
        let leaves = [];
        // Track wand sparkles
        let wandSparkles = [];
        function initLeaves() {
            leaves = [];
            const count = isMobile ? 2 : 4; // Very few leaves for a subtle effect
            for (let i = 0; i < count; i++) {
                leaves.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 4 + 6,
                    angle: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() * 0.005 + 0.003) * (Math.random() > 0.5 ? 1 : -1), // slow rotation
                    vx: Math.random() * 0.15 + 0.25, // very slow horizontal drift
                    vy: Math.random() * 0.1 + 0.15,  // very slow vertical falling
                    swayTime: Math.random() * 100,
                    swaySpeed: Math.random() * 0.012 + 0.006,
                    opacity: Math.random() * 0.2 + 0.5
                });
            }
        }
        initLeaves();

        function updateDimensions() {
            const previousWidth = width;
            mobileSceneDirty = true;
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

            isMobile = phoneLayout();
            if (width !== previousWidth) {
                initStars();
                initLeaves();
            }
            if (!isMobile && mobileOwlOpen) setMobileOwlOpen(false);
            if (starLayer) {
                starLayer.style.width = width + 'px';
                starLayer.style.height = height + 'px';
            }
            if (starWorkerReady) starWorker.postMessage({type:'resize', ...starWorkerData()});
        }

        let resizeFrame = 0;
        window.addEventListener('resize', () => {
            if (resizeFrame) return;
            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = 0;
                updateDimensions();
            });
        }, { passive: true });

        let codeLines = [
            { w: 30, maxW: 50 },
            { w: 15, maxW: 40 },
            { w: 45, maxW: 65 },
            { w: 20, maxW: 35 }
        ];

        isMobile = phoneLayout();

        // Decode detailed gothic artwork once into a small reusable sprite.
        let broomSprite = null;
        let broomAspect = 3;
        const broomImage = new Image();
        broomImage.decoding = 'async';
        broomImage.onload = () => {
            const sprite = document.createElement('canvas');
            sprite.width = 768;
            sprite.height = Math.round(768 * broomImage.naturalHeight / broomImage.naturalWidth);
            sprite.getContext('2d').drawImage(broomImage, 0, 0, sprite.width, sprite.height);
            broomAspect = sprite.width / sprite.height;
            broomSprite = sprite;
        };
        broomImage.src = new URL('assets/ethereal-gothic-broom.webp', document.baseURI).href;

        function broomFlight(elapsed) {
            const phase = ((elapsed + 5000) % 36000) / 27000;
            return {phase, x:-250+(width+500)*phase,
                y:(isMobile ? Math.max(102,height*0.22) : height*(0.36-Math.sin(Math.PI*Math.min(phase,1))*0.12))+
                    Math.sin(elapsed*0.00065)*Math.min(height*0.026,18)};
        }
        function drawBroom(time) {
            if (reducedMotion.matches || !broomSprite) return;
            const flight = broomFlight(time);
            if (flight.phase>1) return;
            const scale = broomDisplayScale();
            const opacity = Math.min(1,flight.phase*10,(1-flight.phase)*10);
            const sparkleSprite = getStarSprite(false,true);
            ctx.save();
            for (let i=1;i<=28;i++) {
                const pastTime = time-i*65;
                if (pastTime<0) continue;
                const past = broomFlight(pastTime);
                if (past.phase>flight.phase || past.phase>1) continue;
                const age=i/29;
                const twinkle=(Math.sin(time*0.003+i*2.4)+1)/2;
                const x=past.x-139*scale;
                const y=past.y+Math.sin(i*2.4)*(3+age*15)*scale+age*8;
                const size=(4+twinkle*7)*scale;
                ctx.globalAlpha=opacity*(1-age)*(0.12+twinkle*0.65);
                ctx.drawImage(sparkleSprite,x-size/2,y-size/2,size,size);
            }
            ctx.translate(flight.x,flight.y);
            ctx.rotate(-0.08+Math.sin(time*0.00065)*0.065);
            // A gentle moonlight shimmer helps the painterly sprite merge into the sky.
            const moonlight = 0.88 + Math.sin(time * Math.PI * 2 / 6800) * 0.06;
            ctx.globalAlpha=opacity*moonlight;
            const spriteWidth = 350 * scale;
            const spriteHeight = spriteWidth / broomAspect;
            ctx.drawImage(broomSprite,-spriteWidth/2,-spriteHeight/2,spriteWidth,spriteHeight);
            ctx.restore();
        }

        // A brief moon cameo, decoded once and drawn as one cached silhouette.
        let nikaSprite = null;
        let nikaAspect = 1;
        const nikaImage = new Image();
        nikaImage.decoding = 'async';
        nikaImage.onload = () => {
            const sprite = document.createElement('canvas');
            sprite.height = 320;
            sprite.width = Math.round(320 * nikaImage.naturalWidth / nikaImage.naturalHeight);
            const paint = sprite.getContext('2d');
            paint.drawImage(nikaImage, 0, 0, sprite.width, sprite.height);
            // Guarantee a pure #000000 silhouette, preserving the transparent contour.
            paint.globalCompositeOperation = 'source-in';
            paint.fillStyle = '#000000';
            paint.fillRect(0, 0, sprite.width, sprite.height);
            paint.globalCompositeOperation = 'source-over';
            nikaSprite = sprite;
            nikaAspect = sprite.width / sprite.height;
        };
        nikaImage.src = new URL('assets/luffy-reference-silhouette.webp', document.baseURI).href;

        function nikaMoonOpacity(time, moonX, moonScreenY, moonScreenR) {
            const phase = time % 36000;
            if (phase < 9000 || phase > 17200 || reducedMotion.matches) return 0;
            // Keep a generous clear interval around a broom crossing, including its trail.
            const broomScale = broomDisplayScale();
            for (const offset of [-1500, 0, 1500]) {
                const broom = broomFlight(Math.max(0, time + offset));
                if (broom.phase <= 1 &&
                    Math.abs(broom.x - moonX) < 235 * broomScale + moonScreenR + 22 &&
                    Math.abs(broom.y - moonScreenY) < 90 * broomScale + moonScreenR + 22) return 0;
            }
            const fade = Math.min(1, (phase - 9000) / 1400, (17200 - phase) / 1400);
            return fade * fade * (3 - 2 * fade);
        }
        function drawNikaMoon(time, moonX, moonY, moonR, owlScale) {
            if (!nikaSprite) return;
            const alpha = nikaMoonOpacity(time, moonX, owl.y + (moonY - owl.y) * owlScale,
                moonR * owlScale);
            if (alpha <= 0) return;
            const height = moonR * 1.80 / Math.max(1, nikaAspect);
            const width = height * nikaAspect;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(moonX, moonY + Math.sin(time * 0.0017) * 2.5);
            ctx.rotate(Math.sin(time * 0.0012) * 0.025);
            ctx.drawImage(nikaSprite, -width / 2, -height / 2, width, height);
            ctx.restore();
        }

        let branchCache = null;
        let branchCacheDensity = 0;
        function drawCachedBranch(anchorX, anchorY, owlScale) {
            const density = dpr * owlScale;
            if (!branchCache || branchCacheDensity !== density) {
                branchCacheDensity = density;
                branchCache = document.createElement('canvas');
                branchCache.width = Math.ceil(1460 * density);
                branchCache.height = Math.ceil(250 * density);
                const paint = branchCache.getContext('2d');
                paint.scale(density, density);
                paint.translate(1205, 80);
                paint.save();

                paint.fillStyle = 'rgba(21, 13, 10, 0.95)'; // Deep charcoal silhouette
                paint.beginPath();

                // Main branch top contour
                paint.moveTo(0 - 1200, 0 + 110);
                paint.quadraticCurveTo(0 - 500, 0 + 75, 0 - 120, 0 + 48);
                // Under claws
                paint.quadraticCurveTo(0 - 40, 0 + 44, 0 + 40, 0 + 44);
                // Tapering to the right
                paint.quadraticCurveTo(0 + 120, 0 + 40, 0 + 200, 0 + 25);
                
                // Tip of the right branch
                paint.quadraticCurveTo(0 + 220, 0 + 20, 0 + 240, 0 + 12);
                paint.quadraticCurveTo(0 + 220, 0 + 25, 0 + 200, 0 + 32);

                // Lower contour of the main branch
                paint.quadraticCurveTo(0 + 120, 0 + 48, 0 + 40, 0 + 52);
                paint.quadraticCurveTo(0 - 40, 0 + 54, 0 - 120, 0 + 60);
                paint.quadraticCurveTo(0 - 500, 0 + 95, 0 - 1200, 0 + 160);
                paint.closePath();
                paint.fill();

                // Draw organic sub-branches/twigs as filled paths or thick tapered lines
                let drawTwig = (startX, startY, controlX, controlY, endX, endY, startWidth) => {
                    paint.beginPath();
                    paint.moveTo(startX, startY);
                    paint.quadraticCurveTo(controlX, controlY, endX, endY);
                    paint.strokeStyle = 'rgba(21, 13, 10, 0.95)';
                    paint.lineCap = 'round';
                    // We can draw a tapered line by drawing a few overlapping segments with decreasing width
                    for (let i = 0; i < 10; i++) {
                        let t1 = i / 10;
                        let t2 = (i + 1) / 10;
                        let x1 = (1 - t1) * (1 - t1) * startX + 2 * (1 - t1) * t1 * controlX + t1 * t1 * endX;
                        let y1 = (1 - t1) * (1 - t1) * startY + 2 * (1 - t1) * t1 * controlY + t1 * t1 * endY;
                        let x2 = (1 - t2) * (1 - t2) * startX + 2 * (1 - t2) * t2 * controlX + t2 * t2 * endX;
                        let y2 = (1 - t2) * (1 - t2) * startY + 2 * (1 - t2) * t2 * controlY + t2 * t2 * endY;
                        paint.lineWidth = startWidth * (1 - t1 * 0.85);
                        paint.beginPath();
                        paint.moveTo(x1, y1);
                        paint.lineTo(x2, y2);
                        paint.stroke();
                    }
                };

                // Twig 1: Up-left from base area
                drawTwig(0 - 260, 0 + 62, 0 - 290, 0 + 35, 0 - 320, 0 + 15, 6);
                drawTwig(0 - 290, 0 + 35, 0 - 300, 0 + 20, 0 - 310, 0 + 5, 3);
                drawTwig(0 - 280, 0 + 45, 0 - 265, 0 + 25, 0 - 250, 0 + 10, 3);

                // Twig 2: Mid-left twig reaching up
                drawTwig(0 - 160, 0 + 52, 0 - 170, 0 + 25, 0 - 180, 0 - 5, 5);
                drawTwig(0 - 170, 0 + 25, 0 - 160, 0 + 5, 0 - 150, 0 - 12, 2.5);

                // Twig 3: Strong central branch reaching high next to owl's left
                drawTwig(0 - 70, 0 + 48, 0 - 65, 0 - 5, 0 - 85, 0 - 50, 7);
                drawTwig(0 - 67, 0 + 15, 0 - 80, 0 - 10, 0 - 90, 0 - 35, 4);
                drawTwig(0 - 75, 0 - 20, 0 - 70, 0 - 40, 0 - 73, 0 - 65, 3.5);

                // Twig 4: Twig extending up-right from the right side of owl
                drawTwig(0 + 80, 0 + 43, 0 + 110, 0 + 25, 0 + 130, 0 + 5, 4.5);
                drawTwig(0 + 100, 0 + 31, 0 + 115, 0 + 15, 0 + 120, 0 - 5, 2.5);

                // Twig 5: Lower hanging branch
                drawTwig(0 - 110, 0 + 58, 0 - 60, 0 + 75, 0 + 20, 0 + 70, 7);
                drawTwig(0 - 30, 0 + 70, 0 + 20, 0 + 85, 0 + 80, 0 + 82, 4);
                drawTwig(0 + 20, 0 + 70, 0 + 40, 0 + 85, 0 + 60, 0 + 92, 3);
            
                paint.restore();
            }
            ctx.drawImage(branchCache, 0, 0, 1460 * branchCacheDensity,
                250 * branchCacheDensity, anchorX - 1205, anchorY - 80, 1460, 250);
        }

        // Layout reads are only needed when the anchored card moves or changes size.
        const anchoredGamesCard = document.querySelector('.games-card');
        let gamesCardRect = null;
        let gamesCardGeometryDirty = true;
        const invalidateGamesCard = () => { gamesCardGeometryDirty = true; };
        if (anchoredGamesCard) {
            window.addEventListener('scroll', invalidateGamesCard, { passive: true });
            window.addEventListener('resize', invalidateGamesCard, { passive: true });
            if ('ResizeObserver' in window) {
                new ResizeObserver(invalidateGamesCard).observe(anchoredGamesCard);
            }
        }

        // Cache typography, ornamental borders and glow together at display resolution.
        let elegantDialogue = null;
        let elegantDialogueKey = '';
        const whisperFont = "'Cormorant Garamond', 'Baskerville', 'Georgia', serif";
        if (document.fonts) {
            Promise.all([
                document.fonts.load(`500 20px ${whisperFont}`)
            ]).then(() => { elegantDialogueKey = ''; }).catch(() => {});
            document.fonts.addEventListener('loadingdone', () => { elegantDialogueKey = ''; });
        }
        function buildElegantDialogue(boxWidth, compact, message) {
            const pad = 28, inset = compact ? 20 : 25;
            const fontSize = compact ? 18 : 20;
            const lineHeight = compact ? 22 : 25;
            const surface = document.createElement('canvas');
            const paint = surface.getContext('2d');
            paint.font = `500 ${fontSize}px ${whisperFont}`;
            const lines = [];
            for (const paragraph of message.split('\n')) {
                let line = '';
                for (const word of paragraph.split(/\s+/).filter(Boolean)) {
                    const next = line ? `${line} ${word}` : word;
                    if (line && paint.measureText(next).width > boxWidth - inset * 2) {
                        lines.push(line); line = word;
                    } else line = next;
                }
                lines.push(line);
            }
            const bodyTop = 24;
            const boxHeight = bodyTop + lines.length * lineHeight + 24;
            surface.width = Math.ceil((boxWidth + pad * 2) * dpr);
            surface.height = Math.ceil((boxHeight + pad * 2) * dpr);
            paint.scale(dpr,dpr);
            paint.translate(pad,pad);
            const shape = (x,y,w,h,r) => {
                paint.beginPath();
                paint.moveTo(x+r,y);paint.lineTo(x+w-r,y);
                paint.quadraticCurveTo(x+w,y,x+w,y+r);paint.lineTo(x+w,y+h-r);
                paint.quadraticCurveTo(x+w,y+h,x+w-r,y+h);paint.lineTo(x+r,y+h);
                paint.quadraticCurveTo(x,y+h,x,y+h-r);paint.lineTo(x,y+r);
                paint.quadraticCurveTo(x,y,x+r,y);paint.closePath();
            };
            paint.save();
            paint.shadowColor='rgba(136,170,239,0.32)';paint.shadowBlur=17;
            paint.shadowOffsetY=2;
            const velvet=paint.createLinearGradient(0,0,boxWidth,boxHeight);
            velvet.addColorStop(0,'rgba(26,35,62,0.98)');
            velvet.addColorStop(0.5,'rgba(12,19,36,0.98)');
            velvet.addColorStop(1,'rgba(26,24,47,0.98)');
            paint.fillStyle=velvet;shape(0,0,boxWidth,boxHeight,20);paint.fill();
            paint.restore();
            paint.strokeStyle='rgba(207,187,139,0.75)';paint.lineWidth=0.9;
            shape(0.5,0.5,boxWidth-1,boxHeight-1,20);paint.stroke();
            paint.strokeStyle='rgba(153,181,226,0.23)';paint.lineWidth=0.65;
            shape(6,6,boxWidth-12,boxHeight-12,15);paint.stroke();
            // Fine gilded corner flourishes and small four-point stars.
            for (const [x,y,sx,sy] of [[13,13,1,1],[boxWidth-13,13,-1,1],
                [13,boxHeight-13,1,-1],[boxWidth-13,boxHeight-13,-1,-1]]) {
                paint.save();paint.translate(x,y);paint.scale(sx,sy);
                paint.strokeStyle='rgba(224,205,164,0.75)';paint.lineWidth=0.75;
                paint.beginPath();paint.moveTo(0,15);paint.quadraticCurveTo(0,0,15,0);paint.stroke();
                paint.fillStyle='#d9c797';paint.beginPath();
                paint.moveTo(1,-2);paint.lineTo(2,1);paint.lineTo(5,2);
                paint.lineTo(2,3);paint.lineTo(1,6);paint.lineTo(0,3);
                paint.lineTo(-3,2);paint.lineTo(0,1);paint.closePath();paint.fill();
                paint.restore();
            }
            paint.textAlign='center';paint.textBaseline='middle';
            paint.fillStyle='#f3eadc';paint.font=`500 ${fontSize}px ${whisperFont}`;
            lines.forEach((line,i)=>paint.fillText(line,boxWidth/2,bodyTop+i*lineHeight+lineHeight/2));
            return {surface,boxWidth,boxHeight,pad};
        }
        function drawElegantOwlDialogue(time, opacity) {
            const compact = isMobile;
            const boxWidth = Math.min(compact ? 260 : 296, width - 28);
            const message = window.owlDialogueText ||
                'Did you know?\nI love experimenting around with different sorts of tea in my spare time: white tea, green tea, black tea, yellow tea, fruit teas, matcha—you name it!\nWhoot fun!';
            const key = `${boxWidth}|${compact}|${dpr}|${message}`;
            if (!elegantDialogue || key !== elegantDialogueKey) {
                elegantDialogue=buildElegantDialogue(boxWidth,compact,message);
                elegantDialogueKey=key;
            }
            const {surface,boxHeight,pad}=elegantDialogue;
            const x=Math.max(14,Math.min(owl.x-boxWidth/2,width-boxWidth-14));
            const owlHeadY=owl.y-36*(compact ? 0.45 : 1);
            const y=Math.max(14,owlHeadY-boxHeight-22);
            ctx.save();ctx.globalAlpha=opacity;
            ctx.drawImage(surface,x-pad,y-pad,boxWidth+pad*2,boxHeight+pad*2);
            // A few soft fairy lights echo the moon; expensive glow is already cached.
            for(let i=0;i<3;i++){
                const wave=reducedMotion.matches ? 0.5 : (Math.sin(time*0.0014+i*2.4)+1)/2;
                const size=7+wave*5;
                const sx=i===0 ? x+boxWidth*0.5 : x+boxWidth+(i===1 ? 3 : -5);
                const sy=i===0 ? y-3 : y+boxHeight*(i===1 ? 0.23 : 0.8);
                ctx.globalAlpha=opacity*(0.16+wave*0.5);
                ctx.drawImage(getStarSprite(false,true),sx-size/2,sy-size/2,size,size);
            }
            ctx.restore();
        }

        function animate(time) {
            if (reducedMotion.matches) time = 0;

            ctx.clearRect(0, 0, width, height);

            if (!starWorkerReady) {
            // Fade each star independently; timing is consistent on every refresh rate.
            ctx.save();
            stars.forEach(star => {
                const wave = reducedMotion.matches ? 0.5 :
                    (Math.sin(time * Math.PI * 2 / star.period + star.phase) + 1) / 2;
                const opacity = 0.025 + Math.pow(wave, 1.7) * 0.975;
                const diameter = star.size * 10;
                const sprite = star.glintSprite && wave > 0.65 ? star.glintSprite : star.sprite;
                ctx.globalAlpha = opacity;
                ctx.drawImage(sprite, star.x - diameter / 2, star.y - diameter / 2,
                    diameter, diameter);
            });

            ctx.restore();



            }

            // Update & Draw wind-blown silhouette leaves (realistic physics-based drift)
            leaves.forEach(leaf => {
                if (reducedMotion.matches) return;
                leaf.swayTime += leaf.swaySpeed;
                
                // Wind pushes the leaf steadily forward with minor turbulent gusts (sway) - scaled down for gentle breeze
                let windGust = Math.sin(leaf.swayTime) * 0.05;
                let lift = Math.cos(leaf.swayTime * 1.2) * 0.04; // aerodynamic lift/sink wave
                
                leaf.x += leaf.vx + windGust;
                leaf.y += leaf.vy + lift;
                
                // Spin/tumble naturally, slightly perturbed by the wind gusts
                leaf.angle += leaf.rotationSpeed + windGust * 0.01;

                // Reset when drifting off-screen (mostly left-to-right wind)
                if (leaf.x > width + 25 || leaf.y > height + 25) {
                    leaf.x = -25;
                    leaf.y = Math.random() * height * 0.7; // respawn in upper-left
                    leaf.size = Math.random() * 4 + 6;
                    leaf.opacity = Math.random() * 0.2 + 0.5;
                    leaf.angle = Math.random() * Math.PI * 2;
                }

                ctx.save();
                ctx.translate(leaf.x, leaf.y);
                ctx.rotate(leaf.angle);
                ctx.scale(leaf.size, leaf.size * 0.55); // slightly elongated leaf silhouette
                ctx.fillStyle = `rgba(21, 13, 10, ${leaf.opacity})`;
                ctx.beginPath();
                ctx.moveTo(0, -1);
                ctx.quadraticCurveTo(-0.8, -0.5, 0, 1);
                ctx.quadraticCurveTo(0.8, -0.5, 0, -1);
                ctx.fill();
                ctx.restore();
            });

            // Update & Draw wandSparkles (magic wand path sparkles)
            for (let i = wandSparkles.length - 1; i >= 0; i--) {
                let s = wandSparkles[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life -= s.decay;
                
                if (s.life <= 0) {
                    wandSparkles.splice(i, 1);
                    continue;
                }

                // Draw sparkle as a tiny 4-point star with a soft glow shadow
                ctx.save();
                ctx.fillStyle = s.color + s.life + ')';
                ctx.shadowColor = s.color + (s.life * 0.55) + ')';
                ctx.shadowBlur = s.size * 2.2;
                
                ctx.beginPath();
                let cx = s.x;
                let cy = s.y;
                let size = s.size;
                ctx.moveTo(cx, cy - size);
                ctx.quadraticCurveTo(cx, cy, cx + size, cy);
                ctx.quadraticCurveTo(cx, cy, cx, cy + size);
                ctx.quadraticCurveTo(cx, cy, cx - size, cy);
                ctx.quadraticCurveTo(cx, cy, cx, cy - size);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }



            // Update & Draw Majestic Perched Owl (Hedwig) on the left branch
            // On phones the owl and moon share a clear space above the academic content.
            if (isMobile && mobileOwlOpen) syncMobileOwlText();
            const mobilePerch = isMobile ? mobileOwlPosition() : null;
            let owlScale = isMobile ? 0.62 : 1.0;
            let scaledBaseX = isMobile ? mobilePerch.x : owl.baseX;
            let scaledBaseY = isMobile ? mobilePerch.y : owl.baseY;

            // Anchor owl directly above the games quiz question card on games page
            let isGamePage = !!window.forceOwlDialogue;
            if (isGamePage && !isMobile) {
                if (anchoredGamesCard) {
                    if (gamesCardGeometryDirty || !gamesCardRect) {
                        gamesCardRect = anchoredGamesCard.getBoundingClientRect();
                        gamesCardGeometryDirty = false;
                    }
                    const rect = gamesCardRect;
                    // Center owl horizontally above the box
                    scaledBaseX = rect.left + rect.width / 2;
                    // Position perched directly on the top border (leaving room for claws)
                    scaledBaseY = rect.top - 46;
                }
            }

            owl.x = scaledBaseX;
            owl.y = scaledBaseY;

            let owlDist = 9999;
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - owl.x;
                let dy = mouse.y - owl.y;
                owlDist = Math.sqrt(dx * dx + dy * dy);
            }

            // Blink state logic
            if (!reducedMotion.matches) owl.blinkTimer -= 16.67;
            else owl.blinkDuration = 0;
            if (owl.blinkTimer <= 0) {
                owl.blinkDuration = 10; // Blink lasts 10 frames
                owl.blinkTimer = Math.random() * 5000 + 3000;
            }
            if (owl.blinkDuration > 0) {
                owl.blinkDuration--;
            }

            let isBlinking = owl.blinkDuration > 0;

            if ((isMobile && mobileOwlOpen) || (!isMobile && owlDist < 180)) {
                owl.eyesOpen = true;
                let dx = isMobile ? 0 : mouse.x - owl.x;
                let dy = isMobile ? 0 : mouse.y - (owl.y - 36); // Head center is at y - 36
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
            if (!reducedMotion.matches && owl.eyesOpen && !isBlinking && Math.random() < 0.12) {
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

            // Cull only fully offscreen mobile artwork, retaining all visible detail.
            const owlInView = !isMobile || (owl.y + 100 * owlScale > 0 && owl.y - 360 * owlScale < height);
            if (owlInView) {
            // Scale owl drawing for mobile: pivot around owl position
            ctx.save();
            ctx.translate(owl.x, owl.y);
            ctx.scale(owlScale, owlScale);
            ctx.translate(-owl.x, -owl.y);



            // 0. Enchanted pearl moon, floating higher above the owl.
            (function drawMoon() {
                const moonX = owl.x;
                const moonY = owl.y - 220;
                const moonR = 68;
                const pulse = reducedMotion.matches ? 0.5 :
                    (Math.sin(time * Math.PI * 2 / 6200) + 1) / 2;
                const shimmer = reducedMotion.matches ? 0.5 :
                    (Math.sin(time * Math.PI * 2 / 9700 + 1.4) + 1) / 2;
                ctx.save();
                const auraSize = moonR * (3.7 + pulse * 0.22);
                ctx.globalAlpha = 0.52 + pulse * 0.30;
                ctx.drawImage(moonAuras[0], moonX - auraSize / 2, moonY - auraSize / 2,
                    auraSize, auraSize);
                ctx.globalAlpha = 0.28 + shimmer * 0.30;
                const outerSize = auraSize * 1.18;
                ctx.drawImage(moonAuras[1], moonX - outerSize / 2, moonY - outerSize / 2,
                    outerSize, outerSize);
                ctx.globalAlpha = 1;
                if (moonSprite) {
                    const extent = moonR * 2 / 0.65;
                    ctx.drawImage(moonSprite, moonX - extent / 2, moonY - extent / 2,
                        extent, extent);
                } else {
                    const pearl = ctx.createRadialGradient(moonX - 18, moonY - 22, 2,
                        moonX, moonY, moonR);
                    pearl.addColorStop(0, '#f0f3ff');
                    pearl.addColorStop(0.65, '#c8daef');
                    pearl.addColorStop(1, '#8ea9d6');
                    ctx.fillStyle = pearl;
                    ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
                }
                // A sparse halo of independently twinkling fairy lights.
                for (let i = 0; i < 7; i++) {
                    const phase = i * 2.39996;
                    const wave = reducedMotion.matches ? 0.5 :
                        (Math.sin(time * 0.0011 + phase * 2) + 1) / 2;
                    const radius = moonR * (1.18 + (i % 3) * 0.15);
                    const drift = reducedMotion.matches ? 0 : Math.sin(time * 0.0004 + phase) * 0.035;
                    const x = moonX + Math.cos(phase + drift) * radius;
                    const y = moonY + Math.sin(phase + drift) * radius;
                    const size = 7 + wave * 7;
                    ctx.globalAlpha = 0.12 + wave * 0.70;
                    ctx.drawImage(getStarSprite(false, true), x - size / 2, y - size / 2, size, size);
                }
                ctx.restore();
                drawNikaMoon(time, moonX, moonY, moonR, owlScale);
            })();

            // 1. Organic Silhouette Tree Branch (Beautiful tapered silhouette next to/under the owl)
            drawCachedBranch(owl.x, owl.y, owlScale);

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
            ctx.fillStyle = 'rgba(246, 238, 227, 0.72)'; // cream white base — opaque enough to cover moon
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
            ctx.fillStyle = 'rgba(220, 208, 192, 0.65)';
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
            ctx.fillStyle = 'rgba(220, 208, 192, 0.65)';
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
            if ((owl.eyesOpen || window.forceOwlDialogue) && !isBlinking) {
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
            } // end visible owl scene

            // Foreground flight: paint after the moon, outside the owl scale transform.
            drawBroom(time);

            // Update dialogue bubble opacity based on touch/mouse proximity or external force flag
            let dialogueTriggerDist = isMobile ? 80 : 180;
            if (owlDist < dialogueTriggerDist || window.forceOwlDialogue) {
                owl.dialogueOpacity += (1.0 - owl.dialogueOpacity) * 0.1;
            } else {
                owl.dialogueOpacity += (0 - owl.dialogueOpacity) * 0.15;
            }

            // Dialogue cloud: shown on all screen sizes, adapted for mobile layout
            if (!isMobile && owl.dialogueOpacity > 0.015) {
                let op = owl.dialogueOpacity;

                if (!window.forceOwlDialogue) {
                    drawElegantOwlDialogue(time, op);
                } else {
                if (isMobile) {
                    // ── MOBILE: tight auto-sized rounded rectangle, max 2 lines ──
                    let mFontSize = 11;
                    let mLineH = 15;
                    let mPadX = 12;
                    let mPadY = 9;
                    let mRadius = 10; // rounded corner radius

                    // 1-line condensed text for mobile
                    let mLines = [];
                    if (window.owlDialogueText) {
                        mLines = window.owlDialogueText.split('\n');
                    } else {
                        mLines = [
                            "Did you know? I collect tea- Whoot fun! 🍵"
                        ];
                    }

                    // Measure actual rendered text width to size box tightly
                    ctx.font = `600 italic ${mFontSize}px var(--font-sans)`;
                    let maxTW = Math.max(...mLines.map(l => ctx.measureText(l).width));

                    let bw = maxTW + mPadX * 2;
                    let bh = mLines.length * mLineH + mPadY * 2;
                    let bx = Math.min(owl.x + 36, width - bw - 6);
                    let by = owl.y - bh / 2 - 4; // vertically centred on owl

                    // Helper: draw a rounded rectangle path
                    let drawRoundRect = (x, y, w, h, r) => {
                        ctx.beginPath();
                        ctx.moveTo(x + r, y);
                        ctx.lineTo(x + w - r, y);
                        ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
                        ctx.lineTo(x + w, y + h - r);
                        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
                        ctx.lineTo(x + r, y + h);
                        ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
                        ctx.lineTo(x, y + r);
                        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);
                        ctx.closePath();
                    };

                    // Helper: draw left-pointing triangular tail from left edge → owl
                    let tailMidY = by + bh / 2;
                    let tailTipX = owl.x + 22;
                    let tailTipY = tailMidY;
                    let drawTail = () => {
                        ctx.beginPath();
                        ctx.moveTo(bx, tailMidY - 6);
                        ctx.lineTo(tailTipX, tailTipY);
                        ctx.lineTo(bx, tailMidY + 6);
                        ctx.closePath();
                    };

                    // 1. Shadow
                    ctx.save();
                    ctx.shadowColor = `rgba(12, 7, 5, ${0.35 * op})`;
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetY = 4;

                    // 2. Fill background (rect + tail together so shadow is unified)
                    ctx.fillStyle = `rgba(21, 13, 10, ${0.82 * op})`;
                    drawRoundRect(bx, by, bw, bh, mRadius);
                    ctx.fill();
                    drawTail();
                    ctx.fill();
                    ctx.restore();

                    // 3. Border
                    ctx.strokeStyle = `rgba(211, 84, 0, ${0.70 * op})`;
                    ctx.lineWidth = 1.5;
                    drawRoundRect(bx, by, bw, bh, mRadius);
                    ctx.stroke();
                    drawTail();
                    ctx.stroke();

                    // 4. Text
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.textRendering = 'geometricPrecision';
                    ctx.shadowColor = `rgba(12, 7, 5, ${0.9 * op})`;
                    ctx.shadowBlur = 2;
                    ctx.shadowOffsetX = 0.5;
                    ctx.shadowOffsetY = 0.8;
                    ctx.fillStyle = `rgba(245, 166, 35, ${0.98 * op})`;
                    ctx.font = `600 italic ${mFontSize}px var(--font-sans)`;

                    let startY = by + mPadY + mLineH / 2;
                    for (let i = 0; i < mLines.length; i++) {
                        ctx.fillText(mLines[i], bx + bw / 2, startY + i * mLineH);
                    }
                    ctx.restore();

                } else {
                    // ── DESKTOP: original puffy cloud bubble with downward tail ──
                    let isGamePage = !!window.forceOwlDialogue;
                    let bw = isGamePage ? 650 : 220;
                    let bh = isGamePage ? 350 : 220;
                    let bx = Math.max(12, owl.x - bw / 2);
                    let by = owl.y - (isGamePage ? 430 : 302);

                    let drawCloudBubble = (x, y, w, h) => {
                        let cx = x + w / 2;
                        let cy = y + h / 2;
                        let r = w / 2;
                        let numBumps = 8;
                        let bumpH = 8;

                        ctx.beginPath();
                        let startAngle = -Math.PI / 8;

                        for (let i = 0; i < numBumps; i++) {
                            let a1 = startAngle + i * (Math.PI / 4);
                            let a2 = a1 + (Math.PI / 4);

                            if (i === 2) {
                                // Downward tail toward Hedwig's head
                                let tx1 = cx + r * Math.cos(a1);
                                let ty1 = cy + r * Math.sin(a1);
                                let tx2 = cx + r * Math.cos(a2);
                                let ty2 = cy + r * Math.sin(a2);

                                ctx.lineTo(tx1, ty1);
                                ctx.quadraticCurveTo(owl.x + 10, y + h + 8, owl.x, y + h + 20);
                                ctx.quadraticCurveTo(owl.x - 10, y + h + 8, tx2, ty2);
                            } else {
                                let midA = a1 + (Math.PI / 8);
                                let cpX = cx + (r + bumpH) * Math.cos(midA);
                                let cpY = cy + (r + bumpH) * Math.sin(midA);
                                let endX = cx + r * Math.cos(a2);
                                let endY = cy + r * Math.sin(a2);

                                if (i === 0) ctx.moveTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
                                ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                            }
                        }
                        ctx.closePath();
                    };

                    if (!isGamePage) {
                        ctx.save();
                        ctx.shadowColor = `rgba(12, 7, 5, ${0.3 * op})`;
                        ctx.shadowBlur = 14;
                        ctx.shadowOffsetY = 6;
                        ctx.fillStyle = `rgba(21, 13, 10, ${0.76 * op})`;
                        drawCloudBubble(bx, by, bw, bh);
                        ctx.fill();
                        ctx.restore();

                        ctx.strokeStyle = `rgba(211, 84, 0, ${0.65 * op})`;
                        ctx.lineWidth = 1.8;
                        drawCloudBubble(bx, by, bw, bh);
                        ctx.stroke();
                    }

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.textRendering = 'geometricPrecision';
                    if (isGamePage) {
                        // High visibility neon glow styling for dialogue text
                        ctx.shadowColor = `rgba(245, 166, 35, ${0.95 * op})`;
                        ctx.shadowBlur = 8;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.fillStyle = `rgba(255, 245, 220, ${0.98 * op})`;
                        ctx.font = `600 14px 'Libre Baskerville', 'Baskerville', 'Playfair Display', 'Georgia', serif`;
                    } else {
                        ctx.shadowColor = `rgba(12, 7, 5, ${0.85 * op})`;
                        ctx.shadowBlur = 3;
                        ctx.shadowOffsetX = 1;
                        ctx.shadowOffsetY = 1.2;
                        ctx.fillStyle = `rgba(245, 166, 35, ${0.98 * op})`;
                        ctx.font = `600 14px 'Libre Baskerville', 'Baskerville', 'Playfair Display', 'Georgia', serif`;
                    }

                    let lines = [];
                    if (window.owlDialogueText) {
                        lines = window.owlDialogueText.split('\n');
                    } else {
                        lines = [
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
                    }

                    if (isGamePage) {
                        // Position text to the right side of the perched owl with extra horizontal breathing room
                        ctx.textAlign = 'left';
                        let textX = owl.x + 65; // shifted to the right to avoid cramming
                        let textY = owl.y - 12; // align beside head center
                        let lineH = 19; // line height for 14px text
                        let startY = textY - ((lines.length - 1) * lineH) / 2;
                        
                        for (let i = 0; i < lines.length; i++) {
                            ctx.fillText(lines[i], textX, startY + i * lineH);
                        }
                    } else {
                        let lineH = 17;
                        let startY = by + bh / 2 - ((lines.length - 1) * lineH) / 2;
                        for (let i = 0; i < lines.length; i++) {
                            ctx.fillText(lines[i], bx + bw / 2, startY + i * lineH);
                        }
                    }
                    ctx.restore();
                }

                }
            } // end dialogue



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
                let baseOpacity = Math.max(0.18, (atom.hover ? 0.55 : 0.32) + flickerOffset);
                let electronOpacity = Math.max(0.40, (atom.hover ? 0.90 : 0.65) + flickerOffset * 2.5);
                let nucleusOpacity = Math.max(0.35, (atom.hover ? 0.80 : 0.55) + flickerOffset * 1.8);

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
            let compOpacity = computer.hover ? 0.55 : 0.32;
            let compGoldOpacity = computer.hover ? 0.48 : 0.26;
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
