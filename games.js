const randomItems = [
    "Banana", "Laptop", "Dog memes", "Pineapple pizza", "Toaster", 
    "Shoelaces", "Rubber duck", "Potato chips", "Alien invasion", 
    "Penguin care tips", "Expired milk", "Sock collection", "Unicorn tax laws",
    "Dancing penguins", "Time travel", "Quantum socks", "Ninja turtles", "Space pizza"
];

const sampleParagraphs = [
    "This comprehensive guide explores the fascinating world of modern technology and its impact on everyday life. From smartphones to artificial intelligence, we examine how these innovations are reshaping the way we work, communicate, and live. The rapid pace of technological advancement continues to surprise even the most seasoned experts in the field.",
    
    "Research has shown that maintaining a healthy lifestyle involves a combination of regular exercise, balanced nutrition, and adequate sleep. Studies indicate that individuals who follow these principles tend to have better mental health, increased energy levels, and improved overall well-being. Experts recommend starting with small, manageable changes.",
    
    "The history of human civilization spans thousands of years, marked by remarkable achievements in art, science, and culture. Ancient civilizations laid the foundation for modern society through their innovations in agriculture, architecture, and governance. These early developments continue to influence contemporary thinking and practices.",
    
    "Environmental conservation has become increasingly important as we face global challenges like climate change and biodiversity loss. Scientists emphasize the need for sustainable practices that balance human needs with ecological preservation. Community involvement and education play crucial roles in achieving long-term environmental goals.",
    
    "The culinary arts represent one of humanity's most creative expressions, combining science, culture, and tradition. Chefs around the world continue to push boundaries, creating new flavors and techniques that delight diners and inspire future generations. Food culture serves as a bridge between different societies and traditions."
];

let currentGame = '';
let searchTerm = '';

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("searchBtn").addEventListener("click", startRandomGame);
});

function startRandomGame() {
    searchTerm = document.getElementById("search").value.trim();
    if (!searchTerm) return;

    // Show the game area
    document.querySelector('.game-area').style.display = 'block';

    // Randomly choose between games
    const games = ['elimination', 'lifo', 'cage'];
    currentGame = games[Math.floor(Math.random() * games.length)];
    
    // Hide search results
    document.getElementById("searchResults").style.display = "none";
    
    if (currentGame === 'elimination') {
        startEliminationGame();
    } else if (currentGame === 'lifo') {
        startLifoGame();
    } else {
        startCageGame();
    }
}

function startEliminationGame() {
    // Hide all games first
    document.getElementById("eliminationGame").style.display = "block";
    document.getElementById("lifoGame").style.display = "none";
    document.getElementById("cageGame").style.display = "none";
    
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    let wrongResults = [];
    let correctResults = [];

    // Create ONLY ONE correct result
    let correctDiv = document.createElement("div");
    correctDiv.classList.add("result", "correct");
    correctDiv.innerText = searchTerm;
    correctDiv.dataset.correct = "true";
    correctResults.push(correctDiv);

    // Create 10 wrong results
    for (let i = 0; i < 10; i++) {
        let div = document.createElement("div");
        div.classList.add("result");
        div.innerText = randomItems[Math.floor(Math.random() * randomItems.length)];
        div.dataset.correct = "false";

        // Runaway fix logic
        if (Math.random() < 0.3) {
            div.classList.add("runaway");
            let dodgeCount = 0;
            div.addEventListener("mouseover", () => {
                if (dodgeCount < 3) {
                    dodgeCount++;
                    const offsetX = (Math.random() - 0.5) * 200;
                    const offsetY = (Math.random() - 0.5) * 200;
                    div.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                    div.style.transition = "transform 0.3s ease";
                }
            });
        }

        wrongResults.push(div);
    }

    let allResults = [...correctResults, ...wrongResults];
    allResults.sort(() => Math.random() - 0.5);
    allResults.forEach(r => resultsContainer.appendChild(r));

    // Click handling
    resultsContainer.addEventListener("click", function handler(e) {
        if (!e.target.classList.contains("result")) return;
        const isCorrect = e.target.dataset.correct === "true";

        if (!isCorrect) {
            e.target.style.animation = "fadeOut 0.5s ease";
            setTimeout(() => {
                e.target.remove();
                // Check if only correct remains
                let remaining = [...resultsContainer.children];
                if (remaining.length === 1 && remaining[0].dataset.correct === "true") {
                    let winner = remaining[0];
                    winner.style.cursor = "pointer";
                    winner.addEventListener("click", () => {
                        showSearchResults(searchTerm);
                    }, { once: true });
                }
            }, 500);
        }
    });
}

function startLifoGame() {
    // Hide all games first
    document.getElementById("eliminationGame").style.display = "none";
    document.getElementById("lifoGame").style.display = "flex";
    document.getElementById("cageGame").style.display = "none";
    
    const stackContainer = document.getElementById("stackContainer");
    stackContainer.innerHTML = "";
    
    // Create stack items (correct one at bottom)
    const stackItems = [];
    
    // Add wrong items first (they'll be on top)
    for (let i = 0; i < 8; i++) {
        const item = document.createElement("div");
        item.classList.add("stack-item");
        item.innerText = randomItems[Math.floor(Math.random() * randomItems.length)];
        item.dataset.correct = "false";
        stackItems.push(item);
    }
    
    // Add correct item at the bottom
    const correctItem = document.createElement("div");
    correctItem.classList.add("stack-item", "correct");
    correctItem.innerText = searchTerm;
    correctItem.dataset.correct = "true";
    stackItems.push(correctItem);
    
    // Add items to stack (correct one will be at bottom)
    stackItems.forEach(item => {
        stackContainer.appendChild(item);
        makeDraggable(item);
    });
    
    setupDropZone();
}

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY;
    let originalX, originalY;

    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    function startDrag(e) {
        if (element.dataset.correct === "true") {
            // Check if it's accessible (no items on top)
            const stackItems = [...document.querySelectorAll('.stack-item')];
            const correctIndex = stackItems.indexOf(element);
            const itemsOnTop = stackItems.slice(0, correctIndex);
            
            if (itemsOnTop.length > 0) {
                alert("You need to remove the items on top first!");
                return;
            }
        }
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        originalX = rect.left;
        originalY = rect.top;
        
        element.classList.add('dragging');
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.left = originalX + 'px';
        element.style.top = originalY + 'px';
        element.style.transition = 'none';
        
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        element.style.left = (originalX + deltaX) + 'px';
        element.style.top = (originalY + deltaY) + 'px';
    }

    function endDrag(e) {
        if (!isDragging) return;
        
        isDragging = false;
        element.classList.remove('dragging');
        
        // Check if dropped in drop zone
        const dropZone = document.getElementById('dropZone');
        const dropZoneRect = dropZone.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        if (element.dataset.correct === "false" && 
            elementRect.left < dropZoneRect.right &&
            elementRect.right > dropZoneRect.left &&
            elementRect.top < dropZoneRect.bottom &&
            elementRect.bottom > dropZoneRect.top) {
            
            // Remove the item with smooth animation
            element.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            element.style.transform = 'scale(0.5) rotate(180deg)';
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.remove();
                
                // Check if correct item is now accessible
                const stackItems = [...document.querySelectorAll('.stack-item')];
                const correctItem = stackItems.find(item => item.dataset.correct === "true");
                
                if (correctItem) {
                    const correctIndex = stackItems.indexOf(correctItem);
                    const itemsOnTop = stackItems.slice(0, correctIndex);
                    
                    if (itemsOnTop.length === 0) {
                        correctItem.style.cursor = "pointer";
                        correctItem.addEventListener("click", () => {
                            showSearchResults(searchTerm);
                        }, { once: true });
                    }
                }
            }, 400);
        } else {
            // Return to original position with smooth animation
            element.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            element.style.left = '';
            element.style.top = '';
            element.style.position = '';
            element.style.zIndex = '';
            element.style.transform = '';
            
            setTimeout(() => {
                element.style.transition = '';
            }, 400);
        }
    }
}

function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });
}

function startCageGame() {
    // Hide all games first
    document.getElementById("eliminationGame").style.display = "none";
    document.getElementById("lifoGame").style.display = "none";
    document.getElementById("cageGame").style.display = "flex";
    
    const cageContainer = document.getElementById("cageContainer");
    const boxesContainer = document.getElementById("boxesContainer");
    
    cageContainer.innerHTML = "";
    boxesContainer.innerHTML = "";
    
    // Create the cage with the search term
    const cage = document.createElement("div");
    cage.classList.add("cage");
    cage.innerHTML = `
        <div class="cage-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <div class="cage-content">
            <div class="locked-item">${searchTerm}</div>
            <div class="lock">🔒</div>
        </div>
    `;
    cageContainer.appendChild(cage);
    
    // Create boxes (one with key, others with random items)
    const boxCount = 12;
    const keyBoxIndex = Math.floor(Math.random() * boxCount);
    
    for (let i = 0; i < boxCount; i++) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.dataset.index = i;
        
        if (i === keyBoxIndex) {
            // This box contains the key
            box.innerHTML = `
                <div class="box-content">
                    <div class="key">🔑</div>
                    <div class="box-label">Key</div>
                </div>
            `;
            box.dataset.hasKey = "true";
        } else {
            // This box contains a random item
            const randomItem = randomItems[Math.floor(Math.random() * randomItems.length)];
            box.innerHTML = `
                <div class="box-content">
                    <div class="box-item">${randomItem}</div>
                </div>
            `;
            box.dataset.hasKey = "false";
        }
        
        box.addEventListener("click", () => openBox(box));
        boxesContainer.appendChild(box);
    }
}

function openBox(box) {
    if (box.classList.contains('opened')) return;
    
    box.classList.add('opened');
    
    if (box.dataset.hasKey === "true") {
        // Found the key!
        box.classList.add('has-key');
        box.style.animation = "foundKey 0.6s ease";
        
        setTimeout(() => {
            // Make the key draggable
            const keyElement = box.querySelector('.key');
            keyElement.style.cursor = "grab";
            keyElement.classList.add('draggable-key');
            makeKeyDraggable(keyElement);
        }, 600);
    } else {
        // Wrong box
        box.style.animation = "wrongBox 0.4s ease";
    }
}

function makeKeyDraggable(keyElement) {
    let isDragging = false;
    let startX, startY;
    let originalX, originalY;

    keyElement.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = keyElement.getBoundingClientRect();
        originalX = rect.left;
        originalY = rect.top;
        
        keyElement.style.position = 'fixed';
        keyElement.style.zIndex = '1000';
        keyElement.style.left = originalX + 'px';
        keyElement.style.top = originalY + 'px';
        keyElement.style.transition = 'none';
        keyElement.style.cursor = 'grabbing';
        
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        keyElement.style.left = (originalX + deltaX) + 'px';
        keyElement.style.top = (originalY + deltaY) + 'px';
    }

    function endDrag(e) {
        if (!isDragging) return;
        
        isDragging = false;
        keyElement.style.cursor = 'grab';
        
        // Check if dropped on the cage
        const cage = document.querySelector('.cage');
        const cageRect = cage.getBoundingClientRect();
        const keyRect = keyElement.getBoundingClientRect();
        
        if (keyRect.left < cageRect.right &&
            keyRect.right > cageRect.left &&
            keyRect.top < cageRect.bottom &&
            keyRect.bottom > cageRect.top) {
            
            // Unlock the cage!
            unlockCage();
            
            // Remove the key
            keyElement.style.transition = 'all 0.4s ease';
            keyElement.style.transform = 'scale(0) rotate(180deg)';
            keyElement.style.opacity = '0';
            
            setTimeout(() => {
                keyElement.remove();
            }, 400);
        } else {
            // Return to original position
            keyElement.style.transition = 'all 0.4s ease';
            keyElement.style.left = '';
            keyElement.style.top = '';
            keyElement.style.position = '';
            keyElement.style.zIndex = '';
            
            setTimeout(() => {
                keyElement.style.transition = '';
            }, 400);
        }
    }
}

function unlockCage() {
    const cage = document.querySelector('.cage');
    const lock = document.querySelector('.lock');
    const lockedItem = document.querySelector('.locked-item');
    
    lock.textContent = "🔓";
    lock.style.animation = "unlock 0.5s ease";
    
    setTimeout(() => {
        cage.classList.add('unlocked');
        lockedItem.style.cursor = "pointer";
        lockedItem.addEventListener("click", () => {
            showSearchResults(searchTerm);
        }, { once: true });
    }, 500);
}

function showSearchResults(searchTerm) {
    const searchResultsContainer = document.getElementById("searchResults");
    searchResultsContainer.style.display = "block";
    
    // Hide the game areas
    document.getElementById("eliminationGame").style.display = "none";
    document.getElementById("lifoGame").style.display = "none";
    
    // Get a random sample paragraph
    const randomParagraph = sampleParagraphs[Math.floor(Math.random() * sampleParagraphs.length)];
    
    // Create Google-like search result
    const resultHTML = `
        <div class="searchResult">
            <a href="#" class="resultTitle">${searchTerm} - Complete Information and Guide</a>
            <div class="resultUrl">https://www.example.com/${searchTerm.toLowerCase().replace(/\s+/g, '-')}</div>
            <div class="resultSnippet">${randomParagraph}</div>
        </div>
        <div class="searchResult">
            <a href="#" class="resultTitle">Everything You Need to Know About ${searchTerm}</a>
            <div class="resultUrl">https://www.info-site.com/${searchTerm.toLowerCase().replace(/\s+/g, '-')}</div>
            <div class="resultSnippet">Discover comprehensive information about ${searchTerm}. Learn about its history, applications, and current developments. This resource provides detailed insights and practical knowledge for anyone interested in this topic.</div>
        </div>
        <div class="searchResult">
            <a href="#" class="resultTitle">${searchTerm} - Latest News and Updates</a>
            <div class="resultUrl">https://www.news-portal.com/${searchTerm.toLowerCase().replace(/\s+/g, '-')}</div>
            <div class="resultSnippet">Stay updated with the latest developments and news related to ${searchTerm}. Our team of experts provides timely analysis and insights on current trends and future prospects in this field.</div>
        </div>
    `;
    
    searchResultsContainer.innerHTML = resultHTML;
} 