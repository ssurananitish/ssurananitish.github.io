const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const reaction = document.getElementById('reaction');
const angryReaction = document.getElementById('angry-reaction');
const buttonsContainer = document.getElementById('buttons-container');
const backBtn = document.getElementById('back-btn');
const musicBtn = document.getElementById('music-btn');

let clickAttempts = 0;
let audio = null;

// Initialize audio
function initAudio() {
    // Using the actual Tere Liye song file
    audio = new Audio('cropped_song.mp3');
    audio.loop = true;
    audio.volume = 0.3;
}

// Handle music button
musicBtn.addEventListener('click', () => {
    if (!audio) {
        initAudio();
    }
    
    if (audio.paused) {
        audio.play();
        musicBtn.textContent = '🎵 Stop Music';
        musicBtn.classList.add('playing');
    } else {
        audio.pause();
        musicBtn.textContent = '🎵 Play Music';
        musicBtn.classList.remove('playing');
    }
});

// Handle Yes button click with instant transition
yesBtn.addEventListener('click', () => {
    // Hide buttons immediately
    buttonsContainer.style.display = 'none';
    buttonsContainer.style.opacity = '0';
    buttonsContainer.style.transition = '';

    // Start celebration immediately
    document.body.classList.add('celebration');

    // Show the celebration reaction immediately with a quick pop animation
    reaction.classList.remove('hidden');
    reaction.style.opacity = '0';
    reaction.style.transform = 'translateY(30px)';
    reaction.style.transition = 'all 400ms ease-out';

    // Trigger the celebration animation on next frame
    requestAnimationFrame(() => {
        reaction.style.opacity = '1';
        reaction.style.transform = 'translateY(0)';
    });

    angryReaction.classList.add('hidden');

    // Auto-play music shortly after
    setTimeout(() => {
        if (!audio) initAudio();
        if (audio.paused) {
            audio.play();
            musicBtn.textContent = '🎵 Stop Music';
            musicBtn.classList.add('playing');
        }
    }, 500);
});

// Track mouse movement to make No button run away from cursor
buttonsContainer.addEventListener('mousemove', (e) => {
    const containerRect = buttonsContainer.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const noCenterX = noRect.left + noRect.width / 2;
    const noCenterY = noRect.top + noRect.height / 2;

    const dx = e.clientX - noCenterX;
    const dy = e.clientY - noCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = 180; // larger threshold = harder to click No
    if (distance < threshold) {
        // Compute stronger push vector away from cursor to make No harder to click
        const push = Math.max(110, (threshold - distance) * 1.8);
        const angle = Math.atan2(dy, dx);
        const moveX = -Math.cos(angle) * push;
        const moveY = -Math.sin(angle) * push; 

        // New position relative to container
        let newLeft = (noRect.left - containerRect.left) + moveX;
        let newTop = (noRect.top - containerRect.top) + moveY;

        // Clamp to container bounds
        newLeft = Math.max(8, Math.min(newLeft, containerRect.width - noRect.width - 8));
        newTop = Math.max(8, Math.min(newTop, containerRect.height - noRect.height - 8));

        // Ensure it doesn't overlap the Yes button
        const absLeft = containerRect.left + newLeft;
        const absTop = containerRect.top + newTop;
        const overlap = !(absLeft + noRect.width < yesRect.left + 8 || absLeft > yesRect.right - 8 || absTop + noRect.height < yesRect.top + 8 || absTop > yesRect.bottom - 8);

        if (overlap) {
            // Try to move horizontally away from Yes
            if (absLeft < yesRect.left) {
                newLeft = Math.max(8, yesRect.left - containerRect.left - noRect.width - 12);
            } else {
                newLeft = Math.min(containerRect.width - noRect.width - 8, yesRect.right - containerRect.left + 12);
            }

            // If still overlapping, move vertically away
            const newAbsLeft = containerRect.left + newLeft;
            const stillOverlap = !(newAbsLeft + noRect.width < yesRect.left + 8 || newAbsLeft > yesRect.right - 8 || absTop + noRect.height < yesRect.top + 8 || absTop > yesRect.bottom - 8);
            if (stillOverlap) {
                if (noCenterY < yesRect.top) {
                    newTop = Math.max(8, yesRect.top - containerRect.top - noRect.height - 12);
                } else {
                    newTop = Math.min(containerRect.height - noRect.height - 8, yesRect.bottom - containerRect.top + 12);
                }
            }
        }

        // Apply new position (clear right to avoid conflicts)
        noBtn.style.right = 'auto';
        noBtn.style.left = newLeft + 'px';
        noBtn.style.top = newTop + 'px';
    }
});

// Prevent clicking but show a cute pouty response
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clickAttempts++;

    // Always try to move away to keep playful
    moveButton();

    // Show a small bubble near the No button for the first 5 clicks (no bubble on the 6th)
    const messages = ["Aww... 😞","Please? 💕","Pretty please? 💗","I will be very sad 😢","Don't do this Dishu 💔"];
    if (clickAttempts <= 5) {
        const msg = messages[clickAttempts - 1];
        showPoutBubble(msg, 1200);
    }

    // After 6 tries, show the full pout screen
    if (clickAttempts >= 6) {
        buttonsContainer.style.display = 'none';
        reaction.classList.add('hidden');
        angryReaction.classList.remove('hidden');
        angryReaction.classList.add('pout');

        // Put page into the same focused layout as celebration (hides h1, hearts, date)
        document.body.classList.add('celebration');

        // subtle show animation
        angryReaction.style.opacity = '0';
        angryReaction.style.transform = 'translateY(20px)';
        angryReaction.style.transition = 'all 420ms ease-out';
        requestAnimationFrame(() => {
            angryReaction.style.opacity = '1';
            angryReaction.style.transform = 'translateY(0)';
        });
    }
});

// Create a transient bubble near the No button
function showPoutBubble(text, duration = 1000) {
    const rect = noBtn.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'pout-bubble';
    bubble.textContent = text;
    document.body.appendChild(bubble);

    // Position slightly above the button center
    const left = rect.left + rect.width / 2;
    const top = rect.top - 8;
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';

    setTimeout(() => bubble.remove(), duration);
}

// Reset click attempts when going back
backBtn.addEventListener('click', () => {
    // Fade out reaction
    reaction.style.transition = 'all 0.5s ease-out';
    reaction.style.opacity = '0';
    reaction.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.opacity = '0';
        buttonsContainer.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            buttonsContainer.style.opacity = '1';
        }, 100);
        
        reaction.classList.add('hidden');
        reaction.style.opacity = '';
        reaction.style.transform = '';
        reaction.style.transition = '';
        
        angryReaction.classList.add('hidden');
        clickAttempts = 0;
        document.body.classList.remove('celebration');
        
        // Stop music
        if (audio && !audio.paused) {
            audio.pause();
            musicBtn.textContent = '🎵 Your Favorite song';
            musicBtn.classList.remove('playing');
        }
    }, 500);
});

// Back button handler
backBtn.addEventListener('click', () => {
    // Fade out reaction
    reaction.style.transition = 'all 0.5s ease-out';
    reaction.style.opacity = '0';
    reaction.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.opacity = '0';
        buttonsContainer.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            buttonsContainer.style.opacity = '1';
        }, 100);
        
        reaction.classList.add('hidden');
        reaction.style.opacity = '';
        reaction.style.transform = '';
        reaction.style.transition = '';
        
        angryReaction.classList.add('hidden');
        clickAttempts = 0;
        document.body.classList.remove('celebration');
        
        // Stop music
        if (audio && !audio.paused) {
            audio.pause();
            musicBtn.textContent = '🎵 Your Favorite song';
            musicBtn.classList.remove('playing');
        }
    }, 500);
});

function moveButton() {
    const containerRect = buttonsContainer.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    const btnWidth = noRect.width;
    const btnHeight = noRect.height;

    const padding = 12;
    let attempts = 0;
    let candidateLeft = 8;
    let candidateTop = 8;

    while (attempts < 200) {
        candidateLeft = Math.random() * (containerRect.width - btnWidth - padding * 2) + padding;
        candidateTop = Math.random() * (containerRect.height - btnHeight - padding * 2) + padding;

        const absLeft = containerRect.left + candidateLeft;
        const absTop = containerRect.top + candidateTop;

        const overlap = !(absLeft + btnWidth < yesRect.left + 8 || absLeft > yesRect.right - 8 || absTop + btnHeight < yesRect.top + 8 || absTop > yesRect.bottom - 8);

        if (!overlap) break;
        attempts++;
    }

    noBtn.style.right = 'auto';
    noBtn.style.left = candidateLeft + 'px';
    noBtn.style.top = candidateTop + 'px';
}
