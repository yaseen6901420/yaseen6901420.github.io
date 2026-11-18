// Independent star rendering frees the page's main thread for input and scrolling.
let canvas, paint, stars = [], sprites, width = 0, height = 0, density = 1;
let reducedMotion = false, running = false, frame = 0, timeOffset = 0;
let reportedReady = false;
function resize(data) {
    width = data.width; height = data.height; density = data.density;
    canvas.width = width * density;
    canvas.height = height * density;
    paint.setTransform(density, 0, 0, density, 0, 0);
    stars = data.stars;
}
function render(timestamp) {
    if (!running) return;
    const time = timestamp + timeOffset;
    paint.clearRect(0, 0, width, height);
    for (const star of stars) {
        const wave = reducedMotion ? 0.5 :
            (Math.sin(time * Math.PI * 2 / star.period + star.phase) + 1) / 2;
        const opacity = 0.025 + Math.pow(wave, 1.7) * 0.975;
        const diameter = star.size * 10;
        const key = `${star.warm}-${star.size > 1.6 && wave > 0.65}`;
        paint.globalAlpha = opacity;
        paint.drawImage(sprites[key], star.x - diameter / 2, star.y - diameter / 2,
            diameter, diameter);
    }
    paint.globalAlpha = 1;
    if (!reportedReady) { reportedReady = true; postMessage({type:'ready'}); }
    frame = requestAnimationFrame(render);
}
onmessage = ({data}) => {
    try {
        if (data.type === 'probe') {
            postMessage({type:'supported', supported:
                typeof OffscreenCanvas !== 'undefined' && typeof requestAnimationFrame === 'function'});
        } else if (data.type === 'init') {
            canvas = data.canvas;
            paint = canvas.getContext('2d');
            if (!paint) throw new Error('Canvas renderer unavailable');
            sprites = data.sprites;
            reducedMotion = data.reducedMotion;
            timeOffset = performance.timeOrigin - data.documentTimeOrigin;
            resize(data);
            running = true;
            frame = requestAnimationFrame(render);
        } else if (data.type === 'resize') {
            resize(data);
        } else if (data.type === 'motion') {
            reducedMotion = data.reducedMotion;
        } else if (data.type === 'visibility') {
            running = data.visible;
            if (running) frame = requestAnimationFrame(render);
            else cancelAnimationFrame(frame);
        }
    } catch (_) {
        running = false;
        if (frame) cancelAnimationFrame(frame);
        postMessage({type:'failed'});
    }
};
