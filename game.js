let tg = window.Telegram.WebApp;
tg.expand();

// Состояние игры
let gameState = {
    resources: {
        energy: 0,
        materials: 0
    },
    buildings: [],
    shopItems: [
        {
            id: 'generator',
            name: 'Генератор',
            cost: { materials: 10 },
            production: { energy: 1 },
            image: 'assets/generator.png'
        },
        {
            id: 'mine',
            name: 'Шахта',
            cost: { energy: 15 },
            production: { materials: 1 },
            image: 'assets/mine.png'
        },
        {
            id: 'powerPlant',
            name: 'Электростанция',
            cost: { materials: 50, energy: 20 },
            production: { energy: 5 },
            image: 'assets/powerplant.png'
        }
    ]
};

// Загрузка сохраненного состояния
function loadGame() {
    const savedState = localStorage.getItem('atomVillageState');
    if (savedState) {
        gameState = JSON.parse(savedState);
    }
    updateUI();
}

// Сохранение состояния
function saveGame() {
    localStorage.setItem('atomVillageState', JSON.stringify(gameState));
}

// Обновление интерфейса
function updateUI() {
    // Обновляем отображение ресурсов
    document.getElementById('energy').textContent = Math.floor(gameState.resources.energy);
    document.getElementById('materials').textContent = Math.floor(gameState.resources.materials);
    
    // Обновляем сетку зданий
    const buildingsGrid = document.getElementById('buildings-grid');
    buildingsGrid.innerHTML = '';
    
    gameState.buildings.forEach((building, index) => {
        const buildingElement = document.createElement('div');
        buildingElement.className = 'building';
        buildingElement.innerHTML = `
            <img src="${building.image}" alt="${building.name}">
            <div>${building.name}</div>
        `;
        buildingsGrid.appendChild(buildingElement);
    });
    
    // Обновляем магазин
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    
    gameState.shopItems.forEach(item => {
        const button = document.createElement('button');
        button.className = 'shop-item';
        
        const costText = Object.entries(item.cost)
            .map(([resource, amount]) => `${amount} ${resource}`)
            .join(', ');
            
        button.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 32px; height: 32px;">
            <div>${item.name}</div>
            <div>Стоимость: ${costText}</div>
        `;
        
        button.onclick = () => purchaseBuilding(item);
        
        // Проверяем, может ли игрок купить здание
        const canAfford = Object.entries(item.cost)
            .every(([resource, amount]) => gameState.resources[resource] >= amount);
            
        button.disabled = !canAfford;
        
        shopItems.appendChild(button);
    });
}

// Покупка здания
function purchaseBuilding(building) {
    // Проверяем, достаточно ли ресурсов
    const canAfford = Object.entries(building.cost)
        .every(([resource, amount]) => gameState.resources[resource] >= amount);
        
    if (!canAfford) return;
    
    // Вычитаем стоимость
    Object.entries(building.cost).forEach(([resource, amount]) => {
        gameState.resources[resource] -= amount;
    });
    
    // Добавляем здание
    gameState.buildings.push({...building});
    
    // Обновляем UI и сохраняем
    updateUI();
    saveGame();
}

// Производство ресурсов
function produceResources() {
    gameState.buildings.forEach(building => {
        if (building.production) {
            Object.entries(building.production).forEach(([resource, amount]) => {
                gameState.resources[resource] += amount / 10; // Делим на 10 для более плавного прироста
            });
        }
    });
    updateUI();
    saveGame();
}

// Инициализация игры
function initGame() {
    loadGame();
    setInterval(produceResources, 100); // Производство каждые 100мс
    
    // Настраиваем Telegram Mini App
    tg.ready();
    
    // Добавляем обработку темы
    if (tg.colorScheme === 'dark') {
        document.documentElement.style.setProperty('--tg-theme-bg-color', '#1f1f1f');
        document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
    }
}

// Запускаем игру
initGame(); 