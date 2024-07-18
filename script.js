const DISCORD_TOKEN = 'Njk2MzU3OTM5MTUzMzM4NDI5.G65AWV.KfbxHlItFUfjlMn7SWiyxhF_i8mfjQLiTdvRMk';
let validLinks = [];

async function checkLink(link) {
    const apiUrl = `https://discord.com/api/v9/entitlements/gift-codes/${link.split('/').pop()}?with_application=false&with_subscription_plan=true`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${DISCORD_TOKEN}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return !data.redeemed ? 'válido' : 'inválido';
        } else {
            return 'inválido';
        }
    } catch (error) {
        console.error('Erro ao verificar o link:', error);
        return 'erro na verificação';
    }
}

document.getElementById('linkForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const linksInput = document.getElementById('linksInput');
    const results = document.getElementById('results');
    const summary = document.getElementById('summary');
    const loading = document.getElementById('loading');
    const downloadBtn = document.getElementById('downloadBtn');
    results.innerHTML = '';
    summary.innerHTML = '';
    validLinks = [];

    const links = linksInput.value.match(/https:\/\/(?:discord\.com\/billing\/promotions|promos\.discord\.gg)\/[^\s]+/g) || [];
    if (links.length === 0) {
        results.innerHTML = '<p>Nenhum link de promoção do Discord encontrado.</p>';
        return;
    }

    loading.style.display = 'block';
    let validCount = 0;
    let invalidCount = 0;
    let errorCount = 0;

    for (const link of links) {
        const status = await checkLink(link);
        if (status === 'válido') {
            validCount++;
            validLinks.push(link);
        } else if (status === 'inválido') {
            invalidCount++;
        } else {
            errorCount++;
        }
        const item = document.createElement('div');
        item.classList.add('result-item');
        item.textContent = `${link} - ${status}`;
        results.appendChild(item);
    }

    loading.style.display = 'none';
    summary.innerHTML = `Total de links válidos: ${validCount}<br>Total de links inválidos: ${invalidCount}<br>Total de erros na verificação: ${errorCount}`;

    if (validLinks.length > 0) {
        downloadBtn.style.display = 'block';
    } else {
        downloadBtn.style.display = 'none';
    }
});

function downloadValidLinks() {
    const blob = new Blob([validLinks.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validos.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
