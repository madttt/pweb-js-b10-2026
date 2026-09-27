// Ngambil dari HTML

const form = document.getElementById('form');
const submit = document.getElementById('submit');
const status = document.getElementById('status');

// mencegah refresh pada halaman ketika submit
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // ngambil username dan pw
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // loading
    status.textContent = 'Loading...';
    submit.disabled = true;

    // error handling
    try {
        const response = await fetch('https://dummyjson.com/users');

        if (!response.ok) {
            throw new Error('Koneksi API gagal');
        }

        // mengambil data dari API
        const data = await response.json();

        // validasi user
        const validUser = data.users.find(function (user) {
            return user.username === usernameInput.value &&
                   user.password === passwordInput.value;
        });

        if (validUser) {
            localStorage.setItem('username', validUser.username);

            status.textContent =
                'Login berhasil! Selamat datang, ' + validUser.username;

            // pindah ke halaman katalog
            window.location.href = 'index.html';

        } else {
            throw new Error('Username atau password salah');
        }

    } catch (error) {
        status.textContent = error.message;

    } finally {
        submit.disabled = false;
    }
});
