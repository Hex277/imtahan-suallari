// ---------------------- GLOBAL SCRIPTS ----------------------
const themeBtn = document.getElementById("theme-btn");
const themeImg = document.getElementById("theme-img");

// 1. Səhifə yüklənəndə yaddaşı yoxla
const currentTheme = localStorage.getItem("theme");

if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeImg.src = "sun.webp"; // Əgər dark-dırsa günəş göstər
}

// 2. Düyməyə kliklədikdə dəyiş və yadda saxla
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    
    let theme = "light";
    
    if (document.body.classList.contains("dark-theme")) {
        theme = "dark";
        themeImg.src = "sun.webp";
    } else {
        theme = "light";
        themeImg.src = "moon.webp";
    }
    
    // Seçimi yaddaşa yaz (Səhifə yenilənsə də itməyəcək)
    localStorage.setItem("theme", theme);
});
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
// ---------------------- BUY PREMIUM PAGE ----------------------
if (window.location.pathname.endsWith("premium.html")) {
    const plansBg = document.getElementById("plans-bg");
    let allPlans = [];
    fetch("plans.json")
        .then(response => response.json())
        .then(plans => {
            allPlans = plans;
            renderPlans(allPlans);
        })
        .catch(error => console.log("JSON FAILED", error));
    function renderPlans(data) {
        if (data.length === 0) {
            container.innerHTML = data.map(plan => `
                <div class="plan-card"'${plan.header}'">
                    <div class="card-price">${plan.price}</div>
                    <div class="card-sinfo">${plan.short-info}</div>
                    <div class="card-support">${plan.support1}</div>
                    <div class="card-support">${plan.support2}</div>
                    <div class="card-support">${plan.support3}</div>
                    <div class="card-support">${plan.support4}</div>
                    <div class="card-button"><button>Aktiv et</button></div>
                </div>
            `).join("");
        }
    }
}