document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('paymentForm');
    const storeSelect = document.getElementById('appId');
    const errorDiv = document.getElementById('error');

    // Parse query parameters to prepopulate the form
    const params = new URLSearchParams(window.location.search);
    document.getElementById('amount').value = params.get('amount') || '';
    document.getElementById('phoneNumber').value = params.get('phoneNumber') || '';

    // Fetch and populate stores
    fetch('https://btcpayserver.bitcoinjungle.app/foood-app-stores')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                data.data.sort((a, b) => a.btcpayStore.name.localeCompare(b.btcpayStore.name))
                    .forEach(store => {
                        const option = document.createElement('option');
                        option.value = store.appId;
                        option.textContent = store.btcpayStore.name;
                        storeSelect.appendChild(option);
                    });

                if(params.get('appId')) {
                    storeSelect.value = params.get('appId');
                    storeSelect.disabled = true;
                    // storeSelect.parentElement.style.display = 'none';
                }
            } else {
                errorDiv.textContent = 'No stores available.';
            }
        })
        .catch((e) => {
            console.log(e);
            errorDiv.textContent = 'Failed to fetch stores.';
        });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorDiv.textContent = '';

        const amount = document.getElementById('amount').value;
        const appId = document.getElementById('appId').value;
        const phoneNumber = document.getElementById('phoneNumber').value;

        const formData = new URLSearchParams();
        formData.append('amount', amount);
        if(phoneNumber) {
            formData.append('email', `${phoneNumber}@fooodapp.com`);
        }

        fetch(`https://btcpayserver.bitcoinjungle.app/apps/${appId}/pos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString(),
            redirect: 'follow' // Changed from 'manual' to 'follow' to get redirect response
        })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                throw new Error('Error creating payment');
            }
            
            // Get the final URL after redirects
            const redirectUrl = response.url;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                throw new Error('Redirect URL not found');
            }
        })
        .catch(err => {
            errorDiv.textContent = err.message;
        });
    });
}); 