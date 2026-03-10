// --- 1. ALT MENYULARIN AÇILIB-BAĞLANMASI (ACCORDION) ---
function toggleMenu(menuId, headerElement) {
  const abituriyentMenu = document.getElementById('abituriyent-menu');
  const telebeMenu = document.getElementById('telebe-menu');
  const allArrows = document.querySelectorAll('.arrow');
  const targetMenu = document.getElementById(menuId);
  const targetArrow = headerElement.querySelector('.arrow');
  
  if (!targetMenu || !targetArrow) return;
  
  const isOpen = targetMenu.classList.contains('open');

  if (abituriyentMenu) abituriyentMenu.classList.remove('open');
  if (telebeMenu) telebeMenu.classList.remove('open');
  allArrows.forEach(arrow => arrow.textContent = '>');
  
  if (!isOpen) {
    targetMenu.classList.add('open');
    targetArrow.textContent = 'v';
  }
}

// --- 2. SƏNİN ƏSAS KODUN VƏ MOBİL MENYU İDARƏSİ ---
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menuContent = document.getElementById("menu-bar");

  // İlk açılışda Tələbə menyusunun avtomatik açıq olması
  const telebeMenu = document.getElementById('telebe-menu');

  if (!menuToggle || !menuContent) return;

  let maxWidth = 250;
  if (!menuContent.classList.contains("hidden")) {
      maxWidth = menuContent.offsetWidth;
  } else {
      menuContent.classList.remove("hidden");
      maxWidth = menuContent.offsetWidth || 250;
      menuContent.classList.add("hidden");
      document.body.style.overflow = "";  
  }

  // --- DÜZƏLİŞ 1: Düyməyə klikləyəndə animasiya fəndi ---
  menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Hər ehtimala qarşı animasiyanı (transition) yenidən aktiv edirik
      menuContent.style.transition = "left 0.4s ease-in-out";

      if (menuContent.classList.contains("hidden")) {
          // 1. Öncə gizli sinfini silirik (display: block olur)
          menuContent.classList.remove("hidden");
          
          // 2. Çox kiçik bir gecikmə ilə sürüşdürməni işə salırıq ki, animasiya işləsin
          setTimeout(() => {
              menuContent.style.left = "0px";
          }, 10); 
          
          document.body.style.overflow = "hidden";
      } else {
          menuContent.style.left = `-${maxWidth}px`;
          document.body.style.overflow = "";
          // 400ms (animasiya müddəti) gözləyib sonra gizlədirik
          setTimeout(() => menuContent.classList.add("hidden"), 400);
      }
  });

  // --- DÜZƏLİŞ 2: Kənara klikləyəndə animasiya ---
  document.addEventListener("click", (e) => {
      const clickedInside = menuToggle.contains(e.target) || menuContent.contains(e.target);
      if (!clickedInside && !menuContent.classList.contains("hidden")) {
          menuContent.style.transition = "left 0.4s ease-in-out";
          menuContent.style.left = `-${maxWidth}px`;
          document.body.style.overflow = "";
          setTimeout(() => menuContent.classList.add("hidden"), 400);
      }
  });

  // --- SƏNİN SWIPE (SÜRÜŞDÜRMƏ) KODUN ---
  const swipeThreshold = window.innerWidth * 0.40;
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;

  document.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isDragging = true;
      menuContent.style.transition = "none"; // Barmaqla hərəkət edəndə animasiya ləğv olunur
  });

  document.addEventListener("touchmove", (e) => {});

  document.addEventListener("touchend", (e) => {
      isDragging = false;
      const touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(e.changedTouches[0].screenY - touchStartY);
      const horizontalDistance = Math.abs(swipeDistance);

      menuContent.style.transition = "left 0.4s ease-in-out"; // Sürüşdürmə bitəndə animasiya qayıdır

      if (horizontalDistance > verticalDistance) {
          if (menuContent.classList.contains("hidden") && swipeDistance > swipeThreshold) {
              menuContent.classList.remove("hidden");
              setTimeout(() => { menuContent.style.left = "0px"; }, 10);
              document.body.style.overflow = "hidden";
          } else if (!menuContent.classList.contains("hidden") && swipeDistance < -swipeThreshold) {
              menuContent.style.left = `-${maxWidth}px`;
              document.body.style.overflow = "";
              setTimeout(() => menuContent.classList.add("hidden"), 400);
          } else {
              if (menuContent.classList.contains("hidden")) {
                  menuContent.style.left = `-${maxWidth}px`;
                  document.body.style.overflow = "";
                  setTimeout(() => menuContent.classList.add("hidden"), 400);
              } else {
                  menuContent.style.left = "0px";
              }
          }
      }
  });
});