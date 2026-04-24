$(document).ready(function() {
    
    // ==========================================
    // PAGE 1: CLASSIFICATION DASHBOARD LOGIC
    // ==========================================
    if ($('#donutChart1').length > 0) {
        
        // 1. Initialize Charts
        const ctx1 = document.getElementById('donutChart1').getContext('2d');
        new Chart(ctx1, {
            type: 'doughnut',
            data: { labels: ['Urban', 'Agriculture', 'Nature'], datasets: [{ data: [45, 30, 25], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const ctx2 = document.getElementById('donutChart2').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: { labels: ['Processed', 'Pending'], datasets: [{ data: [80, 20], backgroundColor: ['#10b981', '#cbd5e1'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // 2. Upload Logic
        const dropzone = $('#imageDropzone');
        const fileInput = $('#fileInput');
        
        dropzone.off('click').on('click', function(e) {
            if(e.target.id !== 'fileInput') { fileInput[0].click(); }
        });

        dropzone.off('dragover').on('dragover', function(e) {
            e.preventDefault(); $(this).addClass('dragover');
        });

        dropzone.off('dragleave').on('dragleave', function(e) {
            e.preventDefault(); $(this).removeClass('dragover');
        });

        dropzone.off('drop').on('drop', function(e) {
            e.preventDefault(); $(this).removeClass('dragover');
            handleFiles(e.originalEvent.dataTransfer.files);
        });

        fileInput.off('change').on('change', function(e) {
            handleFiles(e.target.files);
        });

        // 4. Staging Files
        function handleFiles(files) {
            let currentQueueSize = $('.queue-item').length;
            if (currentQueueSize + files.length > 20) {
                alert("Maximum batch size is 20 satellite images. Please run the model or clear the queue.");
                return; 
            }

            $.each(files, function(index, file) {
                let newRowId = 'queue-' + Date.now() + index;
                
                let itemHtml = `
                    <div class="queue-item pending-item" id="${newRowId}" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <img class="queue-img preview-img" src="" alt="preview" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; background: #ddd;" />
                            <span>${file.name}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="status-badge" style="background: #e2e8f0; color: #475569; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">Ready</span>
                            <i class="fa-solid fa-xmark remove-btn" style="color: #ef4444; cursor: pointer; font-size: 16px; margin-left: 10px;"></i>
                        </div>
                    </div>
                `;
                
                let newRow = $(itemHtml);
                // *CRITICAL NEW LINE*: Attach the actual file object to the HTML row
                newRow.data('rawFile', file);
                $('#queueItemsContainer').prepend(newRow);

                if (file.type.match('image.*')) {
                    let reader = new FileReader();
                    reader.onload = function(e) { $(`#${newRowId} .preview-img`).attr('src', e.target.result); }
                    reader.readAsDataURL(file);
                } else {
                    $(`#${newRowId} .preview-img`).replaceWith('<div class="queue-img" style="background:#ddd; display:flex; justify-content:center; align-items:center; width:50px; height:50px;"><i class="fa-solid fa-satellite" style="color:#888;"></i></div>');
                }

                $(`#${newRowId} .remove-btn`).on('click', function() { $(`#${newRowId}`).remove(); });
            });
            fileInput.val(''); 
        }

        // 5. The REAL "Run Model" API Connection
        $('#runModelBtn').on('click', function() {
            $('.pending-item').each(function() {
                let row = $(this);
                let physicalFile = row.data('rawFile'); // Retrieve the stored file!
                
                row.removeClass('pending-item');
                row.find('.remove-btn').hide(); 
                
                let badge = row.find('.status-badge');
                badge.css({'background': '#fef3c7', 'color': '#d97706'}).html('<i class="fa-solid fa-spinner fa-spin"></i> Processing...');
                
                // Package the file for sending over the internet
                let formData = new FormData();
                formData.append("file", physicalFile);

                // Send it to the local Python FastAPI server
                fetch("http://127.0.0.1:8000/analyze-image/", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    // Change badge color based on the AI's actual classification
                    let bg = '#dcfce7'; let text = '#166534'; // Default Green
                    
                    if (data.classification === 'Urban') { bg = '#dbeafe'; text = '#1e3a8a'; } // Blue
                    else if (data.classification === 'Agriculture') { bg = '#dcfce7'; text = '#14532d'; } // Green
                    else if (data.classification === 'Nature') { bg = '#ffedd5'; text = '#9a3412'; } // Orange

                    // Update the UI with the data from Python!
                    badge.css({'background': bg, 'color': text}).html(`${data.classification.toUpperCase()} (${data.confidence}% Confirmed)`);
                })
                .catch(error => {
                    console.error("API Error:", error);
                    badge.css({'background': '#fee2e2', 'color': '#991b1b'}).html('Error Connecting to AI');
                });
            });
        });

        $('#clearQueue').on('click', function() { $('#queueItemsContainer').empty(); });
    }

    // ==========================================
    // PAGE 2: TRENDS LOGIC
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

    // ==========================================
    // PAGE 3: LIVE MAP LOGIC
    // ==========================================
    if ($('#liveMap').length > 0) {
        const liveMap = L.map('liveMap').setView([-26.2041, 28.0473], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(liveMap);

        const urbanLayer = L.rectangle([[-26.1, 28.0], [-26.3, 28.2]], {color: "#3b82f6", weight: 2, fillOpacity: 0.4}).addTo(liveMap);
        const agriLayer = L.rectangle([[-26.4, 27.8], [-26.7, 28.1]], {color: "#10b981", weight: 2, fillOpacity: 0.4}).addTo(liveMap);
        const natureLayer = L.rectangle([[-25.8, 28.3], [-26.0, 28.6]], {color: "#f59e0b", weight: 2, fillOpacity: 0.4}).addTo(liveMap);

        $('#regionSelect').on('change', function() {
            let region = $(this).val();
            if(region === 'sa') { liveMap.flyTo([-26.2041, 28.0473], 8, { duration: 1.5 }); } 
            else if (region === 'asia') { liveMap.flyTo([34.0479, 100.6197], 5, { duration: 1.5 }); }
        });

        $('#layerUrban').on('change', function() { $(this).is(':checked') ? liveMap.addLayer(urbanLayer) : liveMap.removeLayer(urbanLayer); });
        $('#layerAgri').on('change', function() { $(this).is(':checked') ? liveMap.addLayer(agriLayer) : liveMap.removeLayer(agriLayer); });
        $('#layerNature').on('change', function() { $(this).is(':checked') ? liveMap.addLayer(natureLayer) : liveMap.removeLayer(natureLayer); });
    }
});
