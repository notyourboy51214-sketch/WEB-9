/**
 * AURA Climate Dynamics — Interactive Simulator Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sqftRange = document.getElementById('sqftRange');
  const sqftDisplay = document.getElementById('sqftDisplay');
  const tempDelta = document.getElementById('tempDelta');
  const deltaDisplay = document.getElementById('deltaDisplay');
  const ceilingHeight = document.getElementById('ceilingHeight');
  const modeSelector = document.getElementById('modeSelector');

  // Outputs
  const btuOutput = document.getElementById('btuOutput');
  const tonnageOutput = document.getElementById('tonnageOutput');
  const seerOutput = document.getElementById('seerOutput');
  const savingsOutput = document.getElementById('savingsOutput');

  // State
  let currentMode = 'cool'; // 'cool' or 'heat'

  function calculateThermalLoad() {
    const sqft = parseFloat(sqftRange.value);
    const delta = parseFloat(tempDelta.value);
    const ceilingMultiplier = parseFloat(ceilingHeight.value);

    // Base rule of thumb: ~20-25 BTU per sq ft under standard conditions + delta adjustment
    // Standard baseline delta is 20°F
    const deltaFactor = 1 + (delta - 20) * 0.02;
    const modeMultiplier = currentMode === 'cool' ? 1.0 : 1.12;

    const rawBTU = sqft * 20 * ceilingMultiplier * deltaFactor * modeMultiplier;
    // Round to nearest 500
    const roundedBTU = Math.round(rawBTU / 500) * 500;
    const tons = (roundedBTU / 12000).toFixed(2);

    // SEER2 dynamic estimation based on variable inverter modulation
    // Smaller systems run at higher SEER2, extreme delta lowers effective SEER2 slightly
    let baseSeer = 30.5;
    if (sqft > 6000) baseSeer -= 2.0;
    if (delta > 35) baseSeer -= 1.8;
    const effectiveSeer = (baseSeer).toFixed(1);

    // Annual Energy Savings calculation
    // Baseline SEER 14 system annual kWh cost vs AURA SEER2 system
    // Approx baseline kWh per ton-year = 1800 hrs * (12,000 / 14) / 1000 = ~1,542 kWh/ton
    // AURA kWh per ton-year = 1800 hrs * (12,000 / effectiveSeer) / 1000
    const baselineKwh = parseFloat(tons) * 1542;
    const auraKwh = parseFloat(tons) * (1800 * (12000 / effectiveSeer) / 1000);
    const savedKwh = Math.max(0, baselineKwh - auraKwh);
    const avgRatePerKwh = 0.22; // $0.22/kWh modern average residential rate
    const annualSavings = Math.round(savedKwh * avgRatePerKwh);

    // Update UI
    sqftDisplay.textContent = `${sqft.toLocaleString()} sq ft`;
    deltaDisplay.textContent = `${delta}°F Differential`;

    btuOutput.textContent = roundedBTU.toLocaleString();
    tonnageOutput.textContent = `${tons} Tons Dynamic Capacity`;
    seerOutput.textContent = effectiveSeer;
    savingsOutput.textContent = annualSavings.toLocaleString();
  }

  // Event Listeners for inputs
  sqftRange.addEventListener('input', calculateThermalLoad);
  tempDelta.addEventListener('input', calculateThermalLoad);
  ceilingHeight.addEventListener('change', calculateThermalLoad);

  // Mode buttons
  const modeButtons = modeSelector.querySelectorAll('.pill-option');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      calculateThermalLoad();
    });
  });

  // Modal Functionality
  const quoteModal = document.getElementById('quoteModal');
  const openQuoteBtn = document.getElementById('openQuoteBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const consultationForm = document.getElementById('consultationForm');
  const formSuccessNotice = document.getElementById('formSuccessNotice');

  openQuoteBtn.addEventListener('click', () => {
    quoteModal.classList.add('active');
    quoteModal.setAttribute('aria-hidden', 'false');
  });

  closeModalBtn.addEventListener('click', () => {
    quoteModal.classList.remove('active');
    quoteModal.setAttribute('aria-hidden', 'true');
  });

  quoteModal.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
      quoteModal.classList.remove('active');
    }
  });

  consultationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccessNotice.style.display = 'block';
    setTimeout(() => {
      formSuccessNotice.style.display = 'none';
      quoteModal.classList.remove('active');
      consultationForm.reset();
    }, 2800);
  });

  // Mobile Drawer Navigation
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  mobileMenuBtn.addEventListener('click', () => {
    mobileDrawer.classList.toggle('open');
  });

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
    });
  });

  // Initial calculation run
  calculateThermalLoad();
});
