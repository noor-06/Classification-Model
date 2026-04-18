$(document).ready(function() {
    // 1. Initialize the Donut Chart using Chart.js
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

    // 2. Drag and Drop Visual Effects & Simulation
    const dropzone = $('#imageDropzone');
    
    dropzone.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });

    dropzone.on('dragleave', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    });

    dropzone.on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
        
        let files = e.originalEvent.dataTransfer.files;
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

            // Simulate waiting for your Python Backend to run the model
            setTimeout(function() {
                // Update the row with your validated model results
                $(`#${newRowId} .status-badge`)
                    .removeClass('status-processing')
                    .addClass('status-urban')
                    .html('URBAN (99.4% Confirmed)');
            }, 1500); // 1.5 second delay
        }
    });
});
