// Ngambil dari HTML

const form = document.getElementById('form');
const submit = document.getElementById('submit');
const statusMsg = document.getElementById('statusMsg');

// mencegah refresh pada halaman ketika submit
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // ngambil username dan pw
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // loading
    statusMsg.textContent = 'Loading...';
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
            localStorage.setItem('firstName', validUser.firstName);
            //firstname sesuai dengan instruksi soal.
            statusMsg.textContent = 'Login berhasil! Selamat datang, ' + validUser.firstName;

            // pindah ke halaman katalog
            window.location.href = 'index.html';

        } else {
            throw new Error('Username atau password salah');
        }

    } catch (error) {
        statusMsg.textContent = error.message;

    } finally {
        submit.disabled = false;
    }
});
