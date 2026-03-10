// ---------------------- GLOBAL SCRIPTS ----------------------
document.addEventListener("DOMContentLoaded", function() {
    const telebeMenu = document.getElementById('telebe-menu');
    // Menyunu açırıq
    telebeMenu.classList.add('open');
    // Uyğun oxu tapıb 'v' edirik
    telebeMenu.previousElementSibling.querySelector('.arrow').textContent = 'v';
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
                    
                    // Boş göndərilməsinin qarşısını alırıq
                    if (!reason) {
                        showMessage("Zəhmət olmasa problemin nə olduğunu qeyd edin!");
                        return;
                    }
                    
                    // Burada gələcəkdə Backend-ə (məsələn: fetch POST) göndərmə kodu yazılacaq
                    console.log("Şikayət edilən sual: ", document.getElementById("question-text").innerText);
                    console.log("Səbəb: ", reason);
                    
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
if (window.location.pathname.endsWith("profile.html") || window.location.pathname === "/profile.html") {

    // 1. Dəyişmə pəncərəsini başlatan funksiya
    window.openChangeFrame = function(type) {
        const title = type === 'email' ? 'E-poçtu yenilə' : 'Şifrəni yenilə';
        const currentValLabel = type === 'email' ? 'Cari e-poçt' : 'Cari şifrə';
        const newValLabel = type === 'email' ? 'Yeni e-poçt' : 'Yeni şifrə';
        
        const dbCurrentValue = type === 'email' ? 'istifadeci@gmail.com' : '********'; 
        const inputType = type === 'password' ? 'password' : 'email';

        // Qlobal openActionModal funksiyasına göndəriləcək HTML
        const step1HTML = `
            <h2>${title}</h2>
            <div class="input-group">
                <label>${currentValLabel}</label>
                <input type="text" value="${dbCurrentValue}" disabled>
            </div>
            <div class="input-group">
                <label>${newValLabel}</label>
                <input type="${inputType}" id="newActionValue" placeholder="Yenisini daxil edin">
            </div>
            <div class="action-buttons">
                <button class="btn-cancel" onclick="closeActionModal()">Ləğv et</button>
                <button class="btn-continue" onclick="goToStep2('${type}')">Davam et</button>
            </div>
        `;
        
        openActionModal(step1HTML); // Qlobal funksiyanı çağırdıq
    };

    // 2. Davam et basıldıqda 2-ci addıma (OTP) keçid
    window.goToStep2 = function(type) {
        const newValueInput = document.getElementById("newActionValue");
        const newValue = newValueInput ? newValueInput.value.trim() : "";
        
        if (!newValue) {
            showMessage("Zəhmət olmasa xananı doldurun!");
            return;
        }

        const step2HTML = `
            <h2>Təsdiqləmə kodu</h2>
            <p style="font-size: 14px; margin-bottom: 20px; opacity: 0.8;">Təhlükəsizlik üçün e-poçt addressinizə göndərilən 6 rəqəmli kodu daxil edin.</p>
            
            <div class="verify-email-row">
                <span>${newValue}</span>
                <button onclick="openChangeFrame('${type}')">Dəyiş</button>
            </div>

            <div class="otp-container" id="otpInputs">
                <input type="text" maxlength="1" class="otp-box" autofocus>
                <input type="text" maxlength="1" class="otp-box">
                <input type="text" maxlength="1" class="otp-box">
                <input type="text" maxlength="1" class="otp-box">
                <input type="text" maxlength="1" class="otp-box">
                <input type="text" maxlength="1" class="otp-box">
            </div>

            <div class="action-buttons">
                <button class="btn-cancel" onclick="openChangeFrame('${type}')">Geri</button>
                <button class="btn-continue" onclick="submitChange('${type}')">Dəyiş</button>
            </div>
        `;

        openActionModal(step2HTML); // Qlobal modalın içini yeniləyirik
        setupOTPLogic(); // Qutuların məntiqini işə salırıq
    };

    // 3. OTP Qutularının irəli-geri tullanma məntiqi
    window.setupOTPLogic = function() {
        const inputs = document.querySelectorAll(".otp-box");
        
        inputs.forEach((input, index) => {
            input.addEventListener("input", (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, ""); 
                if (e.target.value !== "" && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && e.target.value === "" && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    };

    // 4. Son təsdiqləmə (Dəyiş) düyməsi
    window.submitChange = function(type) {
        let otpCode = "";
        document.querySelectorAll(".otp-box").forEach(inp => otpCode += inp.value);
        
        if (otpCode.length < 6) {
            showMessage("Kodu tam daxil edin!");
            return;
        }

        closeActionModal();
        showMessage("Məlumatlarınız uğurla yeniləndi!");
    };
}