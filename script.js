// ---------------------- FENNLER MENU ----------------------
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
                // Test üçün sual sayı (istəsəniz limit qoya bilərsiniz, məsələn .slice(0, 5))
                const questions = shuffleArray(allQuestions).slice(0,3); 
                
                let currentIndex = 0;
                let score = 0;
                // İstifadəçinin verdiyi cavabları yadda saxlamaq üçün (index -> seçilən variant)
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

                    // Əgər bu suala əvvəllər cavab verilibsə, vəziyyəti bərpa et
                    if (userAnswers[index]) {
                        const savedAnswer = userAnswers[index];
                        optionsContainer.classList.add("disabled"); // Seçimləri kilidlə
                        
                        optionBtns.forEach(btn => {
                            const key = btn.dataset.key;
                            // Rəngləri bərpa et
                            if (key === savedAnswer) {
                                if (key === q.correct_answer) {
                                    btn.classList.add("correct");
                                } else {
                                    btn.classList.add("wrong");
                                }
                            }
                            // İzahlı qeyd: Əgər səhv cavab verilibsə, düzgün cavabı da göstərmək istəsəniz 
                            // bura əlavə kod yaza bilərsiniz. Hazırda sadəcə basılanı qızardır.
                        });
                        
                        // Növbəti düyməsini aktiv et
                        nextBtn.disabled = false;
                    } else {
                        // Sual yeni sualdırsa
                        optionsContainer.classList.remove("disabled");
                        nextBtn.disabled = true; // Cavab verilməyibsə "Növbəti" deaktiv olsun

                        // Klik hadisəsi
                        optionBtns.forEach(btn => {
                            btn.onclick = () => handleOptionClick(btn, q, index);
                        });
                    }

                    // "Əvvəlki" düyməsinin vəziyyəti
                    if (index === 0) {
                        prevBtn.disabled = true;
                    } else {
                        prevBtn.disabled = false;
                    }
                    
                    // Sonuncu sualdırsa "Növbəti" yerinə "Bitir" yaza bilərsiniz, 
                    // amma sizin istəyə uyğun olaraq "Növbəti" funksiyası showResult çağıracaq.
                    if (index === questions.length - 1) {
                        nextBtn.textContent = "Nəticə";
                    } else {
                        nextBtn.textContent = "Növbəti";
                    }
                }

                function handleOptionClick(btn, questionData, index) {
                    const selected = btn.dataset.key;
                    
                    // Cavabı yadda saxla
                    userAnswers[index] = selected;

                    // Düzgünlüyü yoxla
                    // QEYD: JSON faylında "correct_answer": "A" (və ya B, C) olmalıdır. 
                    // Hazırda null olduğu üçün həmişə səhv çıxacaq. Test üçün JSON-u düzəltməlisiniz.
                    if (selected === questionData.correct_answer) {
                        btn.classList.add("correct");
                        score++;
                    } else {
                        btn.classList.add("wrong");
                    }

                    // Bütün düymələri kilidlə
                    const container = document.getElementById("options-container");
                    container.classList.add("disabled");

                    // "Növbəti" düyməsini aktiv et
                    nextBtn.disabled = false;
                }

                function navigate(direction) {
                    // direction: -1 (əvvəlki) və ya 1 (növbəti)
                    const newIndex = currentIndex + direction;

                    if (newIndex >= 0 && newIndex < questions.length) {
                        currentIndex = newIndex;
                        renderQuestion(currentIndex);
                    } else if (newIndex >= questions.length) {
                        showResult();
                    }
                }

                function showResult() {
                    // 1. Sual panelini və köhnə elementləri gizlət
                    document.querySelector(".top-part").style.display = "none";
                    document.querySelector(".sual-word").style.display = "none";
                    document.querySelector(".quiz-buttons-bg").style.display = "none";
                    document.querySelector(".sual-text-bg").style.display = "none";
                    
                    // Başlığı təmizləyirik ki, səhifənin yuxarısında qalmasın (nəticənin içində göstərəcəyik)
                    const headerTitle = document.querySelector(".fenn-id h1");
                    const subjectTitle = headerTitle.textContent; 
                    headerTitle.style.display = "none"; // Yuxarıdakı başlığı gizlət

                    // 2. Statistikaları hesabla
                    const percentage = Math.round((score / questions.length) * 100);
                    const wrongAnswers = questions.length - score;

                    // 3. Şəklə uyğun HTML strukturunu yarat
                    optionsContainer.innerHTML = `
                        <div class="result-container">
                            <div class="circle-progress-container">
                                <div class="circle-progress" style="background: conic-gradient(#1e90ff ${percentage * 3.6}deg, #f3f3f3 0deg);">
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

                    // Konteynerin kilidini aç (əgər varsa)
                    optionsContainer.classList.remove("disabled");
                }
                // İlk sualı başlat
                renderQuestion(currentIndex);
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