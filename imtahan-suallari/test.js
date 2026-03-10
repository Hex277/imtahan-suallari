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