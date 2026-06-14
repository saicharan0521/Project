const DEFAULT_PLAYLIST = [
        { title: "Despacito", artist: "Luis Fonsi Ft. Daddy Yankee", src: null, url: null },
        { title: "Despacito (Remix)", artist: "Luis Fonsi, Justin Bieber", src: null, url: null },
        { title: "Échame La Culpa", artist: "Luis Fonsi, Demi Lovato", src: null, url: null }
    ];

    let currentPlaylist = [];
    let currentTrackIndex = 0;
    let audio = new Audio();
    let isPlaying = false;

    // DOM elements
    const songTitleEl = document.getElementById('songTitle');
    const artistNameEl = document.getElementById('artistName');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressFill = document.getElementById('progressFill');
    const progressBg = document.getElementById('progressBarBg');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('durationTime');
    const customBadge = document.getElementById('customTrackBadge');
    const accentInput = document.getElementById('accentColor');
    const resetColorBtn = document.getElementById('resetColorBtn');
    const fileInput = document.getElementById('songFileInput');
    const resetPlaylistBtn = document.getElementById('resetDefaultPlaylistBtn');
    const coverArtDiv = document.getElementById('coverArt');
    const mainCoverImage = document.getElementById('mainCoverImage');

    // Handle custom image (justin.jpg) - check if it loads or not
    function setupCoverImage() {
        if (mainCoverImage) {
            // Check if image loads successfully
            mainCoverImage.onload = function() {
                console.log("✅ justin.jpg loaded successfully!");
                coverArtDiv.classList.add('has-image');
                // optional: remove any default SVG if exists
                const defaultSvg = coverArtDiv.querySelector('.default-svg');
                if (defaultSvg) defaultSvg.style.display = 'none';
            };
            mainCoverImage.onerror = function() {
                console.warn("⚠️ justin.jpg not found at path: " + mainCoverImage.src);
                // Image failed to load - show fallback message but keep structure
                coverArtDiv.classList.remove('has-image');
                customBadge.innerText = "🖼️ image not found, check path";
                setTimeout(() => {
                    if(currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].title)
                        customBadge.innerText = "✨ " + currentPlaylist[currentTrackIndex].title.slice(0,18);
                    else customBadge.innerText = "✨ ready for your track";
                }, 2000);
            };
            // trigger initial check
            if (mainCoverImage.complete && mainCoverImage.naturalHeight !== 0) {
                // image already loaded
                coverArtDiv.classList.add('has-image');
                const defaultSvg = coverArtDiv.querySelector('.default-svg');
                if (defaultSvg) defaultSvg.style.display = 'none';
            } else if (mainCoverImage.complete && mainCoverImage.naturalHeight === 0) {
                // broken image
                mainCoverImage.onerror();
            }
        }
    }

    // Helper: format seconds
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // apply accent color
    function applyAccentColor(color) {
        document.querySelectorAll('.progress-fill').forEach(el => {
            el.style.backgroundColor = color;
        });
        const playBtnDiv = document.getElementById('playPauseBtn');
        if (playBtnDiv) playBtnDiv.style.backgroundColor = color;
        const coverTextSpan = document.querySelector('.cover-text-overlay');
        if (coverTextSpan) coverTextSpan.style.borderLeft = `3px solid ${color}`;
        customBadge.style.borderLeft = `2px solid ${color}`;
        customBadge.style.borderLeftWidth = "3px";
        customBadge.style.paddingLeft = "8px";
    }

    // Build default playlist (no audio, just metadata)
    function buildDefaultPlaylist() {
        return DEFAULT_PLAYLIST.map(track => ({
            title: track.title,
            artist: track.artist,
            url: null
        }));
    }

    function loadTrackSafely(index) {
        if (!currentPlaylist.length) return;
        const track = currentPlaylist[index];
        if (!track || !track.url) {
            songTitleEl.innerText = track ? track.title : "No track";
            artistNameEl.innerText = track ? track.artist + " (⬆️ upload song)" : "use + add song";
            audio.pause();
            isPlaying = false;
            updatePlayPauseUI();
            progressFill.style.width = "0%";
            currentTimeSpan.innerText = "0:00";
            durationSpan.innerText = "0:00";
            if (track && track.title) customBadge.innerText = "📂 add your music above!";
            else customBadge.innerText = "🎵 upload mp3";
            return;
        }
        // valid audio url
        audio.pause();
        audio.src = track.url;
        audio.load();
        songTitleEl.innerText = track.title;
        artistNameEl.innerText = track.artist;
        customBadge.innerText = "🎶 " + (track.title.length > 20 ? track.title.slice(0,18)+".." : track.title);
        if (isPlaying) {
            audio.play().catch(e => { console.log("play error", e); isPlaying = false; updatePlayPauseUI(); });
        }
        updatePlayPauseUI();
        resetProgress();
    }

    function resetProgress() {
        progressFill.style.width = "0%";
        currentTimeSpan.innerText = "0:00";
        if (audio.duration && !isNaN(audio.duration)) durationSpan.innerText = formatTime(audio.duration);
        else durationSpan.innerText = "0:00";
    }

    function updateProgress() {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = percent + "%";
            currentTimeSpan.innerText = formatTime(audio.currentTime);
            durationSpan.innerText = formatTime(audio.duration);
        } else if (audio.src) {
            if (audio.duration && !isNaN(audio.duration)) durationSpan.innerText = formatTime(audio.duration);
        }
    }

    function updatePlayPauseUI() {
        if (!playPauseBtn) return;
        if (isPlaying) {
            playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`;
        } else {
            playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" id="playIcon"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>`;
        }
    }

    function togglePlayPause() {
        if (!currentPlaylist.length || !currentPlaylist[currentTrackIndex]?.url) {
            customBadge.innerText = "🎵 upload mp3 first!";
            setTimeout(()=>{ 
                if(currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].title)
                    customBadge.innerText = "✨ "+currentPlaylist[currentTrackIndex].title.slice(0,18); 
                else customBadge.innerText = "✨ add your song";
            }, 1800);
            return;
        }
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play().catch(e => { 
                console.log(e); 
                customBadge.innerText = "⚠️ error playing"; 
                isPlaying = false;
            });
            isPlaying = true;
        }
        updatePlayPauseUI();
    }

    function nextTrack() {
        if (currentPlaylist.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
        loadTrackSafely(currentTrackIndex);
        if (isPlaying && currentPlaylist[currentTrackIndex]?.url) audio.play().catch(e=>{});
    }

    function prevTrack() {
        if (currentPlaylist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        loadTrackSafely(currentTrackIndex);
        if (isPlaying && currentPlaylist[currentTrackIndex]?.url) audio.play().catch(e=>{});
    }

    // handle file upload
    fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        const newPlaylist = [];
        files.forEach(file => {
            const url = URL.createObjectURL(file);
            let title = file.name.replace(/\.[^/.]+$/, "");
            if (title.length > 35) title = title.slice(0, 32)+"...";
            newPlaylist.push({
                title: title,
                artist: "your library",
                url: url
            });
        });
        if (newPlaylist.length) {
            // cleanup previous blob URLs
            currentPlaylist.forEach(t => { if (t.url && t.url.startsWith('blob:')) URL.revokeObjectURL(t.url); });
            currentPlaylist = newPlaylist;
            currentTrackIndex = 0;
            loadTrackSafely(0);
            if (isPlaying && currentPlaylist[0]?.url) { audio.play().catch(e=>{}); }
            customBadge.innerText = `🎧 ${currentPlaylist.length} track(s) loaded`;
        }
    });

    function resetToDefault() {
        currentPlaylist.forEach(t => { if (t.url && t.url.startsWith('blob:')) URL.revokeObjectURL(t.url); });
        currentPlaylist = buildDefaultPlaylist();
        currentTrackIndex = 0;
        loadTrackSafely(0);
        isPlaying = false;
        updatePlayPauseUI();
        customBadge.innerText = "♻️ default titles (upload your song)";
        fileInput.value = '';
    }

    resetPlaylistBtn.addEventListener('click', resetToDefault);

    // seek progress
    progressBg.addEventListener('click', (e) => {
        if (!audio.duration || isNaN(audio.duration) || !currentPlaylist[currentTrackIndex]?.url) return;
        const rect = progressBg.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    audio.addEventListener('timeupdate', () => updateProgress());
    audio.addEventListener('ended', () => { nextTrack(); });
    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) durationSpan.innerText = formatTime(audio.duration);
        updateProgress();
    });

    // Color handlers
    accentInput.addEventListener('input', (e) => applyAccentColor(e.target.value));
    resetColorBtn.addEventListener('click', () => { accentInput.value = "#ff8c42"; applyAccentColor("#ff8c42"); });

    // Buttons
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // ---- MAKE YOUR IMAGE WORK (justin.jpg) ----
    // We'll ensure the image appears correctly. The image path is set to "./images/justin.jpg"
    // You can change the path below if your image is located somewhere else.
    function ensureImagePath() {
        // The image element already has src="./images/justin.jpg"
        // If you want to change the path, modify the src attribute here or above.
        // For flexibility, let's also try to detect if image fails and provide helpful console message
        if (mainCoverImage) {
            console.log("Looking for image at:", mainCoverImage.src);
            // If you need to update the path manually, uncomment and set correct path:
            // mainCoverImage.src = "YOUR_CORRECT_PATH_TO/justin.jpg";
        }
    }
    
    // initialize everything
    function init() {
        ensureImagePath();
        setupCoverImage();    // handles justin.jpg display
        applyAccentColor("#ff8c42");
        currentPlaylist = buildDefaultPlaylist();
        loadTrackSafely(0);
        updatePlayPauseUI();
    }

    init();