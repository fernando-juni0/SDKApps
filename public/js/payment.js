
const serverID = location.pathname.replace('/payment/', "")


document.getElementById('plan-1').addEventListener('click', async () => {
    const response = await fetch('/payment/chechout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            price:999,
            serverID:serverID,
            uid:uid,
            plan:1
        })
    });

    if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
    } else {
        console.error('Erro ao iniciar o checkout');
    }
});


document.getElementById('plan-2').addEventListener('click', async () => {
    const response = await fetch('/payment/chechout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            price:1499,
            serverID:serverID,
            uid:uid,
            plan:2
        })
    });

    if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
    } else {
        console.error('Erro ao iniciar o checkout');
    }
});


document.getElementById('plan-3').addEventListener('click', async () => {
    const response = await fetch('/payment/chechout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            price:1999,
            serverID:serverID,
            uid:uid,
            plan:3
        })
    });

    if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
    } else {
        console.error('Erro ao iniciar o checkout');
    }
});