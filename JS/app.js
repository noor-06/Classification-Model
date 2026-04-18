$(document).ready(function() {
    
    // ==========================================
    // PAGE 1: CLASSIFICATION DASHBOARD LOGIC
    // ==========================================
    if ($('#donutChart1').length > 0) {
        
        // 1. Initialize Chart 1 (Overall Distribution)
        const ctx1 = document.getElementById('donutChart1').getContext('2d');
        new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Urban', 'Agriculture', 'Nature'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // 2. Initialize Chart 2 (Processed Classes - to fill the empty space)
        const ctx2 = document.getElementById('donutChart2').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Processed', 'Pending'],
                datasets: [{
                    data: [80, 20],
                    backgroundColor: ['#10b981', '#cbd5e1']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // 3. Upload Logic (Drag & Drop + Clicking)
        const dropzone = $('#imageDropzone');
        const fileInput = $('#fileInput');
        
        // Trigger file explorer when clicking the dropzone
        dropzone.on('click', function() {
            fileInput.click();
        });

        // Visual effects for dragging
        dropzone.on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('dragover');
        });

        dropzone.on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
        });

        // Handle dropped files
        dropzone.on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
            let files = e.originalEvent.dataTransfer.files;
            handleFiles(files);
        });

        // Handle clicked/selected files
        fileInput.on('change', function(e) {
            let files = e.target.files;
            handleFiles(files);
        });

        // The core function that processes the files
        function handleFiles(files) {
            if(files.length > 0) {
                let fileName = files[0].name;
                
                // Create a "Processing" row in the UI
                let newRowId = 'queue-' + Date.now();
                let processingHtml = `
                    <div class="queue-item" id="${newRowId}">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div class="queue-img" style="background:#ddd; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-satellite" style="color:#888;"></i></div>
                            <span>${fileName}</span>
                        </div>
                        <span class="status-badge status-processing"><i class="fa-solid fa-spinner fa-spin"></i> Processing...</span>
                    </div>
                `;
                
                // Add it to the top of the queue list
                $('.queue-list h3').after(processingHtml);

                // Simulate waiting for the backend
                setTimeout(function() {
                    // Update the row with your validated results
                    $(`#${newRowId} .status-badge`)
                        .removeClass('status-processing')
                        .addClass('status-urban')
                        .html('URBAN (99.4% Confirmed)');
                }, 1500); 
            }
        }
    }

    // ==========================================
    // PAGE 2: TRENDS LOGIC (If you added it previously)
    // ==========================================
    if ($('#trendLineChart').length > 0) {
        const ctxLine = document.getElementById('trendLineChart').getContext('2d');
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['2015', '2017', '2018', '2022', '2024', '2025'],
                datasets: [
                    { label: 'Urban', data: [20, 35, 50, 65, 75, 85], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 },
                    { label: 'Agriculture', data: [80, 65, 50, 45, 40, 35], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
                    { label: 'Nature', data: [85, 70, 55, 40, 25, 10], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', fill: true, tension: 0.4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const map = L.map('miniMap').setView([-26.2041, 28.0473], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    }
});
