// ---------------------- GLOBAL SCRIPTS ----------------------
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Mövcud Menyu Kodunuz
    const telebeMenu = document.getElementById('telebe-menu');
    if (telebeMenu && telebeMenu.previousElementSibling) {
        telebeMenu.classList.add('open');
        telebeMenu.previousElementSibling.querySelector('.arrow').textContent = 'v';
    }

    // ==========================================
    // 2. QLOBAL PREMİUM YOXLANIŞI (Gecikməsiz & Ağıllı Yenilənmə)
    // ==========================================
    
    // UI-ı dəyişən və ya geri qaytaran (Sıfırlayan) funksiya
    function setPremiumUI(isActive) {
        const premiumHref = document.getElementById('premium-href');
        const profileImg = document.querySelector('.profile-bg img');

        if (isActive) {
            // Premium aktivdir
            document.body.classList.add('premium-aktiv');
            if (premiumHref) premiumHref.style.display = 'none';
            if (profileImg) profileImg.src = '../images/premium-profile.png';
        } else {
            // Premium DEYİL (və ya vaxtı bitib) - Hər şeyi standart vəziyyətə qaytarırıq
            document.body.classList.remove('premium-aktiv');
            if (premiumHref) premiumHref.style.display = ''; // CSS-dəki original display dəyərinə qayıdır
            if (profileImg) profileImg.src = '../images/profile.png';
        }
    }

    if (window.supabase) {
        const supabaseUrl = 'https://xoebhhdirsvjorjlrfzi.supabase.co';
        const supabaseKey = 'sb_publishable_FpT1VBCd5NKEnrYQbmx9Gw_MqWxVMvN';

        // Supabase Tək İnstance Yoxlanışı
        if (!window.globalSupabaseClient) {
            window.globalSupabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        }
        const supabaseGlobal = window.globalSupabaseClient;

        // --- ADDIM 1: SIFIR GECİKMƏ İLƏ LOCALSTORAGE YOXLANIŞI ---
        let userId = null;
        try {
            // Supabase-in öz qlobal tokenindən (gecikmə olmadan) User ID-ni çəkirik
            const sbSession = localStorage.getItem('sb-xoebhhdirsvjorjlrfzi-auth-token');
            if (sbSession) {
                userId = JSON.parse(sbSession).user.id;
            }
        } catch (e) {}

        const indi = new Date().getTime();

        if (userId) {
            // Hər istifadəçinin ÖZÜNƏ məxsus premium yaddaşını yoxlayırıq
            const cachedBitis = localStorage.getItem('premiumBitis_' + userId);
            
            if (cachedBitis && indi < parseInt(cachedBitis)) {
                setPremiumUI(true); // Gözləmədən anında Premium rəngləri ver
            } else {
                setPremiumUI(false); // Keş yoxdursa və ya bitibsə standart UI göstər
            }
        }

        // --- ADDIM 2: ARXA FONDA DƏQİQ BAZA YOXLANIŞI ---
        supabaseGlobal.auth.getSession().then(async ({ data: { session } }) => {
            if (session) {
                const currentUserId = session.user.id;
                const { data: abuneData } = await supabaseGlobal
                    .from('abunelikler')
                    .select('bitis_tarixi')
                    .eq('user_id', currentUserId)
                    .single();

                if (abuneData) {
                    const bitis = new Date(abuneData.bitis_tarixi).getTime();
                    const rightNow = new Date().getTime();

                    if (rightNow < bitis) {
                        // Baza təsdiqlədi: Hələ də premiumdur. Yaddaşı yeniləyirik.
                        localStorage.setItem('premiumBitis_' + currentUserId, bitis);
                        setPremiumUI(true);
                    } else {
                        // Baza dedi ki: Vaxtı BİTİB! Yaddaşı sil və UI-ı geri al.
                        localStorage.removeItem('premiumBitis_' + currentUserId);
                        setPremiumUI(false);
                    }
                } else {
                    // Cədvəldə bu istifadəçiyə aid heç nə yoxdur (Pulsuzdur). Yaddaşı sil və UI-ı geri al.
                    localStorage.removeItem('premiumBitis_' + currentUserId);
                    setPremiumUI(false);
                }
            }
        });
    } else {
        console.warn("Diqqət: Bu səhifədə Supabase yüklənməyib.");
    }
});
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

// ---------------------- FENNLER MENU ----------------------
if (window.location.pathname.endsWith("fennler-menu.html")) {
    const container = document.getElementById("subjects-bg");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    let allSubjects = []; // Bütün fənnləri burada saxlayacağıq
    
    // JSON-dan fənnləri çəkirik
    fetch("subjects.json")
        .then(response => response.json())
        .then(subjects => {
            allSubjects = subjects; // Məlumatı qlobal dəyişənə yükləyirik
            renderSubjects(allSubjects); // İlk açılışda hamısını göstər
        })
        .catch(error => console.log("JSON FAILED", error));

    // Ekrana yazdırma funksiyası
    function renderSubjects(data) {
        if (data.length === 0) {
            container.innerHTML = `<p style="width:100%; text-align:center; color:#666;">Heç bir nəticə tapılmadı.</p>`;
            return;
        }
        
        container.innerHTML = data.map(subject => `
            <div class="subject-card" onclick="startQuiz('${subject.id}')">
                <div class="card-icon">${subject.icon}</div>
                <div class="card-title">${subject.title}</div>
                <div class="card-meta">${subject.count} sual • Hər gün yenilənir</div>
                <div class="card-arrow">→</div>
            </div>
        `).join("");
    }

    // Axtarış funksiyası (Real vaxt rejimi)
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        const filteredSubjects = allSubjects.filter(subject => 
            subject.title.toLowerCase().includes(searchTerm)
        );

        renderSubjects(filteredSubjects);
    });

    // "Axtar" düyməsi üçün də (əlavə olaraq)
    searchButton.addEventListener("click", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredSubjects = allSubjects.filter(subject => 
            subject.title.toLowerCase().includes(searchTerm)
        );
        renderSubjects(filteredSubjects);
    });

    window.startQuiz = function(subjectId) {
        window.location.href = `quiz.html?subject=${subjectId}`;
    };
}

// ---------------------- QUIZ PAGE ----------------------
if (window.location.pathname.endsWith("quiz.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const subjectId = urlParams.get('subject');

        if (!subjectId) {
            console.error("No subject provided!");
            return;
        }

        // Başlıq üçün fetch
        fetch("subjects.json")
            .then(res => res.json())
            .then(subjects => {
                const subject = subjects.find(s => s.id === subjectId);
                if (subject) {
                    document.querySelector(".fenn-id h1").textContent = subject.title;
                }
            })
            .catch(err => console.error("Subject fetch error:", err));

        // Suallar üçün fetch
        fetch(`${subjectId}.json`)
            .then(res => res.json())
            .then(data => {
                const allQuestions = data.questions;
                const questions = shuffleArray(allQuestions).slice(0, 2); 
                
                let currentIndex = 0;
                let score = 0;
                let timerInterval;
                let secondsElapsed = 0;
                // İstifadəçinin verdiyi cavabları yadda saxlamaq üçün
                let userAnswers = {}; 

                const questionEl = document.getElementById("question-text");
                const optionsContainer = document.getElementById("options-container");
                const counterEl = document.getElementById("question-counter");
                const progressEl = document.getElementById("progress-fill");
                const prevBtn = document.getElementById("evvelki-btn");
                const nextBtn = document.getElementById("novbeti-btn");

                // Düymələrə event listener əlavə edirik
                prevBtn.onclick = () => navigate(-1);
                nextBtn.onclick = () => navigate(1);

                function formatTime(seconds) {
                    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
                    const s = (seconds % 60).toString().padStart(2, '0');
                    return `${m}:${s}`;
                }

                function startTimer() {
                    if (timerInterval) clearInterval(timerInterval);
                    secondsElapsed = 0;
                    const timerEl = document.getElementById("quiz-timer");
                    if(timerEl) timerEl.textContent = "00:00";

                    timerInterval = setInterval(() => {
                        secondsElapsed++;
                        if(timerEl) timerEl.textContent = formatTime(secondsElapsed);
                    }, 1000);
                }

                function renderQuestion(index) {
                    const q = questions[index];
                    questionEl.textContent = q.question;
                    counterEl.textContent = `${index + 1} / ${questions.length}`;

                    // Progress bar
                    const progressPercent = ((index) / questions.length) * 100;
                    progressEl.style.width = `${progressPercent}%`;

                    // Variantları yarat
                    optionsContainer.innerHTML = Object.entries(q.options).map(([key, text]) =>
                        `<button class="option-btn" data-key="${key}">${key}) ${text}</button>`
                    ).join("");
                    
                    const optionBtns = document.querySelectorAll(".option-btn");

                    // Əgər bu suala əvvəllər cavab verilibsə, bərpa et
                    if (userAnswers[index]) {
                        const savedAnswer = userAnswers[index];
                        optionsContainer.classList.add("disabled");
                        
                        optionBtns.forEach(btn => {
                            const key = btn.dataset.key;
                            if (key === savedAnswer) {
                                if (key === q.correct_answer) {
                                    btn.classList.add("correct");
                                } else {
                                    btn.classList.add("wrong");
                                }
                            }
                        });
                        nextBtn.disabled = false;
                    } else {
                        // Yeni sual
                        optionsContainer.classList.remove("disabled");
                        nextBtn.disabled = true;

                        optionBtns.forEach(btn => {
                            btn.onclick = () => handleOptionClick(btn, q, index);
                        });
                    }

                    // Düymələrin vəziyyəti
                    prevBtn.disabled = (index === 0);
                    
                    if (index === questions.length - 1) {
                        nextBtn.textContent = "Nəticə";
                    } else {
                        nextBtn.textContent = "Növbəti";
                    }
                }

                function handleOptionClick(btn, questionData, index) {
                    const selected = btn.dataset.key;
                    userAnswers[index] = selected;

                    if (selected === questionData.correct_answer) {
                        btn.classList.add("correct");
                        score++;
                    } else {
                        btn.classList.add("wrong");
                    }

                    const container = document.getElementById("options-container");
                    container.classList.add("disabled");
                    nextBtn.disabled = false;
                }

                function navigate(direction) {
                    const newIndex = currentIndex + direction;
                        
                    if (newIndex >= 0 && newIndex < questions.length) {
                        currentIndex = newIndex;
                        renderQuestion(currentIndex);
                    } else if (newIndex >= questions.length) {
                        showResult();
                    }
                }       

                function showResult() {
                    // 1. Vaxtı dayandır
                    clearInterval(timerInterval);
                    const finalTime = formatTime(secondsElapsed);

                    // 2. Elementləri gizlət
                    const topPart = document.querySelector(".top-part");
                    const sualWord = document.querySelector(".sual-word");
                    const quizButtons = document.querySelector(".quiz-buttons-bg");
                    const sualTextBg = document.querySelector(".sual-text-bg");
                    const exitBg = document.querySelector(".exit-bg a");

                    if(topPart) topPart.style.display = "none";
                    if(sualWord) sualWord.style.display = "none";
                    if(quizButtons) quizButtons.style.display = "none";
                    if(sualTextBg) sualTextBg.style.display = "none";
                    if(exitBg) exitBg.style.display = "none";

                    // 3. Fənn adını götür və başlığı gizlət
                    const headerTitle = document.querySelector(".fenn-id h1");
                    let subjectTitle = "";
                    if (headerTitle) {
                        subjectTitle = headerTitle.textContent;
                        headerTitle.style.display = "none";
                    }

                    // 4. Statistikaları hesabla
                    const percentage = Math.round((score / questions.length) * 100);
                    const wrongAnswers = questions.length - score;

                    // 5. HTML Strukturunu yarat
                    optionsContainer.innerHTML = `
                        <div class="result-container">
                            <div class="circle-progress-container">
                                <div class="circle-progress" style="--degrees: ${percentage * 3.6}deg;">
                                    <span class="progress-value">${percentage}%</span>
                                </div>
                            </div>

                            <h1 class="result-title">Yekun nəticə: ${score}/${questions.length}</h1>
                            <p class="result-subject">${subjectTitle}</p>

                            <div class="stats-card">
                                <div class="stat-row">
                                    <span class="stat-label"><span class="dot-blue">●</span> Düzgün cavablar</span>
                                    <span class="stat-count">${score}</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label"><span class="dot-red">●</span> Səhv cavablar</span>
                                    <span class="stat-count">${wrongAnswers}</span>
                                </div>
                                
                                <div class="stat-row">
                                    <span class="stat-label"><span class="dot-grey">●</span> Sərf olunan vaxt</span>
                                    <span class="stat-count">${finalTime}</span>
                                </div>

                                <div class="stat-row last-row">
                                    <span class="stat-label"><span class="dot-green">●</span> Keçmə faizi</span>
                                    <span class="stat-count green-text">${percentage}%</span>
                                </div>
                            </div>

                            <div class="result-actions">
                                <a href="fennler-menu.html" class="link-blue">Əsas səhifə</a>
                                <button class="btn-blue" onclick="window.location.reload()">Davam et</button>
                            </div>
                        </div>
                    `;

                    optionsContainer.classList.remove("disabled");
                }
                // ==========================================
                // SUALI REPORT ETMƏK (ŞİKAYƏT) FUNKSİYASI
                // ==========================================
                
                // Düyməyə və ya ikona kliklədikdə bu funksiya işə düşəcək
                window.openReportFrame = function() {
                    // Ekranda görünən cari sualı DOM-dan alırıq
                    const currentQuestionText = document.getElementById("question-text").innerText;

                    // Qlobal Action Modala göndəriləcək HTML struktur
                    const reportHTML = `
                        <h2>Sualı Şikayət Et</h2>
                        
                        <div>
                            <span class="report-label">Problemli sual:</span>
                            <div class="reported-question-box">${currentQuestionText}</div>
                        </div>
                        
                        <div>
                            <span class="report-label">Problemin təsviri:</span>
                            <textarea id="reportReasonText" class="report-textarea" placeholder="Sualda hansı səhvi və ya problemi gördüyünüzü ətraflı yazın..."></textarea>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="btn-cancel" onclick="closeActionModal()">Ləğv et</button>
                            <button class="btn-continue" onclick="submitReport()">Göndər</button>
                        </div>
                    `;
                    
                    openActionModal(reportHTML); // Qlobal modalı çağırırıq
                };

                // Göndər düyməsinə basıldıqda işləyəcək funksiya
                window.submitReport = function() {
                    const reason = document.getElementById("reportReasonText").value.trim();
                    
                    if (!reason) {
                        showMessage("Zəhmət olmasa problemin nə olduğunu qeyd edin!");
                        return;
                    }
                    closeActionModal(); // Action pəncərəsini bağla
                    showMessage("Şikayətiniz uğurla göndərildi. Təşəkkür edirik!"); // Təşəkkür mesajı göstər
                };
                // Quiz-i başlat
                renderQuestion(currentIndex);
                startTimer();
            })
            .catch(err => console.error("Fetch error:", err));
    });

    function shuffleArray(array) {
        return array
            .map(a => [Math.random(), a])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1]);
    }
}
// ---------------------- PROFILE PAGE ----------------------
if (window.location.pathname.includes("profile.html")) {
    const supabaseUrl = 'https://xoebhhdirsvjorjlrfzi.supabase.co';
    const supabaseKey = 'sb_publishable_FpT1VBCd5NKEnrYQbmx9Gw_MqWxVMvN';
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    document.addEventListener("DOMContentLoaded", async () => {
        // 1. İstifadəçi məlumatlarını Supabase-dən çəkirik
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error || !user) {
            // Əgər istifadəçi giriş etməyibsə, login səhifəsinə atırıq
            window.location.href = "login.html";
            return;
        }

        // 2. HTML-dəki inputları tapırıq və dəyərləri içinə yazırıq
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (usernameInput) usernameInput.value = user.user_metadata?.full_name || "";
        if (emailInput) emailInput.value = user.email || "";
        if (passwordInput) passwordInput.value = "********"; // Şifrə gizli qalmalıdır
        // ==========================================
        // 3. ABUNƏLİK YOXLANIŞI VƏ EKRANA YAZDIRILMASI
        // ==========================================
        const abunelikBg = document.querySelector('.abunelik-bg');
        const premiumBg = document.querySelector('.premium-abunelik-bg');
        const premiumText = document.querySelector('#premium-text p');
        const bitmeTarixi = document.getElementById('bitme-tarixi');

        const { data: abuneData, error: abuneError } = await supabaseClient
            .from('abunelikler')
            .select('*')
            .eq('user_id', user.id)
            .single(); // Həmin istifadəçinin sətirini tapırıq

        if (abuneData) {
            const indi = new Date();
            const bitis = new Date(abuneData.bitis_tarixi);
            
            // Əgər vaxtı hələ bitməyibsə
            if (indi < bitis) {
                // "Pulsuz" div-ini gizlət, "Premium" div-ini göstər
                if(abunelikBg) abunelikBg.style.display = 'none';
                if(premiumBg) premiumBg.style.display = 'flex'; // və ya sizin css necə tələb edirsə
                
                // Planın adını və bitiş tarixini yaz
                if(premiumText) premiumText.textContent = abuneData.plan_adi;
                
                // Tarixi qəşəng və anlaşılan formata salırıq (məs: 20 Mart 2026)
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                if(bitmeTarixi) bitmeTarixi.textContent = bitis.toLocaleDateString('az-AZ', options);
            } 
        }
        // ==========================================
        // DƏYİŞDİRMƏ MODALI (E-poçt və Şifrə üçün)
        // ==========================================
        window.openChangeFrame = function(type) {
            const title = type === 'email' ? 'E-poçtu yenilə' : 'Şifrəni yenilə';
            const newValLabel = type === 'email' ? 'Yeni e-poçt' : 'Yeni şifrə';
            const inputType = type === 'password' ? 'password' : 'email';

            // OTP yerinə sadəcə yeni dəyəri istədiyimiz modal açılır
            const modalHTML = `
                <h2>${title}</h2>
                <p style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">
                    ${type === 'email' 
                        ? 'Yeni e-poçt ünvanınızı daxil edin. Təsdiq linki göndəriləcək.' 
                        : 'Yeni şifrənizi daxil edin.'}
                </p>
                <div class="input-group">
                    <label>${newValLabel}</label>
                    <input type="${inputType}" id="newActionValue" placeholder="Yenisini daxil edin">
                </div>
                <div class="action-buttons">
                    <button class="btn-cancel" onclick="closeActionModal()">Ləğv et</button>
                    <button class="btn-continue" id="modalSubmitBtn" onclick="submitChange('${type}')">Təsdiqlə</button>
                </div>
            `;
            
            openActionModal(modalHTML); 
        };

        // Modalın içindəki Təsdiqlə düyməsinə basıldıqda işləyir
        window.submitChange = async function(type) {
            const newValueInput = document.getElementById("newActionValue");
            const newValue = newValueInput ? newValueInput.value.trim() : "";
            const submitBtn = document.getElementById("modalSubmitBtn");
            
            if (!newValue) {
                await showMessage("Zəhmət olmasa xananı doldurun!");
                return;
            }

            if (type === 'password' && newValue.length < 6) {
                await showMessage("Şifrə ən azı 6 simvol olmalıdır!");
                return;
            }

            // Düyməni donuq vəziyyətə gətiririk ki, 2 dəfə basılmasın
            if (submitBtn) {
                submitBtn.textContent = "Gözləyin...";
                submitBtn.disabled = true;
            }
            // Supabase-ə göndəriləcək məlumat
            let updateParams = {};
            let supabaseResponse; 

            if (type === 'email') {
                updateParams = { email: newValue };
                const updateOptions = { 
                    emailRedirectTo: 'https://hex277.github.io/imtahan-suallari/imtahan-suallari/change_email.html' 
                };
                supabaseResponse = await supabaseClient.auth.updateUser(updateParams, updateOptions);
            } else if (type === 'password') {
                updateParams = { password: newValue };
                supabaseResponse = await supabaseClient.auth.updateUser(updateParams);
            }

            const { data, error } = supabaseResponse;
            closeActionModal(); // Modalı bağlayırıq
            if (error) {
                await showMessage("Xəta baş verdi: " + error.message);
            } else {
                if (type === 'email') {
                    await showMessage(`Təsdiq linki <b>${newValue}</b> ünvanına göndərildi. Zəhmət olmasa e-poçtunuzu yoxlayın.`, "showMessage", "Bağla");
                } else {
                    await showMessage("Şifrəniz uğurla yeniləndi!", "showMessage", "Tamam");
                }
            }
        };

        // ==========================================
        // DƏYİŞİKLİKLƏRİ SAXLA (Yalnız Ad üçün)
        // ==========================================
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const newName = usernameInput.value.trim();
                
                if (!newName) {
                    await showMessage("İstifadəçi adı boş ola bilməz!");
                    return;
                }

                const originalText = saveBtn.textContent;
                saveBtn.textContent = "Saxlanılır...";
                saveBtn.disabled = true;

                // Adı metadata kimi yeniləyirik
                const { data, error } = await supabaseClient.auth.updateUser({
                    data: { full_name: newName }
                });

                saveBtn.textContent = originalText;
                saveBtn.disabled = false;

                if (error) {
                    await showMessage("Xəta: " + error.message);
                } else {
                    await showMessage("Profil məlumatlarınız uğurla yadda saxlanıldı!", "showMessage", "Tamam");
                }
            });
        }

        // ==========================================
        // HESABDAN ÇIX (Logout)
        // ==========================================
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                // Sizin yaratdığınız "confirm" tipli showMessage ilə soruşuruq
                const isConfirmed = await showMessage("Hesabdan çıxmaq istədiyinizə əminsiniz?", "confirm");
                
                if (isConfirmed) {
                    await supabaseClient.auth.signOut();
                    window.location.href = "login.html";
                }
            });
        }

        // ==========================================
        // HESABI SİL (Supabase Cədvəlinə Yazmaq - Spam qorumalı)
        // ==========================================
        const deleteBtn = document.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const isConfirmed = await showMessage("Hesabınızı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!", "confirm");
                
                if (isConfirmed) {
                    deleteBtn.textContent = "Yoxlanılır...";
                    deleteBtn.disabled = true;

                    const userEmail = user.email; 

                    // 1. Əvvəlcə yoxlayırıq: Bu e-poçt artıq cədvəldə varmı?
                    const { data: existingData, error: checkError } = await supabaseClient
                        .from('hesab_silme_telebleri')
                        .select('email')
                        .eq('email', userEmail); // Cədvəldəki 'email' sütunu istifadəçinin e-poçtuna bərabər olanları tap

                    if (checkError) {
                        await showMessage("Sorğu yoxlanılarkən xəta baş verdi: " + checkError.message);
                        deleteBtn.textContent = "Hesabı sil";
                        deleteBtn.disabled = false;
                        return;
                    }

                    // 2. Əgər data içində nəticə varsa, deməli artıq müraciət edib
                    if (existingData && existingData.length > 0) {
                        await showMessage("Sizin hesab silmə istəyiniz artıq qeydə alınıb və hazırda icra olunur.", "showMessage", "Tamam");
                        deleteBtn.textContent = "Hesabı sil";
                        deleteBtn.disabled = false;
                        return; // funksiyanı buradaca dayandırırıq ki, yenidən bazaya yazmasın
                    }

                    // 3. Əgər əvvəllər müraciət etməyibsə, cədvələ yeni sorğu kimi əlavə edirik
                    deleteBtn.textContent = "Göndərilir...";
                    
                    const { error: insertError } = await supabaseClient
                        .from('hesab_silme_telebleri')
                        .insert([
                            { email: userEmail }
                        ]);

                    if (insertError) {
                        await showMessage("Sorğu göndərilərkən xəta baş verdi: " + insertError.message);
                        deleteBtn.textContent = "Hesabı sil";
                        deleteBtn.disabled = false;
                        return;
                    }

                    // Uğurla yazıldıqdan sonra istifadəçiyə yekun mesajı veririk
                    await showMessage("Hesab silmə tələbiniz qeydə alındı. 1 həftə içərisində hesabınız tamamilə silinəcək.", "showMessage", "Tamam");
                    
                    // Sistemdən çıxış edib login-ə atırıq
                    await supabaseClient.auth.signOut();
                    window.location.href = "login.html";
                }
            });
        }

    });
}
// ---------------------- PREMIUM PAGE ----------------------
if (window.location.pathname.includes("premium.html")) {
    const supabaseUrl = 'https://xoebhhdirsvjorjlrfzi.supabase.co';
    const supabaseKey = 'sb_publishable_FpT1VBCd5NKEnrYQbmx9Gw_MqWxVMvN'; 
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- 1. SƏHİFƏ AÇILANDA ABUNƏLİYİ YOXLA VƏ DÜYMƏLƏRİ KİLİDLƏ ---
    // DOMContentLoaded əvəzinə xüsusi asinxron funksiya yaradıb dərhal çağırırıq
    async function checkActivePlan() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            const { data: abuneData } = await supabaseClient
                .from('abunelikler')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (abuneData) {
                const indi = new Date();
                const bitis = new Date(abuneData.bitis_tarixi);
                
                if (indi < bitis) {
                    // Bütün premium düymələrini tapırıq
                    const btns = document.querySelectorAll('.btn-plan-active');
                    
                    btns.forEach(btn => {
                        // Əgər bu düymə istifadəçinin aldığı plandırsa:
                        if (btn.getAttribute('onclick').includes(abuneData.plan_adi)) {
                            btn.textContent = "Aktivdir";
                            btn.disabled = true;
                            btn.style.backgroundColor = "#4CAF50"; // Yaşıl rəng
                            btn.style.cursor = "default";
                        } 
                        // Digər planlardırsa:
                        else {
                            btn.textContent = "Mövcud planınız var";
                            btn.disabled = true;
                            btn.style.opacity = "0.5";
                            btn.style.cursor = "not-allowed";
                        }
                    });
                }
            }
        }
    }
    
    // Funksiyanı dərhal işə salırıq
    checkActivePlan();


    // --- 2. YENİ PLAN ALMAQ (DÜYMƏYƏ BASANDA) ---
    window.activatePlan = async function(planAdi) {
        
        console.log(planAdi + " düyməsinə basıldı!"); 

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("Premium almaq üçün əvvəlcə hesabınıza daxil olmalısınız!");
            window.location.href = "login.html"; 
            return;
        }

        let gunSayi = 0;
        if (planAdi === '3 Günlük') gunSayi = 3;
        else if (planAdi === '7 Günlük') gunSayi = 7;
        else if (planAdi === '30 Günlük') gunSayi = 30;

        const bitisTarixi = new Date();
        bitisTarixi.setDate(bitisTarixi.getDate() + gunSayi);
        const formatlanmisTarix = bitisTarixi.toISOString();

        const { data, error } = await supabaseClient
            .from('abunelikler')
            .upsert({
                user_id: user.id,
                email: user.email, // <--- Baxın, e-poçtu buraya əlavə etdik!
                plan_adi: planAdi,
                bitis_tarixi: formatlanmisTarix
            }, { 
                onConflict: 'user_id' 
            });

        if (error) {
            alert("Xəta baş verdi: " + error.message);
            console.error("Supabase xətası:", error);
        } else {
            await supabaseClient.auth.updateUser({
                data: { is_premium: true }
            });
            const successMessageHTML = `
                <div style="text-align: center;">
                    <img src="../images/premium-dicaprio.png" alt="Premium" style="width: 80px; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 16px;">Təbriklər! <b>${planAdi}</b> Premium abunəliyiniz uğurla aktivləşdirildi.</p>
                </div>
            `;
            
            await showMessage(successMessageHTML, "alert"); 
            
            window.location.reload();
        }
    };
}