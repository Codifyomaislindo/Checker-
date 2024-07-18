function decodeToken(encoded) {
    const charCodeArray = encoded.split(',').map(code => parseInt(code));
    return String.fromCharCode(...charCodeArray);
}

const encodedToken = '77,84,73,53,79,77,51,77,84,69,48,77,84,73,50,77,68,65,53,78,103,46,71,105,48,79,82,114,46,122,95,48,81,101,99,102,114,52,76,98,120,122,50,80,100,80,73,120,111,95,89,97,86,105,82,113,107,121,77,80,122,51,67,90,45,111,73';

const DISCORD_TOKEN = decodeToken(encodedToken);
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
            return !data.consumed ? 'válido' : 'inválido';
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
