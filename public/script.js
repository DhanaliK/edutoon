// DOM Elements
const topicInput = document.getElementById('topic');
const generateBtn = document.getElementById('generate-btn');
const levelOptions = document.getElementById('level-options');
const actionOptions = document.getElementById('learn-revise-options');
const outputSection = document.getElementById('output');
const outputTitle = document.getElementById('output-title');
const outputContent = document.getElementById('output-content');
const errorMessage = document.getElementById('error-message');
const copyBtn = document.getElementById('copy-btn');
const audioBtn = document.getElementById('audio-btn');
const spinner = document.querySelector('.spinner');
const backToTopicBtn = document.getElementById('back-to-topic');
const backToLevelBtn = document.getElementById('back-to-level');
const backToActionBtn = document.getElementById('back-to-action');
const ratingStars = document.querySelectorAll('.stars i');
const levelTag = document.querySelector('.level-tag');
const goalTag = document.querySelector('.goal-tag');

// State
let currentTopic = '';
let currentLevel = '';
let currentAction = '';
let userRating = 0;
let isSidebarCollapsed = false;

// Sample stories for history (in a real app, this would come from a backend)
const storyHistory = [
    {
        id: 1,
        title: "Photosynthesis",
        level: "beginner",
        action: "learn",
        date: "2023-06-15",
        content: "Photosynthesis is like a magical kitchen inside plant leaves..."
    },
    {
        id: 2,
        title: "Blockchain Technology",
        level: "intermediate",
        action: "revise",
        date: "2023-06-10",
        content: "Imagine blockchain as a digital ledger that's shared among many computers..."
    }
];
// Event Listeners
generateBtn.addEventListener('click', startStoryJourney);
topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startStoryJourney();
});

document.querySelectorAll('.option-card[data-level]').forEach(card => {
    card.addEventListener('click', selectLevel);
});

document.querySelectorAll('.option-card[data-action]').forEach(card => {
    card.addEventListener('click', selectAction);
});

copyBtn.addEventListener('click', copyToClipboard);
audioBtn.addEventListener('click', readAloud);
backToTopicBtn.addEventListener('click', () => goBack('topic'));
backToLevelBtn.addEventListener('click', () => goBack('level'));
backToActionBtn.addEventListener('click', () => goBack('action'));

ratingStars.forEach(star => {
    star.addEventListener('click', setRating);
    star.addEventListener('mouseover', hoverRating);
});

// Sidebar Event Listeners
sidebarToggle.addEventListener('click', toggleSidebar);
mobileMenuToggle.addEventListener('click', toggleMobileMenu);

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        if (item.querySelector('span').textContent === 'History') {
            showHistory();
        } else if (item.querySelector('span').textContent === 'Home') {
            showHome();
        }
    });
});

// Initialize
initApp();
function initApp() {
    // Hide all sections except input
    levelOptions.style.display = 'none';
    actionOptions.style.display = 'none';
    outputSection.style.display = 'none';
    
    // Focus on input field
    topicInput.focus();
    
    // Check screen size and adjust sidebar
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
}

function checkScreenSize() {
    if (window.innerWidth <= 992) {
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('show-mobile');
    } else {
        sidebar.classList.remove('show-mobile');
    }
}

function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed');
}

function toggleMobileMenu() {
    sidebar.classList.toggle('show-mobile');
}

function showHistory() {
    // Hide all main content sections
    document.querySelector('.input-section').style.display = 'none';
    levelOptions.style.display = 'none';
    actionOptions.style.display = 'none';
    outputSection.style.display = 'none';
    
    // Create history section if it doesn't exist
    let historySection = document.querySelector('.history-section');
    if (!historySection) {
        historySection = document.createElement('div');
        historySection.className = 'history-section card';
        historySection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-history"></i> Your Story History</h2>
            </div>
            <div class="history-list" id="history-list"></div>
        `;
        document.querySelector('.app-main').appendChild(historySection);
    } else {
        historySection.style.display = 'block';
    }
    
    // Populate history
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    if (storyHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No stories generated yet. Start learning to see them here!</p>';
        return;
    }
    
    storyHistory.forEach(story => {
        const storyEl = document.createElement('div');
        storyEl.className = 'history-item';
        storyEl.innerHTML = `
            <div class="history-item-header">
                <h3>${story.title}</h3>
                <span class="history-date">${story.date}</span>
            </div>
            <div class="history-item-meta">
                <span class="meta-tag" style="background-color: ${getLevelColor(story.level, true)}; color: ${getLevelColor(story.level, false)}">
                    ${story.level.charAt(0).toUpperCase() + story.level.slice(1)}
                </span>
                <span class="meta-tag" style="background-color: ${getActionColor(story.action, true)}; color: ${getActionColor(story.action, false)}">
                    ${story.action.charAt(0).toUpperCase() + story.action.slice(1)}
                </span>
            </div>
            <div class="history-item-content">
                ${story.content.substring(0, 150)}...
            </div>
            <button class="secondary-btn view-history-btn" data-id="${story.id}">
                <i class="fas fa-eye"></i> View Story
            </button>
        `;
        historyList.appendChild(storyEl);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const storyId = parseInt(e.currentTarget.dataset.id);
            viewHistoryStory(storyId);
        });
    });
}

function viewHistoryStory(id) {
    const story = storyHistory.find(s => s.id === id);
    if (!story) return;
    
    // Set current state
    currentTopic = story.title;
    currentLevel = story.level;
    currentAction = story.action;
    
    // Display the story
    displayStory(story.content);
    
    // Hide history section
    document.querySelector('.history-section').style.display = 'none';
}

function showHome() {
    // Show main input section
    document.querySelector('.input-section').style.display = 'block';
    
    // Hide other sections
    levelOptions.style.display = 'none';
    actionOptions.style.display = 'none';
    outputSection.style.display = 'none';
    
    // Hide history section if it exists
    const historySection = document.querySelector('.history-section');
    if (historySection) {
        historySection.style.display = 'none';
    }
}

// Functions
function startStoryJourney() {
    currentTopic = topicInput.value.trim();
    
    if (!currentTopic) {
        showError('Please enter a topic to begin your learning story');
        topicInput.focus();
        return;
    }
    
    // Reset state
    currentLevel = '';
    currentAction = '';
    
    // Hide other sections
    actionOptions.classList.remove('active');
    outputSection.classList.remove('active');
    clearError();
    
    // Show level selection
    levelOptions.classList.add('active');
    backToTopicBtn.classList.add('visible');
    
    // Scroll to level options
    levelOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectLevel(e) {
    currentLevel = e.currentTarget.dataset.level;
    
    // Hide level options
    levelOptions.classList.remove('active');
    backToTopicBtn.classList.remove('visible');
    
    // Show action options
    actionOptions.classList.add('active');
    backToLevelBtn.classList.add('visible');
    
    // Scroll to action options
    actionOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectAction(e) {
    currentAction = e.currentTarget.dataset.action;
    
    // Hide action options
    actionOptions.classList.remove('active');
    backToLevelBtn.classList.remove('visible');
    
    // Show loading state
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-text').textContent = 'Creating your story...';
    spinner.classList.add('active');
    
    // Generate the story
    generateStory();
}

async function generateStory() {
    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                topic: currentTopic, 
                level: currentLevel, 
                action: currentAction 
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create your story');
        }
        
        const result = await response.json();
        
        if (!result.explanation) {
            throw new Error('The story generator returned an empty response');
        }
        
        // Display the story
        displayStory(result.explanation);
        clearError();
    } catch (error) {
        console.error('Error:', error);
        showError(`Story creation failed: ${error.message}`);
        // Return to action selection
        actionOptions.classList.add('active');
        backToLevelBtn.classList.add('visible');
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.querySelector('.btn-text').textContent = 'Begin Story';
        spinner.classList.remove('active');
    }
}

function displayStory(content) {
    outputTitle.textContent = `Story: ${currentTopic}`;
    outputContent.innerHTML = formatStoryContent(content);
    outputSection.classList.add('active');
    backToActionBtn.classList.add('visible');
    
    // Scroll to output
    outputSection.scrollIntoView({ behavior: 'smooth' });
}

function formatStoryContent(content) {
    // Convert markdown-like formatting to HTML
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // italic
        .replace(/^# (.*$)/gm, '<h4>$1</h4>') // headings
        .replace(/\n\n/g, '</p><p>') // paragraphs
        .replace(/\n/g, '<br>') // line breaks
        .replace(/Key Takeaways:/i, '</p><div class="key-takeaways"><h4>Key Takeaways</h4><p>')
        .replace(/Practice Question:/i, '</div><div class="key-takeaways" style="background-color: #f0fdf4;"><h4>Practice Question</h4><p>');
    
    // Ensure proper closing tags
    formatted += '</p></div>';
    
    return `<div class="story-content"><p>${formatted}</div>`;
}

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(outputContent.textContent);
        
        // Visual feedback
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        showError('Failed to copy text to clipboard');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
}

function clearError() {
    errorMessage.classList.remove('active');
}

function goBack(step) {
    switch(step) {
        case 'topic':
            levelOptions.classList.remove('active');
            backToTopicBtn.classList.remove('visible');
            topicInput.focus();
            break;
        case 'level':
            actionOptions.classList.remove('active');
            backToLevelBtn.classList.remove('visible');
            levelOptions.classList.add('active');
            backToTopicBtn.classList.add('visible');
            levelOptions.scrollIntoView({ behavior: 'smooth' });
            break;
        case 'action':
            outputSection.classList.remove('active');
            backToActionBtn.classList.remove('visible');
            actionOptions.classList.add('active');
            backToLevelBtn.classList.add('visible');
            actionOptions.scrollIntoView({ behavior: 'smooth' });
            break;
    }
}