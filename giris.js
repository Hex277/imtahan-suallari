const verificationInput = document.getElementById("verification");

const supabaseUrl = 'https://xoebhhdirsvjorjlrfzi.supabase.co';
const supabaseKey = 'sb_publishable_FpT1VBCd5NKEnrYQbmx9Gw_MqWxVMvN';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase uğurla qoşuldu:", supabase);

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