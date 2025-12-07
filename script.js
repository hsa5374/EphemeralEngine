// Main JavaScript file for The Ephemeral Engine
// Now simplified since most functionality is page-specific

// Common utilities
const EphemeralEngine = {
    // Sound management
    sounds: {},
    
    // Initialize sound system
    initSounds: function() {
        this.sounds.wind = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wind-against-leaves-1248.mp3');
        this.sounds.fire = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3');
        this.sounds.glitch = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-computer-glitch-2346.mp3');
        
        // Set volumes
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.2;
            sound.preload = 'auto';
        });
    },
    
    // Play sound with optional volume
    playSound: function(soundName, volume = 0.2) {
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = volume;
            sound.play().catch(() => {
                // Silent fail for browsers that block autoplay
                console.log('Sound playback prevented by browser policy');
            });
        }
    },
    
    // Format date for archive display
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (diffDays === 1) {
            return 'Yesterday at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    },
    
    // Get algorithm name from key
    getAlgorithmName: function(algoKey) {
        const names = {
            'erosion': 'Erosion',
            'burning': 'Burning',
            'mutation': 'Mutation'
        };
        return names[algoKey] || 'Forgotten';
    },
    
    // Get algorithm description
    getAlgorithmDescription: function(algoKey) {
        const desc = {
            'erosion': 'Like sand writing washed away by the tide',
            'burning': 'Like a letter consumed by protective flames',
            'mutation': 'Like stories that change with each retelling'
        };
        return desc[algoKey] || 'A memory released';
    },
    
    // Get algorithm color
    getAlgorithmColor: function(algoKey) {
        const colors = {
            'erosion': '#a3b899',
            'burning': '#d4a574',
            'mutation': '#9a8c98'
        };
        return colors[algoKey] || '#8b7355';
    },
    
    // Get algorithm icon
    getAlgorithmIcon: function(algoKey) {
        const icons = {
            'erosion': 'fas fa-wind',
            'burning': 'fas fa-fire',
            'mutation': 'fas fa-comments'
        };
        return icons[algoKey] || 'fas fa-question';
    },
    
    // Add entry to archive (only stores metadata)
    addToArchive: function(memory, algorithm, timestamp) {
        let archive = JSON.parse(localStorage.getItem('ephemeralArchive') || '[]');
        
        const archiveEntry = {
            id: Date.now(),
            algorithm: algorithm,
            timestamp: timestamp,
            length: memory.length,
            // Store only trace, not the actual content
            trace: this.createMemoryTrace(memory)
        };
        
        archive.push(archiveEntry);
        
        // Keep only last 100 entries
        if (archive.length > 100) {
            archive = archive.slice(-100);
        }
        
        localStorage.setItem('ephemeralArchive', JSON.stringify(archive));
        
        // Dispatch event for archive updates
        window.dispatchEvent(new CustomEvent('archiveUpdated', {
            detail: archiveEntry
        }));
        
        return archiveEntry;
    },
    
    // Create a poetic trace of the memory (not the actual content)
    createMemoryTrace: function(memory) {
        if (memory.length <= 10) {
            return '•'.repeat(memory.length);
        } else {
            const first = memory.substring(0, 3);
            const last = memory.substring(memory.length - 3);
            return `${first}...${last}`;
        }
    },
    
    // Get archive statistics
    getArchiveStats: function() {
        const archive = JSON.parse(localStorage.getItem('ephemeralArchive') || '[]');
        const today = new Date().toDateString();
        
        const todayCount = archive.filter(entry => {
            const entryDate = new Date(entry.timestamp).toDateString();
            return entryDate === today;
        }).length;
        
        // Count algorithms
        const algorithmCount = {};
        archive.forEach(entry => {
            algorithmCount[entry.algorithm] = (algorithmCount[entry.algorithm] || 0) + 1;
        });
        
        // Find most common algorithm
        let mostCommon = 'none';
        let maxCount = 0;
        Object.entries(algorithmCount).forEach(([algo, count]) => {
            if (count > maxCount) {
                mostCommon = algo;
                maxCount = count;
            }
        });
        
        return {
            total: archive.length,
            today: todayCount,
            mostCommonAlgorithm: mostCommon,
            mostCommonCount: maxCount
        };
    },
    
    // Clear the entire archive
    clearArchive: function() {
        localStorage.removeItem('ephemeralArchive');
        window.dispatchEvent(new Event('archiveCleared'));
        return true;
    },
    
    // Mutate a word (for mutation algorithm)
    mutateWord: function(word) {
        if (word.length < 3) return word;
        
        const mutations = {
            'the': 'tha', 'and': 'und', 'you': 'yu', 'are': 'r',
            'for': 'fer', 'with': 'wth', 'this': 'dis', 'that': 'dat',
            'have': 'hav', 'from': 'frum', 'they': 'dey', 'would': 'wud',
            'their': 'ther', 'there': 'dere', 'what': 'wut', 'about': 'bout',
            'which': 'wich', 'when': 'wen', 'were': 'wir', 'like': 'lik'
        };
        
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (mutations[cleanWord]) {
            return mutations[cleanWord];
        }
        
        // Random mutation
        if (Math.random() < 0.3) {
            const chars = word.split('');
            const changeIndex = Math.floor(Math.random() * chars.length);
            chars[changeIndex] = String.fromCharCode(97 + Math.floor(Math.random() * 26));
            return chars.join('');
        }
        
        return word;
    },
    
    // Apply forgetting effect to text
    applyForgettingEffect: function(element, algorithm, integrity) {
        const text = element.textContent;
        
        switch(algorithm) {
            case 'erosion':
                // Remove random characters
                if (Math.random() < 0.2 && text.length > 10) {
                    const chars = text.split('');
                    let removed = 0;
                    for (let i = 0; i < chars.length && removed < 2; i++) {
                        if (chars[i] !== ' ' && Math.random() < 0.1) {
                            chars[i] = ' ';
                            removed++;
                        }
                    }
                    element.textContent = chars.join('');
                }
                element.style.opacity = `${integrity / 100}`;
                break;
                
            case 'burning':
                // Add charred characters
                if (Math.random() < 0.15) {
                    const chars = text.split('');
                    for (let i = 0; i < chars.length; i++) {
                        if (Math.random() < 0.05 && chars[i] !== ' ') {
                            chars[i] = '~';
                        }
                    }
                    element.textContent = chars.join('');
                }
                // Darken color
                const darkness = 1 - (integrity / 100);
                element.style.color = `rgb(${255 - darkness * 100}, ${200 - darkness * 150}, ${150 - darkness * 100})`;
                break;
                
            case 'mutation':
                // Mutate words
                if (Math.random() < 0.25 && text.length > 5) {
                    const words = text.split(' ');
                    if (words.length > 2) {
                        const changeIndex = Math.floor(Math.random() * words.length);
                        words[changeIndex] = this.mutateWord(words[changeIndex]);
                        element.textContent = words.join(' ');
                    }
                }
                // Shift opacity
                element.style.opacity = `${0.5 + (integrity / 200)}`;
                break;
        }
    },
    
    // Initialize page-specific functionality
    initPage: function(pageName) {
        console.log(`Initializing ${pageName} page`);
        
        // Initialize sounds
        this.initSounds();
        
        // Page-specific initializations
        switch(pageName) {
            case 'landing':
                this.initLandingPage();
                break;
            case 'invitation':
                this.initInvitationPage();
                break;
            case 'forgetting':
                this.initForgettingPage();
                break;
            case 'archive':
                this.initArchivePage();
                break;
            case 'reflection':
                this.initReflectionPage();
                break;
        }
    },
    
    // Landing page initialization
    initLandingPage: function() {
        // Fading words effect
        const words = document.querySelectorAll('.fade-word');
        if (words.length > 0) {
            let current = 0;
            setInterval(() => {
                words.forEach(word => word.classList.remove('active'));
                words[current].classList.add('active');
                current = (current + 1) % words.length;
            }, 2000);
        }
        
        // Gentle wind sound on landing page
        try {
            this.sounds.wind.volume = 0.1;
            this.sounds.wind.loop = true;
            this.sounds.wind.play().catch(() => {
                // Autoplay might be blocked, that's okay
            });
        } catch (e) {
            // Sound playback error, continue silently
        }
    },
    
    // Invitation page initialization
    initInvitationPage: function() {
        const memoryInput = document.getElementById('memoryInput');
        const charCount = document.getElementById('charCount');
        const submitBtn = document.getElementById('submitBtn');
        const clearBtn = document.getElementById('clearBtn');
        const algoCards = document.querySelectorAll('.algo-card');
        
        if (!memoryInput) return;
        
        let selectedAlgorithm = 'erosion';
        
        // Character count
        memoryInput.addEventListener('input', function() {
            const count = memoryInput.value.length;
            if (charCount) charCount.textContent = count;
            if (submitBtn) submitBtn.disabled = count === 0;
        });
        
        // Algorithm selection
        if (algoCards.length > 0) {
            algoCards.forEach(card => {
                card.addEventListener('click', function() {
                    algoCards.forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedAlgorithm = this.dataset.algorithm;
                });
            });
        }
        
        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                memoryInput.value = '';
                if (charCount) charCount.textContent = '0';
                if (submitBtn) submitBtn.disabled = true;
                memoryInput.focus();
            });
        }
        
        // Submit button
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                const memory = memoryInput.value.trim();
                if (memory.length === 0) return;
                
                // Store in sessionStorage for next page
                sessionStorage.setItem('memoryToForget', memory);
                sessionStorage.setItem('forgettingAlgorithm', selectedAlgorithm);
                sessionStorage.setItem('submissionTime', new Date().toISOString());
                
                // Navigate to forgetting page
                window.location.href = 'forgetting.html';
            });
        }
        
        // Auto-focus textarea
        memoryInput.focus();
    },
    
    // Forgetting page initialization
    initForgettingPage: function() {
        // This page has its own script embedded in the HTML
        // The main logic is in the forgetting.html file
        console.log('Forgetting page loaded');
    },
    
    // Archive page initialization
    initArchivePage: function() {
        // This page has its own script embedded in the HTML
        console.log('Archive page loaded');
    },
    
    // Reflection page initialization
    initReflectionPage: function() {
        // No special initialization needed
        console.log('Reflection page loaded');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Determine current page
    const path = window.location.pathname;
    const page = path.includes('invitation') ? 'invitation' :
                 path.includes('forgetting') ? 'forgetting' :
                 path.includes('archive') ? 'archive' :
                 path.includes('reflection') ? 'reflection' : 'landing';
    
    // Initialize the engine for this page
    EphemeralEngine.initPage(page);
});

// Make engine available globally
window.EphemeralEngine = EphemeralEngine;