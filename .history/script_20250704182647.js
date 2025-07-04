document.addEventListener("DOMContentLoaded", () => {
  // Carousel logic (if you use it)
  const track = document.querySelector('.carousel-track');
  if (track) {
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button-right');
    const prevButton = document.querySelector('.carousel-button-left');
    const slideWidth = slides[0].getBoundingClientRect().width;
    let currentIndex = 0;

    const updateCarousel = () => {
      const offset = -slideWidth * currentIndex;
      track.style.transform = `translateX(${offset}px)`;
    };

    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    });

    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    });

    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    }, 5000);
  }

  // BANK REPO CARS GRID
  const grid = document.getElementById("bankRepoGrid");
  const pagination = document.getElementById("pagination");
  const carsPerPage = 6;
  let currentPage = 1;
  let allCars = [];

  if (grid) {
    fetch('bank-repo-cars.json')
      .then(res => res.json())
      .then(data => {
        allCars = data;
        renderPage(currentPage);
        renderPagination();
      })
      .catch(err => {
        grid.innerHTML = "<p style='color:red;'>❌ Failed to load cars.</p>";
        console.error(err);
      });

    function renderPage(page) {
      grid.innerHTML = '';
      const start = (page - 1) * carsPerPage;
      const end = start + carsPerPage;
      const pageCars = allCars.slice(start, end);

      pageCars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.innerHTML = `
          <img src="${car.image}" alt="${car.title}" />
          <div class="vehicle-info">
            <h3>${car.title}</h3>
            <p>${car.desc}</p>
            <p class="price">${car.price}</p>
            <button class="enquire-btn">ENQUIRE</button>
          </div>
        `;
        grid.appendChild(card);
      });

      // Attach event listeners to new buttons
      grid.querySelectorAll('.enquire-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.vehicle-card');
          const title = card.querySelector('h3').textContent;
          const encoded = encodeURIComponent(title);
          window.location.href = `enquire.html?car=${encoded}`;
        });
      });
    }

    function renderPagination() {
      if (!pagination) return;
      pagination.innerHTML = '';
      const totalPages = Math.ceil(allCars.length / carsPerPage);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
          currentPage = i;
          renderPage(currentPage);
          renderPagination();
        });
        pagination.appendChild(btn);
      }

      if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          currentPage++;
          renderPage(currentPage);
          renderPagination();
        });
        pagination.appendChild(nextBtn);
      }
    }
  }

  // MAIN CAR GRID (if you use it elsewhere)
  const mainCarGrid = document.getElementById("mainCarGrid");
  const mainPagination = document.getElementById("mainCarPagination");
  const mainStatus = document.getElementById("mainCarStatus");
  const carsPerPageMain = 6;
  let currentMainPage = 1;
  let allMainCars = [];

  if (mainCarGrid && mainPagination && mainStatus) {
    fetch('cars.json')
      .then(res => res.json())
      .then(data => {
        allMainCars = data;
        renderMainPage(currentMainPage);
        renderMainPagination();
      })
      .catch(err => {
        mainStatus.textContent = "❌ Failed to load car listings: " + err.message;
        console.error(err);
      });

    function renderMainPage(page) {
      mainCarGrid.innerHTML = '';
      const start = (page - 1) * carsPerPageMain;
      const end = start + carsPerPageMain;
      const pageCars = allMainCars.slice(start, end);

      pageCars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.innerHTML = `
          <img src="${car.image}" alt="${car.title}" />
          <div class="info">
            <h3>${car.title}</h3>
            <p>${car.desc}</p>
            <p class="price">${car.price}</p>
            <button class="enquire-btn">ENQUIRE</button>
          </div>
        `;
        mainCarGrid.appendChild(card);
      });

      // Attach event listeners to new buttons
      mainCarGrid.querySelectorAll('.enquire-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.vehicle-card');
          const title = card.querySelector('h3').textContent;
          const encoded = encodeURIComponent(title);
          window.location.href = `enquire.html?car=${encoded}`;
        });
      });
    }

    function renderMainPagination() {
      mainPagination.innerHTML = '';
      const totalPages = Math.ceil(allMainCars.length / carsPerPageMain);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentMainPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
          currentMainPage = i;
          renderMainPage(currentMainPage);
          renderMainPagination();
        });
        mainPagination.appendChild(btn);
      }

      if (currentMainPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          currentMainPage++;
          renderMainPage(currentMainPage);
          renderMainPagination();
        });
        mainPagination.appendChild(nextBtn);
      }
    }
  }
});

const response = await fetch('https://bna2-backend.onrender.com/add-car', { ... });
