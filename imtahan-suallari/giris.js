// Supabase məlumatları
const supabaseUrl = 'https://xoebhhdirsvjorjlrfzi.supabase.co';
const supabaseKey = 'sb_publishable_FpT1VBCd5NKEnrYQbmx9Gw_MqWxVMvN';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase uğurla qoşuldu:", supabaseClient);

// Bütün səhifələrdə ortaq olan elementlər
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const actionBtn = document.querySelector('.btn-login'); 

// Sizin təklif etdiyiniz üsul: Səhifəni URL-dən tapırıq
const currentPath = window.location.pathname;
const isRegisterPage = currentPath.includes("register.html");

// Düyməyə klikləyəndə işləyəcək əsas funksiya
if (actionBtn) {
    actionBtn.addEventListener('click', async () => {
        const email = emailInput?.value.trim();
        const password = passwordInput?.value;

        if (!email || !password) {
            showMessage("Zəhmət olmasa, e-poçt və şifrəni daxil edin!");
            return;
        }

        const originalText = actionBtn.textContent;
        actionBtn.disabled = true;

        if (isRegisterPage) {
            // ==========================================
            // ------ QEYDİYYAT (REGISTER) MƏNTİQİ ------
            // ==========================================
            const nameInput = document.getElementById('name');
            const name = nameInput ? nameInput.value.trim() : "";
            
            if (!name) {
                showMessage("Zəhmət olmasa, adınızı daxil edin!");
                actionBtn.disabled = false; return;
            }
            if (password.length < 6) {
                showMessage("Şifrə ən azı 6 simvol olmalıdır!");
                actionBtn.disabled = false; return;
            }

            actionBtn.textContent = "Yaradılır...";

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: { data: { full_name: name } }
            });

            if (error) {
                showMessage("Xəta baş verdi: " + error.message);
                actionBtn.textContent = originalText;
                actionBtn.disabled = false;
            } else {
                showMessage("Hesabınız uğurla yaradıldı!");
                window.location.href = "login.html"; 
            }

        } else {
            // ====================================
            // ------ GİRİŞ (LOGIN) MƏNTİQİ ------
            // ====================================
            actionBtn.textContent = "Daxil olunur...";

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                showMessage("E-poçt və ya şifrə yanlışdır!");
                actionBtn.textContent = originalText;
                actionBtn.disabled = false;
            } else {
                showMessage("Uğurla daxil oldunuz!");
                window.location.href = "profile.html"; 
            }
        }
    });
}
// -----------------------------------------------------------------------------------------------------------
function showMessage(message, type = "showMessage") {
    return new Promise((resolve) => {
        const overlay = document.getElementById("messageOverlay");
        const messageText = document.getElementById("messageText");
        const okBtn = document.getElementById("okBtn");
        const confirmBtn = document.getElementById("confirmBtn");
        const cancelBtn = document.getElementById("cancelBtn");

        if (!overlay) return resolve(false);

        // Mesajı qutuya yazırıq və ekranı açırıq
        messageText.innerHTML = message;
        overlay.style.display = "flex"; // "block" yox "flex" edirik ki, mərkəzdə qalsın

        // Əgər növ "confirm" (Sual) idisə:
        if (type === "confirm") {
            okBtn.style.display = "none";
            confirmBtn.style.display = "inline-block";
            cancelBtn.style.display = "inline-block";

            // Təsdiqlə düyməsinə basıldıqda
            confirmBtn.onclick = () => {
                overlay.style.display = "none";
                resolve(true); // Sistemi true ilə davam etdirir
            };

            // Ləğv et düyməsinə basıldıqda
            cancelBtn.onclick = () => {
                overlay.style.display = "none";
                resolve(false); // Sistemi false ilə dayandırır
            };
        } 
        // Əgər növ "showMessage" (Sadəcə bildiriş) idisə:
        else {
            okBtn.style.display = "inline-block";
            confirmBtn.style.display = "none";
            cancelBtn.style.display = "none";

            // OK düyməsinə basıldıqda sadəcə bağla
            okBtn.onclick = () => {
                overlay.style.display = "none";
                resolve(true);
            };
        }
    });
}
function openActionModal(contentHTML) {
    const overlay = document.getElementById("actionOverlay");
    const modalContent = document.getElementById("actionModalContent");
    
    if (overlay && modalContent) {
        modalContent.innerHTML = contentHTML;
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}
function closeActionModal() {
    const overlay = document.getElementById("actionOverlay");
    const modalContent = document.getElementById("actionModalContent");
    
    if (overlay) {
        // Modalı gizlədirik
        overlay.style.display = "none";
        // Səhifənin sürüşməsini (scroll) geri qaytarırıq
        document.body.style.overflow = ""; 
    }
    
    if (modalContent) {
        // Növbəti dəfə açılanda köhnə elementlər görünməsin deyə içini təmizləyirik
        modalContent.innerHTML = ""; 
    }
}