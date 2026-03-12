// Services related functions
const API_BASE = 'http://localhost:5000/api';

// Load services on page load
document.addEventListener('DOMContentLoaded', () => {
    loadServices();

    // Filter button handler
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', loadServices);
    }

    // Search on enter
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadServices();
            }
        });
    }
});

// Load services from API
async function loadServices() {
    const loading = document.getElementById('loading');
    const servicesList = document.getElementById('services-list');
    const noServices = document.getElementById('no-services');

    loading.style.display = 'block';
    servicesList.innerHTML = '';
    noServices.style.display = 'none';

    try {
        const search = document.getElementById('search')?.value || '';
        const category = document.getElementById('category')?.value || '';
        const college = document.getElementById('college')?.value || '';

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (college) params.append('college', college);

        const response = await fetch(`${API_BASE}/services?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        loading.style.display = 'none';

        if (response.ok && data.services && data.services.length > 0) {
            displayServices(data.services);
        } else {
            noServices.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        loading.style.display = 'none';
        noServices.style.display = 'block';
        noServices.textContent = 'Error loading services. Please try again.';
    }
}

// Display services in the grid
function displayServices(services) {
    const servicesList = document.getElementById('services-list');

    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';

        serviceCard.innerHTML = `
            <div class="service-card-content">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="service-price">$${service.price} ${service.priceType}</div>
                <div class="service-provider">
                    By: ${service.provider?.name || 'Unknown'} (${service.provider?.university || 'Unknown University'})
                </div>
                <div class="service-category">${service.category}</div>
                <button class="btn-primary" onclick="bookService('${service._id}')">Book Now</button>
            </div>
        `;

        servicesList.appendChild(serviceCard);
    });
}

// Book service function (redirect to booking page with service ID)
function bookService(serviceId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to book a service');
        window.location.href = 'login.html';
        return;
    }

    // Redirect to booking page with service ID
    window.location.href = `booking.html?serviceId=${serviceId}`;
}