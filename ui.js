const cfg = window.boidsConfig;

// DOM Mappings
const inputs = {
    // Boids Panel
    cohesion: document.getElementById('cohesion'),
    separation: document.getElementById('separation'),
    alignment: document.getElementById('alignment'),
    visualRange: document.getElementById('visualRange'),
    speedLimit: document.getElementById('speedLimit'),
    numBoids: document.getElementById('numBoids'),
    // World Panel
    boundarySize: document.getElementById('boundarySize'),
    boundaryTurnFactor: document.getElementById('boundaryTurnFactor'),
};

const displays = {
    cohesion: document.getElementById('val-cohesion'),
    separation: document.getElementById('val-separation'),
    alignment: document.getElementById('val-alignment'),
    visualRange: document.getElementById('val-range'),
    speedLimit: document.getElementById('val-speed'),
    numBoids: document.getElementById('val-count'),
    boundarySize: document.getElementById('val-boundSize'),
    boundaryTurnFactor: document.getElementById('val-turnFactor'),
};

const flaps = document.querySelectorAll('.flap');
const panels = document.querySelectorAll('.panel');
const resetBtn = document.getElementById('reset-btn');
const panelContainer = document.getElementById('panel-container'); // Ref to container


function updateSliderVisual(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const val = parseFloat(input.value);

    // Calculate percentage
    const percentage = ((val - min) / (max - min)) * 100;

    input.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, var(--track-color) ${percentage}%, var(--track-color) 100%)`;
}

function updateDisplay(key) {
    let val = parseFloat(inputs[key].value);

    // Integer formatting for certain fields
    if (['numBoids', 'visualRange', 'speedLimit', 'boundarySize'].includes(key)) {
        displays[key].textContent = Math.round(val);
    } else {
        displays[key].textContent = val.toFixed(3);
    }
}

function syncInputsToConfig() {
    inputs.cohesion.value = cfg.cohesionFactor;
    inputs.separation.value = cfg.separationFactor;
    inputs.alignment.value = cfg.alignmentFactor;
    inputs.visualRange.value = cfg.visualRange;
    inputs.speedLimit.value = cfg.speedLimit;
    inputs.numBoids.value = cfg.numBoids;
    inputs.boundarySize.value = cfg.boundarySize;
    inputs.boundaryTurnFactor.value = cfg.boundaryTurnFactor;

    Object.keys(inputs).forEach(key => {
        updateSliderVisual(inputs[key]);
        updateDisplay(key);
    });
}

// Tab switch with collapse logic
flaps.forEach(flap => {
    flap.addEventListener('click', () => {
        const targetId = flap.dataset.target;
        const targetPanel = document.getElementById(targetId);

        // Check if we are clicking the currently active tab
        const isCurrentlyActive = flap.classList.contains('active');

        // Reset everything first
        flaps.forEach(f => f.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        if (isCurrentlyActive) {
            // If it was active, we are closing it. Hide container.
            panelContainer.style.display = 'none';
        } else {
            // New tab clicked. Activate it.
            flap.classList.add('active');
            targetPanel.classList.add('active');
            // Show container
            panelContainer.style.display = 'flex';
        }
    });
});

// Event listeners 
Object.keys(inputs).forEach(key => {
    const input = inputs[key];

    input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);

        cfg[key] = val;

        updateSliderVisual(input);
        updateDisplay(key);

        if (key === 'boundarySize') {
            window.updateWorldBounds();
        }
    });

    if (key === 'numBoids' || key === 'boundarySize') {
        input.addEventListener('change', () => {
            window.initBoids();
        });
    }
});

resetBtn.addEventListener('click', () => {
    window.initBoids();
});

// Init
syncInputsToConfig();