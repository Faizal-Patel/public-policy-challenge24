import { useState, useEffect } from 'react';
import { withRouter } from 'next/router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config/firebase.js';
import styles from '../css/styles.module.css';

const Signup = ({ onToggleView }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsFirebaseInitialized(true);
    }, []);

    // authentification regex!

    const isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    };

    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };


    // signup

    const handleSignup = async () => {
        try {
            setError(null);
            setSuccessMessage(null);
            setIsLoading(true);

            if (!isFirebaseInitialized) {
                setError('Firebase is not initialized. Please wait...');
                setIsLoading(false);
                return;
            }

            if (!isValidEmail(email)) {
                setError("Invalid email format");
                setIsLoading(false);
                return;
            }

            if (!isValidPassword(password)) {
                setError("Password must be at least 8 characters long and include uppercase," +
                    " lowercase letters, a number, and a special character.");
                setIsLoading(false);
                return;
            }

            const authInstance = getAuth(app);
            await createUserWithEmailAndPassword(authInstance, email, password);

            // user signup success

            setSuccessMessage('Account created successfully!');
        } catch (authError) {
            setError(authError.message);
        } finally {

            // loading false

            setIsLoading(false);
        }
    };

    // signup/login container

    return (
        <div className={styles.fullHeightFlex}>
            <div className={styles.authContainer}>
                <h1 className={styles.signupHeading}>Sign Up</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {isLoading && <p className={ styles.successMessage }>Creating your account...</p>}
                <input
                    type="email"
                    placeholder="Email"
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className={styles.inputField}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSignup}
                    className={styles.signupButton}
                    disabled={isLoading}
                >
                    Sign Up
                </button>
                <p className={styles.toggle_message}>
                    Already have an account?
                    <span onClick={onToggleView} className={styles.toggle_signup_and_login_Button}> Log in</span>
                </p>
            </div>
        </div>
    );
};

export default withRouter(Signup);