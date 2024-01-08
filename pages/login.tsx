import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config/firebase.js';
import styles from '../css/styles.module.css';


const Login = ({ onToggleView }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {

        const authInstance = getAuth(app);
        if (authInstance.currentUser) {
            router.push('/dashboard');
        }
    }, [router]);

    // login

    const handleLogin = async () => {

        try {
            setError(null);
            setIsLoading(true);

            const authInstance = getAuth(app);
            await signInWithEmailAndPassword(authInstance, email, password);

            // dashboard after logging in

            router.push('/dashboard');
        } catch (error) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={styles.fullHeightFlex}>
            <div className={styles.authContainer}>
                <h1 className={styles.loginHeading}>Login</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {isLoading && <p className={ styles.successMessage }>Attempting to log in...</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                    disabled={isLoading}
                />
                <button
                    onClick={handleLogin}
                    className={styles.loginButton}
                    disabled={isLoading}
                >
                    Enter
                </button>
                <p className={styles.toggle_message}>
                    Don't have an account?
                    <span onClick={onToggleView} className={styles.toggle_signup_and_login_Button}> Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;