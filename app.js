document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("metacognition-form");
  const formSteps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  const progressSteps = document.querySelectorAll("#progressbar .step");
  const resultDiv = document.getElementById("result");
  const resultOutput = document.getElementById("result-output");
  const restartBtn = document.getElementById("restart-btn");

  // Range Inputs
  const frequencyInput = document.getElementById("frequency");
  const frequencyValue = document.getElementById("frequency-value");
  const intensityInput = document.getElementById("intensity");
  const intensityValue = document.getElementById("intensity-value");

  frequencyInput.addEventListener("input", function () {
    frequencyValue.textContent = frequencyInput.value;
  });
  intensityInput.addEventListener("input", function () {
    intensityValue.textContent = intensityInput.value;
  });

  // Aktueller Schritt: Aus localStorage laden, falls vorhanden
  let currentStep = localStorage.getItem("currentStep")
    ? parseInt(localStorage.getItem("currentStep"), 10)
    : 0;

  // Formularschritte entsprechend anzeigen
  formSteps.forEach((step, index) => {
    if (index === currentStep) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
  updateProgressBar(currentStep);

  // Beim Eingeben im Formular werden Daten im localStorage gespeichert
  form.addEventListener("input", function () {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });
    localStorage.setItem("formData", JSON.stringify(data));
  });

  // Vorhandene Daten laden
  loadFormData();
  function loadFormData() {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.thoughtPattern) document.getElementById("thought-pattern").value = data.thoughtPattern;
      if (data.frequency) {
        frequencyInput.value = data.frequency;
        frequencyValue.textContent = data.frequency;
      }
      if (data.intensity) {
        intensityInput.value = data.intensity;
        intensityValue.textContent = data.intensity;
      }
      if (data.alternativeThoughts) document.getElementById("alternative-thoughts").value = data.alternativeThoughts;
      if (data.reflection) document.getElementById("reflection").value = data.reflection;
      // Für Checkboxen (distortions)
      if (data.distortions) {
        const distortions = Array.isArray(data.distortions) ? data.distortions : [data.distortions];
        document.querySelectorAll("input[name='distortions']").forEach(el => {
          el.checked = distortions.includes(el.value);
        });
      }
    }
  }

  // Validierung: Prüft, ob für bestimmte Schritte Pflichtfelder ausgefüllt wurden
  function validateStep(stepIndex) {
    let valid = true;
    const currentFormStep = formSteps[stepIndex];
    const errorMessageDiv = currentFormStep.querySelector(".error-message");
    errorMessageDiv.textContent = ""; // Vorherige Fehlermeldungen löschen

    // Beispielhafte Validierungen:
    if (stepIndex === 0) { // Identifikation
      const thoughtPattern = document.getElementById("thought-pattern").value.trim();
      if (!thoughtPattern) {
        errorMessageDiv.textContent = "Bitte beschreiben Sie Ihr Gedankenmuster.";
        valid = false;
      }
    }
    if (stepIndex === 3) { // Alternative Gedanken
      const alternativeThoughts = document.getElementById("alternative-thoughts").value.trim();
      if (!alternativeThoughts) {
        errorMessageDiv.textContent = "Bitte formulieren Sie alternative Gedanken.";
        valid = false;
      }
    }
    if (stepIndex === 4) { // Reflexion
      const reflection = document.getElementById("reflection").value.trim();
      if (!reflection) {
        errorMessageDiv.textContent = "Bitte reflektieren Sie den Übungsprozess.";
        valid = false;
      }
    }
    return valid;
  }

  // Aktualisiert die Fortschrittsanzeige
  function updateProgressBar(step) {
    progressSteps.forEach((progress, index) => {
      if (index <= step) {
        progress.classList.add("active");
      } else {
        progress.classList.remove("active");
      }
    });
    localStorage.setItem("currentStep", step);
  }

  // "Weiter"-Buttons
  nextBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < formSteps.length - 1) {
        formSteps[currentStep].classList.remove("active");
        currentStep++;
        formSteps[currentStep].classList.add("active");
        updateProgressBar(currentStep);
      }
    });
  });

  // "Zurück"-Buttons
  prevBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      if (currentStep > 0) {
        formSteps[currentStep].classList.remove("active");
        currentStep--;
        formSteps[currentStep].classList.add("active");
        updateProgressBar(currentStep);
      }
    });
  });

  // Formular absenden
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    // Ergebnis als formatiertes JSON anzeigen
    resultOutput.textContent = JSON.stringify(data, null, 2);
    resultDiv.classList.remove("hidden");
    form.classList.add("hidden");

    // LocalStorage nach Absenden leeren
    localStorage.removeItem("formData");
    localStorage.removeItem("currentStep");
  });

  // Übung neu starten
  restartBtn.addEventListener("click", function () {
    form.reset();
    frequencyValue.textContent = frequencyInput.value;
    intensityValue.textContent = intensityInput.value;
    resultDiv.classList.add("hidden");
    form.classList.remove("hidden");
    formSteps.forEach(step => step.classList.remove("active"));
    currentStep = 0;
    formSteps[currentStep].classList.add("active");
    updateProgressBar(currentStep);
    localStorage.removeItem("formData");
    localStorage.removeItem("currentStep");
  });
});
