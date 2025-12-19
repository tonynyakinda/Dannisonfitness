// Filename: database.js | Path: C:\Users\cyber\Downloads\Dannisonfitness\database.js
import { supabase } from './supabaseClient.js';

// --- HELPER FUNCTIONS ---

// Extracts a YouTube video ID from various URL formats.
function getYouTubeVideoId(url) {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match) {
            videoId = match[1];
        }
    }
    return videoId;
}

// Creates a YouTube embed URL from a video URL.
function getYouTubeEmbedUrl(url) {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// --- PODCAST PLAYER LOGIC ---
let activeAudioPlayer = null;
let activeAudioEpisodeId = null;
let progressUpdateInterval = null;

window.onYouTubeIframeAPIReady = function () {
    console.log('YouTube API is ready.');
};

function createAudioPlayer(episodeId, videoId) {
    if (activeAudioPlayer) {
        activeAudioPlayer.destroy();
        clearInterval(progressUpdateInterval);
        const oldEpisodeElement = document.querySelector(
            `.podcast-episode[data-id="${activeAudioEpisodeId}"]`
        );
        if (oldEpisodeElement) {
            oldEpisodeElement
                .querySelector('.custom-audio-player')
                .classList.remove('active');
        }
    }
    const playerContainerId = `audio-player-div-${episodeId}`;
    activeAudioPlayer = new YT.Player(playerContainerId, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: { controls: 0 },
        events: {
            onReady: onAudioPlayerReady,
            onStateChange: onAudioPlayerStateChange,
        },
    });
    activeAudioEpisodeId = episodeId;
}

function onAudioPlayerReady(event) {
    event.target.playVideo();
    const episodeElement = document.querySelector(
        `.podcast-episode[data-id="${activeAudioEpisodeId}"]`
    );
    const volumeSlider = episodeElement.querySelector('.volume-slider');
    event.target.setVolume(volumeSlider.value);
    progressUpdateInterval = setInterval(() => {
        updateProgressBar(event.target);
    }, 1000);
}

function onAudioPlayerStateChange(event) {
    const episodeElement = document.querySelector(
        `.podcast-episode[data-id="${activeAudioEpisodeId}"]`
    );
    if (!episodeElement) return;
    const playBtn = episodeElement.querySelector('.listen-play-btn');
    const pauseBtn = episodeElement.querySelector('.listen-pause-btn');
    if (event.data === YT.PlayerState.PLAYING) {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
    } else {
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
        if (event.data === YT.PlayerState.ENDED) {
            clearInterval(progressUpdateInterval);
            if (activeAudioPlayer) activeAudioPlayer.destroy();
            activeAudioPlayer = null;
        }
    }
}

function formatTime(time) {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressBar(player) {
    const episodeElement = document.querySelector(
        `.podcast-episode[data-id="${activeAudioEpisodeId}"]`
    );
    if (!player || !episodeElement || typeof player.getCurrentTime !== 'function')
        return;
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const progressBar = episodeElement.querySelector('.progress-slider');
    const currentTimeDisplay = episodeElement.querySelector('.current-time');
    const durationDisplay = episodeElement.querySelector('.duration-time');
    progressBar.max = duration;
    progressBar.value = currentTime;
    currentTimeDisplay.textContent = formatTime(currentTime);
    durationDisplay.textContent = formatTime(duration);
}

// --- DYNAMIC CONTENT LOADING FUNCTIONS ---

/**
 * Loads recent testimonials and displays them in an animated slider on the homepage.
 */
async function loadHomepageTestimonialSlider() {
    const container = document.getElementById('home-testimonial-container');
    if (!container) return;

    const sliderContent = document.getElementById('testimonial-slider-content');
    if (!sliderContent) return;

    const { data: testimonials, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error || !testimonials || testimonials.length === 0) {
        sliderContent.innerHTML = '<p>Check out our client success stories!</p>';
        console.warn('Could not load testimonials for slider:', error);
        return;
    }

    let currentIndex = 0;

    function showTestimonial(index) {
        const testimonial = testimonials[index];
        sliderContent.style.opacity = 0;
        setTimeout(() => {
            sliderContent.innerHTML = `
                <div class="testimonial-card">
                    <p>"${testimonial.quote}"</p>
                    <div class="client-info">
                        <div class="client-image">
                            <img src="${testimonial.image_after_url || 'https://placehold.co/100x100'}" alt="${testimonial.client_name}">
                        </div>
                        <div>
                            <div class="client-name">${testimonial.client_name}</div>
                            <div>${testimonial.program_type || 'Transformation'}</div>
                        </div>
                    </div>
                </div>
            `;
            sliderContent.style.opacity = 1;
        }, 500);
    }

    showTestimonial(currentIndex);

    if (testimonials.length > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 7000);
    }
}

async function loadBlogPosts() {
    const container = document.getElementById('blog-posts-container');
    if (!container) return;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'blog')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML =
            '<p>There was an error loading the posts. Please try again later.</p>';
        return;
    }
    if (data.length === 0) {
        container.innerHTML =
            '<p>No blog posts have been published yet. Check back soon!</p>';
        return;
    }
    container.innerHTML = '';
    data.forEach((post) => {
        const contentSnippet = post.content
            ? post.content.replace(/<[^>]*>?/gm, '')
            : '';
        const postCard = `
      <article class="blog-post">
        <div class="blog-image">
          <a href="post.html?id=${post.id}">
            <img src="${post.image_url}" alt="${post.title}">
          </a>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span>${new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <h3>
            <a href="post.html?id=${post.id}" style="color: inherit; text-decoration: none;">
              ${post.title}
            </a>
          </h3>
          <p>${contentSnippet.substring(0, 150)}...</p>
          <a href="post.html?id=${post.id}" class="btn btn-secondary">Read More</a>
        </div>
      </article>`;
        container.insertAdjacentHTML('beforeend', postCard);
    });
}

async function loadSinglePost() {
    const container = document.getElementById('single-post-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    if (!postId) {
        container.innerHTML =
            '<h1>Article not found.</h1><p>Please return to the <a href="blog.html">blog list</a>.</p>';
        return;
    }
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
    if (error || !post) {
        console.error('Error fetching post:', error);
        container.innerHTML =
            '<h1>Article not found.</h1><p>The requested article does not exist or could not be loaded.</p>';
        return;
    }
    document.title = `${post.title} | Dennison Fitness`;
    container.innerHTML = `
    <div class="post-header">
      <h1>${post.title}</h1>
      <div class="post-meta">Published on ${new Date(
        post.created_at
    ).toLocaleDateString()}</div>
    </div>
    <img src="${post.image_url}" alt="${post.title}" class="post-image">
    <div class="post-content">${post.content}</div>`;
}

async function loadMerchandise() {
    const container = document.getElementById('merch-container');
    if (!container) return;

    const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        container.innerHTML =
            '<p>There was an error loading the products. Please try again later.</p>';
        return;
    }
    if (data.length === 0) {
        container.innerHTML =
            '<p>No products are available at the moment. Check back soon!</p>';
        return;
    }
    container.innerHTML = '';
    data.forEach((item) => {
        const merchCard = `
      <div class="merch-card">
        <img src="${item.image_url}" alt="${item.name}">
        <div class="merch-content">
          <h3>${item.name}</h3>
          <span class="merch-price">Ksh${Number(item.price).toFixed(2)}</span>
          <p>${item.description}</p>
          <a href="#" class="btn btn-primary" style="width: 100%; text-align: center;">Add to Cart</a>
        </div>
      </div>`;
        container.insertAdjacentHTML('beforeend', merchCard);
    });
}

async function loadPodcastEpisodes() {
    const container = document.getElementById('podcast-list-container');
    if (!container) return;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'vlog')
        .order('created_at', { ascending: false });
    if (error) {
        container.innerHTML = '<p>Error loading episodes.</p>';
        return;
    }
    if (data.length === 0) {
        container.innerHTML = '<p>No episodes yet.</p>';
        return;
    }

    container.innerHTML = '';
    data.forEach((episode, index) => {
        const episodeNumber = (data.length - index).toString().padStart(2, '0');
        const hasVideo = !!episode.video_url;
        const contentSnippet = episode.content
            ? episode.content.replace(/<[^>]*>?/gm, '')
            : 'Tune in to find out more!';
        let actionButtons = '';
        if (hasVideo) {
            actionButtons = `
        <button class="btn btn-secondary main-listen-btn">Listen</button>
        <button class="btn btn-primary watch-btn">Watch</button>`;
        }
        const episodeCard = `
      <div class="podcast-episode" data-id="${episode.id}" data-video-url="${episode.video_url || ''}">
        <img src="${episode.image_url}" alt="${episode.title}" class="episode-thumbnail">
        <div class="episode-details">
            <div class="episode-meta">Episode ${episodeNumber} | ${new Date(episode.created_at).toLocaleDateString()}</div>
            <h3>${episode.title}</h3>
            <p>${contentSnippet.substring(0, 150)}...</p>
            <div class="custom-audio-player">
                <div class="player-controls">
                    <button class="btn btn-secondary listen-play-btn"><i class="fas fa-play"></i></button>
                    <button class="btn btn-secondary listen-pause-btn" style="display:none;"><i class="fas fa-pause"></i></button>
                    <div class="progress-bar-container">
                        <span class="time-display current-time">0:00</span>
                        <input type="range" class="progress-slider" value="0" min="0" step="1">
                        <span class="time-display duration-time">0:00</span>
                    </div>
                </div>
                <div class="volume-controls">
                    <i class="fas fa-volume-down"></i>
                    <input type="range" class="volume-slider" min="0" max="100" value="75">
                    <i class="fas fa-volume-up"></i>
                </div>
            </div>
            <div class="video-player-container"></div>
            <div class="audio-player-container" id="audio-player-div-${episode.id}"></div>
        </div>
        <div class="episode-actions">${actionButtons}</div>
      </div>`;
        container.insertAdjacentHTML('beforeend', episodeCard);
    });

    container.addEventListener('click', function (e) {
        const button = e.target.closest('button');
        if (!button) return;
        const episodeElement = button.closest('.podcast-episode');
        const episodeId = episodeElement.dataset.id;
        const videoUrl = episodeElement.dataset.videoUrl;
        const videoId = getYouTubeVideoId(videoUrl);
        if (button.classList.contains('main-listen-btn')) {
            const audioPlayerUI = episodeElement.querySelector('.custom-audio-player');
            audioPlayerUI.classList.toggle('active');
            if (audioPlayerUI.classList.contains('active') && activeAudioEpisodeId !== episodeId) {
                if (videoId) createAudioPlayer(episodeId, videoId);
            }
        }
        if (button.classList.contains('watch-btn')) {
            const playerContainer = episodeElement.querySelector('.video-player-container');
            if (playerContainer.classList.contains('active')) {
                playerContainer.innerHTML = '';
                playerContainer.classList.remove('active');
            } else if (videoId) {
                if (activeAudioPlayer) {
                    activeAudioPlayer.destroy();
                    clearInterval(progressUpdateInterval);
                }
                document.querySelectorAll('.video-player-container.active, .custom-audio-player.active').forEach(p => {
                    p.classList.remove('active');
                    if (p.classList.contains('video-player-container')) p.innerHTML = '';
                });
                playerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                playerContainer.classList.add('active');
            }
        }
        if (button.classList.contains('listen-play-btn')) {
            if (videoId) {
                if (activeAudioEpisodeId !== episodeId) {
                    createAudioPlayer(episodeId, videoId);
                } else if (activeAudioPlayer) {
                    activeAudioPlayer.playVideo();
                }
            }
        }
        if (button.classList.contains('listen-pause-btn')) {
            if (activeAudioPlayer) activeAudioPlayer.pauseVideo();
        }
    });

    container.addEventListener('input', function (e) {
        const slider = e.target;
        if (slider.classList.contains('progress-slider')) {
            if (activeAudioPlayer && typeof activeAudioPlayer.seekTo === 'function') {
                activeAudioPlayer.seekTo(slider.value, true);
            }
        }
        if (slider.classList.contains('volume-slider')) {
            if (activeAudioPlayer && typeof activeAudioPlayer.setVolume === 'function') {
                activeAudioPlayer.setVolume(slider.value);
            }
        }
    });
}

async function loadTestimonialsPage() {
    const galleryContainer = document.getElementById(
        'transformation-gallery-container'
    );
    const videoContainer = document.getElementById('video-testimonials-container');
    const storiesContainer = document.getElementById('client-stories-container');
    if (!galleryContainer || !videoContainer || !storiesContainer) return;

    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        [galleryContainer, videoContainer, storiesContainer].forEach(
            (c) => (c.innerHTML = '<p>Error loading content.</p>')
        );
        return;
    }
    if (data.length === 0) {
        galleryContainer.innerHTML = '<p>No transformations to show yet.</p>';
        videoContainer.innerHTML = '<p>No video testimonials yet.</p>';
        storiesContainer.innerHTML = '<p>No client stories yet.</p>';
        return;
    }
    galleryContainer.innerHTML = '';
    videoContainer.innerHTML = '';
    storiesContainer.innerHTML = '';
    const videoTestimonials = [];
    data.forEach((testimonial) => {
        if (testimonial.image_before_url && testimonial.image_after_url) {
            const galleryCard = `
        <div class="transformation-card" style="background: var(--white); border-radius: var(--border-radius); overflow: hidden; box-shadow: var(--box-shadow);">
          <div class="transformation-images" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
            <div class="before-image">
              <img src="${testimonial.image_before_url}" alt="Before Transformation" style="width: 100%; height: 250px; object-fit: cover;">
              <div style="background: var(--primary-orange); color: white; text-align: center; padding: 5px; font-weight: bold;">BEFORE</div>
            </div>
            <div class="after-image">
              <img src="${testimonial.image_after_url}" alt="After Transformation" style="width: 100%; height: 250px; object-fit: cover;">
              <div style="background: var(--charcoal-gray); color: white; text-align: center; padding: 5px; font-weight: bold;">AFTER</div>
            </div>
          </div>
          <div style="padding: 20px;">
            <h3>${testimonial.client_name}'s Transformation</h3>
            <p>${testimonial.quote.substring(0, 100)}...</p>
          </div>
        </div>`;
            galleryContainer.insertAdjacentHTML('beforeend', galleryCard);
        }
        if (testimonial.video_url) videoTestimonials.push(testimonial);
        const storyCard = `
      <div class="testimonial-card">
        <div class="client-info">
          <div class="client-image"><img src="${testimonial.image_after_url}" alt="${testimonial.client_name}"></div>
          <div>
            <div class="client-name">${testimonial.client_name}</div>
            <div>${testimonial.program_type || 'Transformation Program'}</div>
          </div>
        </div>
        <p>${testimonial.quote}</p>
      </div>`;
        storiesContainer.insertAdjacentHTML('beforeend', storyCard);
    });
    if (videoTestimonials.length > 0) {
        videoTestimonials.forEach((testimonial) => {
            const embedUrl = getYouTubeEmbedUrl(testimonial.video_url);
            if (embedUrl) {
                const videoCard = `
          <div class="video-embed-card" style="margin-bottom: 2rem;">
            <h3 style="text-align: center; margin-bottom: 1rem;">${testimonial.client_name}'s Story</h3>
            <div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px;">
              <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedUrl}" title="${testimonial.client_name}'s Story" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
          </div>`;
                videoContainer.insertAdjacentHTML('beforeend', videoCard);
            }
        });
    } else {
        videoContainer.innerHTML = '<p>No video testimonials yet.</p>';
    }
}

async function loadSchedule() {
    const scheduleBody = document.getElementById('schedule-body');
    if (!scheduleBody) return;

    const { data, error } = await supabase.from('schedule').select('*').order('start_time');
    if (error) {
        console.error('Error fetching schedule:', error);
        scheduleBody.innerHTML = '<tr><td colspan="8">Error loading schedule.</td></tr>';
        return;
    }
    if (data.length === 0) {
        scheduleBody.innerHTML = '<tr><td colspan="8">Class schedule is not available at the moment.</td></tr>';
        return;
    }

    const timeSlots = {};
    data.forEach(item => {
        const time = item.start_time.slice(0, 5);
        if (!timeSlots[time]) {
            timeSlots[time] = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        }
        timeSlots[time][item.day_of_week].push(item);
    });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedTimes = Object.keys(timeSlots).sort();
    let tableHtml = '';

    sortedTimes.forEach(time => {
        tableHtml += `<tr><td><strong>${time}</strong></td>`;
        for (let day = 1; day <= 7; day++) {
            tableHtml += '<td>';
            if (timeSlots[time][day] && timeSlots[time][day].length > 0) {
                timeSlots[time][day].forEach(classItem => {
                    tableHtml += `
                      <div class="class-entry bookable" 
                           data-class-name="${classItem.class_name}" 
                           data-class-day="${daysOfWeek[day - 1]}"
                           data-class-time="${time}">
                        <span class="class-session">${classItem.class_name}</span>
                        <span class="session-type">Click to Book</span>
                      </div>`;
                });
            }
            tableHtml += '</td>';
        }
        tableHtml += '</tr>';
    });
    scheduleBody.innerHTML = tableHtml;

    scheduleBody.addEventListener('click', (e) => {
        const classEntry = e.target.closest('.bookable');
        if (!classEntry) return;

        const className = classEntry.dataset.className;
        const classDay = classEntry.dataset.classDay;
        const classTime = classEntry.dataset.classTime;

        const bookingModal = document.getElementById('booking-modal');
        const serviceSelect = document.getElementById('service');
        const messageTextarea = document.getElementById('message');

        const existingCustomOption = serviceSelect.querySelector('option[data-custom-class]');
        if (existingCustomOption) {
            existingCustomOption.remove();
        }

        const newOption = document.createElement('option');
        newOption.value = `Group Class: ${className}`;
        newOption.textContent = `${className} (Group Class)`;
        newOption.selected = true;
        newOption.setAttribute('data-custom-class', 'true');
        serviceSelect.prepend(newOption);

        const prefilledMessage = `I'm interested in booking the "${className}" class on ${classDay} at ${classTime}.`;
        messageTextarea.value = prefilledMessage;

        bookingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

async function loadServicePricing() {
    const containers = {
        'one-on-one': document.getElementById('pricing-one-on-one'),
        online: document.getElementById('pricing-online'),
        nutrition: document.getElementById('pricing-nutrition'),
    };
    // Check for only one container to decide if we are on the services page
    if (!document.getElementById('pricing-one-on-one')) return;

    const { data, error } = await supabase.from('services').select('id, pricing');
    if (error) {
        console.error('Error fetching service pricing:', error);
        Object.values(containers).forEach(
            (c) => { if (c) c.innerHTML = '<p>Error loading pricing.</p>' }
        );
        return;
    }
    data.forEach((service) => {
        const container = containers[service.id];
        if (container && service.pricing && service.pricing.tiers) {
            const pricingTiersHtml = service.pricing.tiers
                .map(
                    (tier) =>
                        `<p><strong>${tier.name}: ${tier.price}</strong> ${tier.note || ''}</p>`
                )
                .join('');
            container.innerHTML = `<h4>Investment:</h4>${pricingTiersHtml}`;
        }
    });
}

// --- TUTORIALS (LIBRARY) LOADING ---
async function loadTutorials() {
    const grid = document.getElementById('tutorial-grid');
    const filterContainer = document.querySelector('.tutorial-filters');
    if (!grid) return;

    // Fetch tutorials from Supabase
    const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching tutorials:', error);
        grid.innerHTML = '<p class="error-message">Error loading tutorials. Please try again later.</p>';
        return;
    }

    if (!data || data.length === 0) {
        grid.innerHTML = '<p>No tutorials available yet. Check back soon!</p>';
        return;
    }

    // Store tutorials for filtering
    let allTutorials = data;

    // Function to render tutorials
    function renderTutorials(tutorials) {
        grid.innerHTML = '';

        if (tutorials.length === 0) {
            grid.innerHTML = '<p>No tutorials found in this category.</p>';
            return;
        }

        tutorials.forEach(tutorial => {
            const categoryLabel = tutorial.category ? tutorial.category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General';
            const difficultyClass = tutorial.difficulty || 'beginner';
            const difficultyLabel = tutorial.difficulty ? tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1) : 'Beginner';

            // Check if there's a video URL for clickable play
            const hasVideo = !!tutorial.video_url;
            const videoId = hasVideo ? getYouTubeVideoId(tutorial.video_url) : null;
            const thumbnailStyle = tutorial.thumbnail_url
                ? `background: url('${tutorial.thumbnail_url}') center/cover no-repeat;`
                : (videoId ? `background: url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg') center/cover no-repeat;` : '');

            const card = `
                <div class="tutorial-card" data-category="${tutorial.category || 'general'}" ${hasVideo ? `data-video-url="${tutorial.video_url}"` : ''}>
                    <div class="tutorial-thumbnail" style="${thumbnailStyle}">
                        <i class="fas fa-play-circle"></i>
                        <span class="duration">${tutorial.duration || 'N/A'}</span>
                    </div>
                    <div class="tutorial-content">
                        <h3>${tutorial.title}</h3>
                        <p>${tutorial.description || ''}</p>
                        <div class="tutorial-meta">
                            <span class="difficulty ${difficultyClass}">${difficultyLabel}</span>
                            <span class="category">${categoryLabel}</span>
                        </div>
                    </div>
                </div>`;
            grid.insertAdjacentHTML('beforeend', card);
        });

        // Add click handlers for video playback
        grid.querySelectorAll('.tutorial-card[data-video-url]').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function () {
                const videoUrl = this.dataset.videoUrl;
                const videoId = getYouTubeVideoId(videoUrl);
                if (videoId) {
                    // Create a modal for video playback
                    const modal = document.createElement('div');
                    modal.className = 'video-modal';
                    modal.innerHTML = `
                        <div class="video-modal-content">
                            <button class="video-modal-close">&times;</button>
                            <div class="video-wrapper">
                                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                                    title="Tutorial Video" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen></iframe>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    document.body.style.overflow = 'hidden';

                    // Close modal handlers
                    modal.querySelector('.video-modal-close').addEventListener('click', () => {
                        modal.remove();
                        document.body.style.overflow = '';
                    });
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.remove();
                            document.body.style.overflow = '';
                        }
                    });
                }
            });
        });
    }

    // Initial render
    renderTutorials(allTutorials);

    // Setup category filter buttons
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            // Update active state
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;
            if (category === 'all') {
                renderTutorials(allTutorials);
            } else {
                const filtered = allTutorials.filter(t => t.category === category);
                renderTutorials(filtered);
            }
        });
    }
}

// --- EVENT LISTENERS & INITIALIZATION ---

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = {
            full_name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('contact-message').value,
        };
        const { error } = await supabase.from('contacts').insert([formData]);
        if (error) {
            console.error('Error submitting contact form:', error);
            // Use the global alert function
            window.showAlert('Sorry, there was an error sending your message.', 'error');
        } else {
            // Use the global alert function
            window.showAlert('Thank you for your message! We will get back to you soon.', 'success');
            this.reset();
        }
    });
}

// Run all loading functions when the DOM is ready.
// Each function checks internally if it's on the right page.
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    loadHomepageTestimonialSlider();
    loadBlogPosts();
    loadSinglePost();
    loadMerchandise();
    loadPodcastEpisodes();
    loadTestimonialsPage();
    loadSchedule();
    loadServicePricing();
    loadTutorials();
});