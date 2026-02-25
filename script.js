// ---------------------- FENNLER MENU ----------------------
if (window.location.pathname.endsWith("fennler-menu.html")) {
    const container = document.getElementById("subjects-bg");

    fetch("subjects.json")
        .then(response => response.json())
        .then(subjects => {
            container.innerHTML = subjects.map(subject => `
                <div class="subject-card" onclick="startQuiz('${subject.id}')">
                    <div class="card-icon">${subject.icon}</div>
                    <div class="card-title">${subject.title}</div>
                    <div class="card-meta">${subject.count} sual • Hər gün yenilənir</div>
                    <div class="card-arrow">→</div>
                </div>
            `).join("");
        })
        .catch(error => console.log("JSON FAILED", error));

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
        fetch("subjects.json")
            .then(res => res.json())
            .then(subjects => {
                const subject = subjects.find(s=> s.id === subjectId);
                if (subject) {
                    document.querySelector(".fenn-id h1").textContent = subject.title;
                } else {
                    document.querySelector(".fenn-id h1").textContent = "None 500";
                }
            })
            .catch(err => console.error("Subject id error:",err))
        fetch(`${subjectId}.json`)
            .then(res => res.json())
            .then(data => {
                const allQuestions = data.questions;
                const numQuestions = Math.min(5, allQuestions.length);
                const questions = shuffleArray(allQuestions).slice(0, numQuestions);

                let currentIndex = 0;
                let score = 0;

                const questionEl = document.getElementById("question-text");
                const optionsContainer = document.getElementById("options-container");
                const counterEl = document.getElementById("question-counter");
                const progressEl = document.getElementById("progress-fill");

                function renderQuestion(index) {
                    const q = questions[index];
                    questionEl.textContent = q.question;
                     // Sual və sual sayı
                    questionEl.textContent = q.question;
                    counterEl.textContent = `${index + 1} / ${questions.length}`;

                    // Progress bar
                    const progressPercent = ((index) / questions.length) * 100;
                    progressEl.style.width = `${progressPercent}%`;
                    optionsContainer.innerHTML = Object.entries(q.options).map(([key, text]) =>
                        `<button class="option-btn" data-key="${key}">${key}. ${text}</button>`
                    ).join("");

                    document.querySelectorAll(".option-btn").forEach(btn => {
                        btn.onclick = () => {
                            const selected = btn.dataset.key;
                            if (selected === q.correct_answer) score++;

                            currentIndex++;
                            if (currentIndex < questions.length) {
                                renderQuestion(currentIndex);
                            } else {
                                showResult();
                                counterEl.style.display = "none";
                                document.getElementById("sual-text").style.display = "none";
                            }
                        };
                    });
                }

                function showResult() {
                    questionEl.textContent = `Nəticə: ${score} / ${questions.length}`;
                    optionsContainer.innerHTML = `
                        <button onclick="window.location.href='fennler-menu.html'">
                            Əsas menyuya qayıt
                        </button>
                    `;
                    counterEl.textContent = '';
                    progressEl.style.width = `100%`;
                }

                renderQuestion(currentIndex);

            })
            .catch(err => console.error("Fetch error:", err));
    });

    // yardımçı funksiya: array-i shuffle etmək
    function shuffleArray(array) {
        return array
            .map(a => [Math.random(), a])
            .sort((a,b) => a[0] - b[0])
            .map(a => a[1]);
    }
}