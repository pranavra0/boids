const cfg = window.boidsConfig;

const inputs = {
    // Boids Panel
    cohesionFactor: document.getElementById('cohesion'),
    separationFactor: document.getElementById('separation'),
    alignmentFactor: document.getElementById('alignment'),
    visualRange: document.getElementById('visualRange'),
    speedLimit: document.getElementById('speedLimit'),
    numBoids: document.getElementById('numBoids'),
    // World Panel
    boundarySize: document.getElementById('boundarySize'),
    boundaryTurnFactor: document.getElementById('boundaryTurnFactor'),
};

const displays = {
    cohesionFactor: document.getElementById('val-cohesion'),
    separationFactor: document.getElementById('val-separation'),
    alignmentFactor: document.getElementById('val-alignment'),
    visualRange: document.getElementById('val-range'),
    speedLimit: document.getElementById('val-speed'),
    numBoids: document.getElementById('val-count'),
    boundarySize: document.getElementById('val-boundSize'),
    boundaryTurnFactor: document.getElementById('val-turnFactor'),
};

const flaps = document.querySelectorAll('.flap');
const panels = document.querySelectorAll('.panel');
const resetBtn = document.getElementById('reset-btn');
const panelContainer = document.getElementById('panel-container');


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
    inputs.cohesionFactor.value = cfg.cohesionFactor;
    inputs.separationFactor.value = cfg.separationFactor;
    inputs.alignmentFactor.value = cfg.alignmentFactor;
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

flaps.forEach(flap => {
    flap.addEventListener('click', () => {
        const targetId = flap.dataset.target;
        const targetPanel = document.getElementById(targetId);
        
        const isCurrentlyActive = flap.classList.contains('active');
        
        // Reset everything first
        flaps.forEach(f => f.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        if (isCurrentlyActive) {
            panelContainer.style.display = 'none';
        } else {
            flap.classList.add('active');
            targetPanel.classList.add('active');
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