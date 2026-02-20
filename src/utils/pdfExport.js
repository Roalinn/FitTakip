// Simple PDF generator using browser print API
export function exportProgramToPDF(title, content) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title} - FitTakip</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                    color: #1a1a2e;
                    background: #fff;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 32px; 
                    padding-bottom: 16px;
                    border-bottom: 2px solid #e0e0e0;
                }
                .header h1 { 
                    font-size: 24px; 
                    font-weight: 700;
                    color: #6c5ce7;
                }
                .header p { 
                    font-size: 12px; 
                    color: #999; 
                    margin-top: 4px; 
                }
                .day-section { 
                    margin-bottom: 24px; 
                    page-break-inside: avoid;
                }
                .day-title { 
                    font-size: 16px; 
                    font-weight: 700; 
                    padding: 8px 16px;
                    background: #6c5ce7;
                    color: #fff;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 4px;
                }
                th { 
                    text-align: left; 
                    padding: 8px 12px; 
                    background: #f0f0f5;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #666;
                    border-bottom: 1px solid #e0e0e0;
                }
                td { 
                    padding: 8px 12px; 
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 13px;
                }
                tr:last-child td { border-bottom: none; }
                .empty { 
                    text-align: center; 
                    color: #999; 
                    padding: 16px; 
                    font-style: italic;
                    font-size: 13px;
                }
                .footer {
                    text-align: center;
                    margin-top: 32px;
                    padding-top: 16px;
                    border-top: 1px solid #e0e0e0;
                    font-size: 11px;
                    color: #999;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${content}
            <div class="footer">FitTakip &bull; ${new Date().toLocaleDateString()}</div>
            <script>
                window.onload = function() { window.print(); };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

export function generateDietPDF(dietProgram, dayLabels, t) {
    const days = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];

    let content = `
        <div class="header">
            <h1>🍎 ${t('prog_diyet', 'Diyet Programı')}</h1>
            <p>${t('pdf_generating', 'PDF oluşturuluyor...')}</p>
        </div>
    `;

    days.forEach(day => {
        const meals = dietProgram[day] || [];
        const label = dayLabels[day] || day;

        content += `<div class="day-section">`;
        content += `<div class="day-title">${label}</div>`;

        if (meals.length > 0) {
            content += `<table><thead><tr><th>${t('diet_time', 'Saat')}</th><th>${t('diet_meal_name', 'Öğün')}</th><th>${t('diet_foods', 'Besinler')}</th></tr></thead><tbody>`;
            meals.forEach(meal => {
                content += `<tr><td>${meal.time || '—'}</td><td>${meal.name || '—'}</td><td>${meal.foods || '—'}</td></tr>`;
            });
            content += `</tbody></table>`;
        } else {
            content += `<p class="empty">—</p>`;
        }
        content += `</div>`;
    });

    exportProgramToPDF(t('prog_diyet', 'Diyet Programı'), content);
}

export function generateGymPDF(gymProgram, dayLabels, t) {
    const days = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];

    let content = `
        <div class="header">
            <h1>🏋️ ${t('prog_gym', 'Gym Programı')}</h1>
            <p>${t('pdf_generating', 'PDF oluşturuluyor...')}</p>
        </div>
    `;

    days.forEach(day => {
        const exercises = gymProgram[day] || [];
        const label = dayLabels[day] || day;

        content += `<div class="day-section">`;
        content += `<div class="day-title">${label}</div>`;

        if (exercises.length > 0) {
            content += `<table><thead><tr><th>${t('gym_move', 'Hareket')}</th><th>${t('gym_sets', 'Set')}</th><th>${t('gym_reps', 'Tekrar')}</th><th>${t('gym_duration', 'Süre')}</th></tr></thead><tbody>`;
            exercises.forEach(ex => {
                content += `<tr><td>${ex.name || '—'}</td><td>${ex.sets || '—'}</td><td>${ex.reps || '—'}</td><td>${ex.duration || '—'}</td></tr>`;
            });
            content += `</tbody></table>`;
        } else {
            content += `<p class="empty">—</p>`;
        }
        content += `</div>`;
    });

    exportProgramToPDF(t('prog_gym', 'Gym Programı'), content);
}
