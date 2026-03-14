// Supabase məlumatları
const supabaseUrl = 'https://xoebhhdirsvjorjlrfzi.supabase.co';
const supabaseKey = 'sb_publishable_FpT1VBCd5NKEnrYQbmx9Gw_MqWxVMvN';

// 1-Cİ DÜZƏLİŞ: Adı 'supabaseClient' etdik ki, xəta verməsin
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase uğurla qoşuldu:", supabaseClient);
// HTML-dən inputları və düyməni seçirik
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const registerBtn = document.querySelector('.btn-login');

// Qeydiyyat düyməsinə klikləyəndə işləyəcək funksiya
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        // Inputlardakı dəyərləri alırıq və kənardakı boşluqları silirik (trim)
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // 1. Sadə yoxlanış: Bütün xanalar doldurulubmu?
        if (!name || !email || !password) {
            alert("Zəhmət olmasa, bütün xanaları doldurun!");
            return;
        }

        // 2. Şifrə uzunluğu yoxlanışı
        if (password.length < 6) {
            alert("Şifrə ən azı 6 simvol olmalıdır!");
            return;
        }

        // Yüklənmə effekti üçün düymənin mətnini dəyişirik
        const originalText = registerBtn.textContent;
        registerBtn.textContent = "Yaradılır...";
        registerBtn.disabled = true;

        // 3-CÜ DÜZƏLİŞ: Supabase-ə qeydiyyat sorğusunu 'supabaseClient' ilə göndəririk
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name // İstifadəçinin adını metadata kimi bağlayırıq
                }
            }
        });

        // Nəticəni yoxlayırıq
        if (error) {
            alert("Xəta baş verdi: " + error.message);
            registerBtn.textContent = originalText;
            registerBtn.disabled = false;
        } else {
            alert("Hesabınız uğurla yaradıldı!");
            window.location.href = "login.html"; 
        }
    });
}
// -----------------------------------------------------------------------------------------------------------
function showMessage(message, type = "alert") {
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
        // Əgər növ "alert" (Sadəcə bildiriş) idisə:
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