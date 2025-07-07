document.addEventListener("DOMContentLoaded", () => {
  // 🚗 Carousel Logic
  const track = document.querySelector('.carousel-track');
  if (track) {
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button-right');
    const prevButton = document.querySelector('.carousel-button-left');

    if (slides.length && nextButton && prevButton) {
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
  }

  // 🔁 Shared Render Function
  function renderCars(grid, cars, page, perPage, pagination, statusElement) {
    grid.innerHTML = '';
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageCars = cars.slice(start, end);

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

    grid.querySelectorAll('.enquire-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.vehicle-card');
        const title = card.querySelector('h3').textContent;
        const encoded = encodeURIComponent(title);
        window.location.href = `enquire.html?car=${encoded}`;
      });
    });

    if (pagination) {
      pagination.innerHTML = '';
      const totalPages = Math.ceil(cars.length / perPage);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === page) btn.classList.add('active');
        btn.addEventListener('click', () => {
          renderCars(grid, cars, i, perPage, pagination, statusElement);
        });
        pagination.appendChild(btn);
      }

      if (page < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          renderCars(grid, cars, page + 1, perPage, pagination, statusElement);
        });
        pagination.appendChild(nextBtn);
      }
    }
  }

  // 🏦 BANK REPO CARS
  const bankRepoGrid = document.getElementById("bankRepoGrid");
  const bankPagination = document.getElementById("pagination");
  const carsPerPage = 6;

  if (bankRepoGrid) {
    fetch('/bank-repo-cars')
      .then(res => res.json())
      .then(data => {
        renderCars(bankRepoGrid, data, 1, carsPerPage, bankPagination);
      })
      .catch(err => {
        bankRepoGrid.innerHTML = "<p style='color:red;'>❌ Failed to load bank repo cars.</p>";
        console.error(err);
      });
  }

  // 🚘 MAIN CAR GRID
  const mainCarGrid = document.getElementById("mainCarGrid");
  const mainPagination = document.getElementById("mainCarPagination");
  const mainStatus = document.getElementById("mainCarStatus");
  const carsPerPageMain = 6;

  if (mainCarGrid && mainPagination && mainStatus) {
    fetch('/cars')
      .then(res => res.json())
      .then(data => {
        renderCars(mainCarGrid, data, 1, carsPerPageMain, mainPagination, mainStatus);
      })
      .catch(err => {
        mainStatus.textContent = "❌ Failed to load car listings: " + err.message;
        console.error(err);
      });
  }
});

//  Add Car via API
async function addCar(carData) {
  try {
    const response = await fetch('https://bna2-backend.onrender.com/add-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    if (!response.ok) throw new Error('Failed to add car');
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}