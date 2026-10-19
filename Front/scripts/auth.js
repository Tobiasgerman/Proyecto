let supabaseClient = null;

document.addEventListener('DOMContentLoaded', async () => {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-btn');

    loginTab.addEventListener('click', () => showAuthForm('login'));
    registerTab.addEventListener('click', () => showAuthForm('register'));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutButton.addEventListener('click', logout);

    try {
        const response = await fetch('/api/auth/config');
        if (!response.ok) {
            throw new Error('Supabase todavía no está configurado.');
        }

        const config = await response.json();
        if (!window.supabase || !config.url || !config.publishableKey) {
            throw new Error('La configuración de acceso está incompleta.');
        }

        supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session?.user) {
            showApplication(session.user);
        }

        supabaseClient.auth.onAuthStateChange((_event, currentSession) => {
            if (currentSession?.user) {
                showApplication(currentSession.user);
            }
        });
    } catch (error) {
        setAuthMessage(error.message, 'error');
    }
});

function showAuthForm(mode) {
    const isLogin = mode === 'login';
    document.getElementById('login-form').classList.toggle('hidden', !isLogin);
    document.getElementById('register-form').classList.toggle('hidden', isLogin);
    document.getElementById('login-tab').classList.toggle('active', isLogin);
    document.getElementById('register-tab').classList.toggle('active', !isLogin);
    document.getElementById('login-tab').setAttribute('aria-selected', String(isLogin));
    document.getElementById('register-tab').setAttribute('aria-selected', String(!isLogin));
    setAuthMessage('');
}

async function handleRegister(event) {
    event.preventDefault();
    if (!supabaseClient) {
        setAuthMessage('El servicio de usuarios todavía no está disponible.', 'error');
        return;
    }

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirmation = document.getElementById('register-confirm-password').value;

    if (password !== confirmation) {
        setAuthMessage('Las contraseñas no coinciden.', 'error');
        return;
    }

    setAuthMessage('Creando tu cuenta...');
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { name },
            emailRedirectTo: window.location.origin
        }
    });

    if (error) {
        setAuthMessage(error.message, 'error');
        return;
    }

    if (data.session && data.user) {
        showApplication(data.user);
        return;
    }

    event.target.reset();
    showAuthForm('login');
    setAuthMessage('Cuenta creada. Revisá tu correo para confirmarla.', 'success');
}

async function handleLogin(event) {
    event.preventDefault();
    if (!supabaseClient) {
        setAuthMessage('El servicio de usuarios todavía no está disponible.', 'error');
        return;
    }

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    setAuthMessage('Iniciando sesión...');
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        setAuthMessage(error.message, 'error');
        return;
    }

    showApplication(data.user);
}

function showApplication(user) {
    document.getElementById('auth-screen').classList.add('hidden');
    document.querySelectorAll('.app-shell').forEach(element => element.classList.remove('hidden'));
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'jugador';
    document.getElementById('welcome-user').textContent = `Hola, ${name}`;
}

async function logout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut({ scope: 'local' });
    }
    window.location.reload();
}

function setAuthMessage(message, type = '') {
    const messageElement = document.getElementById('auth-message');
    messageElement.textContent = message;
    messageElement.className = `auth-message ${type}`.trim();
}
