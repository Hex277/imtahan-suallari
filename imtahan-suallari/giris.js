const verificationInput = document.getElementById("verification");

// Verification input logic
  document.getElementById("code-boxes").addEventListener("click", () => {
    verificationInput.focus();
  });

  verificationInput.addEventListener("input", () => {
    const value = verificationInput.value.slice(0, 6);
    verificationInput.value = value;
    boxes.forEach((box, i) => {
      box.textContent = value[i] || "";
    });
  });