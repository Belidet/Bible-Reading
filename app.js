// ===== Bible Reading App - 5 Chapters Daily Plan =====
// Always 5 chapters per day: 1 NT + 4 OT until OT finishes, then 5 NT
// Start Date: April 13, 2026
// Day 1: April 13, Day 2: April 14, Day 3: April 15 (Today)

// ===== Vercel Blob Cloud Storage Integration =====
const API_BASE_URL = window.location.origin + '/api';

let lastCloudSave = 0;
const CLOUD_SAVE_DEBOUNCE = 2000;

// User management
let currentUser = null;
let otherUser = null;
let viewingOtherUser = false;

// Progress storage
let userProgress = {
    user1: { completedDays: [], name: "Belidet" },
    user2: { completedDays: [], name: "Ephi" }
};

// ===== New Testament & Old Testament Bible Data =====
const ntBooks = [
    { name: "Matthew", chapters: 28 },
    { name: "Mark", chapters: 16 },
    { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 },
    { name: "Acts", chapters: 28 },
    { name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 },
    { name: "2 Corinthians", chapters: 13 },
    { name: "Galatians", chapters: 6 },
    { name: "Ephesians", chapters: 6 },
    { name: "Philippians", chapters: 4 },
    { name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 },
    { name: "2 Thessalonians", chapters: 3 },
    { name: "1 Timothy", chapters: 6 },
    { name: "2 Timothy", chapters: 4 },
    { name: "Titus", chapters: 3 },
    { name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 },
    { name: "James", chapters: 5 },
    { name: "1 Peter", chapters: 5 },
    { name: "2 Peter", chapters: 3 },
    { name: "1 John", chapters: 5 },
    { name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 },
    { name: "Jude", chapters: 1 },
    { name: "Revelation", chapters: 22 }
];

const otBooks = [
    { name: "Genesis", chapters: 50 },
    { name: "Exodus", chapters: 40 },
    { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 },
    { name: "Deuteronomy", chapters: 34 },
    { name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 },
    { name: "Ruth", chapters: 4 },
    { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 },
    { name: "1 Kings", chapters: 22 },
    { name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 },
    { name: "2 Chronicles", chapters: 36 },
    { name: "Ezra", chapters: 10 },
    { name: "Nehemiah", chapters: 13 },
    { name: "Esther", chapters: 10 },
    { name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 },
    { name: "Proverbs", chapters: 31 },
    { name: "Ecclesiastes", chapters: 12 },
    { name: "Song of Solomon", chapters: 8 },
    { name: "Isaiah", chapters: 66 },
    { name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 },
    { name: "Ezekiel", chapters: 48 },
    { name: "Daniel", chapters: 12 },
    { name: "Hosea", chapters: 14 },
    { name: "Joel", chapters: 3 },
    { name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 },
    { name: "Jonah", chapters: 4 },
    { name: "Micah", chapters: 7 },
    { name: "Nahum", chapters: 3 },
    { name: "Habakkuk", chapters: 3 },
    { name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 },
    { name: "Zechariah", chapters: 14 },
    { name: "Malachi", chapters: 4 }
];

// Reading plan structure: each day has exactly 5 chapters total
let readingPlan = [];

// Generate the daily reading plan (always 5 chapters per day)
function generateReadingPlan() {
    const plan = [];
    let ntBookIndex = 0;
    let ntChapter = 1;
    let otBookIndex = 0;
    let otChapter = 1;
    
    let ntCompleted = false;
    let otCompleted = false;
    let day = 1;
    
    console.log("Generating reading plan with 5 chapters per day...");
    
    while (!ntCompleted || !otCompleted) {
        const reading = {
            day: day,
            ntPassages: [],
            otPassages: [],
            completed: false,
            isCurrent: false,
            date: null
        };
        
        let chaptersAdded = 0;
        const targetChapters = 5;
        
        // If OT is not finished, add OT chapters first (up to 4)
        if (!otCompleted) {
            let otChaptersToAdd = Math.min(4, targetChapters - chaptersAdded);
            let otAdded = 0;
            
            while (otAdded < otChaptersToAdd && otBookIndex < otBooks.length) {
                const book = otBooks[otBookIndex];
                const remainingInBook = book.chapters - otChapter + 1;
                const toTake = Math.min(otChaptersToAdd - otAdded, remainingInBook);
                
                reading.otPassages.push({
                    book: book.name,
                    startChapter: otChapter,
                    endChapter: otChapter + toTake - 1
                });
                
                otChapter += toTake;
                otAdded += toTake;
                chaptersAdded += toTake;
                
                if (otChapter > book.chapters) {
                    otBookIndex++;
                    otChapter = 1;
                }
            }
            
            // Check if OT is now finished
            if (otBookIndex >= otBooks.length) {
                otCompleted = true;
                console.log(`OT completed on day ${day}`);
            }
            
            // Add 1 NT chapter if we still need chapters
            if (chaptersAdded < targetChapters && !ntCompleted && ntBookIndex < ntBooks.length) {
                const book = ntBooks[ntBookIndex];
                reading.ntPassages.push({
                    book: book.name,
                    chapter: ntChapter
                });
                chaptersAdded++;
                
                // Move to next NT chapter
                if (ntChapter < book.chapters) {
                    ntChapter++;
                } else {
                    ntBookIndex++;
                    ntChapter = 1;
                }
                
                // Check if NT is finished
                if (ntBookIndex >= ntBooks.length) {
                    ntCompleted = true;
                    console.log(`NT completed on day ${day}`);
                }
            }
        }
        
        // If OT is finished, fill all remaining chapters with NT (5 NT chapters per day)
        if (otCompleted && !ntCompleted) {
            let ntChaptersToAdd = targetChapters - chaptersAdded;
            let ntAdded = 0;
            
            while (ntAdded < ntChaptersToAdd && ntBookIndex < ntBooks.length) {
                const book = ntBooks[ntBookIndex];
                const remainingInBook = book.chapters - ntChapter + 1;
                const toTake = Math.min(ntChaptersToAdd - ntAdded, remainingInBook);
                
                if (toTake === 1) {
                    reading.ntPassages.push({
                        book: book.name,
                        chapter: ntChapter
                    });
                } else {
                    reading.ntPassages.push({
                        book: book.name,
                        startChapter: ntChapter,
                        endChapter: ntChapter + toTake - 1
                    });
                }
                
                ntChapter += toTake;
                ntAdded += toTake;
                chaptersAdded += toTake;
                
                if (ntChapter > book.chapters) {
                    ntBookIndex++;
                    ntChapter = 1;
                }
                
                if (ntBookIndex >= ntBooks.length) {
                    ntCompleted = true;
                    console.log(`NT completed on day ${day}`);
                    break;
                }
            }
        }
        
        // If both testaments are finished, break
        if (ntCompleted && otCompleted) {
            if (reading.ntPassages.length > 0 || reading.otPassages.length > 0) {
                plan.push(reading);
            }
            break;
        }
        
        plan.push(reading);
        day++;
        
        // Safety break
        if (day > 500) break;
    }
    
    console.log(`Generated ${plan.length} days of readings (${plan.length * 5} total chapters)`);
    return plan;
}

// Initialize reading plan
readingPlan = generateReadingPlan();

// Set start date to April 13, 2026
// Day 1: April 13, Day 2: April 14, Day 3: April 15 (Today)
const START_DATE = new Date(2026, 3, 13); // April 13, 2026 (month is 0-indexed, so 3 = April)

function assignDatesToPlan() {
    readingPlan.forEach((day, index) => {
        const date = new Date(START_DATE);
        date.setDate(START_DATE.getDate() + index);
        day.date = date;
    });
}
assignDatesToPlan();

// Pre-populate existing progress - Days 1, 2, and 3 completed
// Day 1 (April 13): Matthew 1, Genesis 1-4
// Day 2 (April 14): Matthew 2, Genesis 5-8
// Day 3 (April 15 - Today): Matthew 3, Genesis 9-12
function prePopulateProgress() {
    // Mark Days 1, 2, and 3 as completed
    for (let day = 1; day <= 3; day++) {
        const dayIndex = day - 1;
        if (readingPlan[dayIndex]) {
            readingPlan[dayIndex].completed = true;
        }
    }
    
    const completedDays = [1, 2, 3];
    userProgress.user1.completedDays = [...completedDays];
    userProgress.user2.completedDays = [...completedDays];
    
    saveAllProgress();
    
    console.log('Pre-populated progress: Days 1-3 completed');
    console.log('Day 1 (April 13): Matthew 1, Genesis 1-4');
    console.log('Day 2 (April 14): Matthew 2, Genesis 5-8');
    console.log('Day 3 (April 15 - Today): Matthew 3, Genesis 9-12');
}

// ===== Cloud Sync Functions =====
async function loadProgressFromCloud(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/sync?user=${userId}`);
        if (!response.ok) throw new Error('Failed to load from cloud');
        const data = await response.json();
        return data.completedDays || [];
    } catch (error) {
        console.error('Cloud load failed:', error);
        return null;
    }
}

async function saveProgressToCloud(userId, completedDays, force = false) {
    const now = Date.now();
    if (!force && now - lastCloudSave < CLOUD_SAVE_DEBOUNCE) {
        return false;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, completedDays })
        });
        if (!response.ok) throw new Error('Failed to save to cloud');
        lastCloudSave = now;
        return true;
    } catch (error) {
        console.error('Cloud save failed:', error);
        return false;
    }
}

async function syncProgressForUser(userId) {
    const cloudProgress = await loadProgressFromCloud(userId);
    const storageKey = `bible-reading-${userId}`;
    const localProgress = localStorage.getItem(storageKey);
    const localDays = localProgress ? JSON.parse(localProgress) : [];
    
    if (cloudProgress !== null && cloudProgress.length > 0) {
        if (cloudProgress.length > localDays.length) {
            return cloudProgress;
        } else if (localDays.length > cloudProgress.length) {
            await saveProgressToCloud(userId, localDays, true);
            return localDays;
        }
        return cloudProgress;
    }
    return localDays;
}

function saveLocalProgress(userId, completedDays) {
    localStorage.setItem(`bible-reading-${userId}`, JSON.stringify(completedDays));
}

function saveAllProgress() {
    saveLocalProgress('user1', userProgress.user1.completedDays);
    saveLocalProgress('user2', userProgress.user2.completedDays);
    saveProgressToCloud('user1', userProgress.user1.completedDays);
    saveProgressToCloud('user2', userProgress.user2.completedDays);
}

// ===== User Management =====
function showUserSelector() {
    const selector = document.getElementById('user-selector');
    if (selector) selector.style.display = 'flex';
}

function selectUser(userId) {
    currentUser = userId;
    viewingOtherUser = false;
    document.getElementById('user-selector').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('viewing-banner').style.display = 'none';
    
    // Set the view button text correctly for the selected user
    const viewBtn = document.getElementById('view-other-btn');
    if (viewBtn) {
        const otherUserName = currentUser === 'user1' ? userProgress.user2.name : userProgress.user1.name;
        viewBtn.textContent = `👥 View ${otherUserName}`;
    }
    
    loadUserProgress();
}

function viewOtherUser() {
    if (!currentUser) return;
    viewingOtherUser = true;
    otherUser = currentUser === 'user1' ? 'user2' : 'user1';
    const banner = document.getElementById('viewing-banner');
    banner.style.display = 'flex';
    banner.querySelector('span').textContent = 
        `👁️ Viewing ${otherUser === 'user1' ? userProgress.user1.name : userProgress.user2.name}'s progress`;
    loadUserProgress(true);
}

function switchBackToSelf() {
    viewingOtherUser = false;
    document.getElementById('viewing-banner').style.display = 'none';
    loadUserProgress();
}

async function loadUserProgress(viewing = false) {
    const targetUser = viewing ? otherUser : currentUser;
    if (!targetUser) return;
    
    const completedDays = await syncProgressForUser(targetUser);
    userProgress[targetUser].completedDays = completedDays;
    
    readingPlan.forEach(day => {
        day.completed = completedDays.includes(day.day);
    });
    
    updateCurrentDay();
    renderReadingList(viewing);
    updateProgressBar();
    renderCalendar(viewing);
    updateTodayHighlight(viewing);
    updateStatistics(viewing);
}

function toggleDay(dayNum) {
    if (viewingOtherUser) {
        showToast("You cannot mark someone else's reading as complete", "warning");
        return;
    }
    
    const day = readingPlan.find(d => d.day === dayNum);
    if (day) {
        day.completed = !day.completed;
        updateCurrentDay();
        
        userProgress[currentUser].completedDays = readingPlan.filter(d => d.completed).map(d => d.day);
        saveAllProgress();
        
        const card = document.querySelector(`.day-card[data-day="${dayNum}"]`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => card.style.transform = '', 150);
        }
        
        renderReadingList(false);
        updateProgressBar();
        renderCalendar(false);
        updateTodayHighlight(false);
        updateStatistics(false);
        
        if (day.completed) {
            showToast(`Day ${dayNum} marked as read!`, "success");
        } else {
            showToast(`Day ${dayNum} marked as unread`, "info");
        }
    }
}

// ===== Statistics Functions =====
function updateStatistics(viewing = false) {
    const targetUser = viewing ? otherUser : currentUser;
    if (!targetUser) return;
    
    const stats = calculateStatistics(targetUser);
    
    document.getElementById('stat-completed').textContent = stats.completedDays;
    document.getElementById('stat-total').textContent = stats.totalDays;
    document.getElementById('stat-percentage').textContent = `${stats.percentage}%`;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-nt-read').textContent = stats.ntChaptersRead;
    document.getElementById('stat-ot-read').textContent = stats.otChaptersRead;
    document.getElementById('stat-total-chapters').textContent = stats.totalChaptersRead;
    
    const viewBtn = document.getElementById('view-other-btn');
    if (viewBtn && currentUser) {
        viewBtn.style.display = 'inline-block';
        // Set button text to view the OTHER user
        const otherUserName = currentUser === 'user1' ? userProgress.user2.name : userProgress.user1.name;
        viewBtn.textContent = `👥 View ${otherUserName}`;
    }
}

function calculateStatistics(userId) {
    const userCompletedDays = userProgress[userId].completedDays;
    const completedDays = userCompletedDays.length;
    const totalDays = readingPlan.length;
    const percentage = Math.round((completedDays / totalDays) * 100);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < readingPlan.length; i++) {
        const dayDate = new Date(readingPlan[i].date);
        dayDate.setHours(0, 0, 0, 0);
        if (dayDate > today) continue;
        if (userCompletedDays.includes(readingPlan[i].day)) {
            streak++;
        } else {
            if (dayDate <= today) {
                streak = 0;
            }
        }
    }
    
    let ntChaptersRead = 0;
    let otChaptersRead = 0;
    
    userCompletedDays.forEach(dayNum => {
        const day = readingPlan[dayNum - 1];
        if (day) {
            if (day.ntPassages && day.ntPassages.length > 0) {
                day.ntPassages.forEach(passage => {
                    if (passage.chapter) {
                        ntChaptersRead += 1;
                    } else if (passage.startChapter && passage.endChapter) {
                        ntChaptersRead += (passage.endChapter - passage.startChapter + 1);
                    }
                });
            }
            
            if (day.otPassages && day.otPassages.length > 0) {
                otChaptersRead += day.otPassages.reduce((sum, p) => 
                    sum + (p.endChapter - p.startChapter + 1), 0);
            }
        }
    });
    
    return {
        completedDays,
        totalDays,
        percentage,
        currentStreak: streak,
        ntChaptersRead,
        otChaptersRead,
        totalChaptersRead: ntChaptersRead + otChaptersRead
    };
}

function showToast(message, type = "info") {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// ===== UI Rendering Functions =====
function updateCurrentDay() {
    readingPlan.forEach(day => day.isCurrent = false);
    // Find the first uncompleted day
    for (let i = 0; i < readingPlan.length; i++) {
        if (!readingPlan[i].completed) {
            readingPlan[i].isCurrent = true;
            break;
        }
    }
}

function updateProgressBar() {
    const targetUser = viewingOtherUser ? otherUser : currentUser;
    if (!targetUser) return;
    
    const completedCount = userProgress[targetUser].completedDays.length;
    const totalDays = readingPlan.length;
    const percentage = (completedCount / totalDays) * 100;
    
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('total-days').textContent = totalDays;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

function formatPassage(ntPassages, otPassages) {
    let html = '';
    
    if (ntPassages && ntPassages.length > 0) {
        html += `<div class="passage-nt">`;
        html += `<span class="testament-label NT">NT</span>`;
        
        ntPassages.forEach((passage, idx) => {
            if (passage.chapter) {
                html += `<span class="passage-book">${passage.book}</span> `;
                html += `<span class="passage-chapter">${passage.chapter}</span>`;
            } else if (passage.startChapter && passage.endChapter) {
                html += `<span class="passage-book">${passage.book}</span> `;
                if (passage.startChapter === passage.endChapter) {
                    html += `<span class="passage-chapter">${passage.startChapter}</span>`;
                } else {
                    html += `<span class="passage-chapter">${passage.start
